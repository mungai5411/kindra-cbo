"""
Donation Views
Handles HTTP requests and delegates business logic to services
"""

import logging
import uuid
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.response import Response
from django.http import Http404
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend

from .models import Donor, Campaign, Donation, Receipt, SocialMediaPost, MaterialDonation
from .serializers import (
    DonorSerializer, CampaignSerializer, DonationSerializer, 
    ReceiptSerializer, SocialMediaPostSerializer, MaterialDonationSerializer
)
from .services import DonationService, PaymentService, NotificationService, MaterialAcknowledgmentService
from accounts.models import User, Notification, AuditLog
from django.http import HttpResponse
from accounts.permissions import IsAdminOrManagement
from kindra_cbo.throttling import PaymentRateThrottle, RegistrationRateThrottle
from reporting.utils import log_analytics_event
from reporting.models import AnalyticsEvent

logger = logging.getLogger('kindra_cbo')


class DonorListCreateView(generics.ListCreateAPIView):
    queryset = Donor.objects.all()
    serializer_class = DonorSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['donor_type', 'country', 'is_recurring_donor']


class DonorDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Donor.objects.all()
    serializer_class = DonorSerializer
    permission_classes = [permissions.IsAuthenticated]


class CampaignListCreateView(generics.ListCreateAPIView):
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'is_featured']

    def perform_create(self, serializer):
        from django.utils.text import slugify
        import uuid
        
        title = serializer.validated_data.get('title')
        slug = slugify(title)
        
        # Ensure slug uniqueness
        if Campaign.objects.filter(slug=slug).exists():
            slug = f"{slug}-{uuid.uuid4().hex[:6]}"
            
        serializer.save(
            created_by=self.request.user if self.request.user.is_authenticated else None,
            slug=slug
        )


class CampaignDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    lookup_url_kwarg = 'identifier'

    def get_object(self):
        queryset = self.get_queryset()
        identifier = self.kwargs.get(self.lookup_url_kwarg)

        if identifier is None:
            return super().get_object()

        by_slug = queryset.filter(slug=identifier).first()
        if by_slug is not None:
            self.check_object_permissions(self.request, by_slug)
            return by_slug

        try:
            uuid_val = uuid.UUID(str(identifier))
        except (ValueError, TypeError, AttributeError):
            raise Http404

        obj = get_object_or_404(queryset, pk=uuid_val)
        self.check_object_permissions(self.request, obj)
        return obj

    def perform_destroy(self, instance):
        title = instance.title
        instance.delete()
        log_analytics_event(
            event_type='CAMPAIGN_DELETED',
            description=f'Administrator deleted campaign: {title}',
            user=self.request.user,
            request=self.request,
            event_data={'deleted_campaign_title': title}
        )


class DonationListCreateView(generics.ListCreateAPIView):
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer
    permission_classes = [permissions.AllowAny]  # Public endpoint for donations
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['campaign', 'status', 'payment_method']


class DonationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer
    permission_classes = [permissions.AllowAny]

    def perform_destroy(self, instance):
        tx_id = instance.transaction_id
        amount = instance.amount
        instance.delete()
        log_analytics_event(
            event_type='DONOR_RECORD_DELETED',
            description=f'Administrator deleted donation record: {tx_id} ({amount})',
            user=self.request.user,
            request=self.request,
            event_data={'deleted_transaction_id': tx_id, 'amount': float(amount.amount) if hasattr(amount, 'amount') else float(amount)}
        )

    def perform_update(self, serializer):
        old_status = self.get_object().status
        instance = serializer.save()
        
        # If status changed to COMPLETED, finalize it using service
        if old_status != Donation.Status.COMPLETED and instance.status == Donation.Status.COMPLETED:
            try:
                DonationService.finalize_donation(instance)
            except Exception as e:
                logger.error(f"Error finalizing donation: {str(e)}")
                raise


class ReceiptListView(generics.ListAPIView):
    queryset = Receipt.objects.all()
    serializer_class = ReceiptSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['donation__campaign', 'tax_year']


class ReceiptDetailView(generics.RetrieveAPIView):
    queryset = Receipt.objects.all()
    serializer_class = ReceiptSerializer
    permission_classes = [permissions.IsAuthenticated]


