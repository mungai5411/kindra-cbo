"""
Donation & Campaign Management Models
Handles donations, campaigns, and donor management
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator
from accounts.models import User
from django.utils import timezone
import uuid


class Donor(models.Model):
    """
    Donor profiles and management
    """
    
    class DonorType(models.TextChoices):
        INDIVIDUAL = 'INDIVIDUAL', _('Individual')
        ORGANIZATION = 'ORGANIZATION', _('Organization')
        CORPORATE = 'CORPORATE', _('Corporate')
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, related_name='donor_profile')
    
    # Basic information (Will sync from User if linked)
    donor_type = models.CharField(max_length=20, choices=DonorType.choices, default=DonorType.INDIVIDUAL)
    full_name = models.CharField(max_length=200, blank=True)
    email = models.EmailField(blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    
    # Organization details (if applicable)
    organization_name = models.CharField(max_length=200, blank=True)
    tax_id = models.CharField(max_length=100, blank=True)
    
    # Address
    country = models.CharField(max_length=100)
    city = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)
    
    # Communication preferences
    newsletter_subscribed = models.BooleanField(default=True)
    email_notifications = models.BooleanField(default=True)
    
    # Donor status
    is_recurring_donor = models.BooleanField(default=False)
    total_donated = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('donor')
        verbose_name_plural = _('donors')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['donor_type']),
        ]
    
    def __str__(self):
        return self.get_display_name()

    def get_display_name(self):
        """Helper to get donor name from profile or linked user"""
        if self.user:
            return self.user.get_full_name()
        return self.full_name or self.organization_name or _("Anonymous Donor")

    def get_display_email(self):
        """Helper to get donor email from profile or linked user"""
        if self.user:
            return self.user.email
        return self.email


class Campaign(models.Model):
    """
    Fundraising campaigns
    """
    
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', _('Draft')
        ACTIVE = 'ACTIVE', _('Active')
        COMPLETED = 'COMPLETED', _('Completed')
        PAUSED = 'PAUSED', _('Paused')

    class Category(models.TextChoices):
        EDUCATION = 'EDUCATION', _('Education')
        HEALTHCARE = 'HEALTHCARE', _('Healthcare')
        SHELTER = 'SHELTER', _('Shelter/Housing')
        FOOD_SECURITY = 'FOOD_SECURITY', _('Food Security')
        DISASTER_RELIEF = 'DISASTER_RELIEF', _('Disaster Relief')
        ENVIRONMENT = 'ENVIRONMENT', _('Environment')
        OTHER = 'OTHER', _('Other')

    class Urgency(models.TextChoices):
        LOW = 'LOW', _('Low')
        MEDIUM = 'MEDIUM', _('Medium')
        HIGH = 'HIGH', _('High')
        CRITICAL = 'CRITICAL', _('Critical')
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=250, unique=True)
    description = models.TextField()
    
    # Images
    featured_image = models.ImageField(upload_to='campaigns/', blank=True, null=True)
    
    # Financial goals
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    raised_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default='KES')
    
    # Timeline
    start_date = models.DateField()
    end_date = models.DateField()
    
    # Status & Categorization
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    category = models.CharField(max_length=50, choices=Category.choices, default=Category.OTHER)
    urgency = models.CharField(max_length=20, choices=Urgency.choices, default=Urgency.MEDIUM)
    is_featured = models.BooleanField(default=False)
    
    # Social media
    facebook_post_id = models.CharField(max_length=200, blank=True)
    twitter_post_id = models.CharField(max_length=200, blank=True)
    instagram_post_id = models.CharField(max_length=200, blank=True)
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='campaigns_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('campaign')
        verbose_name_plural = _('campaigns')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['status']),
            models.Index(fields=['start_date', 'end_date']),
        ]
    
    def __str__(self):
        return self.title
    
    @property
    def progress_percentage(self):
        """Calculate fundraising progress"""
        if self.target_amount == 0:
            return 0
        return min((self.raised_amount / self.target_amount) * 100, 100)

    def recalculate_raised_amount(self):
        """
        Recalculate raised_amount from the sum of completed donations.
        Call this after any donation refund or deletion to keep the field accurate.
        """
        from django.db.models import Sum
        total = self.donations.filter(
            status='COMPLETED'
        ).aggregate(total=Sum('amount'))['total'] or 0
        self.raised_amount = total
        self.save(update_fields=['raised_amount'])
        return self.raised_amount


class Donation(models.Model):
    """
    Individual donations
    """
    
    class PaymentMethod(models.TextChoices):
        MPESA = 'MPESA', _('M-Pesa')
        PAYPAL = 'PAYPAL', _('PayPal')
        STRIPE = 'STRIPE', _('Stripe')
        BANK_TRANSFER = 'BANK_TRANSFER', _('Bank Transfer')
    
    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        COMPLETED = 'COMPLETED', _('Completed')
        FAILED = 'FAILED', _('Failed')
        REFUNDED = 'REFUNDED', _('Refunded')
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    donor = models.ForeignKey(Donor, on_delete=models.SET_NULL, null=True, related_name='donations')
    campaign = models.ForeignKey(Campaign, on_delete=models.SET_NULL, null=True, blank=True, related_name='donations')
    
    # Amount
    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(1)])
    currency = models.CharField(max_length=3, default='KES')
    
    # Payment details
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices)
    transaction_id = models.CharField(max_length=200, unique=True)
    payment_reference = models.CharField(max_length=200, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    
    # Donor information (for anonymous donations)
    donor_name = models.CharField(max_length=200, blank=True)
    donor_email = models.EmailField(blank=True)
    is_anonymous = models.BooleanField(default=False)
    
    # Message
    message = models.TextField(blank=True, help_text=_('Optional message from donor'))
    
    # Receipt
    receipt_sent = models.BooleanField(default=False)
    receipt_sent_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    donation_date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('donation')
        verbose_name_plural = _('donations')
        ordering = ['-donation_date']
        indexes = [
            models.Index(fields=['donor']),
            models.Index(fields=['campaign']),
            models.Index(fields=['status']),
            models.Index(fields=['transaction_id']),
        ]
    
    def __str__(self):
        return f"{self.donor_name or self.donor} - {self.amount} {self.currency}"


class Receipt(models.Model):
    """
    Tax receipts for donations
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    donation = models.OneToOneField(Donation, on_delete=models.CASCADE, related_name='receipt')
    
    receipt_number = models.CharField(max_length=50, unique=True)
    receipt_file = models.FileField(upload_to='receipts/%Y/%m/', blank=True, null=True)
    
    # Tax information
    tax_deductible = models.BooleanField(default=True)
    tax_year = models.IntegerField()
    
    # Generation
    generated_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('receipt')
        verbose_name_plural = _('receipts')
        ordering = ['-generated_at']
    
    def __str__(self):
        return f"Receipt {self.receipt_number}"


