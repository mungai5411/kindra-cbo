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
    
    def validate(self, data):
        """Validate required fields for shelter registration"""
        # Only validate on creation
        if not self.instance:
            required_fields = [
                'name', 'contact_person', 'phone_number', 'email',
                'county', 'physical_address', 'total_capacity',
                'emergency_contact', 'age_range_min', 'age_range_max',
                'gender_policy', 'security_measures'
            ]
            missing_fields = []
            for field in required_fields:
                if field not in data or not data[field]:
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

        return data
    
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
