"""
Kindra CBO Management System
Django Settings Configuration

This file contains all Django settings for the Kindra CBO project.
Credentials are loaded from environment variables - see .env.example

For configuration details, see: configuration_guide.md
"""

from pathlib import Path
from decouple import config, Csv
from datetime import timedelta
import socket
import dj_database_url
import ssl

def get_local_ip():
    """Detects the local IP address of the machine."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return '127.0.0.1'

LOCAL_IP = get_local_ip()

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent

# ==================================
# SECURITY SETTINGS
# ==================================

# SECURITY WARNING: keep the secret key used in production secret!
# Generate using: python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
SECRET_KEY = config('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=False, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=Csv())
if DEBUG:
    ALLOWED_HOSTS = ['*']
elif LOCAL_IP not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(LOCAL_IP)

# Print network access info
if DEBUG:
    print("\n" + "="*50)
    print(f"NETWORK ACCESS ENABLED")
    print(f"Local IP detected: {LOCAL_IP}")
    print(f"Access backend at: http://{LOCAL_IP}:8000/api/v1/")
    print(f"Access frontend at: http://{LOCAL_IP}:3000/")
    print("="*50 + "\n")

# ==================================
# APPLICATION DEFINITION
# ==================================

INSTALLED_APPS = [
    # Django Core Apps
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-Party Apps
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
    'drf_spectacular',
    'django_celery_beat',
    'django_celery_results',
    
    # Django Allauth (Social Authentication)
    'django.contrib.sites',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    
    # Cloudinary Storage
    'cloudinary_storage',
    'cloudinary',
    
    # Kindra CBO Apps
    'accounts.apps.AccountsConfig',
    'case_management.apps.CaseManagementConfig',
    'shelter_homes.apps.ShelterHomesConfig',
    'donations.apps.DonationsConfig',
    'volunteers.apps.VolunteersConfig',
    'reporting.apps.ReportingConfig',
    'blog.apps.BlogConfig',
    'social_chat.apps.SocialChatConfig',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Serve static files in production
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'allauth.account.middleware.AccountMiddleware',  # For django-allauth
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    # Custom middleware
    'kindra_cbo.middleware.GlobalExceptionMiddleware',
    'kindra_cbo.middleware.SecurityHeadersMiddleware',
]

ROOT_URLCONF = 'kindra_cbo.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'kindra_cbo.wsgi.application'

# ==================================
# DATABASE CONFIGURATION
# ==================================
# Auto-detect: Use DATABASE_URL for production, SQLite for development

if config('DATABASE_URL', default=''):
    # Production: Use PostgreSQL from DATABASE_URL (Render, Neon, etc.)
    DATABASES = {
        'default': dj_database_url.config(
            default=config('DATABASE_URL'),
            conn_max_age=600,
            conn_health_checks=True,
            ssl_require=True
        )
    }
else:
    # Development: Use SQLite
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db_kindra.sqlite3',
        }
    }


# ==================================
# CACHE CONFIGURATION
# ==================================
# Auto-detect: Use Redis for production, local memory for development

_REDIS_URL = config('REDIS_URL', default='')

# Only enable Redis cache when both the URL is set AND django_redis is installed
_django_redis_available = False
if _REDIS_URL:
    try:
        import django_redis  # noqa: F401
        _django_redis_available = True
    except ImportError:
        pass

if _django_redis_available:
    CACHES = {
        "default": {
            "BACKEND": "django_redis.cache.RedisCache",
            "LOCATION": _REDIS_URL,
            "OPTIONS": {
                "CLIENT_CLASS": "django_redis.client.DefaultClient",
                "SOCKET_CONNECT_TIMEOUT": 5,
                "SOCKET_TIMEOUT": 5,
                "IGNORE_EXCEPTIONS": True,  # Degrade gracefully on Redis failure
            },
        }
    }
else:
    # Fallback: dev environment without Redis, or django_redis not installed
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "unique-snowflake",
        }
    }
SESSION_ENGINE = 'django.contrib.sessions.backends.db'

# Session configuration
SESSION_CACHE_ALIAS = 'default'

# ==================================
# PASSWORD VALIDATION
# ==================================

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# ==================================
# INTERNATIONALIZATION
# ==================================

LANGUAGE_CODE = 'en-us'

# Kenyan timezone
TIME_ZONE = 'Africa/Nairobi'

USE_I18N = True

USE_TZ = True

# ==================================
# FRONTEND URL
# ==================================
# Used to build absolute links in emails (verification, password reset)
FRONTEND_URL = config('FRONTEND_URL', default='http://localhost:5173')

# ==================================
# STATIC & MEDIA FILES
# ==================================

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files (user uploads)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# File upload settings
MAX_UPLOAD_SIZE = config('MAX_UPLOAD_SIZE_MB', default=10, cast=int) * 1024 * 1024  # Convert to bytes
DATA_UPLOAD_MAX_MEMORY_SIZE = MAX_UPLOAD_SIZE
FILE_UPLOAD_MAX_MEMORY_SIZE = MAX_UPLOAD_SIZE

# ==================================
# CLOUDINARY FILE STORAGE (Production)
# ==================================
# Auto-detect: Use Cloudinary for production, local storage for development

if config('CLOUDINARY_CLOUD_NAME', default=''):
    # Production: Use Cloudinary for media files
    import cloudinary
    import cloudinary.uploader
    import cloudinary.api
    
    # Cloudinary configuration
    cloudinary.config(
        cloud_name=config('CLOUDINARY_CLOUD_NAME'),
        api_key=config('CLOUDINARY_API_KEY'),
        api_secret=config('CLOUDINARY_API_SECRET'),
        secure=True
    )
    
    # Storage Configuration (Django 4.2+)
    STORAGES = {
        "default": {
            "BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage",
        },
        "staticfiles": {
            "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
        },
    }
else:
    # Default to local storage if Cloudinary not configured
    STORAGES = {
        "default": {
            "BACKEND": "django.core.files.storage.FileSystemStorage",
        },
        "staticfiles": {
            "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
        },
    }

# ==================================
# CUSTOM USER MODEL
# ==================================

AUTH_USER_MODEL = 'accounts.User'

# ==================================
# REST FRAMEWORK CONFIGURATION
# ==================================

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'accounts.authentication.SafeJWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    # API Versioning
    'DEFAULT_VERSIONING_CLASS': 'rest_framework.versioning.NamespaceVersioning',
    'ALLOWED_VERSIONS': ['v1'],
    # API Throttling for DDoS protection
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',  # Anonymous users: 100 requests per hour
        'user': '1000/hour',  # Authenticated users: 1000 requests per hour
        'payment': '10/hour',  # Payment endpoints: 10 requests per hour
        'registration': '5/hour',  # Registration: 5 requests per hour
    },
    # Exception handling
    'EXCEPTION_HANDLER': 'rest_framework.views.exception_handler',  # DRF default, our middleware catches the rest
}

# ==================================
# JWT CONFIGURATION
# ==================================

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=config('JWT_ACCESS_TOKEN_LIFETIME_MINUTES', default=60, cast=int)),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=config('JWT_REFRESH_TOKEN_LIFETIME_DAYS', default=7, cast=int)),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': config('JWT_ALGORITHM', default='HS256'),
    'SIGNING_KEY': config('JWT_SECRET_KEY', default=SECRET_KEY),
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# ==================================
# CORS CONFIGURATION
# ==================================

CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', default='http://localhost:3000,http://localhost:5173,https://kindra-cbo.vercel.app', cast=Csv())
# Sanitize origins: remove trailing slashes if present (fixes corsheaders.E014)
CORS_ALLOWED_ORIGINS = [origin.rstrip('/') for origin in CORS_ALLOWED_ORIGINS]
CORS_ALLOW_ALL_ORIGINS = True if DEBUG else False

# Add dynamic network origins for development
if DEBUG and LOCAL_IP != '127.0.0.1':
    # Allow local network access
    CORS_ALLOWED_ORIGINS.append(f'http://{LOCAL_IP}:3000')
    CORS_ALLOWED_ORIGINS.append(f'http://{LOCAL_IP}:5173')

# Force add production frontend domain (ensures it works even if env vars override defaults)
if 'https://kindra-cbo.vercel.app' not in CORS_ALLOWED_ORIGINS:
    CORS_ALLOWED_ORIGINS.append('https://kindra-cbo.vercel.app')

CORS_ALLOW_CREDENTIALS = True

# ==================================
# CELERY CONFIGURATION
# ==================================

CELERY_BROKER_URL = config('CELERY_BROKER_URL', default=config('REDIS_URL', default='redis://localhost:6379/0'))
CELERY_RESULT_BACKEND = None  # Disable result backend to avoid connection issues
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'
CELERY_TASK_IGNORE_RESULT = True  # Globally ignore results

# Handle secure Redis (Upstash/Render/Heroku)
if CELERY_BROKER_URL.startswith('rediss://'):
    CELERY_BROKER_USE_SSL = {
        'ssl_cert_reqs': ssl.CERT_NONE
    }
    CELERY_REDIS_BACKEND_USE_SSL = {
        'ssl_cert_reqs': ssl.CERT_NONE
    }

# Celery task settings for free tier (reduced frequency)
CELERY_TASK_ALWAYS_EAGER = DEBUG  # Run tasks synchronously in development
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True
CELERY_BROKER_CONNECTION_TIMEOUT = 5.0 # Seconds before failing and falling back
CELERY_BROKER_TRANSPORT_OPTIONS = {
    'socket_timeout': 5.0,
    'socket_connect_timeout': 5.0,
}

# Scheduled periodic tasks
CELERY_BEAT_SCHEDULE = {
    'cleanup-old-notifications-daily': {
        'task': 'kindra_cbo.tasks.cleanup_old_notifications',
        'schedule': 86400,  # Every 24 hours (seconds)
        'kwargs': {'days': 90},
    },
}

# ==================================
# EMAIL CONFIGURATION (Zoho SMTP)
# ==================================

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.zoho.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_USE_SSL = False
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='kindra-cbo@zohomail.com')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER
EMAIL_TIMEOUT = 30 # Increased timeout for slow SMTP handshake


# Email templates
EMAIL_TEMPLATES = {
    'donation_receipt': config('SENDGRID_TEMPLATE_DONATION_RECEIPT', default=''),
    'newsletter': config('SENDGRID_TEMPLATE_NEWSLETTER', default=''),
}

# ==================================
# API DOCUMENTATION (Spectacular)
# ==================================

SPECTACULAR_SETTINGS = {
    'TITLE': 'Kindra CBO Management System API',
    'DESCRIPTION': 'API for managing child welfare services, donations, and NGO operations',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

# ==================================
# SENTRY ERROR TRACKING
# ==================================

if not DEBUG:
    try:
        import sentry_sdk
        from sentry_sdk.integrations.django import DjangoIntegration
        
        sentry_sdk.init(
            dsn=config('SENTRY_DSN', default=''),
            integrations=[DjangoIntegration()],
            traces_sample_rate=0.1,
            send_default_pii=False,
            environment=config('SENTRY_ENVIRONMENT', default='production'),
        )
    except ImportError:
        pass  # Sentry not installed, skip error tracking


# ==================================
# SECURITY SETTINGS (Production)
# ==================================

# HTTPS/SSL Settings
SECURE_SSL_REDIRECT = False if DEBUG else True  # Only redirect to HTTPS in production
SESSION_COOKIE_SECURE = not DEBUG  # Send cookies only over HTTPS
CSRF_COOKIE_SECURE = not DEBUG  # CSRF cookies only over HTTPS

# Security Headers
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'  # Prevent clickjacking
SECURE_REFERRER_POLICY = 'same-origin'  # Referrer policy

# HSTS (HTTP Strict Transport Security)
if not DEBUG:
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

# Content Security Policy (Basic)
CSP_DEFAULT_SRC = ("'self'",)
CSP_SCRIPT_SRC = ("'self'", "'unsafe-inline'")  # Allow inline scripts for React
CSP_STYLE_SRC = ("'self'", "'unsafe-inline'", "fonts.googleapis.com")
CSP_IMG_SRC = ("'self'", "data:", "https:")
CSP_FONT_SRC = ("'self'", "fonts.gstatic.com")
CSP_CONNECT_SRC = ("'self'", config('CORS_ALLOWED_ORIGINS', default='http://localhost:3000', cast=str))

# Session Security
SESSION_COOKIE_AGE = 3600  # 1 hour
SESSION_COOKIE_HTTPONLY = True  # Prevent JavaScript access
SESSION_COOKIE_SAMESITE = 'Lax'  # Relaxed for dev
SESSION_SAVE_EVERY_REQUEST = True  # Extend session on each request
SESSION_EXPIRE_AT_BROWSER_CLOSE = True

# CSRF Protection
CSRF_COOKIE_HTTPONLY = False  # Frontend needs to read this for API calls
CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_TRUSTED_ORIGINS = config('CORS_ALLOWED_ORIGINS', default='http://localhost:3000,http://localhost:5173,https://kindra-cbo.vercel.app', cast=Csv())
# Sanitize trusted origins
CSRF_TRUSTED_ORIGINS = [origin.rstrip('/') for origin in CSRF_TRUSTED_ORIGINS]
if DEBUG:
    # Allow local network IPs for CSRF as well in debug mode
    CSRF_TRUSTED_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000']
    if LOCAL_IP != '127.0.0.1':
        CSRF_TRUSTED_ORIGINS.append(f"http://{LOCAL_IP}:3000")
        CSRF_TRUSTED_ORIGINS.append(f"http://{LOCAL_IP}:8000")

# Force add production frontend domain
if 'https://kindra-cbo.vercel.app' not in CSRF_TRUSTED_ORIGINS:
    CSRF_TRUSTED_ORIGINS.append('https://kindra-cbo.vercel.app')

# ==================================
# LOGGING CONFIGURATION
# ==================================

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'kindra_cbo.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
        'django.server': {
            'handlers': ['console'],
            'level': 'ERROR',  # Reduce noise from basehttp (like Broken pipe)
            'propagate': False,
        },
        'kindra_cbo': {
            'handlers': ['file', 'console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}

# ==================================
# DEFAULT PRIMARY KEY FIELD TYPE
# ==================================

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ==================================
# DJANGO ALLAUTH CONFIGURATION
# ==================================

SITE_ID = 1

# Authentication backends
AUTHENTICATION_BACKENDS = [
    # Django default (username/password)
    'django.contrib.auth.backends.ModelBackend',
    # Allauth (social auth)
    'allauth.account.auth_backends.AuthenticationBackend',
]

# Allauth settings
ACCOUNT_SIGNUP_FIELDS = ['email*', 'password1*', 'password2*']
ACCOUNT_LOGIN_METHODS = {'email'}
ACCOUNT_EMAIL_VERIFICATION = 'optional'  # Can be 'mandatory', 'optional', or 'none'
SOCIALACCOUNT_EMAIL_VERIFICATION = 'none'
SOCIALACCOUNT_AUTO_SIGNUP = True

# Google OAuth settings
SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': [
            'profile',
            'email',
        ],
        'AUTH_PARAMS': {
            'access_type': 'online',
        },
        'APP': {
            'client_id': config('GOOGLE_OAUTH_CLIENT_ID', default=''),
            'secret': config('GOOGLE_OAUTH_CLIENT_SECRET', default=''),
            'key': ''
        }
    }
}

