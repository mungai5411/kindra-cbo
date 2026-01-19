"""
Shelter Home URL Configuration
"""

from django.urls import path
from .views import (
    ShelterHomeListCreateView, ShelterHomeDetailView,
    PlacementListCreateView, PlacementDetailView,
    ResourceListCreateView, ResourceDetailView,
    StaffCredentialListCreateView, StaffCredentialDetailView,
    ResourceRequestListCreateView, IncidentReportListCreateView,
    add_shelter_photo, delete_shelter_photo, set_primary_shelter_photo,
)
from .approval_views import ShelterApprovalView, PendingSheltersView

app_name = 'shelter_homes'

urlpatterns = [
    path('', ShelterHomeListCreateView.as_view(), name='shelter-list'),
    path('<uuid:pk>/', ShelterHomeDetailView.as_view(), name='shelter-detail'),
    
    # Approval endpoints (Admin only)
    path('<uuid:pk>/approve/', ShelterApprovalView.as_view(), name='shelter-approve'),
    path('pending/', PendingSheltersView.as_view(), name='shelters-pending'),
    
    path('placements/', PlacementListCreateView.as_view(), name='placement-list'),
    path('placements/<uuid:pk>/', PlacementDetailView.as_view(), name='placement-detail'),
    path('resources/', ResourceListCreateView.as_view(), name='resource-list'),
    path('resources/<uuid:pk>/', ResourceDetailView.as_view(), name='resource-detail'),
    path('staff/', StaffCredentialListCreateView.as_view(), name='staff-list'),
    path('staff/<uuid:pk>/', StaffCredentialDetailView.as_view(), name='staff-detail'),
    
    # New interactive features
    path('requests/', ResourceRequestListCreateView.as_view(), name='resource-request-list'),
    path('incidents/', IncidentReportListCreateView.as_view(), name='incident-report-list'),
    
    # Photo Management
    path('<uuid:shelter_id>/photos/add/', add_shelter_photo, name='add-shelter-photo'),
    path('<uuid:shelter_id>/photos/<uuid:photo_id>/delete/', delete_shelter_photo, name='delete-shelter-photo'),
    path('<uuid:shelter_id>/photos/<uuid:photo_id>/set-primary/', set_primary_shelter_photo, name='set-primary-photo'),
]
