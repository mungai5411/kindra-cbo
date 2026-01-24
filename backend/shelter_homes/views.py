"""
Shelter Home Views
"""

from rest_framework import generics, permissions, status, parsers
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import (
    ShelterHome, Placement, Resource, StaffCredential, 
    ResourceRequest, IncidentReport
)
from .serializers import (
    ShelterHomeSerializer, PlacementSerializer, ResourceSerializer, 
    StaffCredentialSerializer, ResourceRequestSerializer, IncidentReportSerializer
)
from accounts.models import User, Notification
from reporting.utils import log_analytics_event


class ShelterHomeListCreateView(generics.ListCreateAPIView):
    serializer_class = ShelterHomeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]  # For file uploads
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['county', 'is_active', 'approval_status']
    
    def get_queryset(self):
        """Filter shelters based on user role"""
        user = self.request.user
        if not user or not user.is_authenticated:
            # Guest users only see approved shelters
            return ShelterHome.objects.filter(approval_status='APPROVED').prefetch_related('photos')
            
        if user.is_superuser or user.role in ['ADMIN', 'MANAGEMENT']:
            # Admins see all shelters
            return ShelterHome.objects.all().prefetch_related('photos')
        elif user.role == 'SHELTER_PARTNER':
            # Partners only see their own shelter
            return ShelterHome.objects.filter(partner_user=user).prefetch_related('photos')
        # Other authenticated users only see approved shelters
        return ShelterHome.objects.filter(approval_status='APPROVED').prefetch_related('photos')
    
    def perform_create(self, serializer):
        """New shelters start as PENDING"""
        shelter = serializer.save(partner_user=self.request.user)
        
        # Notify admins about new shelter registration
        admins = User.objects.filter(role__in=['ADMIN', 'MANAGEMENT'])
        for admin in admins:
            Notification.objects.create(
                recipient=admin,
                title="New Shelter Registration",
                message=f"A new shelter '{shelter.name}' has been registered and is pending review.",
                type=Notification.Type.INFO,
                category=Notification.Category.SHELTER,
                link=f"/dashboard/shelters/{shelter.id}",
                metadata={
                    'shelter_id': str(shelter.id),
                    'action': 'review_registration'
                }
            )


class ShelterHomeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ShelterHome.objects.all()
    serializer_class = ShelterHomeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_destroy(self, instance):
        name = instance.name
        instance.delete()
        log_analytics_event(
            event_type='SHELTER_DELETED',
            description=f'Administrator deleted shelter home: {name}',
            user=self.request.user,
            request=self.request,
            event_data={'deleted_shelter_name': name}
        )


class PlacementListCreateView(generics.ListCreateAPIView):
    serializer_class = PlacementSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['shelter_home', 'child', 'status']

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role in ['ADMIN', 'MANAGEMENT', 'CASE_WORKER']:
            return Placement.objects.all()
        elif user.role == 'SHELTER_PARTNER':
            return Placement.objects.filter(shelter_home__partner_user=user)
        return Placement.objects.none()


class PlacementDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Placement.objects.all()
    serializer_class = PlacementSerializer
    permission_classes = [permissions.IsAuthenticated]



class ResourceListCreateView(generics.ListCreateAPIView):
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['shelter_home', 'resource_type', 'is_available']

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role in ['ADMIN', 'MANAGEMENT']:
            return Resource.objects.all()
        elif user.role == 'SHELTER_PARTNER':
            return Resource.objects.filter(shelter_home__partner_user=user)
        return Resource.objects.none()



class ResourceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]



class StaffCredentialListCreateView(generics.ListCreateAPIView):
    serializer_class = StaffCredentialSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['shelter_home', 'is_verified', 'is_active']

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role in ['ADMIN', 'MANAGEMENT']:
            return StaffCredential.objects.all()
        elif user.role == 'SHELTER_PARTNER':
            return StaffCredential.objects.filter(shelter_home__partner_user=user)
        return StaffCredential.objects.none()



class StaffCredentialDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = StaffCredential.objects.all()
    serializer_class = StaffCredentialSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_destroy(self, instance):
        name = instance.full_name
        id_num = instance.id_number
        instance.delete()
        log_analytics_event(
            event_type='STAFF_CREDENTIAL_DELETED',
            description=f'Administrator deleted staff credential for: {name} ({id_num})',
            user=self.request.user,
            request=self.request,
            event_data={'deleted_staff_name': name}
        )


class ResourceRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = ResourceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['shelter_home', 'item_category', 'priority', 'status']

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role in ['ADMIN', 'MANAGEMENT']:
            return ResourceRequest.objects.all()
        return ResourceRequest.objects.filter(shelter_home__partner_user=user)

    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user)


