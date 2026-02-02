"""
Reporting & Analytics Models
Analytics, dashboards, and compliance reporting
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.files.storage import FileSystemStorage
from accounts.models import User
import uuid

# Force local storage for reports (not Cloudinary)
local_storage = FileSystemStorage()


class Report(models.Model):
    """
    Generated reports with PDF/Excel storage
    """
    
    class ReportType(models.TextChoices):
        DONATION = 'DONATION', _('Donation Report')
        VOLUNTEER = 'VOLUNTEER', _('Volunteer Hours Report')
        CASE = 'CASE', _('Case Management Report')
        SHELTER = 'SHELTER', _('Shelter Home Report')
        COMPLIANCE = 'COMPLIANCE', _('Compliance Report')
        FINANCIAL = 'FINANCIAL', _('Financial Report')
        CUSTOM = 'CUSTOM', _('Custom Report')
    
    class Format(models.TextChoices):
        PDF = 'PDF', _('PDF')
        EXCEL = 'EXCEL', _('Excel')
        CSV = 'CSV', _('CSV')
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Report details
    title = models.CharField(max_length=200)
    report_type = models.CharField(max_length=20, choices=ReportType.choices)
    description = models.TextField(blank=True)
    
    # Date range
    start_date = models.DateField()
    end_date = models.DateField()
    
    # Format and file (stored in MEDIA_ROOT/reports/, NOT Cloudinary)
    format = models.CharField(max_length=10, choices=Format.choices, default=Format.PDF)
    file = models.FileField(upload_to='reports/%Y/%m/', storage=local_storage, blank=True, null=True)
    
    # Parameters (JSON field for filter criteria)
    parameters = models.JSONField(default=dict, blank=True, help_text=_('Report filter parameters'))
    
    # Generation
    generated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='reports_generated')
    generated_at = models.DateTimeField(auto_now_add=True)
    
    # Scheduling
    is_scheduled = models.BooleanField(default=False)
    schedule_frequency = models.CharField(
        max_length=20,
        blank=True,
        choices=[
            ('DAILY', 'Daily'),
            ('WEEKLY', 'Weekly'),
            ('MONTHLY', 'Monthly'),
            ('QUARTERLY', 'Quarterly'),
        ]
    )
    
    class Meta:
        verbose_name = _('report')
        verbose_name_plural = _('reports')
        ordering = ['-generated_at']
        indexes = [
            models.Index(fields=['report_type']),
            models.Index(fields=['generated_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.generated_at.date()}"


class Dashboard(models.Model):
    """
    Custom dashboard configurations per user role
    """
    
    class DashboardType(models.TextChoices):
        EXECUTIVE = 'EXECUTIVE', _('Executive Dashboard')
        CASE_WORKER = 'CASE_WORKER', _('Case Worker Dashboard')
        VOLUNTEER_MANAGER = 'VOLUNTEER_MANAGER', _('Volunteer Manager Dashboard')
        DONOR_RELATIONS = 'DONOR_RELATIONS', _('Donor Relations Dashboard')
        CUSTOM = 'CUSTOM', _('Custom Dashboard')
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Dashboard details
    name = models.CharField(max_length=200)
    dashboard_type = models.CharField(max_length=30, choices=DashboardType.choices)
    description = models.TextField(blank=True)
    
    # Configuration (JSON for widget layout and settings)
    configuration = models.JSONField(
        default=dict,
        help_text=_('Dashboard widget configuration')
    )
    
    # Access control
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dashboards')
    is_shared = models.BooleanField(default=False)
    shared_with_roles = models.JSONField(default=list, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('dashboard')
        verbose_name_plural = _('dashboards')
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name


class KPI(models.Model):
    """
    Key Performance Indicators tracking
    """
    
    class Category(models.TextChoices):
        CHILDREN = 'CHILDREN', _('Children Served')
        FAMILIES = 'FAMILIES', _('Families Supported')
        DONATIONS = 'DONATIONS', _('Donations')
        VOLUNTEERS = 'VOLUNTEERS', _('Volunteers')
        CASES = 'CASES', _('Cases')
        SHELTERS = 'SHELTERS', _('Shelter Homes')
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # KPI details
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=Category.choices)
    description = models.TextField(blank=True)
    
    # Metric
    current_value = models.DecimalField(max_digits=15, decimal_places=2)
    target_value = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    unit = models.CharField(max_length=50, help_text=_('e.g., children, KES, hours'))
    
    # Time period
    period_start = models.DateField()
    period_end = models.DateField()
    
    # Trend (compared to previous period)
    previous_value = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    trend_percentage = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Metadata
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('KPI')
        verbose_name_plural = _('KPIs')
        ordering = ['category', 'name']
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['period_start', 'period_end']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.current_value} {self.unit}"
    
    @property
    def progress_percentage(self):
        """Calculate progress towards target"""
        if not self.target_value or self.target_value == 0:
            return None
        return (self.current_value / self.target_value) * 100


class AnalyticsEvent(models.Model):
    """
    Event tracking for analytics
    """
    
    class EventType(models.TextChoices):
        DONATION_RECEIVED = 'DONATION_RECEIVED', _('Donation Received')
        CASE_OPENED = 'CASE_OPENED', _('Case Opened')
        CASE_CLOSED = 'CASE_CLOSED', _('Case Closed')
        VOLUNTEER_JOINED = 'VOLUNTEER_JOINED', _('Volunteer Joined')
        VOLUNTEER_HOURS = 'VOLUNTEER_HOURS', _('Volunteer Hours Logged')
        BLOG_VIEW = 'BLOG_VIEW', _('Blog Post Viewed')
        CAMPAIGN_CREATED = 'CAMPAIGN_CREATED', _('Campaign Created')
        SHELTER_PLACEMENT = 'SHELTER_PLACEMENT', _('Shelter Placement')
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Event details
    event_type = models.CharField(max_length=30, choices=EventType.choices)
    event_data = models.JSONField(default=dict, help_text=_('Additional event data'))
    description = models.TextField(blank=True, help_text=_('Human readable description of the event'))
    
    # Context
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=255, blank=True)
    
    # Timestamp
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('analytics event')
        verbose_name_plural = _('analytics events')
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['event_type', 'timestamp']),
            models.Index(fields=['user', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.event_type} - {self.timestamp}"


class ComplianceReport(models.Model):
    """
    Regulatory compliance reports
    """
    
    class ReportingPeriod(models.TextChoices):
        MONTHLY = 'MONTHLY', _('Monthly')
        QUARTERLY = 'QUARTERLY', _('Quarterly')
        ANNUAL = 'ANNUAL', _('Annual')
    
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', _('Draft')
        SUBMITTED = 'SUBMITTED', _('Submitted')
        APPROVED = 'APPROVED', _('Approved')
        REJECTED = 'REJECTED', _('Rejected')
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Report details
    title = models.CharField(max_length=200)
    reporting_period = models.CharField(max_length=20, choices=ReportingPeriod.choices)
    period_start = models.DateField()
    period_end = models.DateField()
    
    # Content
    content = models.TextField(help_text=_('Report content'))
    attachments = models.FileField(upload_to='compliance/%Y/%m/', blank=True, null=True)
    
    # Metrics (JSON for various compliance metrics)
    metrics = models.JSONField(default=dict, help_text=_('Compliance metrics'))
    
    # Status
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    
    # Submission
    prepared_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='compliance_reports_prepared')
    submitted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='compliance_reports_submitted')
    submitted_at = models.DateTimeField(null=True, blank=True)
    
    # Approval
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='compliance_reports_approved')
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('compliance report')
        verbose_name_plural = _('compliance reports')
        ordering = ['-period_start']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['period_start', 'period_end']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.period_start} to {self.period_end}"
