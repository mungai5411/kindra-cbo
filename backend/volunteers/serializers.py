"""
Volunteer Management Serializers
"""

from rest_framework import serializers
from django.utils.html import strip_tags
from .models import Volunteer, Task, Event, EventPhoto, TimeLog, Training, TrainingCompletion, TaskApplication, VolunteerGroup, GroupMessage


class VolunteerSerializer(serializers.ModelSerializer):
    total_hours_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = Volunteer
        fields = '__all__'
        read_only_fields = ('id', 'total_hours', 'tasks_completed', 'created_at', 'updated_at')
    
    def get_total_hours_formatted(self, obj):
        return f"{obj.total_hours} hours"

    account_details = serializers.SerializerMethodField()

    def get_account_details(self, obj):
        if obj.user:
            return {
                'role': obj.user.role,
                'is_active': obj.user.is_active,
                'is_verified': obj.user.is_verified,
                'date_joined': obj.user.date_joined,
                'last_login': obj.user.last_login,
                'profile_picture': obj.user.profile_picture.url if obj.user.profile_picture else None,
                'first_name': obj.user.first_name,
                'last_name': obj.user.last_name,
            }
        return None


class TaskApplicationSerializer(serializers.ModelSerializer):
    volunteer_name = serializers.CharField(source='volunteer.full_name', read_only=True)
    task_title = serializers.CharField(source='task.title', read_only=True)
    volunteer_email = serializers.EmailField(source='volunteer.email', read_only=True)
    
    class Meta:
        model = TaskApplication
        fields = '__all__'
        read_only_fields = ('id', 'applied_at', 'reviewed_at', 'reviewed_by')


class TaskSerializer(serializers.ModelSerializer):
    assignees_details = serializers.SerializerMethodField()
    assigned_by_name = serializers.CharField(source='assigned_by.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    shelter_name = serializers.CharField(source='shelter.name', read_only=True)
    
    requested_by_name = serializers.CharField(source='requested_by.get_full_name', read_only=True)
    application_count = serializers.SerializerMethodField()
    has_applied = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ('id', 'actual_hours', 'created_at', 'updated_at', 'application_count', 'has_applied', 'assignees_details')

    def validate_title(self, value):
        value = strip_tags(value or '').strip()
        if not value:
            raise serializers.ValidationError('Title is required.')
        if len(value) > 200:
            raise serializers.ValidationError('Title is too long.')
        return value

    def validate_description(self, value):
        value = strip_tags(value or '').strip()
        if not value:
            raise serializers.ValidationError('Description is required.')
        if len(value) > 5000:
            raise serializers.ValidationError('Description is too long.')
        return value

    def validate_location(self, value):
        value = strip_tags(value or '').strip()
        if len(value) > 200:
            raise serializers.ValidationError('Location is too long.')
        return value
        
    def get_assignees_details(self, obj):
        return [{'id': v.id, 'name': v.full_name, 'email': v.email} for v in obj.assignees.all()]

    def get_application_count(self, obj):
        return obj.applications.count()
        
    def get_has_applied(self, obj):
        request = self.context.get('request')
        if request and hasattr(request.user, 'volunteer_profile'):
            return obj.applications.filter(volunteer=request.user.volunteer_profile).exists()
        return False


class EventPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventPhoto
        fields = '__all__'


class EventSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    registered_count = serializers.SerializerMethodField()
    is_full = serializers.ReadOnlyField()
    photos = EventPhotoSerializer(many=True, read_only=True)
    
    class Meta:
        model = Event
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_title(self, value):
        value = strip_tags(value or '').strip()
        if not value:
            raise serializers.ValidationError('Title is required.')
        if len(value) > 200:
            raise serializers.ValidationError('Title is too long.')
        return value

    def validate_description(self, value):
        value = strip_tags(value or '').strip()
        if len(value) > 5000:
            raise serializers.ValidationError('Description is too long.')
        return value

    def validate_location(self, value):
        value = strip_tags(value or '').strip()
        if len(value) > 200:
            raise serializers.ValidationError('Location is too long.')
        return value
    
    def get_registered_count(self, obj):
        return obj.registered_volunteers.count()


class EventRegistrationSerializer(serializers.Serializer):
    """Serializer for registering/unregistering for an event"""
    action = serializers.ChoiceField(choices=['register', 'unregister'])

    def validate(self, data):
        user = self.context['request'].user
        if not hasattr(user, 'volunteer_profile'):
            raise serializers.ValidationError("Only volunteers can register for events.")
        return data


class TimeLogSerializer(serializers.ModelSerializer):
    volunteer_name = serializers.CharField(source='volunteer.full_name', read_only=True)
    task_title = serializers.CharField(source='task.title', read_only=True)
    event_title = serializers.CharField(source='event.title', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = TimeLog
        fields = '__all__'
        read_only_fields = ('id', 'status', 'approved_by', 'approved_at', 'created_at', 'updated_at')


class TimeLogApprovalSerializer(serializers.ModelSerializer):
    """Serializer for approving/rejecting time logs"""
    
    class Meta:
        model = TimeLog
        fields = ['status', 'rejection_reason']


class TrainingSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    completion_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Training
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def get_completion_count(self, obj):
        return obj.completed_by.count()


class TrainingCompletionSerializer(serializers.ModelSerializer):
    volunteer_name = serializers.CharField(source='volunteer.full_name', read_only=True)
    training_title = serializers.CharField(source='training.title', read_only=True)
    
    class Meta:
        model = TrainingCompletion
        fields = '__all__'
        read_only_fields = ('id', 'created_at')

class VolunteerGroupSerializer(serializers.ModelSerializer):
    members_details = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    message_count = serializers.SerializerMethodField()
    
    class Meta:
        model = VolunteerGroup
        fields = '__all__'
        read_only_fields = ('id', 'created_by', 'created_at', 'updated_at')
        
    def get_members_details(self, obj):
        return [{'id': v.id, 'name': v.full_name, 'email': v.email} for v in obj.members.all()]
        
    def get_message_count(self, obj):
        return obj.messages.count()


class GroupMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    sender_email = serializers.EmailField(source='sender.email', read_only=True)
    
    class Meta:
        model = GroupMessage
        fields = '__all__'
        read_only_fields = ('id', 'sender', 'group', 'created_at')
