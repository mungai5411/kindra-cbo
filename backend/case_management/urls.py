"""
Case Management URL Configuration
"""

from django.urls import path
from .views import (
    FamilyListCreateView, FamilyDetailView,
    ChildListCreateView, ChildDetailView,
    CaseListCreateView, CaseDetailView,
    AssessmentListCreateView, AssessmentDetailView,
    DocumentListCreateView, DocumentDetailView,
    CaseNoteListCreateView,
    case_statistics,
)

app_name = 'case_management'

urlpatterns = [
    # Families
    path('families/', FamilyListCreateView.as_view(), name='family-list'),
    path('families/<uuid:pk>/', FamilyDetailView.as_view(), name='family-detail'),
    
    # Children
    path('children/', ChildListCreateView.as_view(), name='child-list'),
    path('children/<uuid:pk>/', ChildDetailView.as_view(), name='child-detail'),
    
    # Cases
    path('cases/', CaseListCreateView.as_view(), name='case-list'),
    path('cases/<uuid:pk>/', CaseDetailView.as_view(), name='case-detail'),
    
    # Assessments
    path('assessments/', AssessmentListCreateView.as_view(), name='assessment-list'),
    path('assessments/<uuid:pk>/', AssessmentDetailView.as_view(), name='assessment-detail'),
    
    # Documents
    path('documents/', DocumentListCreateView.as_view(), name='document-list'),
    path('documents/<uuid:pk>/', DocumentDetailView.as_view(), name='document-detail'),
    
    # Case Notes
    path('notes/', CaseNoteListCreateView.as_view(), name='note-list'),
    
    # Statistics
    path('statistics/', case_statistics, name='statistics'),
]
