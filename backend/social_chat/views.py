from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from accounts.models import Notification, User as KindraUser
import re
from .models import ChatMessage
from .serializers import ChatMessageSerializer

class IsAdminOrOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if obj.is_private:
            # Private messages: strictly sender or recipient
            return obj.user == request.user or obj.recipient == request.user
        if request.user.is_superuser or request.user.role == 'ADMIN':
            return True
        return obj.user == request.user

class MessageViewSet(viewsets.ModelViewSet):
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Filter for public messages OR private messages where user is sender or recipient
        # NEW: New members shouldn't see previous conversations of other members unless new ones.
        # We filter public messages to only show those sent AFTER the user joined.
        return ChatMessage.objects.filter(
            Q(is_private=False, timestamp__gte=user.date_joined) | 
            Q(is_private=True, user=user) | 
            Q(is_private=True, recipient=user)
        ).distinct().order_by('timestamp')

    def perform_create(self, serializer):
        message = serializer.save(user=self.request.user)
        
        # Tagging support: Detect @username in content
        tags = re.findall(r'@(\w+)', message.content)
        for username in tags:
            try:
                tagged_user = KindraUser.objects.get(username=username)
                if tagged_user != self.request.user:
                    # Create notification
                    Notification.objects.create(
                        recipient=tagged_user,
                        title="You were mentioned in Community Chat",
                        message=f"{self.request.user.get_full_name()} mentioned you: {message.content[:50]}...",
                        type=Notification.Type.INFO,
                        category=Notification.Category.SYSTEM,
                        link="/dashboard/overview" # Adjust as needed
                    )
            except KindraUser.DoesNotExist:
                continue

    @action(detail=False, methods=['get'])
    def users(self, request):
        """Endpoint to get users for tagging autocompletion"""
        users = KindraUser.objects.filter(is_active=True).exclude(id=request.user.id)
        # Note: reusing ChatUserSerializer
        from .serializers import ChatUserSerializer
        serializer = ChatUserSerializer(users, many=True)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Admin can delete public messages, but handle private messages
        if instance.is_private:
            if instance.user == request.user:
                self.perform_destroy(instance)
                return Response(status=status.HTTP_204_NO_CONTENT)
            return Response({"detail": "Only sender can delete private messages."}, status=status.HTTP_403_FORBIDDEN)
            
        if request.user.is_superuser or request.user.role == 'ADMIN' or instance.user == request.user:
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({"detail": "Not authorized to delete this message."}, status=status.HTTP_403_FORBIDDEN)
