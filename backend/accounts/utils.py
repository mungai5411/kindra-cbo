"""
Input Sanitization & Shared Utilities
Provides functions to sanitize and validate user input, plus shared request helpers.
"""

import re
import bleach
from django.core.exceptions import ValidationError
from django.core.validators import URLValidator


def get_client_ip(request):
    """
    Extract the real client IP address from a Django request.
    Handles reverse proxies that set X-Forwarded-For headers.
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        # Take the first (original) IP in the chain
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '127.0.0.1')


# Allowed HTML tags for rich text (if needed)
ALLOWED_TAGS = [
    'p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code'
]

ALLOWED_ATTRIBUTES = {
    'a': ['href', 'title'],
    '*': ['class']
}


def sanitize_html(text):
    """
    Sanitize HTML content to prevent XSS attacks
    Removes dangerous tags and attributes
    """
    if not text:
        return text
    return bleach.clean(
        text,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        strip=True
    )


def sanitize_text(text, max_length=None):
    """
    Sanitize plaintext input
    Removes HTML tags and limits length
    """
    if not text:
        return text
    
    # Remove HTML tags
    cleaned = bleach.clean(text, tags=[], strip=True)
    
    # Trim whitespace
    cleaned = cleaned.strip()
    
    # Limit length if specified
    if max_length and len(cleaned) > max_length:
        cleaned = cleaned[:max_length]
    
    return cleaned


def validate_phone_number(phone):
    """
    Validate phone number format (Kenyan format)
    Accepts: +254XXXXXXXXX, 254XXXXXXXXX, 07XXXXXXXX, 01XXXXXXXX
    """
    if not phone:
        return False
    
    # Remove spaces and dashes
    phone = re.sub(r'[\s\-()]', '', phone)
    
    # Check patterns
    patterns = [
        r'^\+254[17]\d{8}$',  # +254 format
        r'^254[17]\d{8}$',     # 254 format
        r'^0[17]\d{8}$'        # 0 format
    ]
    
    return any(re.match(pattern, phone) for pattern in patterns)


def sanitize_phone_number(phone):
    """
    Sanitize and normalize phone number to international format
    """
    if not phone:
        return phone
    
    # Remove spaces, dashes, and parentheses
    phone = re.sub(r'[\s\-()]', '', phone)
    
    # Convert to international format
    if phone.startswith('0'):
        phone = '+254' + phone[1:]
    elif phone.startswith('254'):
        phone = '+' + phone
    elif not phone.startswith('+'):
        phone = '+254' + phone
    
    return phone if validate_phone_number(phone) else None


def validate_email(email):
    """
    Validate email format
    """
    if not email:
        return False
    
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def sanitize_email(email):
    """
    Sanitize email address
    """
    if not email:
        return email
    
    # Convert to lowercase and trim
    email = email.lower().strip()
    
    # Validate format
    return email if validate_email(email) else None


def validate_url(url, allowed_domains=None):
    """
    Validate URL format and optionally check against whitelist
    """
    if not url:
        return False
    
    # Check URL format
    validator = URLValidator()
    try:
        validator(url)
    except ValidationError:
        return False
    
    # Check against whitelist if provided
    if allowed_domains:
        domain_pattern = r'^https?://([^/]+)'
        match = re.match(domain_pattern, url)
        if match:
            domain = match.group(1)
            return any(domain.endswith(allowed) for allowed in allowed_domains)
    
    return True


def sanitize_filename(filename):
    """
    Sanitize filename to prevent directory traversal and malicious filenames
    """
    if not filename:
        return filename
    
    # Remove directory separators
    filename = filename.replace('/', '').replace('\\', '')
    
    # Remove potentially dangerous characters
    filename = re.sub(r'[^a-zA-Z0-9._-]', '_', filename)
    
    # Limit length
    if len(filename) > 255:
        name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
        filename = name[:250] + ('.' + ext if ext else '')
    
    return filename


def validate_file_type(filename, allowed_types):
    """
    Validate file type against allowed extensions
    """
    if not filename:
        return False
    
    ext = filename.lower().rsplit('.', 1)[-1] if '.' in filename else ''
    return ext in allowed_types


def sanitize_sql_input(text):
    """
    Additional SQL injection prevention (Django ORM already handles this)
    This is a backup for raw SQL queries
    """
    if not text:
        return text
    
    # Remove common SQL injection patterns
    dangerous_patterns = [
        r'(\bOR\b.*?=.*?)',
        r'(\bAND\b.*?=.*?)',
        r'(--|#|\/\*|\*\/)',
        r'(\bDROP\b|\bDELETE\b|\bINSERT\b|\bUPDATE\b)',
        r'(\bEXEC\b|\bEXECUTE\b)',
        r'(;)',
    ]
    
    cleaned = text
    for pattern in dangerous_patterns:
        cleaned = re.sub(pattern, '', cleaned, flags=re.IGNORECASE)
    
    return cleaned


def sanitize_json_input(data):
    """
    Sanitize JSON input to prevent injection
    """
    if isinstance(data, dict):
        return {k: sanitize_json_input(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_json_input(item) for item in data]
    elif isinstance(data, str):
        return sanitize_text(data)
    else:
        return data


def validate_password_strength(password):
    """
    Validate password strength beyond Django's defaults
    """
    if not password or len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Password must contain at least one special character"
    
    # Check for common patterns
    common_patterns = ['123456', 'password', 'qwerty', 'abc123']
    if any(pattern in password.lower() for pattern in common_patterns):
        return False, "Password contains common patterns"
    
    return True, "Password is strong"


def send_email_async_safe(recipient, subject, message, html_message=None):
    """
    Attempts to send email via Celery background tasks.
    Falls back to synchronous sending if the Celery broker or DNS is unavailable.
    This prevents 500 errors during registration when infrastructure (Redis) is down.
    """
    import logging
    from django.conf import settings
    from django.core.mail import send_mail
    
    logger = logging.getLogger(__name__)

    try:
        # Try to import and delay the task
        from kindra_cbo.tasks import send_email_notification
        send_email_notification.delay(
            recipient=recipient,
            subject=subject,
            message=message,
            html_message=html_message
        )
        if settings.DEBUG:
            print(f"DEBUG: Async email queued for {recipient}")
        return True
    except Exception as e:
        # Fallback to threaded synchronous sending if Celery broker is unreachable
        logger.warning(f"Celery delivery failed, falling back to threaded sync send for {recipient}. Error: {str(e)}")
        if settings.DEBUG:
            print(f"DEBUG: Celery failed ({e}), falling back to threaded sync send.")
        
        try:
            import threading
            def _send_sync():
                try:
                    send_mail(
                        subject=subject,
                        message=message,
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[recipient],
                        html_message=html_message,
                        fail_silently=False
                    )
                    logger.info(f"Threaded fallback email sent to {recipient}")
                except Exception as sync_e:
                    logger.error(f"Threaded fallback email failed for {recipient}: {str(sync_e)}")

            # Start thread and don't join (fire and forget)
            thread = threading.Thread(target=_send_sync)
            thread.daemon = True
            thread.start()
            return True
        except Exception as thread_e:
            logger.error(f"Failed to start fallback thread for {recipient}: {str(thread_e)}")
            return False


# Export all functions
__all__ = [
    'get_client_ip',
    'sanitize_html',
    'sanitize_text',
    'validate_phone_number',
    'sanitize_phone_number',
    'validate_email',
    'sanitize_email',
    'validate_url',
    'sanitize_filename',
    'validate_file_type',
    'sanitize_sql_input',
    'sanitize_json_input',
    'validate_password_strength',
    'send_email_async_safe',
]
