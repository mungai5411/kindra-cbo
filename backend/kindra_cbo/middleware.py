"""
Custom Middleware for Kindra CBO
Handles global exception handling and security
"""

import logging
import traceback
from django.conf import settings
from django.http import JsonResponse
from django.db import DatabaseError, IntegrityError
from rest_framework.exceptions import APIException, ValidationError, PermissionDenied, NotAuthenticated
from rest_framework import status

logger = logging.getLogger('kindra_cbo')


class GlobalExceptionMiddleware:
    """
    Global exception handler middleware
    Catches all unhandled exceptions and returns user-friendly error messages
    while logging detailed errors internally
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        return response
    
    def process_exception(self, request, exception):
        """
        Process exceptions and return appropriate responses
        """
        # Get client IP for logging
        ip_address = self.get_client_ip(request)
        
        # Log the full exception with stack trace
        logger.error(
            f"Exception occurred: {type(exception).__name__}\n"
            f"Path: {request.path}\n"
            f"Method: {request.method}\n"
            f"IP: {ip_address}\n"
            f"User: {request.user if hasattr(request, 'user') else 'Anonymous'}\n"
            f"Error: {str(exception)}\n"
            f"Traceback:\n{traceback.format_exc()}"
        )
        
        # Handle different exception types
        
        # 1. DRF API Exceptions (already handled by DRF, but catch edge cases)
        if isinstance(exception, NotAuthenticated):
            return JsonResponse({
                'error': 'Authentication required',
                'detail': str(exception) if settings.DEBUG else None
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        if isinstance(exception, PermissionDenied):
            return JsonResponse({
                'error': 'Permission denied',
                'detail': str(exception) if settings.DEBUG else None
            }, status=status.HTTP_403_FORBIDDEN)
        
        if isinstance(exception, ValidationError):
            return JsonResponse({
                'error': 'Validation error',
                'detail': exception.detail if settings.DEBUG else 'Invalid input data'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if isinstance(exception, APIException):
            return JsonResponse({
                'error': exception.default_detail,
                'detail': str(exception) if settings.DEBUG else None
            }, status=exception.status_code)
        
        # 2. Database Errors (NEVER expose to users)
        if isinstance(exception, (DatabaseError, IntegrityError)):
            return JsonResponse({
                'error': 'Something went wrong. Please try again later.',
                'detail': str(exception) if settings.DEBUG else None,
                'type': 'database_error' if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # 3. Generic exceptions
        return JsonResponse({
            'error': 'Something went wrong. Please try again later.',
            'detail': str(exception) if settings.DEBUG else None,
            'type': type(exception).__name__ if settings.DEBUG else None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get_client_ip(self, request):
        """Get client IP address from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class SecurityHeadersMiddleware:
    """
    Add security headers to all responses
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Add security headers
        if not settings.DEBUG:
            response['X-Content-Type-Options'] = 'nosniff'
            response['X-Frame-Options'] = 'DENY'
            response['X-XSS-Protection'] = '1; mode=block'
            response['Referrer-Policy'] = 'same-origin'
            response['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
        
        return response
