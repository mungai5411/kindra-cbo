"""
Reporting & Analytics Admin Configuration
"""

from django.contrib import admin
from .models import Report, Dashboard, KPI, AnalyticsEvent, ComplianceReport


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'report_type', 'format', 'start_date',
        'end_date', 'generated_by', 'generated_at', 'is_scheduled'
    )
    list_filter = ('report_type', 'format', 'is_scheduled', 'generated_at')
    search_fields = ('title', 'description')
    date_hierarchy = 'generated_at'
    ordering = ('-generated_at',)
    
    fieldsets = (
        ('Report Details', {
            'fields': ('title', 'report_type', 'description')
        }),
        ('Date Range', {
            'fields': ('start_date', 'end_date')
        }),
        ('Format & File', {
            'fields': ('format', 'file')
        }),
        ('Parameters', {
            'fields': ('parameters',),
            'classes': ('collapse',)
        }),
        ('Scheduling', {
            'fields': ('is_scheduled', 'schedule_frequency')
        }),
    )
    
    readonly_fields = ('generated_by', 'generated_at')


@admin.register(Dashboard)
class DashboardAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'dashboard_type', 'owner', 'is_shared',
        'is_active', 'is_default', 'created_at'
    )
    list_filter = ('dashboard_type', 'is_shared', 'is_active', 'is_default')
    search_fields = ('name', 'description')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Dashboard Details', {
            'fields': ('name', 'dashboard_type', 'description')
        }),
        ('Configuration', {
            'fields': ('configuration',)
        }),
        ('Access Control', {
            'fields': ('owner', 'is_shared', 'shared_with_roles')
        }),
        ('Status', {
            'fields': ('is_active', 'is_default')
        }),
    )


@admin.register(KPI)
class KPIAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'category', 'current_value', 'target_value',
        'unit', 'trend_percentage', 'is_active', 'last_updated'
    )
    list_filter = ('category', 'is_active', 'period_start')
    search_fields = ('name', 'description')
    ordering = ('category', 'name')
    
    fieldsets = (
        ('KPI Details', {
            'fields': ('name', 'category', 'description')
        }),
        ('Metric', {
            'fields': ('current_value', 'target_value', 'unit')
        }),
        ('Time Period', {
            'fields': ('period_start', 'period_end')
        }),
        ('Trend', {
            'fields': ('previous_value', 'trend_percentage')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )
    
    readonly_fields = ('last_updated',)


@admin.register(AnalyticsEvent)
class AnalyticsEventAdmin(admin.ModelAdmin):
    list_display = (
        'event_type', 'user', 'timestamp', 'ip_address'
    )
    list_filter = ('event_type', 'timestamp')
    search_fields = ('event_type', 'user__email')
    date_hierarchy = 'timestamp'
    ordering = ('-timestamp',)
    
    fieldsets = (
        ('Event', {
            'fields': ('event_type', 'event_data')
        }),
        ('Context', {
            'fields': ('user', 'ip_address', 'user_agent')
        }),
    )
    
    readonly_fields = ('timestamp',)


@admin.register(ComplianceReport)
class ComplianceReportAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'reporting_period', 'period_start', 'period_end',
        'status', 'prepared_by', 'submitted_at', 'approved_at'
    )
    list_filter = ('status', 'reporting_period', 'period_start')
    search_fields = ('title', 'content')
    date_hierarchy = 'period_start'
    ordering = ('-period_start',)
    
    fieldsets = (
        ('Report Details', {
            'fields': ('title', 'reporting_period', 'period_start', 'period_end')
        }),
        ('Content', {
            'fields': ('content', 'attachments', 'metrics')
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('Preparation', {
            'fields': ('prepared_by',)
        }),
        ('Submission', {
            'fields': ('submitted_by', 'submitted_at'),
            'classes': ('collapse',)
        }),
        ('Approval', {
            'fields': ('approved_by', 'approved_at', 'rejection_reason'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('prepared_by', 'submitted_by', 'submitted_at', 'approved_by', 'approved_at')
    
    actions = ['approve_reports', 'reject_reports']
    
    def approve_reports(self, request, queryset):
        from django.utils import timezone
        count = queryset.filter(status='SUBMITTED').update(
            status='APPROVED',
            approved_by=request.user,
            approved_at=timezone.now()
        )
        self.message_user(request, f'{count} report(s) approved.')
    approve_reports.short_description = 'Approve selected reports'
    
    def reject_reports(self, request, queryset):
        count = queryset.filter(status='SUBMITTED').update(status='REJECTED')
        self.message_user(request, f'{count} report(s) rejected.')
    reject_reports.short_description = 'Reject selected reports'
