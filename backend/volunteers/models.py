"""
Volunteer Management Models
Volunteer coordination, task management, and time tracking
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator
from decimal import Decimal
from accounts.models import User
from shelter_homes.models import ShelterHome
import uuid


class Volunteer(models.Model):
    """
    Volunteer profiles and management
    """
    
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', _('Active')
        INACTIVE = 'INACTIVE', _('Inactive')
        ON_LEAVE = 'ON_LEAVE', _('On Leave')
        SUSPENDED = 'SUSPENDED', _('Suspended')
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, related_name='volunteer_profile')
    
    # Personal information
    full_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone_number = models.CharField(max_length=20)
    date_of_birth = models.DateField(null=True, blank=True)
    
    # Address
    county = models.CharField(max_length=100)
    city = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)
    
    # Emergency contact
    emergency_contact_name = models.CharField(max_length=200)
    emergency_contact_phone = models.CharField(max_length=20)
    emergency_contact_relationship = models.CharField(max_length=100)
    
    # Skills and availability
    skills = models.TextField(help_text=_('Comma-separated skills'))
    areas_of_interest = models.TextField(blank=True)
    availability = models.TextField(help_text=_('Available days/times'))
    
    # Background check
    background_check_completed = models.BooleanField(default=False)
    background_check_date = models.DateField(null=True, blank=True)
    background_check_expiry = models.DateField(null=True, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    join_date = models.DateField()
    leave_date = models.DateField(null=True, blank=True)
    
    # Metrics
    total_hours = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tasks_completed = models.IntegerField(default=0)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('volunteer')
        verbose_name_plural = _('volunteers')
        ordering = ['-join_date']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['status']),
            models.Index(fields=['county']),
        ]
    
    def __str__(self):
        return self.full_name


class Task(models.Model):
    """
    Volunteer tasks and assignments
    """
    
    class Status(models.TextChoices):
        OPEN = 'OPEN', _('Open')
        ASSIGNED = 'ASSIGNED', _('Assigned')
        IN_PROGRESS = 'IN_PROGRESS', _('In Progress')
        COMPLETED = 'COMPLETED', _('Completed')
        CANCELLED = 'CANCELLED', _('Cancelled')
    
    class Priority(models.TextChoices):
        LOW = 'LOW', _('Low')
        MEDIUM = 'MEDIUM', _('Medium')
        HIGH = 'HIGH', _('High')
        URGENT = 'URGENT', _('Urgent')
    
    class TaskType(models.TextChoices):
        SHELTER = 'SHELTER', _('Shelter Assistance')
        COMMUNITY = 'COMMUNITY', _('Community Service')
        EVENT = 'EVENT', _('Event Support')
        OTHER = 'OTHER', _('Other')

    class ApprovalStatus(models.TextChoices):
        PENDING = 'PENDING', _('Pending Approval')
        APPROVED = 'APPROVED', _('Approved')
        REJECTED = 'REJECTED', _('Rejected')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Task details
    title = models.CharField(max_length=200)
    description = models.TextField()
    task_type = models.CharField(max_length=20, choices=TaskType.choices, default=TaskType.OTHER)
    
    # Location
    location = models.CharField(max_length=200, help_text=_('Specific location/address'), default='General Location')
    shelter = models.ForeignKey(ShelterHome, on_delete=models.SET_NULL, null=True, blank=True, related_name='tasks')
    
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.MEDIUM)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    
    # Assignment
    assignees = models.ManyToManyField(Volunteer, blank=True, related_name='tasks')
    assigned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='tasks_assigned')
    
    # Recruitment
    volunteers_needed = models.IntegerField(default=1)
    
    # Request & Approval (for Shelter Requests)
    is_request = models.BooleanField(default=False)
    requested_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='tasks_requested')
    approval_status = models.CharField(max_length=20, choices=ApprovalStatus.choices, default=ApprovalStatus.APPROVED)
    
    # Timeline
    due_date = models.DateField(null=True, blank=True)
    estimated_hours = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    actual_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Completion
    completed_date = models.DateField(null=True, blank=True)
    completion_notes = models.TextField(blank=True)
    
    # Results (for Shelter Partners to log)
    result_summary = models.TextField(blank=True, help_text=_('Summary of the task outcome'))
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='tasks_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('task')
        verbose_name_plural = _('tasks')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['priority']),
            models.Index(fields=['due_date']),
            models.Index(fields=['shelter']),
            models.Index(fields=['approval_status']),
        ]
    
    def __str__(self):
        return self.title


class TaskApplication(models.Model):
    """
    Volunteers applying for open tasks
    """
    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        ACCEPTED = 'ACCEPTED', _('Accepted')
        REJECTED = 'REJECTED', _('Rejected')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='applications')
    volunteer = models.ForeignKey(Volunteer, on_delete=models.CASCADE, related_name='task_applications')
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    application_note = models.TextField(blank=True, help_text=_('Why do you want to do this task?'))
    
    applied_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        verbose_name = _('task application')
        verbose_name_plural = _('task applications')
        unique_together = ['task', 'volunteer']
        ordering = ['-applied_at']
        
    def __str__(self):
        return f"{self.volunteer.full_name} - {self.task.title}"


class Event(models.Model):
    """
    Volunteer events and activities
    """
    
    class EventType(models.TextChoices):
        TRAINING = 'TRAINING', _('Training')
        FUNDRAISER = 'FUNDRAISER', _('Fundraiser')
        COMMUNITY = 'COMMUNITY', _('Community Service')
        MEETING = 'MEETING', _('Meeting')
        OTHER = 'OTHER', _('Other')
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Event details
    title = models.CharField(max_length=200)
    description = models.TextField()
    event_type = models.CharField(max_length=20, choices=EventType.choices)
    
    # Location
    location = models.CharField(max_length=200)
    venue_details = models.TextField(blank=True)
    
    # Schedule
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    
    # Capacity
    max_volunteers = models.IntegerField(null=True, blank=True)
    registered_volunteers = models.ManyToManyField(Volunteer, blank=True, related_name='events')
    
    # Requirements
    required_skills = models.TextField(blank=True, help_text=_('Skills needed for this event'))
    
    # Status
    is_active = models.BooleanField(default=True)
    is_cancelled = models.BooleanField(default=False)
    cancellation_reason = models.TextField(blank=True)
    
    # Posting Control
    post_to_volunteers = models.BooleanField(default=True)
    post_to_donors = models.BooleanField(default=False)
    post_to_shelters = models.BooleanField(default=False)
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('event')
        verbose_name_plural = _('events')
        ordering = ['-start_datetime']
        indexes = [
            models.Index(fields=['event_type']),
            models.Index(fields=['start_datetime']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return self.title
    
    @property
    def is_full(self):
        """Check if event is at capacity"""
        if not self.max_volunteers:
            return False
        return self.registered_volunteers.count() >= self.max_volunteers


class EventPhoto(models.Model):
    """
    Photos attached to volunteer events
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='events/photos/')
    caption = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('event photo')
        verbose_name_plural = _('event photos')
        
    def __str__(self):
        return f"Photo for {self.event.title}"


