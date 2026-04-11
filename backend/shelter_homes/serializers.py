"""
Shelter Home Serializers
"""

from rest_framework import serializers
from django.utils import timezone
from django.conf import settings
from django.utils.html import strip_tags
from .models import (
    ShelterHome, Placement, Resource, StaffCredential, 
    ShelterPhoto, ResourceRequest, IncidentReport
)


"""Serializer for shelter photos"""


class ShelterPhotoSerializer(serializers.ModelSerializer):
    """Serializer for shelter photos"""
    class Meta:
        model = ShelterPhoto
        fields = '__all__'
        read_only_fields = ('id', 'uploaded_at')


class ShelterHomeSerializer(serializers.ModelSerializer):
    available_beds = serializers.ReadOnlyField()
    occupancy_percentage = serializers.ReadOnlyField()
    photos = ShelterPhotoSerializer(many=True, read_only=True)
    uploaded_photos = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False,
        max_length=10,
        help_text='Upload 3-10 photos of the shelter'
    )
    
    class Meta:
        model = ShelterHome
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'approval_status', 'approved_by', 'approval_date')
        extra_kwargs = {
            'registration_number': {'required': False}  # Will be required by validate() for POST only
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # For partial updates (PATCH), don't require all fields
        if self.instance is not None:
            # This is an update, make fields not required
            for field_name, field in self.fields.items():
                if field_name not in self.Meta.read_only_fields:
                    # Allow all fields to be optional on PATCH, except coordinates must stay not-required
                    field.required = False
    
    def validate_registration_number(self, value):
        """Validate registration number is unique, excluding current instance on update"""
        if not value:  # Allow empty/None on updates
            return value
            
        queryset = ShelterHome.objects.filter(registration_number=value)
        
        # Exclude current instance if updating
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        
        if queryset.exists():
            raise serializers.ValidationError("A shelter with this registration number already exists.")
        
        return value
    
    def validate(self, data):
        """Validate required fields for shelter registration"""
        # Only validate required fields strictly on creation
        if not self.instance:
            required_fields = [
                'name', 'contact_person', 'phone_number', 'email',
                'county', 'physical_address', 'total_capacity',
                'emergency_contact', 'age_range_min', 'age_range_max',
                'gender_policy', 'security_measures'
            ]
            missing_fields = []
            for field in required_fields:
                val = data.get(field)
                if val is None or val == '':
                    missing_fields.append(field)
            
            if missing_fields:
                raise serializers.ValidationError({
                    'missing_fields': f"Required fields missing: {', '.join(missing_fields)}"
                })
            
            # Validate photos
            uploaded_photos = data.get('uploaded_photos', [])
            if len(uploaded_photos) < 3:
                raise serializers.ValidationError({
                    'uploaded_photos': 'At least 3 photos are required for shelter registration'
                })

            max_bytes = getattr(settings, 'MAX_UPLOAD_SIZE', 10 * 1024 * 1024)
            for photo in uploaded_photos:
                if hasattr(photo, 'size') and photo.size and photo.size > max_bytes:
                    raise serializers.ValidationError({
                        'uploaded_photos': f'Each photo must be smaller than {int(max_bytes / (1024 * 1024))}MB'
                    })
                content_type = getattr(photo, 'content_type', '') or ''
                if content_type and not content_type.startswith('image/'):
                    raise serializers.ValidationError({
                        'uploaded_photos': 'Only image uploads are allowed.'
                    })

            # Sanitize text fields
            data['name'] = strip_tags(data.get('name', ''))
            data['contact_person'] = strip_tags(data.get('contact_person', ''))
            data['emergency_contact'] = strip_tags(data.get('emergency_contact', ''))
            data['physical_address'] = strip_tags(data.get('physical_address', ''))
            data['security_measures'] = strip_tags(data.get('security_measures', ''))

        # On updates, sanitize text fields if provided
        else:
            text_fields = ['name', 'contact_person', 'emergency_contact', 'physical_address', 'security_measures']
            for field in text_fields:
                if field in data:
                    data[field] = strip_tags(data[field]) if data[field] else data[field]

        return data
    
    def to_internal_value(self, data):
        """Convert incoming float coordinates to proper Decimal format"""
        result = super().to_internal_value(data)
        
        # Ensure latitude and longitude are properly formatted as Decimals
        if 'latitude' in result and result['latitude'] is not None:
            try:
                result['latitude'] = float(result['latitude'])
            except (TypeError, ValueError):
                raise serializers.ValidationError({'latitude': 'Must be a valid number'})
        
        if 'longitude' in result and result['longitude'] is not None:
            try:
                result['longitude'] = float(result['longitude'])
            except (TypeError, ValueError):
                raise serializers.ValidationError({'longitude': 'Must be a valid number'})
        
        return result
    
    def to_representation(self, instance):
        """Ensure decimal fields are properly serialized"""
        ret = super().to_representation(instance)
        # Ensure coordinates are serialized as floats for frontend
        if 'latitude' in ret and ret['latitude'] is not None:
            ret['latitude'] = float(ret['latitude'])
        if 'longitude' in ret and ret['longitude'] is not None:
            ret['longitude'] = float(ret['longitude'])
        return ret
    
    def create(self, validated_data):
        """Create shelter and associated photos"""
        uploaded_photos = validated_data.pop('uploaded_photos', [])
        
        # Check if creator is admin
        request = self.context.get('request')
        is_admin = request and (
            request.user.is_superuser or 
            request.user.role in ['ADMIN', 'MANAGEMENT']
        )
        
        # Admins can create pre-approved shelters, partners create pending shelters
        if is_admin:
            validated_data['approval_status'] = 'APPROVED'
            validated_data['is_active'] = True
            validated_data['approved_by'] = request.user
            validated_data['approval_date'] = timezone.now()
        else:
            validated_data['approval_status'] = 'PENDING'
            validated_data['is_active'] = False
        
        shelter = super().create(validated_data)
        
        # Create photo records
        photo_types = ['EXTERIOR', 'DORMITORY', 'FACILITIES']
        for idx, photo in enumerate(uploaded_photos):
            photo_type = photo_types[idx] if idx < len(photo_types) else 'OTHER'
            is_primary = (idx == 0)  # First photo is primary
            
            ShelterPhoto.objects.create(
                shelter_home=shelter,
                image=photo,
                photo_type=photo_type,
                is_primary=is_primary
            )
        
        return shelter

    
    def update(self, instance, validated_data):
        """Update shelter - handles PATCH requests"""
        # Remove fields that shouldn't be updated
        validated_data.pop('uploaded_photos', None)
        validated_data.pop('photos', None)  # In case frontend sends this
        
        # Get all valid field names from the model
        valid_fields = {f.name for f in instance._meta.get_fields()}
        
        # Update only valid fields that exist on the model
        for attr, value in validated_data.items():
            if attr in valid_fields and hasattr(instance, attr) and attr not in ['created_at', 'updated_at', 'id']:
                setattr(instance, attr, value)
        
        try:
            instance.save()
            return instance
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to save shelter: {str(e)}", exc_info=True)
            raise


class PlacementSerializer(serializers.ModelSerializer):
    child_name = serializers.SerializerMethodField()
    shelter_name = serializers.CharField(source='shelter_home.name', read_only=True)
    
    class Meta:
        model = Placement
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def get_child_name(self, obj):
        if obj.child:
            return f"{obj.child.first_name} {obj.child.last_name}"
        return "Unknown"


class ResourceSerializer(serializers.ModelSerializer):
    needs_restock = serializers.ReadOnlyField()
    
    class Meta:
        model = Resource
        fields = '__all__'
        read_only_fields = ('id', 'last_updated')


class StaffCredentialSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffCredential
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class ResourceRequestSerializer(serializers.ModelSerializer):
    shelter_name = serializers.CharField(source='shelter_home.name', read_only=True)
    requested_by_name = serializers.CharField(source='requested_by.get_full_name', read_only=True)
    
    class Meta:
        model = ResourceRequest
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'status', 'processed_by', 'rejection_reason')


class IncidentReportSerializer(serializers.ModelSerializer):
    shelter_name = serializers.CharField(source='shelter_home.name', read_only=True)
    reported_by_name = serializers.CharField(source='reported_by.get_full_name', read_only=True)
    
    class Meta:
        model = IncidentReport
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'status', 'assigned_to', 'actions_taken', 'resolution_notes')
