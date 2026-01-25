"""
Google OAuth API View
Handles Google OAuth token exchange for JWT authentication
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
from accounts.models import User
import logging

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([AllowAny])
def google_login(request):
    """
    Exchange Google OAuth token for Django JWT tokens
    
    Expected request body:
    {
        "credential": "google_id_token"
    }
    
    Returns:
    {
        "access": "jwt_access_token",
        "refresh": "jwt_refresh_token",
        "user": {...}
    }
    """
    try:
        # Get the Google ID token from request
        google_token = request.data.get('credential')
        
        if not google_token:
            return Response(
                {'error': 'No credential provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify the Google token
        client_id = settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['client_id']
        
        try:
            idinfo = id_token.verify_oauth2_token(
                google_token,
                requests.Request(),
                client_id
            )
        except ValueError as e:
            logger.error(f"Google token verification failed: {str(e)}")
            return Response(
                {'error': 'Invalid Google token'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Extract user information from Google token
        email = idinfo.get('email')
        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')
        
        if not email:
            return Response(
                {'error': 'Email not provided by Google'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get or create user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'first_name': first_name,
                'last_name': last_name,
                'is_verified': True,  # Google accounts are pre-verified
                'is_active': True,
            }
        )
        
        # If user exists but was created via normal registration, update their info
        if not created:
            if not user.first_name and first_name:
                user.first_name = first_name
            if not user.last_name and last_name:
                user.last_name = last_name
            user.is_verified = True
            user.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Prepare user data for response
        from accounts.serializers import UserSerializer
        user_data = UserSerializer(user).data
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': user_data,
            'message': 'Login successful' if not created else 'Account created and logged in'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Google login error: {str(e)}")
        return Response(
            {'error': 'An error occurred during Google login'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
