"""
Case Management Models
Family and child welfare case management system
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from accounts.models import User
import uuid


class Family(models.Model):
    """
    Family registration and tracking
    """
    
    class VulnerabilityLevel(models.TextChoices):
        LOW = 'LOW', _('Low Risk')
        MEDIUM = 'MEDIUM', _('Medium Risk')
        HIGH = 'HIGH', _('High Risk')
        CRITICAL = 'CRITICAL', _('Critical')
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    family_code = models.CharField(max_length=20, unique=True, help_text=_('Unique family identifier'))
    
    # Primary contact
    primary_contact_name = models.CharField(max_length=200)
    primary_contact_phone = models.CharField(max_length=20)
    primary_contact_email = models.EmailField(blank=True)
    primary_contact_relationship = models.CharField(max_length=100, help_text=_('e.g., Mother, Father, Guardian'))
    
    # Address
    county = models.CharField(max_length=100)
    sub_county = models.CharField(max_length=100, blank=True)
    ward = models.CharField(max_length=100, blank=True)
    village = models.CharField(max_length=100, blank=True)
    physical_address = models.TextField(help_text=_('Detailed physical address'))
    
    # GPS coordinates (optional)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Vulnerability assessment
    vulnerability_score = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text=_('Calculated vulnerability score (0-100)')
    )
    vulnerability_level = models.CharField(
        max_length=20,
        choices=VulnerabilityLevel.choices,
        default=VulnerabilityLevel.MEDIUM
    )
    
    # Family composition
    total_members = models.IntegerField(default=0)
    children_count = models.IntegerField(default=0)
    adults_count = models.IntegerField(default=0)
    
    # Economic status
    monthly_income = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    income_source = models.CharField(max_length=200, blank=True)
    housing_type = models.CharField(max_length=100, blank=True, help_text=_('e.g., Rented, Owned, Informal settlement'))
    
    # Case worker assignment
    assigned_case_worker = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='assigned_families',
        limit_choices_to={'role': User.Role.CASE_WORKER}
    )
    
    # Status
    is_active = models.BooleanField(default=True)
    registration_date = models.DateField(auto_now_add=True)
    last_assessment_date = models.DateField(null=True, blank=True)
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='families_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('family')
        verbose_name_plural = _('families')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['family_code']),
            models.Index(fields=['vulnerability_level']),
            models.Index(fields=['assigned_case_worker']),
            models.Index(fields=['county']),
        ]
    
    def __str__(self):
        return f"{self.family_code} - {self.primary_contact_name}"


class Child(models.Model):
    """
    Individual child tracking and welfare
    """
    
    class Gender(models.TextChoices):
        MALE = 'M', _('Male')
        FEMALE = 'F', _('Female')
        OTHER = 'O', _('Other')
    
    class LegalStatus(models.TextChoices):
        WITH_PARENTS = 'WITH_PARENTS', _('Living with Parents')
        ORPHAN_SINGLE = 'ORPHAN_SINGLE', _('Single Orphan')
        ORPHAN_DOUBLE = 'ORPHAN_DOUBLE', _('Double Orphan')
        ABANDONED = 'ABANDONED', _('Abandoned')
        COURT_ORDER = 'COURT_ORDER', _('Under Court Order')
        GUARDIANSHIP = 'GUARDIANSHIP', _('Under Guardianship')
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    family = models.ForeignKey(Family, on_delete=models.CASCADE, related_name='children')
    
    # Personal information
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=Gender.choices)
    birth_certificate_number = models.CharField(max_length=50, blank=True)
    
    # Photo (with consent)
    photo = models.ImageField(upload_to='children/photos/', blank=True, null=True)
    photo_consent = models.BooleanField(default=False, help_text=_('Parental consent for photo'))
    
    # Legal status
    legal_status = models.CharField(max_length=20, choices=LegalStatus.choices)
    guardian_name = models.CharField(max_length=200, blank=True)
    guardian_relationship = models.CharField(max_length=100, blank=True)
    court_order_number = models.CharField(max_length=100, blank=True)
    
    # Education
    in_school = models.BooleanField(default=True)
    school_name = models.CharField(max_length=200, blank=True)
    grade_level = models.CharField(max_length=50, blank=True)
    education_support_needed = models.BooleanField(default=False)
    
    # Health
    health_status = models.TextField(blank=True, help_text=_('General health notes'))
    has_disability = models.BooleanField(default=False)
    disability_description = models.TextField(blank=True)
    medical_conditions = models.TextField(blank=True)
    
    # Special needs
    special_needs = models.TextField(blank=True)
    requires_counseling = models.BooleanField(default=False)
    
    # Status
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('child')
        verbose_name_plural = _('children')
        ordering = ['family', 'date_of_birth']
        indexes = [
            models.Index(fields=['family', 'is_active']),
            models.Index(fields=['legal_status']),
        ]
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def age(self):
        """Calculate child's age"""
        from datetime import date
        today = date.today()
        return today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))