class IncidentReportListCreateView(generics.ListCreateAPIView):
    serializer_class = IncidentReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['shelter_home', 'severity', 'status']

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role in ['ADMIN', 'MANAGEMENT']:
            return IncidentReport.objects.all()
        return IncidentReport.objects.filter(shelter_home__partner_user=user)

    def perform_create(self, serializer):
        serializer.save(reported_by=self.request.user)


# Shelter Photo Management Endpoints
from rest_framework.decorators import api_view, permission_classes
from .models import ShelterPhoto
from accounts.permissions import IsAdminOrManagement


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_shelter_photo(request, shelter_id):
    """Add a photo to a shelter"""
    try:
        shelter = ShelterHome.objects.get(pk=shelter_id)
        
        # Check permissions: Admin, Management, or Shelter Owner
        user = request.user
        if not (user.is_staff or user.role in ['ADMIN', 'MANAGEMENT'] or shelter.partner_user == user):
            return Response(
                {'error': 'You do not have permission to manage this shelter'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if 'image' not in request.FILES:
            return Response(
                {'error': 'No image file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate image using utility
        from accounts.image_utils import validate_image_file
        validate_image_file(request.FILES['image'])
        
        # Create photo
        photo_type = request.data.get('photo_type', 'FACILITY')
        caption = request.data.get('caption', '')
        
        photo = ShelterPhoto.objects.create(
            shelter_home=shelter,
            image=request.FILES['image'],
            photo_type=photo_type,
            caption=caption
        )
        
        # If this is the first photo, make it primary
        if shelter.photos.count() == 1:
            shelter.primary_photo = photo
            shelter.save()
        
        log_analytics_event(
            event_type='SHELTER_PHOTO_ADDED',
            description=f'Photo added to shelter: {shelter.name}',
            user=request.user,
            request=request,
            event_data={'shelter_id': str(shelter.id), 'photo_id': str(photo.id)}
        )
        
        return Response({
            'success': True,
            'message': 'Photo added successfully',
            'photo': {
                'id': str(photo.id),
                'image': photo.image.url if photo.image else None,
                'photo_type': photo.photo_type,
                'caption': photo.caption,
                'is_primary': shelter.primary_photo == photo
            }
        }, status=status.HTTP_201_CREATED)
    except ShelterHome.DoesNotExist:
        return Response({'error': 'Shelter not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response(
            {'error': f'Failed to add photo: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_shelter_photo(request, shelter_id, photo_id):
    """Delete a photo from a shelter"""
    try:
        shelter = ShelterHome.objects.get(pk=shelter_id)
        photo = ShelterPhoto.objects.get(pk=photo_id, shelter_home=shelter)
        
        # Check permissions
        user = request.user
        if not (user.is_staff or user.role in ['ADMIN', 'MANAGEMENT'] or shelter.partner_user == user):
            return Response(
                {'error': 'You do not have permission to manage this shelter'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Delete from Cloudinary
        from accounts.image_utils import delete_cloudinary_image
        if hasattr(photo.image, 'url'):
            delete_cloudinary_image(photo.image.url)
        
        # If this was the primary photo, clear it
        if shelter.primary_photo == photo:
            shelter.primary_photo = None
            shelter.save()
        
        photo.delete()
        
        log_analytics_event(
            event_type='SHELTER_PHOTO_DELETED',
            description=f'Photo deleted from shelter: {shelter.name}',
            user=request.user,
            request=request,
            event_data={'shelter_id': str(shelter.id)}
        )
        
        return Response({'success': True, 'message': 'Photo deleted successfully'})
    except ShelterHome.DoesNotExist:
        return Response({'error': 'Shelter not found'}, status=status.HTTP_404_NOT_FOUND)
    except ShelterPhoto.DoesNotExist:
        return Response({'error': 'Photo not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response(
            {'error': f'Failed to delete photo: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def set_primary_shelter_photo(request, shelter_id, photo_id):
    """Set a photo as the primary photo for a shelter"""
    try:
        shelter = ShelterHome.objects.get(pk=shelter_id)
        photo = ShelterPhoto.objects.get(pk=photo_id, shelter_home=shelter)
        
        # Check permissions
        user = request.user
        if not (user.is_staff or user.role in ['ADMIN', 'MANAGEMENT'] or shelter.partner_user == user):
            return Response(
                {'error': 'You do not have permission to manage this shelter'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        shelter.primary_photo = photo
        shelter.save()
        
        return Response({'success': True, 'message': 'Primary photo updated successfully'})
    except ShelterHome.DoesNotExist:
        return Response({'error': 'Shelter not found'}, status=status.HTTP_404_NOT_FOUND)
    except ShelterPhoto.DoesNotExist:
        return Response({'error': 'Photo not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response(
            {'error': f'Failed to set primary photo: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
