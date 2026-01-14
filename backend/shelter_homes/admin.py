"""
Shelter Home Admin Configuration
"""

from django.contrib import admin
from .models import ShelterHome, Placement, Resource, StaffCredential


@admin.register(ShelterHome)
class ShelterHomeAdmin(admin.ModelAdmin):
    list_display = ('name', 'county', 'total_capacity', 'current_occupancy', 'compliance_status', 'is_active')
    list_filter = ('county', 'compliance_status', 'is_active')
    search_fields = ('name', 'registration_number')


@admin.register(Placement)
class PlacementAdmin(admin.ModelAdmin):
    list_display = ('child', 'shelter_home', 'placement_date', 'status')
    list_filter = ('status', 'placement_date')
    search_fields = ('child__first_name', 'child__last_name', 'shelter_home__name')


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ('name', 'shelter_home', 'resource_type', 'quantity', 'unit', 'is_available')
    list_filter = ('resource_type', 'is_available')
    search_fields = ('name', 'shelter_home__name')


@admin.register(StaffCredential)
class StaffCredentialAdmin(admin.ModelAdmin):
    list_display = ('staff_name', 'shelter_home', 'position', 'is_verified', 'is_active')
    list_filter = ('is_verified', 'is_active')
    search_fields = ('staff_name', 'shelter_home__name')
