"""
Shelter Home Coordination Models
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator
from accounts.models import User
from case_management.models import Child
import uuid
from django.utils import timezone




class ShelterHome(models.Model):
    """
    Shelter home partner organizations
    """
    
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', _('Active')
        INACTIVE = 'INACTIVE', _('Inactive')
        SUSPENDED = 'SUSPENDED', _('Suspended')
    
    class ApprovalStatus(models.TextChoices):
        PENDING = 'PENDING', _('Pending Review')
        APPROVED = 'APPROVED', _('Approved')
        REJECTED = 'REJECTED', _('Rejected')
        NEEDS_INFO = 'NEEDS_INFO', _('Needs More Information')
    
    class GenderPolicy(models.TextChoices):
        MALE_ONLY = 'MALE_ONLY', _('Male Only')
        FEMALE_ONLY = 'FEMALE_ONLY', _('Female Only')
        CO_ED = 'CO_ED', _('Co-Educational')
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    registration_number = models.CharField(max_length=100, unique=True)
    
    # Contact information
    contact_person = models.CharField(max_length=200)
    phone_number = models.CharField(max_length=20)
    email = models.EmailField()
    
    # Address
    county = models.CharField(max_length=100)
    sub_county = models.CharField(max_length=100, blank=True)
    physical_address = models.TextField()
    
    # Capacity
    total_capacity = models.IntegerField(validators=[MinValueValidator(1)])
    current_occupancy = models.IntegerField(default=0)
    
    # Age and Gender Policy
    age_range_min = models.IntegerField(validators=[MinValueValidator(0)], default=0)
    age_range_max = models.IntegerField(validators=[MinValueValidator(0)], default=18)
    gender_policy = models.CharField(max_length=20, choices=GenderPolicy.choices, default=GenderPolicy.CO_ED)
    
    # Disability Support
    disability_accommodations = models.BooleanField(default=False)
    disability_capacity = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    disability_types_supported = models.JSONField(default=list, blank=True, help_text=_('List of disability types supported'))
    
    # Facilities
    has_medical_facility = models.BooleanField(default=False)
    has_education_facility = models.BooleanField(default=False)
    has_counseling_services = models.BooleanField(default=False)
    
    # Safety and Security
    emergency_contact = models.CharField(max_length=20, blank=True)
    fire_safety_certified = models.BooleanField(default=False)
    security_measures = models.TextField(blank=True, help_text=_('Describe security arrangements'))
    
    # Compliance
    license_number = models.CharField(max_length=100, blank=True)
    license_expiry_date = models.DateField(null=True, blank=True)
    last_inspection_date = models.DateField(null=True, blank=True)
    compliance_status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    
    # Partner user account
    partner_user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managed_shelter',
        limit_choices_to={'role': User.Role.SHELTER_PARTNER}
    )
    
    # Approval Workflow
    approval_status = models.CharField(
        max_length=20,
        choices=ApprovalStatus.choices,
        default=ApprovalStatus.PENDING,
        help_text=_('Admin approval status')
    )
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_shelters'
    )
    approval_date = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    
    # Status
    is_active = models.BooleanField(default=False)  # Changed default to False - only active after approval
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('shelter home')
        verbose_name_plural = _('shelter homes')
        ordering = ['name']
        indexes = [
            models.Index(fields=['county']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return self.name
    
    @property
    def available_beds(self):
        """Calculate available bed capacity"""
        return self.total_capacity - self.current_occupancy
    
    @property
    def occupancy_percentage(self):
        """Calculate occupancy percentage"""
        if self.total_capacity == 0:
            return 0
        return (self.current_occupancy / self.total_capacity) * 100


class ShelterPhoto(models.Model):
    """
    Photos of shelter facilities
    """
    
    class PhotoType(models.TextChoices):
        EXTERIOR = 'EXTERIOR', _('Exterior View')
        DORMITORY = 'DORMITORY', _('Dormitory/Sleeping Area')
        FACILITIES = 'FACILITIES', _('Common Facilities')
        PLAYGROUND = 'PLAYGROUND', _('Play/Recreation Area')
        DINING = 'DINING', _('Dining Area')
        OTHER = 'OTHER', _('Other')
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shelter_home = models.ForeignKey(ShelterHome, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='shelter_photos/%Y/%m/')
    caption = models.CharField(max_length=200, blank=True)
    photo_type = models.CharField(max_length=20, choices=PhotoType.choices, default=PhotoType.OTHER)
    is_primary = models.BooleanField(default=False, help_text=_('Primary display photo'))
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('shelter photo')
        verbose_name_plural = _('shelter photos')
        ordering = ['-is_primary', 'uploaded_at']
    
    def __str__(self):
        return f"{self.shelter_home.name} - {self.get_photo_type_display()}"



class Placement(models.Model):
    """
    Child placement in shelter homes
    """
    
    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        APPROVED = 'APPROVED', _('Approved')
        ACTIVE = 'ACTIVE', _('Active')
        COMPLETED = 'COMPLETED', _('Completed')
        TRANSFERRED = 'TRANSFERRED', _('Transferred')
        CANCELLED = 'CANCELLED', _('Cancelled')
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    child = models.ForeignKey(Child, on_delete=models.CASCADE, related_name='placements')
    shelter_home = models.ForeignKey(ShelterHome, on_delete=models.CASCADE, related_name='placements')
    
    # Placement details
    placement_date = models.DateField()
    expected_duration_days = models.IntegerField(null=True, blank=True)
    actual_end_date = models.DateField(null=True, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    
    # Reason and notes
    placement_reason = models.TextField()
    special_requirements = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    
    # Approval
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_placements'
    )
    approval_date = models.DateField(null=True, blank=True)
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='placements_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('placement')
        verbose_name_plural = _('placements')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['child']),
            models.Index(fields=['shelter_home']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.child} at {self.shelter_home.name}"


class Resource(models.Model):
    """
    Shared resources and inventory
    """
    
    class ResourceType(models.TextChoices):
        FOOD = 'FOOD', _('Food')
        CLOTHING = 'CLOTHING', _('Clothing')
        MEDICAL = 'MEDICAL', _('Medical Supplies')
        EDUCATIONAL = 'EDUCATIONAL', _('Educational Materials')
        BEDDING = 'BEDDING', _('Bedding')
        OTHER = 'OTHER', _('Other')
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shelter_home = models.ForeignKey(ShelterHome, on_delete=models.CASCADE, related_name='resources')
    
    resource_type = models.CharField(max_length=20, choices=ResourceType.choices)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    quantity = models.IntegerField(validators=[MinValueValidator(0)])
    unit = models.CharField(max_length=50, help_text=_('e.g., kg, pieces, boxes'))
    
    # Tracking
    minimum_quantity = models.IntegerField(default=0, help_text=_('Alert when below this level'))
    expiry_date = models.DateField(null=True, blank=True)
    
    # Status
    is_available = models.BooleanField(default=True)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('resource')
        verbose_name_plural = _('resources')
        ordering = ['shelter_home', 'resource_type', 'name']
        indexes = [
            models.Index(fields=['shelter_home', 'resource_type']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.shelter_home.name}"
    
    @property
    def needs_restock(self):
        """Check if resource needs restocking"""
        return self.quantity <= self.minimum_quantity


class StaffCredential(models.Model):
    """
    Shelter home staff credentials and verification
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shelter_home = models.ForeignKey(ShelterHome, on_delete=models.CASCADE, related_name='staff_credentials')
    
    staff_name = models.CharField(max_length=200)
    position = models.CharField(max_length=100)
    id_number = models.CharField(max_length=50)
    phone_number = models.CharField(max_length=20)
    
    # Credentials
    certificate_of_good_conduct = models.BooleanField(default=False)
    certificate_expiry = models.DateField(null=True, blank=True)
    training_certificates = models.TextField(blank=True, help_text=_('List of training certificates'))
    
    # Verification
    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    verification_date = models.DateField(null=True, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('staff credential')
        verbose_name_plural = _('staff credentials')
        ordering = ['shelter_home', 'staff_name']
    
    def __str__(self):
        return f"{self.staff_name} - {self.shelter_home.name}"


class ResourceRequest(models.Model):
    """
    Requests for supplies from shelter homes
    """
    
    class Priority(models.TextChoices):
        LOW = 'LOW', _('Low')
        MEDIUM = 'MEDIUM', _('Medium')
        HIGH = 'HIGH', _('High')
        URGENT = 'URGENT', _('Urgent')
    
    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        APPROVED = 'APPROVED', _('Approved')
        IN_TRANSIT = 'IN_TRANSIT', _('In Transit')
        DELIVERED = 'DELIVERED', _('Delivered')
        REJECTED = 'REJECTED', _('Rejected')
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shelter_home = models.ForeignKey(ShelterHome, on_delete=models.CASCADE, related_name='resource_requests')
    
    # Request details
    item_category = models.CharField(max_length=20, choices=Resource.ResourceType.choices)
    items_description = models.TextField(help_text=_('List of items needed and specific details'))
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.MEDIUM)
    needed_by = models.DateField(null=True, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    rejection_reason = models.TextField(blank=True)
    
    # Metadata
    requested_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='resource_requests_made')
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='resource_requests_processed')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('resource request')
        verbose_name_plural = _('resource requests')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.item_category} request - {self.shelter_home.name}"


class IncidentReport(models.Model):
    """
    Reports of emergencies or operational issues
    """
    
    class Severity(models.TextChoices):
        INFO = 'INFO', _('Information')
        LOW = 'LOW', _('Low')
        MEDIUM = 'MEDIUM', _('Medium')
        HIGH = 'HIGH', _('High')
        CRITICAL = 'CRITICAL', _('Critical')
    
    class Status(models.TextChoices):
        OPEN = 'OPEN', _('Open')
        INVESTIGATING = 'INVESTIGATING', _('Investigating')
        RESOLVED = 'RESOLVED', _('Resolved')
        CLOSED = 'CLOSED', _('Closed')
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shelter_home = models.ForeignKey(ShelterHome, on_delete=models.CASCADE, related_name='incident_reports')
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    incident_date = models.DateTimeField(default=timezone.now)
    
    severity = models.CharField(max_length=20, choices=Severity.choices, default=Severity.MEDIUM)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    
    # Actions taken
    actions_taken = models.TextField(blank=True)
    resolution_notes = models.TextField(blank=True)
    
    # Metadata
    reported_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='incidents_reported')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='incidents_assigned')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('incident report')
        verbose_name_plural = _('incident reports')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.shelter_home.name}"
