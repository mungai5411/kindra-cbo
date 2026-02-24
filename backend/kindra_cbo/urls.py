"""
Kindra CBO Management System - URL Configuration

Main URL routing for the Django project.
API endpoints are versioned under /api/v1/
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from .health_views import HealthCheckView

urlpatterns = [
    # Admin panel
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    # API v1 Endpoints
    path('api/v1/accounts/', include('accounts.urls')),
    path('api/v1/cases/', include('case_management.urls')),
    path('api/v1/shelters/', include('shelter_homes.urls')),
    path('api/v1/donations/', include('donations.urls')),
    path('api/v1/volunteers/', include('volunteers.urls')),
    path('api/v1/reporting/', include('reporting.urls')),
    path('api/v1/blog/', include('blog.urls')),
    path('api/v1/chat/', include('social_chat.urls')),
    
    # Health check
    path('health/', HealthCheckView.as_view(), name='health_check'),
    path('api/health/', HealthCheckView.as_view(), name='api_health_check'),
    
    # Django Allauth (for social authentication)
    path('accounts/', include('allauth.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Customize admin site
admin.site.site_header = "Kindra CBO Management System"
admin.site.site_title = "Kindra CBO Admin"
admin.site.index_title = "Welcome to Kindra CBO Administration"

# Root API view
from django.http import JsonResponse
def api_root(request):
    return JsonResponse({
        "status": "online",
        "message": "Welcome to Kindra CBO API",
        "version": "v1",
        "documentation": "/api/docs/",
        "admin_panel": "/admin/"
    })

urlpatterns.insert(0, path('', api_root, name='api-root'))
