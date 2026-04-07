"""
Donation Services
Business logic for donation processing, separated from views
"""

import uuid
import secrets
import logging
from django.utils import timezone
from django.db import transaction
from .models import Donor, Campaign, Donation, Receipt, MaterialDonation
from accounts.models import User, Notification, AuditLog
from django.core.files.base import ContentFile
import io
import os
from django.conf import settings
from .utils import amount_to_words, get_date_digits
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib import colors
from .daraja_service import DarajaService

logger = logging.getLogger('kindra_cbo')


class DonationService:
    """
    Service class for donation-related business logic
    """
    
    @staticmethod
    @transaction.atomic
    def finalize_donation(donation):
        """
        Finalize a successful donation.
        Updates campaign, donor, creates receipt, and sends notifications.
        Idempotent: calling this on an already-COMPLETED donation is a no-op.
        """
        try:
            # Guard against double-finalization
            if donation.status == Donation.Status.COMPLETED:
                logger.warning(
                    f"finalize_donation called on already-completed donation {donation.id}. "
                    "Skipping to prevent double-counting."
                )
                return Receipt.objects.filter(donation=donation).first()

            # Update donation status
            donation.status = Donation.Status.COMPLETED
            donation.save()
            
            # Update campaign raised amount
            if donation.campaign:
                donation.campaign.raised_amount += donation.amount
                donation.campaign.save()
                logger.info(f"Updated campaign {donation.campaign.id} raised amount by {donation.amount}")
            
            # Update donor total
            if donation.donor:
                donation.donor.total_donated += donation.amount
                donation.donor.save()
                logger.info(f"Updated donor {donation.donor.id} total donated by {donation.amount}")
            
            # Create receipt
            # Use M-Pesa transaction ID in the receipt number if available
            prefix = "REC"
            txn_id = donation.transaction_id
            if donation.payment_method == 'MPESA' and txn_id and not txn_id.startswith('MPESA-'):
                receipt_no = f"MP-{txn_id}"
            else:
                receipt_no = f"{prefix}-{uuid.uuid4().hex[:8].upper()}"

            receipt = Receipt.objects.create(
                donation=donation,
                receipt_number=receipt_no,
                tax_year=timezone.now().year
            )
            logger.info(f"Created receipt {receipt.receipt_number} for donation {donation.id}")
            
            # Generate PDF File
            ReceiptService.generate_pdf_receipt(receipt)
            
            # Automated Audit Logging
            AuditLog.objects.create(
                user=None, # System automated
                action=AuditLog.Action.UPDATE,
                resource_type='Donation',
                resource_id=str(donation.id),
                description=f"Automated completion of donation {donation.transaction_id} (KES {donation.amount}). All related records updated."
            )
            
            # Campaign Goal Synchronization
            if donation.campaign and donation.campaign.raised_amount >= donation.campaign.target_amount:
                logger.info(f"Campaign {donation.campaign.id} goal reached! Total: {donation.campaign.raised_amount}")
                # We keep status as ACTIVE to allow over-funding, but could notify admins of the milestone
                NotificationService.notify_campaign_goal_reached(donation.campaign)
            
            # Send notifications
            NotificationService.notify_donation_completed(donation)
            
            return receipt
            
        except Exception as e:
            logger.error(f"Error finalizing donation {donation.id}: {str(e)}")
            raise
    
    @staticmethod
    def create_donation(data, user=None):
        """
        Create a new donation with validation
        
        Args:
            data: Dictionary with donation data
            user: Optional user making the donation
            
        Returns:
            Donation instance
        """
        # Link to donor if user has a donor profile
        donor = None
        if user and hasattr(user, 'donor_profile'):
            donor = user.donor_profile
        
        donation = Donation.objects.create(
            amount=data.get('amount'),
            payment_method=data.get('payment_method'),
            transaction_id=data.get('transaction_id'),
            donor=donor,
            donor_name=data.get('donor_name', ''),
            donor_email=data.get('donor_email', ''),
            is_anonymous=data.get('is_anonymous', False),
            message=data.get('message', ''),
            campaign_id=data.get('campaign'),
            status=data.get('status', Donation.Status.PENDING)
        )
        
        logger.info(f"Created donation {donation.id} for amount {donation.amount}")
        return donation


