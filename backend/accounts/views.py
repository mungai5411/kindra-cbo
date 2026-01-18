"""
User Views
Handles user authentication, registration, and profile management
"""

from rest_framework import generics, status, permissions, exceptions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from django.core.cache import cache
import time
import random
from .models import User, AuditLog, Notification
from .serializers import (
    UserRegistrationSerializer,
    UserSerializer,
    UserProfileUpdateSerializer,
    ChangePasswordSerializer,
    AuditLogSerializer,
    NotificationSerializer
)
from .permissions import IsAdminOrManagement
from kindra_cbo.throttling import RegistrationRateThrottle
from reporting.utils import log_analytics_event
from reporting.models import AnalyticsEvent

# Rate limiting decorator
def rate_limit(key_prefix, limit, period):
    """
    Rate limiting decorator
    key_prefix: prefix for cache key
    limit: maximum number of attempts
    period: time period in seconds
    """
    def decorator(func):
        def wrapper(self, request, *args, **kwargs):
            # Get client IP
            ip = self.get_client_ip(request) if hasattr(self, 'get_client_ip') else request.META.get('REMOTE_ADDR')
            cache_key = f"{key_prefix}:{ip}"
            
            # Get current attempts
            attempts = cache.get(cache_key, {'count': 0, 'reset_time': time.time() + period})
            
            # Check if period has expired
            if time.time() > attempts['reset_time']:
                attempts = {'count': 0, 'reset_time': time.time() + period}
            
            # Check if limit exceeded
            if attempts['count'] >= limit:
                time_remaining = int(attempts['reset_time'] - time.time())
                return Response({
                    'error': f'Rate limit exceeded. Try again in {time_remaining} seconds.'
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)
            
            # Increment attempts
            attempts['count'] += 1
            cache.set(cache_key, attempts, period)
            
            return func(self, request, *args, **kwargs)
        return wrapper
    return decorator



class UserRegistrationView(generics.CreateAPIView):
    """
    Register a new user
    Public endpoint - no authentication required
    Rate limited to prevent spam
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [RegistrationRateThrottle]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Determine if approval is needed (e.g., Shelter Partners)
        role = request.data.get('role', 'DONOR')
        approval_needed = role == User.Role.SHELTER_PARTNER
        
        user = serializer.save(is_approved=not approval_needed)
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Create random encouraging notification
        ENCOURAGING_MESSAGES = [
            ("Welcome to Kindra!", "We're thrilled to have you join our mission of creating lasting impact. Together, we can change lives!"),
            ("A New Journey Begins", "Thank you for joining our community. Your presence alone brings hope to those we serve."),
            ("Ready to Make a Difference?", "Welcome aboard! We can't wait to see the amazing contributions you'll bring to the Kindra family."),
            ("Your Support Matters", "Welcome to Kindra! Every member counts in our quest to build stronger communities."),
            ("Global Impact, Local Action", "We're glad you're here! Let's work together to make the world a better place, one step at a time.")
        ]
        chosen_title, chosen_msg = random.choice(ENCOURAGING_MESSAGES)
        Notification.objects.create(
            recipient=user,
            title=chosen_title,
            message=chosen_msg,
            type=Notification.Type.SUCCESS,
            category=Notification.Category.SYSTEM
        )
        
        # Log registration
        log_analytics_event(
            event_type=AnalyticsEvent.EventType.VOLUNTEER_JOINED if role == 'VOLUNTEER' else 'USER_REGISTERED',
            description=f'New {role.lower()} registered: {user.email} (Approved: {not approval_needed})',
            user=user,
            request=request
        )
        
        # Create response
        response = Response({
            'user': UserSerializer(user).data,
            'message': 'User registered successfully' + (' and waiting for admin approval' if approval_needed else ''),
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
        
        # Set tokens in HTTP-only cookies
        self._set_auth_cookies(response, str(refresh.access_token), str(refresh))
        
        return response
    
    def _set_auth_cookies(self, response, access_token, refresh_token):
        """Set JWT tokens in HTTP-only cookies"""
        from django.conf import settings
        
        # Access token cookie
        response.set_cookie(
            key='access_token',
            value=access_token,
            max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
            httponly=True,  # Prevents JavaScript access (XSS protection)
            secure=not settings.DEBUG,  # HTTPS only in production
            samesite='Lax',  # CSRF protection (relaxed slightly for cross-origin consistency)
            path='/'
        )
        
        # Refresh token cookie
        response.set_cookie(
            key='refresh_token',
            value=refresh_token,
            max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
            httponly=True,
            secure=not settings.DEBUG,
            samesite='Lax',
            path='/'
        )
    
    def get_client_ip(self, request):
        """Get client IP address from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip



class LoginView(APIView):
    """
    User login endpoint
    Returns JWT tokens on successful authentication
    """
    permission_classes = [permissions.AllowAny]
    
    def get_client_ip(self, request):
        """Get client IP address from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({
                'error': 'Email and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check rate limit BEFORE authentication
        ip = self.get_client_ip(request)
        cache_key = f"login_attempts:{ip}"
        attempts = cache.get(cache_key, {'count': 0, 'reset_time': time.time() + 900})
        
        # Check if period has expired
        if time.time() > attempts['reset_time']:
            attempts = {'count': 0, 'reset_time': time.time() + 900}
        
        # Check if limit exceeded (5 failed attempts per 15 minutes)
        if attempts['count'] >= 5:
            time_remaining = int(attempts['reset_time'] - time.time())
            return Response({
                'error': f'Rate limit exceeded. Try again in {time_remaining} seconds.'
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        # Authenticate user
        # Note: We pass 'username' argument because Django's authenticate method expects it,
        # even if the actual field is 'email'.
        user = authenticate(request, username=email, password=password)
        
        if user is None:
            # ONLY increment on FAILED login
            attempts['count'] += 1
            cache.set(cache_key, attempts, 900)
            
            # Audit log failed attempt
            AuditLog.objects.create(
                action=AuditLog.Action.LOGIN,
                resource_type='User',
                description=f'Failed login attempt for {email}',
                ip_address=self.get_client_ip(request)
            )
            return Response({
                'error': 'Invalid email or password'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Successful authentication - CLEAR the rate limit
        cache.delete(cache_key)
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        # Audit log successful login
        log_analytics_event(
            event_type='USER_LOGIN',
            description=f'Successful login: {user.email}',
            user=user,
            request=request
        )
        
        # Create response
        response = Response({
            'user': {
                'id': str(user.id),
                'email': user.email,
                'full_name': user.get_full_name(),
                'role': user.role,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
            },
            # Keep tokens in response for backward compatibility during transition
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)
        
        # Set tokens in HTTP-only cookies (more secure)
        self._set_auth_cookies(response, str(refresh.access_token), str(refresh))
        
        return response
    
    def _set_auth_cookies(self, response, access_token, refresh_token):
        """Set JWT tokens in HTTP-only cookies"""
        from django.conf import settings
        
        # Access token cookie
        response.set_cookie(
            key='access_token',
            value=access_token,
            max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
            httponly=True,  # Prevents JavaScript access (XSS protection)
            secure=not settings.DEBUG,  # HTTPS only in production
            samesite='Lax',  # CSRF protection
            path='/'
        )
        
        # Refresh token cookie
        response.set_cookie(
            key='refresh_token',
            value=refresh_token,
            max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
            httponly=True,
            secure=not settings.DEBUG,
            samesite='Lax',
            path='/'
        )
    
    def get_client_ip(self, request):
        """Get client IP address from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Get or update current user's profile
    Requires authentication
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def get_serializer_class(self):
        if self.request.method == 'PUT' or self.request.method == 'PATCH':
            return UserProfileUpdateSerializer
        return UserSerializer


class ChangePasswordView(APIView):
    """
    Change user password
    Requires authentication
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        
        # Check old password
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({
                'error': 'Old password is incorrect'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Set new password
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        # Log password change
        AuditLog.objects.create(
            user=user,
            action=AuditLog.Action.UPDATE,
            resource_type='User',
            resource_id=str(user.id),
            description='Password changed',
            ip_address=self.get_client_ip(request)
        )
        
        return Response({
            'message': 'Password changed successfully'
        })
    
    def get_client_ip(self, request):
        """Get client IP address from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class UserListView(generics.ListAPIView):
    """
    List all users (Admin only)
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Only admins can see all users
        if self.request.user.is_admin:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)


class UserAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Admin view to retrieve, update, or delete a specific user.
    Only accessible by admins.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrManagement]

    def perform_update(self, serializer):
        old_role = self.get_object().role
        user = serializer.save()
        
        if old_role != user.role:
            log_analytics_event(
                event_type='USER_ROLE_CHANGED',
                description=f'Administrator changed role for {user.email} from {old_role} to {user.role}',
                user=self.request.user,
                request=self.request,
                event_data={'affected_user_id': str(user.id), 'old_role': old_role, 'new_role': user.role}
            )

    def perform_destroy(self, instance):
        # Prevent deleting yourself
        if instance == self.request.user:
            raise exceptions.ValidationError("You cannot delete your own account.")
        
        email = instance.email
        instance.delete()
        
        # Log deletion
        log_analytics_event(
            event_type='USER_DELETED',
            description=f'Administrator deleted user account: {email}',
            user=self.request.user,
            request=self.request,
            event_data={'deleted_user_email': email}
        )


class AuditLogListView(generics.ListAPIView):
    """
    View audit logs (Admin and Management only)
    """
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Admins and management can see all logs
        if user.role in [User.Role.ADMIN, User.Role.MANAGEMENT]:
            return AuditLog.objects.all()
        
        # Other users can only see their own logs
        return AuditLog.objects.filter(user=user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """
    Logout user (blacklist refresh token and clear cookies)
    """
    try:
        # Try to get refresh token from request body or cookies
        refresh_token = request.data.get('refresh_token') or request.COOKIES.get('refresh_token')
        
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        # Log logout
        AuditLog.objects.create(
            user=request.user,
            action=AuditLog.Action.LOGOUT,
            resource_type='Authentication',
            description=f'User logged out: {request.user.email}',
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        # Create response
        response = Response({'message': 'Logout successful'})
        
        # Clear cookies
        response.delete_cookie('access_token', path='/')
        response.delete_cookie('refresh_token', path='/')
        
        return response
    except Exception as e:
        return Response(
            {'error': 'Logout failed'},
            status=status.HTTP_400_BAD_REQUEST
        )


class PasswordResetRequestView(APIView):
    """
    Request password reset link
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user = User.objects.get(email=email)
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # In a real app, send an email here.
            # For now, we'll return the token/uid for testing if DEBUG is True
            # Or just send it to console
            reset_url = f"{settings.CORS_ALLOWED_ORIGINS[0]}/reset-password/{uid}/{token}/"
            
            if settings.DEBUG:
                print(f"Password reset link for {email}: {reset_url}")
                
            # Simulate sending email
            # send_mail(
            #     'Password Reset Request',
            #     f'Click the link to reset your password: {reset_url}',
            #     settings.DEFAULT_FROM_EMAIL,
            #     [email],
            #     fail_silently=False,
            # )
            
            return Response({
                'message': 'If an account exists with this email, a reset link has been sent.',
                # return debug info only in dev
                'debug_link': reset_url if settings.DEBUG else None 
            })
        except User.DoesNotExist:
            # Don't reveal if user exists
            return Response({'message': 'If an account exists with this email, a reset link has been sent.'})


class PasswordResetConfirmView(APIView):
    """
    Confirm password reset with token
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        
        if not all([uidb64, token, new_password]):
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
            
            if not default_token_generator.check_token(user, token):
                return Response({'error': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)
                
            user.set_password(new_password)
            user.save()
            
            # Log password reset
            log_analytics_event(
                event_type='PASSWORD_RESET_CONFIRMED',
                description=f'Password reset confirmed via token for: {user.email}',
                user=user,
                request=request
            )
            
            return Response({'message': 'Password has been reset successfully'})
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({'error': 'Invalid link'}, status=status.HTTP_400_BAD_REQUEST)


class NotificationListView(generics.ListAPIView):
    """
    List all notifications for the current user
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user).order_by('-created_at')

    def post(self, request, *args, **kwargs):
        """
        Mark notifications as read
        Expected body: {"notification_ids": [id1, id2, ...]}
        """
        notification_ids = request.data.get('notification_ids', [])
        if not notification_ids:
            return Response(
                {"error": "No notification_ids provided"},
                status=status.HTTP_400_BAD_REQUEST
            )

        updated_count = Notification.objects.filter(
            id__in=notification_ids,
            recipient=request.user
        ).update(read=True)

        return Response({
            "success": True,
            "message": f"Marked {updated_count} notifications as read"
        })

