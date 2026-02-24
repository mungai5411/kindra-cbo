"""
User Management Models
Custom user model with role-based permissions for Kindra CBO system
"""

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from datetime import timedelta
import uuid
import secrets


class UserManager(BaseUserManager):
    """Custom user manager for email-based authentication"""
    
    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular user"""
        if not email:
            raise ValueError(_('The Email field must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a superuser"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """
    Custom User model for Kindra CBO system
    Uses email for authentication instead of username
    """
    
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', _('System Administrator')
        MANAGEMENT = 'MANAGEMENT', _('Management Team')
        SOCIAL_MEDIA = 'SOCIAL_MEDIA', _('Social Media/Donations Coordinator')
        CASE_WORKER = 'CASE_WORKER', _('Case Worker')
        SHELTER_PARTNER = 'SHELTER_PARTNER', _('Shelter Home Partner')
        VOLUNTEER = 'VOLUNTEER', _('Volunteer')
        DONOR = 'DONOR', _('Donor')
    
    # Remove username, use email instead
    username = None
    email = models.EmailField(_('email address'), unique=True)
    
    # User profile fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.DONOR,
        help_text=_('User role determines access permissions')
    )
    phone_number = models.CharField(max_length=20, blank=True)
    organization = models.CharField(
        max_length=200,
        blank=True,
        help_text=_('Organization name for shelter partners or donors')
    )
    profile_picture = models.ImageField(
        upload_to='profiles/',
        blank=True,
        null=True
    )
    
    # Two-factor authentication
    two_factor_enabled = models.BooleanField(default=False)
    two_factor_secret = models.CharField(max_length=32, blank=True)
    
    # Activity tracking
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Account status
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(
        default=False,
        help_text=_('Email verification status')
    )
    is_approved = models.BooleanField(
        default=True,
        help_text=_('Indicates if the account has been approved by admin')
    )
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
            models.Index(fields=['is_active']),
            models.Index(fields=['is_approved']),
        ]
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
    
    def get_full_name(self):
        """Return the user's full name"""
        return f"{self.first_name} {self.last_name}".strip() or self.email
    
    @property
    def is_admin(self):
        """Check if user is an administrator"""
        return self.role == self.Role.ADMIN
    
    @property
    def is_case_worker(self):
        """Check if user is a case worker"""
        return self.role == self.Role.CASE_WORKER
    
    @property
    def is_shelter_partner(self):
        """Check if user is a shelter partner"""
        return self.role == self.Role.SHELTER_PARTNER


class AuditLog(models.Model):
    """
    Audit trail for compliance and security
    Tracks all important user actions
    """
    
    class Action(models.TextChoices):
        CREATE = 'CREATE', _('Create')
        READ = 'READ', _('Read')
        UPDATE = 'UPDATE', _('Update')
        DELETE = 'DELETE', _('Delete')
        LOGIN = 'LOGIN', _('Login')
        LOGOUT = 'LOGOUT', _('Logout')
        EXPORT = 'EXPORT', _('Export Data')
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='audit_logs'
    )
    action = models.CharField(max_length=20, choices=Action.choices)
    resource_type = models.CharField(
        max_length=50,
        help_text=_('Type of resource accessed (e.g., Case, Family, Donation)')
    )
    resource_id = models.CharField(
        max_length=100,
        blank=True,
        help_text=_('ID of the specific resource')
    )
    description = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('audit log')
        verbose_name_plural = _('audit logs')
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['action', 'timestamp']),
            models.Index(fields=['resource_type', 'resource_id']),
        ]
    
    def __str__(self):
        return f"{self.user} - {self.action} - {self.resource_type} at {self.timestamp}"


class Notification(models.Model):
    """
    System-wide notifications for users
    """
    class Type(models.TextChoices):
        INFO = 'info', _('Information')
        SUCCESS = 'success', _('Success')
        WARNING = 'warning', _('Warning')
        ERROR = 'error', _('Error')
        DONATION = 'donation', _('Donation')
        EVENT = 'event', _('Event')
        TASK = 'task', _('Task')
        CAMPAIGN = 'campaign', _('Campaign')

    class Category(models.TextChoices):
        SYSTEM = 'SYSTEM', _('System')
        DONATION = 'DONATION', _('Donation')
        VERIFICATION = 'VERIFICATION', _('Verification')
        SHELTER = 'SHELTER', _('Shelter')
        VOLUNTEER = 'VOLUNTEER', _('Volunteer')
        CASE = 'CASE', _('Case Management')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    
    title = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(max_length=50, choices=Type.choices, default=Type.INFO)
    category = models.CharField(max_length=50, choices=Category.choices, default=Category.SYSTEM)
    
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Optional metadata for linking
    link = models.CharField(max_length=500, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.recipient.email}"


class VerificationToken(models.Model):
    """
    Token for Email Verification and Password Reset
    """
    class TokenType(models.TextChoices):
        VERIFICATION = 'VERIFICATION', _('Email Verification')
        PASSWORD_RESET = 'PASSWORD_RESET', _('Password Reset')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='verification_tokens')
    token = models.CharField(max_length=64, unique=True)
    token_type = models.CharField(max_length=20, choices=TokenType.choices)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    # Expiry durations by token type
    EXPIRY_DURATIONS = {
        'VERIFICATION': timedelta(hours=24),   # 24 hours — user may check email later
        'PASSWORD_RESET': timedelta(hours=1),   # 1 hour  — shorter is more secure
    }

    def save(self, *args, **kwargs):
        if not self.token:
            self.token = secrets.token_urlsafe(32)
        if not self.expires_at:
            duration = self.EXPIRY_DURATIONS.get(self.token_type, timedelta(hours=1))
            self.expires_at = timezone.now() + duration
        super().save(*args, **kwargs)

    @property
    def is_valid(self):
        return not self.is_used and self.expires_at > timezone.now()

    def __str__(self):
        return f"{self.token_type} for {self.user.email}"


class BugReport(models.Model):
    """
    Bug reports submitted by users for admin action
    """
    class Status(models.TextChoices):
        OPEN = 'OPEN', _('Open')
        IN_PROGRESS = 'IN_PROGRESS', _('In Progress')
        RESOLVED = 'RESOLVED', _('Resolved')
        CLOSED = 'CLOSED', _('Closed')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reporter = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='bug_reports'
    )
    bug_type = models.CharField(max_length=50)
    description = models.TextField()
    status = models.CharField(
        max_length=20, 
        choices=Status.choices, 
        default=Status.OPEN
    )
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('bug report')
        verbose_name_plural = _('bug reports')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['bug_type']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.bug_type} ({self.status}) - {self.created_at.date()}"