class PaymentService:
    """
    Service class for payment processing
    """
    
    @staticmethod
    def process_mpesa_payment(data):
        """
        Process M-Pesa payment
        
        Args:
            data: Payment data dictionary
            
        Returns:
            Donation instance
        """
        # Spam Protection: Check for recent pending donations for this phone
        phone_number = data.get('phone_number')
        two_minutes_ago = timezone.now() - timezone.timedelta(minutes=2)
        recent_pending = Donation.objects.filter(
            payment_method=Donation.PaymentMethod.MPESA,
            status=Donation.Status.PENDING,
            updated_at__gte=two_minutes_ago,
            donor_email=data.get('donor_email', '') # Adding email as secondary check
        ).exists()

        if recent_pending:
            logger.warning(f"Spam protection triggered for phone {phone_number}")
            raise ValueError('A payment request is already in progress for this account. Please wait a moment before trying again.')

        # Set unique transaction_id for local DB integrity
        temp_tx_id = f"MPESA-{uuid.uuid4().hex[:10].upper()}"

        # Generate secure callback token
        callback_token = secrets.token_hex(16)

        # Create donation in PENDING status
        donation = DonationService.create_donation({
            'amount': data.get('amount'),
            'payment_method': Donation.PaymentMethod.MPESA,
            'transaction_id': temp_tx_id,
            'donor_name': data.get('donor_name', ''),
            'donor_email': data.get('donor_email', ''),
            'is_anonymous': data.get('is_anonymous', False),
            'message': data.get('message', ''),
            'campaign': data.get('campaign'),
            'status': Donation.Status.PENDING
        })
        
        donation.callback_token = callback_token
        donation.save(update_fields=['callback_token'])
        
        # Initiate Real Daraja STK Push
        account_ref = f"KINDRA-{donation.id.hex[:6]}"
        transaction_desc = f"Donation to Kindra CBO"
        
        try:
            checkout_request_id = DarajaService.initiate_stk_push(
                phone_number=phone_number,
                amount=donation.amount,
                account_reference=account_ref,
                transaction_desc=transaction_desc,
                callback_token=callback_token
            )
            
            # Save the CheckoutRequestID as payment_reference for mapping in the callback
            donation.payment_reference = checkout_request_id
            donation.save(update_fields=['payment_reference'])
            
            logger.info(f"Successfully initiated STK Push for {donation.transaction_id}. CheckoutRequestID: {checkout_request_id}")
            
            # Notify admins of pending
            NotificationService.notify_pending_donation(donation, f"M-Pesa STK (Phone: {phone_number})")
            
            # Note: Receipt is generated only AFTER successful callback
            return donation, None
            
        except Exception as e:
            logger.error(f"Failed to initiate STK Push: {str(e)}")
            donation.status = Donation.Status.FAILED
            donation.save()
            raise ValueError(f"Failed to initiate M-Pesa payment: {str(e)}")

    @staticmethod
    def handle_mpesa_callback(data, request_token=None):
        """
        Handle M-Pesa STK Push Callback Webhook
        """
        try:
            stk_callback = data.get('Body', {}).get('stkCallback', {})
            result_code = stk_callback.get('ResultCode')
            result_desc = stk_callback.get('ResultDesc')
            checkout_request_id = stk_callback.get('CheckoutRequestID')

            if not checkout_request_id:
                logger.error("Callback received without CheckoutRequestID")
                return False

            # Find the pending donation
            try:
                donation = Donation.objects.get(payment_reference=checkout_request_id, payment_method=Donation.PaymentMethod.MPESA)
            except Donation.DoesNotExist:
                logger.error(f"Donation not found for CheckoutRequestID {checkout_request_id}")
                return False

            # Security Token Verification
            if donation.callback_token and donation.callback_token != request_token:
                logger.warning(f"Security Alert: Invalid callback token for donation {donation.id}. Expected {donation.callback_token}, got {request_token}")
                return False

            if donation.status != Donation.Status.PENDING:
                logger.info(f"Donation {donation.id} already processed. Current status: {donation.status}")
                return True

            # Save the raw result code for auditing
            donation.last_mpesa_result_code = str(result_code)

            if result_code == 0:
                # Payment Successful
                callback_metadata = stk_callback.get('CallbackMetadata', {}).get('Item', [])
                
                # Extract details from metadata
                mpesa_receipt_num = None
                mpesa_name = None
                
                for item in callback_metadata:
                    name = item.get('Name')
                    value = item.get('Value')
                    
                    if name == 'MpesaReceiptNumber':
                        mpesa_receipt_num = value
                    elif name in ['CustomerName', 'ExternalReference', 'Name']:
                        mpesa_name = value
                
                # Update transaction_id to real M-Pesa code for official records/receipts
                if mpesa_receipt_num:
                    donation.transaction_id = mpesa_receipt_num
                
                if mpesa_name:
                    donation.mpesa_name = mpesa_name
                    
                logger.info(f"STK Push successful for donation {donation.id}. M-Pesa Ref: {mpesa_receipt_num}, Name: {mpesa_name}")
                
                # Ensure all new fields are saved
                donation.save(update_fields=['transaction_id', 'mpesa_name', 'last_mpesa_result_code'])
                
                # Finalize (updates campaign, donor, and generates receipt)
                DonationService.finalize_donation(donation)
            else:
                friendly_message = error_mapping.get(result_code, result_desc)
                
                logger.warning(f"STK Push failed for {donation.id}. Code: {result_code}, Desc: {result_desc}")
                
                # Update donation status and message for donor feedback
                donation.status = Donation.Status.FAILED
                donation.message = friendly_message[:200]
                donation.save(update_fields=['status', 'message', 'last_mpesa_result_code'])
                
                # Notify admin of the failure with reason
                NotificationService.notify_donation_failed(donation, friendly_message)

            return True

        except Exception as e:
            logger.error(f"Error handling M-Pesa callback: {str(e)}", exc_info=True)
            return False
    
    @staticmethod
    def process_paypal_payment(data):
        """
        Process PayPal payment
        
        Args:
            data: Payment data dictionary
            
        Returns:
            Donation instance
        """
        if not data.get('amount') or not data.get('order_id'):
            raise ValueError('Amount and order ID are required')
        
        donation = DonationService.create_donation({
            'amount': data.get('amount'),
            'payment_method': Donation.PaymentMethod.PAYPAL,
            'transaction_id': data.get('order_id', f"PAYPAL-{uuid.uuid4().hex[:10].upper()}"),
            'donor_name': data.get('donor_name', ''),
            'donor_email': data.get('donor_email', ''),
            'is_anonymous': data.get('is_anonymous', False),
            'message': data.get('message', ''),
            'campaign': data.get('campaign'),
            'status': Donation.Status.COMPLETED # PayPal is usually instant
        })
        
        receipt = DonationService.finalize_donation(donation)
        return donation, receipt
    
    @staticmethod
    def process_stripe_payment(data):
        """
        Process Stripe payment
        
        Args:
            data: Payment data dictionary
            
        Returns:
            Donation instance
        """
        if not data.get('amount'):
            raise ValueError('Amount is required')
        
        donation = DonationService.create_donation({
            'amount': data.get('amount'),
            'payment_method': Donation.PaymentMethod.STRIPE,
            'transaction_id': data.get('token', f"STRIPE-{uuid.uuid4().hex[:10].upper()}"),
            'donor_name': data.get('donor_name', ''),
            'donor_email': data.get('donor_email', ''),
            'is_anonymous': data.get('is_anonymous', False),
            'message': data.get('message', ''),
            'campaign': data.get('campaign'),
            'status': Donation.Status.COMPLETED
        })
        
        receipt = DonationService.finalize_donation(donation)
        return donation, receipt


