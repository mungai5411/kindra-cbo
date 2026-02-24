"""
Accounts URL Configuration
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserRegistrationView,
    LoginView,
    logout_view,
    UserProfileView,
    ChangePasswordView,
    UserListView,
    UserAdminDetailView,
    AuditLogListView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    NotificationListView,
    trigger_cleanup_view,
    PendingApprovalsListView,
    approve_user_view,
    delete_profile_picture_view,
    VerifyEmailView,
    MarkAllNotificationsReadView,
    ResendVerificationView,
)
from .google_auth import google_login


app_name = 'accounts'

urlpatterns = [
    # Authentication
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', logout_view, name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Google OAuth
    path('google-login/', google_login, name='google_login'),
    
    # User Profile
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('profile/picture/', delete_profile_picture_view, name='delete_profile_picture'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    
    # User Management (Admin)
    path('users/', UserListView.as_view(), name='user_list'),
    path('users/<uuid:pk>/', UserAdminDetailView.as_view(), name='user_detail'),
    path('admin/pending-approvals/', PendingApprovalsListView.as_view(), name='pending_approvals'),
    path('admin/approve-user/<uuid:pk>/', approve_user_view, name='approve_user'),
        
    # Audit Logs
    path('audit-logs/', AuditLogListView.as_view(), name='audit_logs'),

    # Email Verification
    path('verify-email/', VerifyEmailView.as_view(), name='verify_email'),

    # Password Reset
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('resend-verification/', ResendVerificationView.as_view(), name='resend_verification'),
    
    # Notifications
    path('notifications/', NotificationListView.as_view(), name='notifications'),
    path('notifications/mark-all-read/', MarkAllNotificationsReadView.as_view(), name='notifications_mark_all_read'),
    
    # Admin Tasks
    path('admin/cleanup-inactivity/', trigger_cleanup_view, name='cleanup_inactivity'),
]