from django.core.management import call_command

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrManagement])
def trigger_cleanup_view(request):
    """
    Manually trigger the inactivity cleanup task.
    """
    try:
        call_command('cleanup_inactive_users')
        
        # Log manual cleanup trigger
        from reporting.utils import log_analytics_event
        log_analytics_event(
            event_type='SYSTEM_CLEANUP_TRIGGERED',
            description='Administrator manually triggered user inactivity cleanup engine.',
            user=request.user,
            request=request
        )
        
        return Response({
            'success': True, 
            'message': 'Inactivity cleanup task executed successfully. Notifications sent and expired profiles removed.'
        })
    except Exception as e:
        return Response({
            'success': False, 
            'message': f'Failed to execute cleanup: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PendingApprovalsListView(generics.ListAPIView):
    """List users waiting for admin approval (Shelter Partners)"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrManagement]
    
    def get_queryset(self):
        return User.objects.filter(is_approved=False, is_active=True)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrManagement])
def approve_user_view(request, pk):
    """Approve a user account"""
    try:
        user = User.objects.get(pk=pk)
        user.is_approved = True
        user.save()
        
        # Notify user
        Notification.objects.create(
            recipient=user,
            title="Account Approved",
            message="Your account has been verified and approved by the administration. You now have full access to the platform.",
            type=Notification.Type.SUCCESS,
            category=Notification.Category.VERIFICATION
        )
        
        # Log approval
        log_analytics_event(
            event_type='USER_APPROVED',
            description=f'Administrator approved account: {user.email}',
            user=request.user,
            request=request,
            event_data={'approved_user_id': str(user.id)}
        )
        
        return Response({'success': True, 'message': f'User {user.email} has been approved.'})
    except User.DoesNotExist:
        return Response({'success': False, 'message': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
