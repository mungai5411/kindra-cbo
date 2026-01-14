"""
Custom Throttling Classes for Kindra CBO
Implements rate limiting for different endpoint types
"""

from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class PaymentRateThrottle(AnonRateThrottle):
    """
    Rate limiting for payment endpoints
    Stricter limits to prevent abuse
    """
    scope = 'payment'


class RegistrationRateThrottle(AnonRateThrottle):
    """
    Rate limiting for registration endpoints
    Prevents spam account creation
    """
    scope = 'registration'


class StrictAnonRateThrottle(AnonRateThrottle):
    """
    Stricter rate limiting for anonymous users on sensitive endpoints
    """
    rate = '20/hour'
