"""
Donation Services
Business logic for donation processing, separated from views
"""

import uuid
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

logger = logging.getLogger('kindra_cbo')


class DonationService:
    """
    Service class for donation-related business logic
    """
    
    @staticmethod
    @transaction.atomic
    def finalize_donation(donation):
        """
        Finalize a successful donation
        Updates campaign, donor, creates receipt, and sends notifications
        
        Args:
            donation: Donation instance
            
        Returns:
            Receipt instance
        """
        try:
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
            receipt = Receipt.objects.create(
                donation=donation,
                receipt_number=f"REC-{uuid.uuid4().hex[:8].upper()}",
                tax_year=timezone.now().year
            )
            logger.info(f"Created receipt {receipt.receipt_number} for donation {donation.id}")
            
            # Generate PDF File
            ReceiptService.generate_pdf_receipt(receipt)
            
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
        # Validate required fields
        if not data.get('amount') or not data.get('phone_number'):
            raise ValueError('Amount and phone number are required')
        
        # Create donation in PENDING status
        donation = DonationService.create_donation({
            'amount': data.get('amount'),
            'payment_method': Donation.PaymentMethod.MPESA,
            'transaction_id': f"MPESA-{uuid.uuid4().hex[:10].upper()}",
            'donor_name': data.get('donor_name', 'M-Pesa Donor'),
            'donor_email': data.get('donor_email', ''),
            'is_anonymous': data.get('is_anonymous', False),
            'message': data.get('message', ''),
            'campaign': data.get('campaign'),
            'status': Donation.Status.PENDING
        })
        
        # Simulation: Auto-finalize for immediate receipt generation
        # In production, this would happen in a callback
        logger.info(f"Auto-finalizing M-Pesa payment for simulation: {donation.transaction_id}")
        receipt = DonationService.finalize_donation(donation)
        
        # Notify admins
        NotificationService.notify_pending_donation(donation, f"M-Pesa from {data.get('phone_number')}")
        
        return donation, receipt
    
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
            'donor_name': data.get('donor_name', 'PayPal Donor'),
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
            'donor_name': data.get('donor_name', 'Stripe Donor'),
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
            
            context = {
                'receipt': receipt,
                'donation': donation,
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
    """

    @staticmethod
    def generate_acknowledgment_pdf(material_donation):
        """
        Generate a professional PDF acknowledgment for physical donations using HTML templates
        """
        try:
            from django.template.loader import render_to_string
            from xhtml2pdf import pisa
            import os
            from django.conf import settings
        
            # Physical paths for assets
            logo_path = os.path.join(settings.BASE_DIR, 'donations', 'static', 'donations', 'images', 'logo.jpg')
            font_path = os.path.join(settings.BASE_DIR, 'donations', 'static', 'donations', 'Handwritten.ttf')
            
            # Fallback if files don't exist
            if not os.path.exists(logo_path):
                logo_path = None
            if not os.path.exists(font_path):
                font_path = None

            context = {
                'material_donation': material_donation,
                'donor_name': material_donation.donor.full_name if material_donation.donor else "Anonymous",
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
            pisa_status = pisa.CreatePDF(html_string, dest=buffer)
            
            if pisa_status.err:
                logger.error(f"PDF generation error for acknowledgment {material_donation.id}")
                return None
                
            return buffer.getvalue()
            
        except Exception as e:
            logger.error(f"Error generating acknowledgment PDF: {str(e)}")
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
    def notify_pending_donation(donation, source_info):
        """
        Send notifications for pending donations
        
        Args:
            donation: Donation instance
            source_info: String describing payment source
        """
        admins = User.objects.filter(role__in=['ADMIN', 'MANAGEMENT'])
        for admin in admins:
            Notification.objects.create(
                recipient=admin,
                title="Pending Donation",
                message=f"A donation of KES {donation.amount} from {source_info} is pending approval.",
                type=Notification.Type.INFO,
                category=Notification.Category.DONATION,
                link=f"/dashboard/donations/{donation.id}"
            )
        
        logger.info(f"Sent pending donation notifications for donation {donation.id}")
    
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