class ReceiptService:
    """
    Service for generating donation receipts
    """
    
    @staticmethod
    def generate_pdf_receipt(receipt, target_copy='both'):
        """
        Generate a professional PDF receipt using HTML templates and WeasyPrint
        target_copy: 'office', 'client', or 'both'
        """
        try:
            from django.template.loader import render_to_string
            from weasyprint import HTML
            from django.conf import settings
            
            donation = receipt.donation
            if not donation:
                logger.error(f"Receipt {receipt.receipt_number} has no associated donation")
                return None
                
            # Physical paths for assets
            logo_path = os.path.join(settings.BASE_DIR, 'donations', 'static', 'donations', 'images', 'logo.jpg')
            font_path = os.path.join(settings.BASE_DIR, 'donations', 'static', 'donations', 'Handwritten.ttf')
            bg_path = os.path.join(settings.BASE_DIR, 'donations', 'static', 'donations', 'images', 'background.jpg')
            
            # Use empty string instead of None to avoid url('None') in CSS
            if not os.path.exists(logo_path):
                logo_path = ""
            if not os.path.exists(font_path):
                font_path = ""
            if not os.path.exists(bg_path):
                bg_path = ""
            
            # Resolve name safely for the template
            donor_display_name = donation.mpesa_name or donation.donor_name
            if not donor_display_name and donation.donor:
                donor_display_name = donation.donor.full_name
            if not donor_display_name:
                donor_display_name = "Valued Supporter"

            context = {
                'receipt': receipt,
                'donation': donation,
                'donor_display_name': donor_display_name,
                'date': donation.donation_date.strftime('%d %b %Y'),
                'date_digits': get_date_digits(donation.donation_date),
                'amount_in_words': amount_to_words(donation.amount, donation.currency),
                'logo_path': logo_path,
                'bg_path': bg_path,
                'font_path': font_path,
                'target_copy': target_copy, # 'office', 'client', or 'both'
                'server_url': settings.BACKEND_URL if hasattr(settings, 'BACKEND_URL') else 'http://localhost:8000',
            }
            
            # Select template based on target_copy
            template_name = 'donations/receipt.html' # Default is 'both'
            if target_copy == 'office':
                template_name = 'donations/receipt_office.html'
            elif target_copy == 'client':
                template_name = 'donations/receipt_client.html'
            
            html_string = render_to_string(template_name, context)
            
            # Generate PDF using WeasyPrint
            buffer = io.BytesIO()
            HTML(string=html_string, base_url=settings.BASE_DIR).write_pdf(buffer)
            
            buffer.seek(0)
            filename = f"receipt_{receipt.receipt_number}.pdf"
            content = buffer.read()
            
            # Try to save to storage, but don't fail if storage is misconfigured
            try:
                receipt.receipt_file.save(filename, ContentFile(content), save=True)
                logger.info(f"Generated PDF file for receipt {receipt.receipt_number} using {template_name} (WeasyPrint)")
            except Exception as storage_error:
                logger.warning(f"Failed to save receipt to storage (will still return content): {str(storage_error)}")
            
            return content
            
        except Exception as e:
            logger.error(f"Error generating PDF receipt with WeasyPrint: {str(e)}", exc_info=True)
            return None


