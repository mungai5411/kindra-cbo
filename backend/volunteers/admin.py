"""
Volunteer Management Admin Configuration
"""

from django.contrib import admin
from .models import Volunteer, Task, Event, TimeLog, Training, TrainingCompletion


@admin.register(Volunteer)
class VolunteerAdmin(admin.ModelAdmin):
    list_display = (
        'full_name', 'email', 'status', 'county',
        'total_hours', 'tasks_completed', 'join_date'
    )
    list_filter = ('status', 'county', 'background_check_completed', 'join_date')
    search_fields = ('full_name', 'email', 'phone_number', 'skills')
    date_hierarchy = 'join_date'
    ordering = ('-join_date',)
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('user', 'full_name', 'email', 'phone_number', 'date_of_birth')
        }),
        ('Address', {
            'fields': ('county', 'city', 'address')
        }),
        ('Emergency Contact', {
            'fields': ('emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship')
        }),
        ('Skills & Availability', {
            'fields': ('skills', 'areas_of_interest', 'availability')
        }),
        ('Background Check', {
            'fields': ('background_check_completed', 'background_check_date', 'background_check_expiry')
        }),
        ('Status', {
            'fields': ('status', 'join_date', 'leave_date')
        }),
        ('Metrics', {
            'fields': ('total_hours', 'tasks_completed'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('total_hours', 'tasks_completed')


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'status', 'priority', 'assignees_display',
        'due_date', 'estimated_hours', 'actual_hours'
    )
    list_filter = ('status', 'priority', 'created_at', 'due_date')
    search_fields = ('title', 'description')
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)
    filter_horizontal = ('assignees',)
    
    fieldsets = (
        ('Task Details', {
            'fields': ('title', 'description', 'priority', 'status')
        }),
        ('Assignment', {
            'fields': ('assignees', 'assigned_by', 'created_by')
        }),
        ('Timeline', {
            'fields': ('due_date', 'estimated_hours', 'actual_hours')
        }),
        ('Completion', {
            'fields': ('completed_date', 'completion_notes'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('assigned_by', 'created_by')

    def assignees_display(self, obj):
        return ", ".join([v.full_name for v in obj.assignees.all()])
    assignees_display.short_description = 'Assignees'


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'event_type', 'start_datetime',
        'location', 'max_volunteers', 'is_active', 'is_cancelled'
    )
    list_filter = ('event_type', 'is_active', 'is_cancelled', 'start_datetime')
    search_fields = ('title', 'description', 'location')
    filter_horizontal = ('registered_volunteers',)
    date_hierarchy = 'start_datetime'
    ordering = ('-start_datetime',)
    
    fieldsets = (
        ('Event Details', {
            'fields': ('title', 'description', 'event_type')
        }),
        ('Location', {
            'fields': ('location', 'venue_details')
        }),
        ('Schedule', {
            'fields': ('start_datetime', 'end_datetime')
        }),
        ('Capacity', {
            'fields': ('max_volunteers', 'registered_volunteers')
        }),
        ('Requirements', {
            'fields': ('required_skills',)
        }),
        ('Status', {
            'fields': ('is_active', 'is_cancelled', 'cancellation_reason')
        }),
    )


@admin.register(TimeLog)
class TimeLogAdmin(admin.ModelAdmin):
    list_display = (
        'volunteer', 'date', 'hours', 'status',
        'task', 'event', 'approved_by', 'approved_at'
    )
    list_filter = ('status', 'date', 'approved_at')
    search_fields = ('volunteer__full_name', 'description')
    date_hierarchy = 'date'
    ordering = ('-date',)
    
    fieldsets = (
        ('Time Entry', {
            'fields': ('volunteer', 'date', 'hours', 'description')
        }),
        ('Associations', {
            'fields': ('task', 'event')
        }),
        ('Approval', {
            'fields': ('status', 'approved_by', 'approved_at', 'rejection_reason')
        }),
    )
    
    readonly_fields = ('approved_by', 'approved_at')
    
    actions = ['approve_timelogs', 'reject_timelogs']
    
    def approve_timelogs(self, request, queryset):
        from django.utils import timezone
        count = 0
        for timelog in queryset.filter(status='PENDING'):
            timelog.status = 'APPROVED'
            timelog.approved_by = request.user
            timelog.approved_at = timezone.now()
            timelog.save()
            
            # Update volunteer total hours
            volunteer = timelog.volunteer
            volunteer.total_hours += timelog.hours
            volunteer.save(update_fields=['total_hours'])
            count += 1
        
        self.message_user(request, f'{count} time log(s) approved.')
    approve_timelogs.short_description = 'Approve selected time logs'
    
    def reject_timelogs(self, request, queryset):
        from django.utils import timezone
        count = queryset.filter(status='PENDING').update(
            status='REJECTED',
            approved_by=request.user,
            approved_at=timezone.now()
        )
        self.message_user(request, f'{count} time log(s) rejected.')
    reject_timelogs.short_description = 'Reject selected time logs'


@admin.register(Training)
class TrainingAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'training_type', 'is_required',
        'duration_hours', 'is_active', 'created_at'
    )
    list_filter = ('training_type', 'is_required', 'is_active', 'created_at')
    search_fields = ('title', 'description')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Training Details', {
            'fields': ('title', 'description', 'training_type')
        }),
        ('Content', {
            'fields': ('content', 'materials_url', 'video_url')
        }),
        ('Requirements', {
            'fields': ('is_required', 'duration_hours')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )


@admin.register(TrainingCompletion)
class TrainingCompletionAdmin(admin.ModelAdmin):
    list_display = (
        'volunteer', 'training', 'completed_date',
        'score', 'certificate_issued', 'expiry_date'
    )
    list_filter = ('certificate_issued', 'completed_date', 'expiry_date')
    search_fields = ('volunteer__full_name', 'training__title')
    date_hierarchy = 'completed_date'
    ordering = ('-completed_date',)
    
    fieldsets = (
        ('Completion', {
            'fields': ('volunteer', 'training', 'completed_date', 'score')
        }),
        ('Certificate', {
            'fields': ('certificate_issued', 'certificate_file', 'expiry_date')
        }),
    )
