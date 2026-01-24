"""
Volunteer Management URL Configuration
"""

from django.urls import path
from .views import (
    VolunteerListCreateView, VolunteerDetailView,
    TaskListCreateView, TaskDetailView,
    EventListCreateView, EventDetailView, EventRegisterView, EventParticipantsView,
    TimeLogListCreateView, TimeLogDetailView, TimeLogApprovalView,
    TrainingListCreateView, TrainingDetailView,
    TrainingCompletionListCreateView, TrainingCompletionDetailView,
    TaskApplicationListCreateView, TaskApplicationDetailView,
    VolunteerGroupListCreateView, VolunteerGroupDetailView, GroupMessageListCreateView
)

app_name = 'volunteers'

urlpatterns = [
    # Volunteers
    path('', VolunteerListCreateView.as_view(), name='volunteer-list'),
    path('<uuid:pk>/', VolunteerDetailView.as_view(), name='volunteer-detail'),
    
    # Tasks
    path('tasks/', TaskListCreateView.as_view(), name='task-list'),
    path('tasks/<uuid:pk>/', TaskDetailView.as_view(), name='task-detail'),
    path('tasks/applications/', TaskApplicationListCreateView.as_view(), name='task-application-list'),
    path('tasks/applications/<uuid:pk>/', TaskApplicationDetailView.as_view(), name='task-application-detail'),
    
    # Events
    path('events/<uuid:pk>/', EventDetailView.as_view(), name='event-detail'),
    path('events/<uuid:pk>/register/', EventRegisterView.as_view(), name='event-register'),
    path('events/<uuid:pk>/participants/', EventParticipantsView.as_view(), name='event-participants'),
    
    # Time Logs
    path('timelogs/', TimeLogListCreateView.as_view(), name='timelog-list'),
    path('timelogs/<uuid:pk>/', TimeLogDetailView.as_view(), name='timelog-detail'),
    path('timelogs/<uuid:pk>/approve/', TimeLogApprovalView.as_view(), name='timelog-approve'),
    
    # Training
    path('training/', TrainingListCreateView.as_view(), name='training-list'),
    path('training/<uuid:pk>/', TrainingDetailView.as_view(), name='training-detail'),
    path('training/completions/', TrainingCompletionListCreateView.as_view(), name='training-completion-list'),
    path('training/completions/<uuid:pk>/', TrainingCompletionDetailView.as_view(), name='training-completion-detail'),
    
    # Groups
    path('groups/', VolunteerGroupListCreateView.as_view(), name='group-list'),
    path('groups/<uuid:pk>/', VolunteerGroupDetailView.as_view(), name='group-detail'),
    path('groups/<uuid:group_id>/messages/', GroupMessageListCreateView.as_view(), name='group-message-list'),
]
