"""
User Serializers
Handles user registration, authentication, and profile management
"""

import base64
import binascii
import uuid
from django.core.files.base import ContentFile
from django.conf import settings
from django.utils.html import strip_tags

from rest_framework import serializers
from .models import User, AuditLog, Notification, VerificationToken, BugReport
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
import re

class BugReportSerializer(serializers.ModelSerializer):
    """Serializer for bug reports"""
    reporter_name = serializers.CharField(source='reporter.get_full_name', read_only=True)
    reporter_email = serializers.EmailField(source='reporter.email', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = BugReport
        fields = (
            'id', 'reporter', 'reporter_name', 'reporter_email',
            'bug_type', 'description', 'status', 'status_display',
            'admin_notes', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'reporter', 'created_at', 'updated_at')

class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for notifications"""
    
    class Meta:
        model = Notification
        fields = (
            'id', 'title', 'message', 'type', 'category',
            'read', 'created_at', 'link', 'metadata'
        )
        read_only_fields = ('id', 'created_at')


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = (
            'id', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone_number',
            'organization', 'role'
        )
        read_only_fields = ('id',)
    
    def validate_email(self, value):
        """Validate email format and uniqueness"""
        value = value.lower().strip()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value
    
    def validate_phone_number(self, value):
        """Validate phone number format"""
        if not value:
            return value
        # Remove spaces and special characters
        cleaned = re.sub(r'[\s\-\(\)]', '', value)
        # Check if it's a valid phone number (digits only, 10-15 characters)
        if not re.match(r'^\+?\d{10,15}$', cleaned):
            raise serializers.ValidationError('Invalid phone number format.')
        return cleaned
    
    def validate_organization(self, value):
        """Sanitize organization name"""
        if not value:
            return value
        value = strip_tags(value).strip()
        if len(value) > 200:
            raise serializers.ValidationError('Organization name is too long (max 200 characters).')
        return value
    
    def validate(self, attrs):
        """Validate password confirmation"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        return attrs
    
    def create(self, validated_data):
        """Create new user"""
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class Base64ImageField(serializers.ImageField):
    """
    A Django REST framework field for handling image-uploads through raw post data.
    It uses base64 for encoding and decoding the contents of the image.
    """
    def to_internal_value(self, data):
        # Check if this is a base64 string
        if isinstance(data, str) and data.startswith('data:image'):
            # base64 encoded image - format: data:image/png;base64,iVBORw0K...
            try:
                format, imgstr = data.split(';base64,')
            except ValueError:
                raise serializers.ValidationError('Invalid image data.')

            ext = format.split('/')[-1].lower()
            if ext not in {'png', 'jpg', 'jpeg', 'gif', 'webp'}:
                raise serializers.ValidationError('Unsupported image type.')

            max_bytes = getattr(settings, 'MAX_UPLOAD_SIZE', 10 * 1024 * 1024)
            try:
                decoded = base64.b64decode(imgstr, validate=True)
            except (binascii.Error, ValueError):
                raise serializers.ValidationError('Invalid base64 image data.')

            if len(decoded) > max_bytes:
                raise serializers.ValidationError('Image is too large.')

            id = uuid.uuid4()
            data = ContentFile(decoded, name=f"{id}.{ext}")

        return super().to_internal_value(data)

class UserSerializer(serializers.ModelSerializer):
    """Serializer for user details"""
    
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    donor_id = serializers.UUIDField(source='donor_profile.id', read_only=True)
    
    class Meta:
        model = User
        fields = (
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'phone_number', 'organization', 'role', 'role_display', 'donor_id',
            'profile_picture', 'is_active', 'is_verified', 'is_staff', 'is_superuser',
            'two_factor_enabled', 'created_at', 'last_login'
        )
        read_only_fields = (
            'id', 'created_at', 'last_login', 'is_verified'
        )


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    profile_picture = Base64ImageField(required=False, allow_null=True)
    
    class Meta:
        model = User
        fields = (
            'email', 'first_name', 'last_name', 'phone_number',
            'organization', 'profile_picture'
        )

    def validate_first_name(self, value):
        return strip_tags(value or '').strip()

    def validate_last_name(self, value):
        return strip_tags(value or '').strip()

    def validate_phone_number(self, value):
        value = strip_tags(value or '').strip()
        if len(value) > 20:
            raise serializers.ValidationError('Phone number is too long.')
        return value

    def validate_organization(self, value):
        value = strip_tags(value or '').strip()
        if len(value) > 200:
            raise serializers.ValidationError('Organization is too long.')
        return value


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change"""
    
    old_password = serializers.CharField(required=True, style={'input_type': 'password'})
    new_password = serializers.CharField(
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(required=True, style={'input_type': 'password'})
    
    def validate(self, attrs):
        """Validate new password confirmation"""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                "new_password": "New password fields didn't match."
            })
        return attrs


class AuditLogSerializer(serializers.ModelSerializer):
    """Serializer for audit logs"""
    
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    
    class Meta:
        model = AuditLog
        fields = (
            'id', 'user', 'user_email', 'user_name',
            'action', 'action_display', 'resource_type',
            'resource_id', 'description', 'ip_address',
            'timestamp'
        )
        read_only_fields = fields


class VerificationSerializer(serializers.Serializer):
    """Serializer for email verification"""
    token = serializers.CharField(required=True)


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request"""
    email = serializers.EmailField(required=True)


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for password reset confirmation"""
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        required=True,
        style={'input_type': 'password'}
    )

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                "new_password": "New password fields didn't match."
            })
        return attrs