class MaterialAcknowledgmentService:
    """
    Service for generating "Gift in Kind" acknowledgments
    Uses WeasyPrint (same library as ReceiptService) for consistency.
    """

    @staticmethod
    def generate_acknowledgment_pdf(material_donation):
        """
        Generate a professional PDF acknowledgment for physical donations using WeasyPrint.
        """
        try:
            from django.template.loader import render_to_string
            from weasyprint import HTML
            from django.conf import settings

            logo_path = os.path.join(settings.BASE_DIR, 'donations', 'static', 'donations', 'images', 'logo.jpg')
            font_path = os.path.join(settings.BASE_DIR, 'donations', 'static', 'donations', 'Handwritten.ttf')

            if not os.path.exists(logo_path):
                logo_path = ''
            if not os.path.exists(font_path):
                font_path = ''

            context = {
                'material_donation': material_donation,
                'donor_name': material_donation.donor.full_name if material_donation.donor else 'Anonymous',
                'donation_date': material_donation.updated_at.strftime('%d %b %Y'),
                'category': material_donation.category,
                'description': material_donation.description,
                'quantity': material_donation.quantity,
                'date': timezone.now().strftime('%d %b %Y'),
                'logo_path': logo_path,
                'font_path': font_path,
                'server_url': settings.BACKEND_URL if hasattr(settings, 'BACKEND_URL') else 'http://localhost:8000',
            }

            html_string = render_to_string('donations/acknowledgment.html', context)
            buffer = io.BytesIO()
            HTML(string=html_string, base_url=settings.BASE_DIR).write_pdf(buffer)
            buffer.seek(0)
            return buffer.read()

        except Exception as e:
            logger.error(f"Error generating acknowledgment PDF: {str(e)}", exc_info=True)
            return None