class MaterialDonation(models.Model):
    """
    Physical items donated (clothes, food, etc.)
    """
    
    class ItemCategory(models.TextChoices):
        CLOTHES = 'CLOTHES', _('Clothes')
        FOOD = 'FOOD', _('Food/Perishables')
        STATIONERY = 'STATIONERY', _('School Supplies/Stationery')
        ELECTRONICS = 'ELECTRONICS', _('Electronics/Computers')
        OTHER = 'OTHER', _('Other')
    
    class Status(models.TextChoices):
        PENDING_PICKUP = 'PENDING_PICKUP', _('Pending Pickup')
        COLLECTED = 'COLLECTED', _('Collected')
        DISTRIBUTED = 'DISTRIBUTED', _('Distributed')
        REJECTED = 'REJECTED', _('Rejected')
        CANCELLED = 'CANCELLED', _('Cancelled')
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    donor = models.ForeignKey(Donor, on_delete=models.SET_NULL, null=True, related_name='material_donations')
    
    category = models.CharField(max_length=20, choices=ItemCategory.choices)
    description = models.TextField()
    quantity = models.CharField(max_length=100, help_text=_('e.g., "5 bags", "2 boxes"'))
    
    # Pickup details
    pickup_address = models.TextField()
    preferred_pickup_date = models.DateField()
    preferred_pickup_time = models.CharField(max_length=100, blank=True)
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING_PICKUP)
    admin_notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('material donation')
        verbose_name_plural = _('material donations')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.category} from {self.donor or 'Anonymous'}"


class SocialMediaPost(models.Model):
    """
    Social media posts linked to campaigns for tracking engagement
    """
    class Platform(models.TextChoices):
        FACEBOOK = 'FACEBOOK', _('Facebook')
        TWITTER = 'TWITTER', _('Twitter')
        INSTAGRAM = 'INSTAGRAM', _('Instagram')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='social_posts')
    platform = models.CharField(max_length=20, choices=Platform.choices)
    post_id = models.CharField(max_length=200)
    post_url = models.URLField()
    content = models.TextField()
    
    # Metrics
    likes_count = models.IntegerField(default=0)
    shares_count = models.IntegerField(default=0)
    comments_count = models.IntegerField(default=0)
    reach = models.IntegerField(default=0)
    
    posted_at = models.DateTimeField()
    last_synced = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('social media post')
        verbose_name_plural = _('social media posts')
        ordering = ['-posted_at']
        unique_together = ('platform', 'post_id')

    def __str__(self):
        return f"{self.platform} - {self.post_id}"


class DonationImpact(models.Model):
    """
    Impact records for donations (recorded by partners)
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shelter_home = models.ForeignKey('shelter_homes.ShelterHome', on_delete=models.CASCADE, related_name='impact_records')
    
    # Linked donations
    donation = models.ForeignKey(Donation, on_delete=models.SET_NULL, null=True, blank=True, related_name='impacts')
    material_donation = models.ForeignKey(MaterialDonation, on_delete=models.SET_NULL, null=True, blank=True, related_name='impacts')
    
    # Impact details
    title = models.CharField(max_length=200)
    description = models.TextField()
    impact_date = models.DateField(default=timezone.now)
    monetary_value = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text=_('Estimated value of material impact if applicable'))
    
    # Media/Files
    media = models.ManyToManyField('blog.MediaAsset', blank=True, related_name='linked_impacts')
    
    # Reporting
    is_reported = models.BooleanField(default=False, help_text=_('Whether this impact has been submitted to admin'))
    admin_feedback = models.TextField(blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('donation impact')
        verbose_name_plural = _('donation impacts')
        ordering = ['-impact_date']

    def __str__(self):
        return f"{self.title} - {self.shelter_home.name}"
