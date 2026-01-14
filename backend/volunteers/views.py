"""
Volunteer Management Views
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from .models import Volunteer, Task, Event, TimeLog, Training, TrainingCompletion, TaskApplication, VolunteerGroup, GroupMessage
from accounts.models import Notification, User
from accounts.permissions import IsAdminOrManagement
from .serializers import (
    VolunteerSerializer, TaskSerializer, EventSerializer,
    TimeLogSerializer, TimeLogApprovalSerializer,
    TrainingSerializer, TrainingCompletionSerializer, TaskApplicationSerializer,
    VolunteerGroupSerializer, GroupMessageSerializer
)


class VolunteerListCreateView(generics.ListCreateAPIView):
    serializer_class = VolunteerSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'county']
    search_fields = ['full_name', 'email', 'skills']
    ordering_fields = ['join_date', 'total_hours', 'tasks_completed']
    ordering = ['-join_date']

    def get_queryset(self):
        # Only return volunteers who actually have the VOLUNTEER role
        # and exclude any donors or admins who might have a profile record.
        return Volunteer.objects.filter(user__role=User.Role.VOLUNTEER)


class VolunteerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Volunteer.objects.all()
    serializer_class = VolunteerSerializer
    permission_classes = [permissions.IsAuthenticated]


class TaskListCreateView(generics.ListCreateAPIView):
    queryset = Task.objects.all().select_related('assigned_by', 'created_by').prefetch_related('assignees')
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'priority', 'assignees', 'shelter', 'is_request', 'approval_status', 'task_type']
    search_fields = ['title', 'description', 'location', 'shelter__name']
    ordering_fields = ['created_at', 'due_date', 'priority', 'approval_status']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        task = serializer.save(created_by=self.request.user)
        
        # Notify assigned volunteers
        for assignee in task.assignees.all():
            if assignee.user:
                Notification.objects.create(
                    recipient=assignee.user,
                    title="New Task Assigned",
                    message=f"You have been assigned a new task: {task.title}",
                    type=Notification.Type.TASK,
                    category=Notification.Category.VOLUNTEER,
                    link=f"/dashboard/volunteers/tasks/{task.id}"
                )

        # Notify Admins if it's a Shelter Request
        if task.is_request:
             # Find admins
             admins = User.objects.filter(role=User.Role.ADMIN)
             for admin in admins:
                Notification.objects.create(
                    recipient=admin,
                    title="New Volunteer Request",
                    message=f"A new volunteer request for '{task.title}' has been submitted.",
                    type=Notification.Type.INFO,
                    category=Notification.Category.SYSTEM,
                    link=f"/dashboard/admin/requests"
                )


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        task = serializer.save()


class TaskApplicationListCreateView(generics.ListCreateAPIView):
    queryset = TaskApplication.objects.all()
    serializer_class = TaskApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['task', 'volunteer', 'status']
    ordering = ['-applied_at']

    def perform_create(self, serializer):
        application = serializer.save()
        
        # Notify Task Creator (Admin or Shelter)
        if application.task.created_by:
             Notification.objects.create(
                recipient=application.task.created_by,
                title="New Task Application",
                message=f"{application.volunteer.full_name} has applied for task '{application.task.title}'",
                type=Notification.Type.INFO,
                category=Notification.Category.VOLUNTEER,
                link=f"/dashboard/volunteers/tasks/{application.task.id}"
            )


class TaskApplicationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TaskApplication.objects.all()
    serializer_class = TaskApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        app = serializer.save()
        if app.status == 'ACCEPTED':
            # Auto-assign task
            task = app.task
            task.assignees.add(app.volunteer)
            task.status = 'ASSIGNED'
            task.save()
            
            # Notify Volunteer
            if app.volunteer.user:
                 Notification.objects.create(
                    recipient=app.volunteer.user,
                    title="Task Application Accepted",
                    message=f"You have been assigned to task '{task.title}'",
                    type=Notification.Type.SUCCESS,
                    category=Notification.Category.VOLUNTEER,
                    link=f"/dashboard/volunteers/tasks/{task.id}"
                )


class EventListCreateView(generics.ListCreateAPIView):
    queryset = Event.objects.all().prefetch_related('registered_volunteers')
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['event_type', 'is_active', 'is_cancelled', 'post_to_volunteers', 'post_to_donors', 'post_to_shelters']
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['start_datetime']
    ordering = ['-start_datetime']
    
    def perform_create(self, serializer):
        event = serializer.save(created_by=self.request.user)
        
        # Handle photos if any (sent as a list of files)
        photos = self.request.FILES.getlist('photos')
        for photo in photos:
            EventPhoto.objects.create(event=event, image=photo)


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class TimeLogListCreateView(generics.ListCreateAPIView):
    queryset = TimeLog.objects.all().select_related('volunteer', 'task', 'event', 'approved_by')
    serializer_class = TimeLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['volunteer', 'status', 'task', 'event']
    ordering_fields = ['date', 'created_at']
    ordering = ['-date']


class TimeLogDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TimeLog.objects.all()
    serializer_class = TimeLogSerializer
    permission_classes = [permissions.IsAuthenticated]


class TimeLogApprovalView(generics.UpdateAPIView):
    """
    Approve or reject time logs
    """
    queryset = TimeLog.objects.all()
    serializer_class = TimeLogApprovalSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrManagement]
    
    def perform_update(self, serializer):
        time_log = serializer.save(
            approved_by=self.request.user,
            approved_at=timezone.now()
        )
        
        if time_log.status == "APPROVED":
            volunteer = time_log.volunteer
            volunteer.total_hours += time_log.hours
            volunteer.save(update_fields=['total_hours'])

        # Notify volunteer about approval/rejection
        if time_log.volunteer.user:
            notif_title = f"Time Log {time_log.status.capitalize()}d"
            notif_type = Notification.Type.SUCCESS if time_log.status == 'APPROVED' else Notification.Type.WARNING
            
            message = f"Your time log for {time_log.hours} hours on {time_log.date} has been {time_log.status.lower()}."
            if time_log.status == 'REJECTED':
                message += " Please contact your coordinator for details."

            Notification.objects.create(
                recipient=time_log.volunteer.user,
                title=notif_title,
                message=message,
                type=notif_type,
                category=Notification.Category.VOLUNTEER,
                link="/dashboard/volunteers/hours"
            )


class TrainingListCreateView(generics.ListCreateAPIView):
    queryset = Training.objects.all()
    serializer_class = TrainingSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['training_type', 'is_required', 'is_active']
    search_fields = ['title', 'description']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class TrainingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Training.objects.all()
    serializer_class = TrainingSerializer
    permission_classes = [permissions.IsAuthenticated]


class TrainingCompletionListCreateView(generics.ListCreateAPIView):
    queryset = TrainingCompletion.objects.all().select_related('volunteer', 'training')
    serializer_class = TrainingCompletionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['volunteer', 'training', 'certificate_issued']
    ordering = ['-completed_date']


class TrainingCompletionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TrainingCompletion.objects.all()
    serializer_class = TrainingCompletionSerializer
    permission_classes = [permissions.IsAuthenticated]


class VolunteerGroupListCreateView(generics.ListCreateAPIView):
    queryset = VolunteerGroup.objects.all().prefetch_related('members')
    serializer_class = VolunteerGroupSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['members']
    search_fields = ['name', 'description']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
        
    def get_queryset(self):
        user = self.request.user
        import logging
        logger = logging.getLogger('kindra_cbo')
        
        # Admins see all groups
        if user.role == User.Role.ADMIN or user.is_staff or user.role == User.Role.MANAGEMENT:
            qs = VolunteerGroup.objects.all()
            logger.debug(f"Admin Access: Returning all {qs.count()} groups for user {user.email}")
            return qs
            
        # Volunteers see groups they belong to
        if hasattr(user, 'volunteer_profile'):
            qs = VolunteerGroup.objects.filter(members=user.volunteer_profile)
            logger.debug(f"Volunteer Access: Returning {qs.count()} assigned groups for user {user.email}")
            return qs
            
        logger.debug(f"Standard Access: Returning no groups for user {user.email} (Role: {user.role})")
        return VolunteerGroup.objects.none()


class VolunteerGroupDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = VolunteerGroup.objects.all()
    serializer_class = VolunteerGroupSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.ADMIN or user.is_staff:
            return VolunteerGroup.objects.all()
        if hasattr(user, 'volunteer_profile'):
            return VolunteerGroup.objects.filter(members=user.volunteer_profile)
        return VolunteerGroup.objects.none()


class GroupMessageListCreateView(generics.ListCreateAPIView):
    """
    Private group chat messages. No admin interference (Admins only see if they are members).
    """
    serializer_class = GroupMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        group_id = self.kwargs.get('group_id')
        user = self.request.user
        
        try:
            group = VolunteerGroup.objects.get(id=group_id)
            # Private: Only members or Admins can see messages
            is_member = hasattr(user, 'volunteer_profile') and group.members.filter(id=user.volunteer_profile.id).exists()
            is_admin = user.role == User.Role.ADMIN or user.is_staff or user.role == User.Role.MANAGEMENT
            
            if is_member or is_admin:
                return group.messages.all().order_by('created_at')
        except VolunteerGroup.DoesNotExist:
            pass
            
        return GroupMessage.objects.none()
        
    def perform_create(self, serializer):
        group_id = self.kwargs.get('group_id')
        user = self.request.user
        try:
            group = VolunteerGroup.objects.get(id=group_id)
            # Ensure sender is in the group OR is an admin
            is_member = hasattr(user, 'volunteer_profile') and group.members.filter(id=user.volunteer_profile.id).exists()
            is_admin = user.role == User.Role.ADMIN or user.is_staff or user.role == User.Role.MANAGEMENT
            
            if is_member or is_admin:
                serializer.save(sender=user, group=group)
            else:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("You must be a member of this group (or an admin) to send messages.")
        except VolunteerGroup.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound("Volunteer group not found.")