class TimeLog(models.Model):
    """
    Volunteer hours tracking
    """
    
    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending Approval')
        APPROVED = 'APPROVED', _('Approved')
        REJECTED = 'REJECTED', _('Rejected')
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    volunteer = models.ForeignKey(Volunteer, on_delete=models.CASCADE, related_name='time_logs')
    
    # Time details
    date = models.DateField()
    hours = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(Decimal('0.25'))])
    description = models.TextField(help_text=_('What did you work on?'))
    
    # Optional associations
    task = models.ForeignKey(Task, on_delete=models.SET_NULL, null=True, blank=True, related_name='time_logs')
    event = models.ForeignKey(Event, on_delete=models.SET_NULL, null=True, blank=True, related_name='time_logs')
    
    # Approval
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='time_logs_approved')
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('time log')
        verbose_name_plural = _('time logs')
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['volunteer', 'date']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.volunteer.full_name} - {self.date} - {self.hours}h"


class Training(models.Model):
    """
    Training materials and completion tracking
    """
    
    class TrainingType(models.TextChoices):
        ORIENTATION = 'ORIENTATION', _('Orientation')
        SAFETY = 'SAFETY', _('Safety Training')
        SKILLS = 'SKILLS', _('Skills Development')
        COMPLIANCE = 'COMPLIANCE', _('Compliance Training')
        OTHER = 'OTHER', _('Other')
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Training details
    title = models.CharField(max_length=200)
    description = models.TextField()
    training_type = models.CharField(max_length=20, choices=TrainingType.choices)
    
    # Content
    content = models.TextField(blank=True, help_text=_('Training content or instructions'))
    materials_url = models.URLField(blank=True, help_text=_('Link to training materials'))
    video_url = models.URLField(blank=True, help_text=_('Link to training video'))
    
    # Requirements
    is_required = models.BooleanField(default=False)
    duration_hours = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # Completion tracking
    completed_by = models.ManyToManyField(Volunteer, through='TrainingCompletion', related_name='trainings_completed')
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('training')
        verbose_name_plural = _('trainings')
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title


class TrainingCompletion(models.Model):
    """
    Tracking volunteer training completion
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    volunteer = models.ForeignKey(Volunteer, on_delete=models.CASCADE)
    training = models.ForeignKey(Training, on_delete=models.CASCADE)
    
    # Completion details
    completed_date = models.DateField()
    score = models.IntegerField(null=True, blank=True, help_text=_('Test score if applicable'))
    certificate_issued = models.BooleanField(default=False)
    certificate_file = models.FileField(upload_to='training/certificates/', blank=True, null=True)
    
    # Expiry (for certifications that expire)
    expiry_date = models.DateField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('training completion')
        verbose_name_plural = _('training completions')
        unique_together = ['volunteer', 'training']
        ordering = ['-completed_date']
    
    def __str__(self):
        return f"{self.volunteer.full_name} - {self.training.title}"


class VolunteerGroup(models.Model):
    """
    Groups for volunteer coordination
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    members = models.ManyToManyField(Volunteer, related_name='volunteer_groups')
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='groups_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('volunteer group')
        verbose_name_plural = _('volunteer groups')
        ordering = ['-created_at']
        
    def __str__(self):
        return self.name


class GroupMessage(models.Model):
    """
    Private messages within a volunteer group
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(VolunteerGroup, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='group_messages')
    content = models.TextField()
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('group message')
        verbose_name_plural = _('group messages')
        ordering = ['created_at']
        
    def __str__(self):
        return f"Msg from {self.sender.email} in {self.group.name}"
