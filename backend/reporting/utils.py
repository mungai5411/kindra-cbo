from .models import AnalyticsEvent

def log_analytics_event(event_type, description='', event_data=None, user=None, request=None):
    """
    Utility to log analytics events
    """
    ip_address = None
    user_agent = ''
    
    if request:
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0]
        else:
            ip_address = request.META.get('REMOTE_ADDR')
        user_agent = request.META.get('HTTP_USER_AGENT', '')[:255]
        
        if not user and request.user.is_authenticated:
            user = request.user
            
    return AnalyticsEvent.objects.create(
        event_type=event_type,
        description=description,
        event_data=event_data or {},
        user=user,
        ip_address=ip_address,
        user_agent=user_agent
    )