class NotificationService:
    """
    Service class for sending notifications
    """
    
    @staticmethod
    def notify_donation_completed(donation):
        """
        Send notifications when a donation is completed
        
        Args:
            donation: Donation instance
        """
        # Notify admins
        admins = User.objects.filter(role__in=['ADMIN', 'MANAGEMENT'])
        for admin in admins:
            Notification.objects.create(
                recipient=admin,
                title="Donation Received",
                message=f"A donation of KES {donation.amount} has been completed for '{donation.campaign.title if donation.campaign else 'General Fund'}'.",
                type=Notification.Type.SUCCESS,
                category=Notification.Category.DONATION,
                link=f"/dashboard/donations/{donation.id}"
            )
        
        # Notify donor if they have a user account
        if donation.donor and donation.donor.user:
            Notification.objects.create(
                recipient=donation.donor.user,
                title="Thank You for Your Donation!",
                message=f"Your donation of KES {donation.amount} to '{donation.campaign.title if donation.campaign else 'Kindra CBO'}' has been processed. Thank you for your support!",
                type=Notification.Type.SUCCESS,
                category=Notification.Category.DONATION,
                link="/dashboard/donations/history"
            )
        
        logger.info(f"Sent donation completion notifications for donation {donation.id}")
    
    @staticmethod
    def notify_campaign_goal_reached(campaign):
        """
        Send milestone notifications when a campaign reaches its target.
        """
        admins = User.objects.filter(role__in=['ADMIN', 'MANAGEMENT'])
        
        for admin in admins:
            Notification.objects.create(
                recipient=admin,
                title="Goal Reached!",
                message=f"Success! The campaign '{campaign.title}' has reached its target of {campaign.currency} {campaign.target_amount}.",
                type=Notification.Type.SUCCESS,
                category=Notification.Category.CAMPAIGN,
                link=f"/dashboard/campaigns/{campaign.id}"
            )
            
        logger.info(f"Sent campaign milestone notifications for campaign {campaign.id}")

    @staticmethod
    def notify_pending_donation(donation, source_info):
        admins = User.objects.filter(role__in=['ADMIN', 'MANAGEMENT'])
        is_automated = donation.payment_method == Donation.PaymentMethod.MPESA
        
        title = "Pending Donation"
        message = f"A donation of KES {donation.amount} from {source_info} is pending approval."
        notif_type = Notification.Type.WARNING # Higher urgency for manual
        
        if is_automated:
            title = "M-Pesa Payment Initiated"
            message = f"STK Push sent to {donation.donor_name or 'Donor'} (KES {donation.amount}). Waiting for PIN."
            notif_type = Notification.Type.INFO # Just informative for automated
            
        for admin in admins:
            Notification.objects.create(
                recipient=admin,
                title=title,
                message=message,
                type=notif_type,
                category=Notification.Category.DONATION,
                link=f"/dashboard/donations/{donation.id}"
            )
        
        logger.info(f"Sent pending notification for donation {donation.id} (Automated: {is_automated})")

    @staticmethod
    def notify_donation_failed(donation, reason):
        """
        Send notifications for failed automated donations.
        Informative only, no admin action required.
        """
        admins = User.objects.filter(role__in=['ADMIN', 'MANAGEMENT'])
        
        for admin in admins:
            Notification.objects.create(
                recipient=admin,
                title="M-Pesa Payment Failed",
                message=f"Donation of KES {donation.amount} from {donation.donor_name or 'Donor'} failed: {reason}.",
                type=Notification.Type.ERROR,
                category=Notification.Category.DONATION,
                link=f"/dashboard/donations/{donation.id}"
            )
            
        logger.info(f"Sent failure notifications for donation {donation.id}")
    
    @staticmethod
    def notify_material_donation(material_donation, user):
        """
        Send notifications for material donation requests
        
        Args:
            material_donation: MaterialDonation instance
            user: User who created the request
        """
        admins = User.objects.filter(role__in=['ADMIN', 'MANAGEMENT'])
        for admin in admins:
            Notification.objects.create(
                recipient=admin,
                title="New Material Donation Request",
                message=f"A new request for {material_donation.category} donation has been submitted by {user.get_full_name()}.",
                type=Notification.Type.INFO,
                category=Notification.Category.DONATION,
                link=f"/dashboard/donations/materials/{material_donation.id}"
            )
        
        logger.info(f"Sent material donation notifications for {material_donation.id}")

    @staticmethod
    def notify_impact_summary(shelter_home, impact_count):
        """
        Send notification to admins when a partner submits an impact summary
        """
        admins = User.objects.filter(role__in=['ADMIN', 'MANAGEMENT'])
        for admin in admins:
            Notification.objects.create(
                recipient=admin,
                title="Impact Summary Submitted",
                message=f"{shelter_home.name} has submitted a summary of {impact_count} new donation impact records.",
                type=Notification.Type.INFO,
                category=Notification.Category.DONATION,
                link=f"/dashboard/donations/impact?shelter={shelter_home.id}"
            )
        logger.info(f"Sent impact summary notifications for shelter {shelter_home.id}")