# Business logic moved to services.py


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@throttle_classes([PaymentRateThrottle])
def process_mpesa_payment(request):
    """Process M-Pesa payment (simulated)"""
    try:
        donation = PaymentService.process_mpesa_payment(request.data)
        return Response({
            'status': 'success',
            'message': 'Donation received and pending admin approval',
            'transaction_id': donation.transaction_id
        }, status=status.HTTP_200_OK)
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error processing M-Pesa payment: {str(e)}")
        return Response(
            {'error': 'Something went wrong. Please try again later.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@throttle_classes([PaymentRateThrottle])
def process_paypal_payment(request):
    """Process PayPal payment (simulated)"""
    try:
        donation = PaymentService.process_paypal_payment(request.data)
        return Response({
            'status': 'success',
            'message': 'Donation processed successfully',
            'transaction_id': donation.transaction_id
        }, status=status.HTTP_200_OK)
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error processing PayPal payment: {str(e)}")
        return Response(
            {'error': 'Something went wrong. Please try again later.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@throttle_classes([PaymentRateThrottle])
def process_stripe_payment(request):
    """Process Stripe payment (simulated)"""
    try:
        donation = PaymentService.process_stripe_payment(request.data)
        return Response({
            'status': 'success',
            'message': 'Donation processed successfully',
            'transaction_id': donation.transaction_id
        }, status=status.HTTP_200_OK)
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error processing Stripe payment: {str(e)}")
        return Response(
            {'error': 'Something went wrong. Please try again later.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class MaterialDonationListCreateView(generics.ListCreateAPIView):
    queryset = MaterialDonation.objects.all()
    serializer_class = MaterialDonationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'category']

    def perform_create(self, serializer):
        # Automatically link to donor if user has a profile
        donor = getattr(self.request.user, 'donor_profile', None)
        mat_don = serializer.save(donor=donor)
        
        # Use service to send notifications
        NotificationService.notify_material_donation(mat_don, self.request.user)


class MaterialDonationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = MaterialDonation.objects.all()
    serializer_class = MaterialDonationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_destroy(self, instance):
        category = instance.category
        instance.delete()
        log_analytics_event(
            event_type='MATERIAL_DONATION_DELETED',
            description=f'Administrator deleted material donation request: {category}',
            user=self.request.user,
            request=self.request,
            event_data={'deleted_material_category': category}
        )


# Admin Approval Endpoints (Secured)
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrManagement])
def approve_donation(request, pk):
    """Approve pending donation - Admin only"""
    try:
        donation = Donation.objects.get(pk=pk)
        if donation.status != Donation.Status.PENDING:
            return Response(
                {'error': f'Donation already {donation.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Use service to finalize donation
        DonationService.finalize_donation(donation)
        
        # Audit log
        log_analytics_event(
            event_type=AnalyticsEvent.EventType.DONATION_RECEIVED,
            description=f'Administrator approved donation of {donation.amount} {donation.currency} (Ref: {donation.transaction_id})',
            user=request.user,
            request=request,
            event_data={'donation_id': str(donation.id), 'amount': float(donation.amount)}
        )
        return Response({'message': 'Donation approved'}, status=status.HTTP_200_OK)
    except Donation.DoesNotExist:
        return Response({'error': 'Donation not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error approving donation {pk}: {str(e)}")
        return Response(
            {'error': 'Something went wrong. Please try again later.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrManagement])
def reject_donation(request, pk):
    """Reject pending donation - Admin only"""
    try:
        donation = Donation.objects.get(pk=pk)
        if donation.status != Donation.Status.PENDING:
            return Response(
                {'error': f'Donation already {donation.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        donation.status = Donation.Status.FAILED
        donation.save()
        
        log_analytics_event(
            event_type='DONATION_REJECTED',
            description=f'Administrator rejected donation {donation.transaction_id}',
            user=request.user,
            request=request,
            event_data={'donation_id': str(donation.id)}
        )
        return Response({'message': 'Donation rejected'}, status=status.HTTP_200_OK)
    except Donation.DoesNotExist:
        return Response({'error': 'Donation not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error rejecting donation {pk}: {str(e)}")
        return Response(
            {'error': 'Something went wrong. Please try again later.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrManagement])
def approve_material_donation(request, pk):
    """Approve material donation pickup - Admin only"""
    try:
        mat_don = MaterialDonation.objects.get(pk=pk)
        if mat_don.status != MaterialDonation.Status.PENDING_PICKUP:
            return Response({'error': f'Already {mat_don.status}'}, status=status.HTTP_400_BAD_REQUEST)
        
        mat_don.status = MaterialDonation.Status.COLLECTED
        mat_don.save()

        # Notify donor that their pickup was approved/collected
        if mat_don.donor and mat_don.donor.user:
            Notification.objects.create(
                recipient=mat_don.donor.user,
                title="Material Donation Collected",
                message=f"Your {mat_don.category} donation has been successfully collected. Thank you for your contribution!",
                type=Notification.Type.SUCCESS,
                category=Notification.Category.DONATION
            )
        
        log_analytics_event(
            event_type='MATERIAL_DONATION_COLLECTED',
            description=f'Administrator verified collection of {mat_don.category} donation',
            user=request.user,
            request=request,
            event_data={'material_donation_id': str(mat_don.id)}
        )
        return Response({'message': 'Pickup approved'}, status=status.HTTP_200_OK)
    except MaterialDonation.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrManagement])
def reject_material_donation(request, pk):
    """Reject material donation - Admin only"""
    try:
        mat_don = MaterialDonation.objects.get(pk=pk)
        if mat_don.status != MaterialDonation.Status.PENDING_PICKUP:
            return Response({'error': f'Already {mat_don.status}'}, status=status.HTTP_400_BAD_REQUEST)
        
        mat_don.status = MaterialDonation.Status.REJECTED
        mat_don.save()
        
        from accounts.models import AuditLog
        AuditLog.objects.create(
            user=request.user, action=AuditLog.Action.UPDATE, resource_type='MaterialDonation',
            resource_id=str(mat_don.id), description=f'Rejected material donation: {mat_don.category}',
            ip_address=request.META.get('REMOTE_ADDR')
        )
        return Response({'message': 'Material donation rejected'}, status=status.HTTP_200_OK)
    except MaterialDonation.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def download_receipt(request, pk):
    """Download PDF receipt for a donation"""
    try:
        receipt = Receipt.objects.get(pk=pk)
        
        # Check permissions - donor can only download their own receipt
        if request.user.role == 'DONOR':
            if not receipt.donation.donor or receipt.donation.donor.user != request.user:
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Generate if file is missing
        if not receipt.receipt_file:
            ReceiptService.generate_pdf_receipt(receipt)
            receipt.refresh_from_db()

        if not receipt.receipt_file:
            return Response({'error': 'Failed to generate receipt'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        file_content = receipt.receipt_file.read()
        response = HttpResponse(file_content, content_type='application/pdf')
        filename = f"receipt_{receipt.receipt_number}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
    except Receipt.DoesNotExist:
        return Response({'error': 'Receipt not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def download_material_acknowledgment(request, pk):
    """Download PDF acknowledgment for a material donation"""
    try:
        mat_don = MaterialDonation.objects.get(pk=pk)
        if mat_don.status != MaterialDonation.Status.COLLECTED:
            return Response(
                {'error': 'Acknowledgment only available for collected donations'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        pdf_content = MaterialAcknowledgmentService.generate_acknowledgment_pdf(mat_don)
        response = HttpResponse(pdf_content, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="acknowledgment_{mat_don.id.hex[:8]}.pdf"'
        return response
    except MaterialDonation.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)


# Image Management Endpoints
@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrManagement])
def delete_campaign_image(request, pk):
    """Delete featured image from a campaign"""
    try:
        campaign = Campaign.objects.get(pk=pk)
        
        if not campaign.featured_image:
            return Response(
                {'error': 'No featured image to delete'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Import here to avoid circular import
        from accounts.image_utils import delete_cloudinary_image
        
        # Delete from Cloudinary if using cloud storage
        if hasattr(campaign.featured_image, 'url'):
            delete_cloudinary_image(campaign.featured_image.url)
        
        # Clear the field
        campaign.featured_image = None
        campaign.save()
        
        log_analytics_event(
            event_type='CAMPAIGN_IMAGE_DELETED',
            description=f'Administrator deleted featured image from campaign: {campaign.title}',
            user=request.user,
            request=request,
            event_data={'campaign_id': str(campaign.id)}
        )
        
        return Response({'success': True, 'message': 'Campaign image deleted successfully'})
    except Campaign.DoesNotExist:
        return Response(
            {'error': 'Campaign not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f'Error deleting campaign image: {str(e)}')
        return Response(
            {'error': f'Failed to delete image: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
