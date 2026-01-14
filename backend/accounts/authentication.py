"""
Custom JWT Authentication
Supports both Authorization header and HTTP-only cookies
"""

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from django.conf import settings


class SafeJWTAuthentication(JWTAuthentication):
    """
    Custom JWT authentication that:
    1. Reads tokens from Authorization header (backward compatible)
    2. Falls back to HTTP-only cookies (more secure)
    3. Provides better error messages
    """
    
    def authenticate(self, request):
        # Try to get token from Authorization header first (backward compatible)
        header = self.get_header(request)
        
        raw_token = None
        if header is not None:
            raw_token = self.get_raw_token(header)
        
        if raw_token is None:
            # Fallback to cookie-based authentication
            raw_token = request.COOKIES.get('access_token')
            
            if raw_token is None:
                return None
        
        try:
            validated_token = self.get_validated_token(raw_token)
            return self.get_user(validated_token), validated_token
        except InvalidToken as e:
            # If the token is invalid or expired, raise AuthenticationFailed.
            # This allows DRF to return a 401.
            # Log the error but don't expose details to user unless in DEBUG mode.
            if settings.DEBUG:
                raise AuthenticationFailed(f'Token is invalid or expired: {str(e)}')
            raise AuthenticationFailed('Token is invalid or expired')
        except Exception as e:
            # Catch any other unexpected errors during authentication.
            if settings.DEBUG:
                raise AuthenticationFailed(f'Authentication failed: {str(e)}')
            raise AuthenticationFailed('Authentication failed')
