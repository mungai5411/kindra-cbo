"""
Case Management Admin Configuration
"""

from django.contrib import admin
from .models import Family, Child, Case, Assessment, Document, CaseNote


@admin.register(Family)
class FamilyAdmin(admin.ModelAdmin):
    list_display = ('family_code', 'primary_contact_name', 'county', 'vulnerability_level', 'children_count', 'assigned_case_worker', 'is_active')
    list_filter = ('vulnerability_level', 'county', 'is_active', 'registration_date')
    search_fields = ('family_code', 'primary_contact_name', 'primary_contact_phone')
    readonly_fields = ('family_code', 'registration_date', 'created_at', 'updated_at')
    fieldsets = (
        ('Basic Information', {
            'fields': ('family_code', 'primary_contact_name', 'primary_contact_phone', 'primary_contact_email', 'primary_contact_relationship')
        }),
        ('Address', {
            'fields': ('county', 'sub_county', 'ward', 'village', 'physical_address', 'latitude', 'longitude')
        }),
        ('Vulnerability', {
            'fields': ('vulnerability_score', 'vulnerability_level')
        }),
        ('Family Composition', {
            'fields': ('total_members', 'children_count', 'adults_count')
        }),
        ('Economic Status', {
            'fields': ('monthly_income', 'income_source', 'housing_type')
        }),
        ('Case Management', {
            'fields': ('assigned_case_worker', 'is_active', 'registration_date', 'last_assessment_date')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at')
        }),
    )


@admin.register(Child)
class ChildAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'date_of_birth', 'gender', 'legal_status', 'family', 'in_school', 'is_active')
    list_filter = ('gender', 'legal_status', 'in_school', 'has_disability', 'is_active')
    search_fields = ('first_name', 'last_name', 'family__family_code')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Case)
class CaseAdmin(admin.ModelAdmin):
    list_display = ('case_number', 'title', 'family', 'status', 'priority', 'assigned_to', 'opened_date')
    list_filter = ('status', 'priority', 'opened_date')
    search_fields = ('case_number', 'title', 'family__family_code')
    readonly_fields = ('case_number', 'opened_date', 'created_at', 'updated_at')


@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    list_display = ('family', 'assessment_type', 'assessment_date', 'overall_score', 'conducted_by')
    list_filter = ('assessment_type', 'assessment_date')
    search_fields = ('family__family_code',)
    readonly_fields = ('overall_score', 'created_at', 'updated_at')


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'document_type', 'family', 'child', 'consent_obtained', 'uploaded_by', 'uploaded_at')
    list_filter = ('document_type', 'consent_obtained', 'is_sensitive', 'uploaded_at')
    search_fields = ('title', 'family__family_code', 'child__first_name', 'child__last_name')
    readonly_fields = ('uploaded_at',)


@admin.register(CaseNote)
class CaseNoteAdmin(admin.ModelAdmin):
    list_display = ('case', 'is_milestone', 'created_by', 'created_at')
    list_filter = ('is_milestone', 'created_at')
    search_fields = ('case__case_number', 'note')
    readonly_fields = ('created_at',)