class Case(models.Model):
    """
    Case management and progress tracking
    """
    
    class Status(models.TextChoices):
        OPEN = 'OPEN', _('Open')
        IN_PROGRESS = 'IN_PROGRESS', _('In Progress')
        ON_HOLD = 'ON_HOLD', _('On Hold')
        CLOSED = 'CLOSED', _('Closed')
        TRANSFERRED = 'TRANSFERRED', _('Transferred')
    
    class Priority(models.TextChoices):
        LOW = 'LOW', _('Low')
        MEDIUM = 'MEDIUM', _('Medium')
        HIGH = 'HIGH', _('High')
        URGENT = 'URGENT', _('Urgent')
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case_number = models.CharField(max_length=50, unique=True)
    family = models.ForeignKey(Family, on_delete=models.CASCADE, related_name='cases')
    
    # Case details
    title = models.CharField(max_length=200)
    description = models.TextField()
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.MEDIUM)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    
    # Assignment
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='assigned_cases',
        limit_choices_to={'role': User.Role.CASE_WORKER}
    )
    
    # Intervention plan
    intervention_plan = models.TextField(help_text=_('Detailed intervention plan'))
    expected_outcomes = models.TextField(blank=True)
    
    # Timeline
    opened_date = models.DateField(auto_now_add=True)
    target_closure_date = models.DateField(null=True, blank=True)
    closed_date = models.DateField(null=True, blank=True)
    
    # Closure details
    closure_reason = models.TextField(blank=True)
    closure_notes = models.TextField(blank=True)
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='cases_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('case')
        verbose_name_plural = _('cases')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['case_number']),
            models.Index(fields=['status']),
            models.Index(fields=['priority']),
            models.Index(fields=['assigned_to']),
        ]
    
    def __str__(self):
        return f"{self.case_number} - {self.title}"


class Assessment(models.Model):
    """
    Vulnerability and needs assessments
    """
    
    class AssessmentType(models.TextChoices):
        INITIAL = 'INITIAL', _('Initial Assessment')
        FOLLOW_UP = 'FOLLOW_UP', _('Follow-up Assessment')
        ANNUAL = 'ANNUAL', _('Annual Review')
        EMERGENCY = 'EMERGENCY', _('Emergency Assessment')
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    family = models.ForeignKey(Family, on_delete=models.CASCADE, related_name='assessments')
    assessment_type = models.CharField(max_length=20, choices=AssessmentType.choices)
    
    # Assessment details
    assessment_date = models.DateField()
    conducted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='assessments_conducted')
    
    # Scores (0-10 scale)
    economic_score = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(10)])
    housing_score = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(10)])
    health_score = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(10)])
    education_score = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(10)])
    safety_score = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(10)])
    
    # Overall score (calculated)
    overall_score = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    # Findings and recommendations
    findings = models.TextField()
    recommendations = models.TextField()
    urgent_needs = models.TextField(blank=True)
    
    # Follow-up
    next_assessment_date = models.DateField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('assessment')
        verbose_name_plural = _('assessments')
        ordering = ['-assessment_date']
        indexes = [
            models.Index(fields=['family', 'assessment_date']),
            models.Index(fields=['assessment_type']),
        ]
    
    def __str__(self):
        return f"{self.family.family_code} - {self.assessment_type} - {self.assessment_date}"
    
    def save(self, *args, **kwargs):
        """Calculate overall score before saving"""
        self.overall_score = (
            self.economic_score + self.housing_score + self.health_score +
            self.education_score + self.safety_score
        ) * 2  # Convert to 0-100 scale
        super().save(*args, **kwargs)


class Document(models.Model):
    """
    Secure document storage with consent tracking
    """
    
    class DocumentType(models.TextChoices):
        ID_CARD = 'ID_CARD', _('ID Card')
        BIRTH_CERT = 'BIRTH_CERT', _('Birth Certificate')
        PHOTO = 'PHOTO', _('Photo')
        MEDICAL = 'MEDICAL', _('Medical Record')
        SCHOOL = 'SCHOOL', _('School Document')
        COURT = 'COURT', _('Court Order')
        OTHER = 'OTHER', _('Other')
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    family = models.ForeignKey(Family, on_delete=models.CASCADE, related_name='documents', null=True, blank=True)
    child = models.ForeignKey(Child, on_delete=models.CASCADE, related_name='documents', null=True, blank=True)
    
    document_type = models.CharField(max_length=20, choices=DocumentType.choices)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='case_documents/%Y/%m/')
    
    # Consent tracking
    consent_obtained = models.BooleanField(default=False)
    consent_date = models.DateField(null=True, blank=True)
    consent_given_by = models.CharField(max_length=200, blank=True)
    
    # Access control
    is_sensitive = models.BooleanField(default=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('document')
        verbose_name_plural = _('documents')
        ordering = ['-uploaded_at']
        indexes = [
            models.Index(fields=['family']),
            models.Index(fields=['child']),
            models.Index(fields=['document_type']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.document_type}"


class CaseNote(models.Model):
    """
    Case progress notes and updates
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='notes')
    
    note = models.TextField()
    is_milestone = models.BooleanField(default=False, help_text=_('Mark as significant milestone'))
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('case note')
        verbose_name_plural = _('case notes')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.case.case_number} - {self.created_at.date()}"
