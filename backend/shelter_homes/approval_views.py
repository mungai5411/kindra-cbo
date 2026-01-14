"""
Shelter Approval View - Admin Only
"""

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import ShelterHome
from .serializers import ShelterHomeSerializer
from accounts.models import Notification, User
from accounts.permissions import IsAdminOrManagement


class ShelterApprovalView(APIView):
    """
    Admin endpoint to approve/reject shelters
    """
    permission_classes = [permissions.IsAuthenticated, IsAdminOrManagement]
    
    def post(self, request, pk):
        try:
            shelter = ShelterHome.objects.get(pk=pk)
            action = request.data.get('action')  # 'approve' or 'reject'
            
            if shelter.approval_status == 'APPROVED' and action == 'approve':
                return Response(
                    {'error': 'Shelter is already approved'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if action == 'approve':
                shelter.approval_status = 'APPROVED'
                shelter.approved_by = request.user
                shelter.approval_date = timezone.now()
                shelter.is_active = True
                shelter.rejection_reason = ''
                message = f'Shelter "{shelter.name}" has been approved successfully'
            elif action == 'reject':
                shelter.approval_status = 'REJECTED'
                shelter.rejection_reason = request.data.get('reason', 'No reason provided')
                shelter.is_active = False
                message = f'Shelter "{shelter.name}" has been rejected'
            elif action == 'request_info':
                shelter.approval_status = 'NEEDS_INFO'
                shelter.rejection_reason = request.data.get('reason', 'Additional information required')
                message = f'More information requested for "{shelter.name}"'
            else:
                return Response(
                    {'error': 'Invalid action. Use "approve", "reject", or "request_info"'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            shelter.save()

            # Notify the partner user about the status change
            if shelter.partner_user:
                notif_title = f"Shelter {action.capitalize()}d"
                notif_type = Notification.Type.SUCCESS if action == 'approve' else Notification.Type.WARNING
                
                if action == 'approve':
                    message = f"Your shelter '{shelter.name}' has been approved successfully."
                elif action == 'reject':
                    message = f"Your shelter '{shelter.name}' registration was rejected. Reason: {shelter.rejection_reason}"
                elif action == 'request_info':
                    notif_title = "Action Required: More Info Needed"
                    message = f"Additional information is required for your shelter '{shelter.name}'. Details: {shelter.rejection_reason}"

                Notification.objects.create(
                    recipient=shelter.partner_user,
                    title=notif_title,
                    message=message,
                    type=notif_type,
                    category=Notification.Category.SHELTER,
                    link="/dashboard/shelters/profile",
                    metadata={
                        'shelter_id': str(shelter.id),
                        'status': shelter.approval_status
                    }
                )

            serializer = ShelterHomeSerializer(shelter)
            
            return Response({
                'message': message,
                'shelter': serializer.data
            })
            
        except ShelterHome.DoesNotExist:
            return Response(
                {'error': 'Shelter not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class PendingSheltersView(APIView):
    """
    Get list of shelters pending review (Admin only)
    """
    permission_classes = [permissions.IsAuthenticated, IsAdminOrManagement]
    
    def get(self, request):
        pending_shelters = ShelterHome.objects.filter(
            approval_status='PENDING'
        ).prefetch_related('photos').order_by('-created_at')
        
        serializer = ShelterHomeSerializer(pending_shelters, many=True)
        return Response(serializer.data)
