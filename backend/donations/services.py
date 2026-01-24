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
        
        # Notify admins
        NotificationService.notify_pending_donation(donation, f"M-Pesa from {data.get('phone_number')}")
        
        logger.info(f"Processed M-Pesa payment: {donation.transaction_id}")
        return donation
    
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
            'transaction_id': data.get('order_id'),
            'donor_name': data.get('donor_name', 'PayPal Donor'),
            'donor_email': data.get('donor_email', ''),
            'is_anonymous': data.get('is_anonymous', False),
            'message': data.get('message', ''),
            'campaign': data.get('campaign'),
            'status': Donation.Status.COMPLETED
        })
        
        # Auto-finalize PayPal donations
        DonationService.finalize_donation(donation)
        
        logger.info(f"Processed PayPal payment: {donation.transaction_id}")
        return donation
    
    @staticmethod
    def process_stripe_payment(data):
        """
        Process Stripe payment
        
        Args:
            data: Payment data dictionary
            
        Returns:
            Donation instance
        """
        if not data.get('amount') or not data.get('token'):
            raise ValueError('Amount and token are required')
        
        donation = DonationService.create_donation({
            'amount': data.get('amount'),
            'payment_method': Donation.PaymentMethod.STRIPE,
            'transaction_id': f"STRIPE-{uuid.uuid4().hex[:10].upper()}",
            'donor_name': data.get('donor_name', 'Stripe Donor'),
            'donor_email': data.get('donor_email', ''),
            'is_anonymous': data.get('is_anonymous', False),
            'message': data.get('message', ''),
            'campaign': data.get('campaign'),
            'status': Donation.Status.COMPLETED
        })
        
        # Auto-finalize Stripe donations
        DonationService.finalize_donation(donation)
        
        logger.info(f"Processed Stripe payment: {donation.transaction_id}")
        return donation


class ReceiptService:
    """
    Service for generating donation receipts
    """
    
    @staticmethod
    def generate_pdf_receipt(receipt):
        """
        Generate a professional PDF receipt using HTML templates
        """
        try:
            from django.template.loader import render_to_string
            from xhtml2pdf import pisa
            
            donation = receipt.donation
            context = {
                'receipt': receipt,
                'date': timezone.now().strftime('%d %b %Y'),
                'server_url': 'http://localhost:8000', # Should be from settings
            }
            
            html_string = render_to_string('donations/receipt.html', context)
            buffer = io.BytesIO()
            pisa_status = pisa.CreatePDF(html_string, dest=buffer)
            
            if pisa_status.err:
                logger.error(f"PDF generation error for receipt {receipt.receipt_number}")
                return None
                
            buffer.seek(0)
            filename = f"receipt_{receipt.receipt_number}.pdf"
            receipt.receipt_file.save(filename, ContentFile(buffer.read()), save=True)
            logger.info(f"Generated PDF file for receipt {receipt.receipt_number} using template")
            return receipt
            
        except Exception as e:
            logger.error(f"Error generating PDF receipt: {str(e)}")
            # Fallback to ReportLab if template fails (legacy support) or raise
            return None


class MaterialAcknowledgmentService:
    """
    Service for generating "Gift in Kind" acknowledgments
    """

    @staticmethod
    def generate_acknowledgment_pdf(material_donation):
        """
        Generate a professional PDF acknowledgment for physical donations
        """
        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter
        
        # Header
        p.setFont("Helvetica-Bold", 20)
        p.drawCentredString(width/2, height - inch, "KINDRA CBO")
        p.setFont("Helvetica", 12)
        p.drawCentredString(width/2, height - 1.3*inch, "Official Gift-in-Kind Acknowledgment")
        
        p.line(inch, height - 1.6*inch, width - inch, height - 1.6*inch)
        
        # Content
        lines = [
            f"Date: {timezone.now().strftime('%d %b %Y')}",
            "",
            "Dear " + (material_donation.donor.user.get_full_name() if material_donation.donor and material_donation.donor.user else "Valued Donor") + ",",
            "",
            "On behalf of Kindra CBO, we would like to express our deepest gratitude for your",
            f"generous donation of the following items received on {material_donation.updated_at.strftime('%d %b %Y')}:",
            "",
            f"Category: {material_donation.category}",
            f"Description: {material_donation.description}",
            f"Quantity: {material_donation.quantity}",
            "",
            "Your contribution is vital to our mission of empowering lives and building futures",
            "for our community members. Your kindness makes a real difference.",
            "",
            "Please note that as per standard regulations, we do not provide a dollar value for",
            "gift-in-kind donations. This acknowledgment serves as your official record for tax",
            "purposes.",
            "",
            "With sincere gratitude,",
            "",
            "The Kindra CBO Team"
        ]
        
        y = height - 2.2*inch
        p.setFont("Helvetica", 11)
        for line in lines:
            if line.startswith("Dear") or line.startswith("Category"):
                p.setFont("Helvetica-Bold", 11)
            else:
                p.setFont("Helvetica", 11)
            p.drawString(inch, y, line)
            y -= 0.2*inch if line else 0.15*inch

        p.showPage()
        p.save()
        buffer.seek(0)
        return buffer.read()


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
