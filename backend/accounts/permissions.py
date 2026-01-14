from rest_framework.permissions import BasePermission


class IsAdminOrManagement(BasePermission):
    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        return bool(
            user
            and user.is_authenticated
            and (user.is_superuser or getattr(user, 'role', None) in {'ADMIN', 'MANAGEMENT'})
        )


class IsAdminManagementOrSocialMedia(BasePermission):
    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        return bool(
            user
            and user.is_authenticated
            and (
                user.is_superuser
                or getattr(user, 'role', None) in {'ADMIN', 'MANAGEMENT', 'SOCIAL_MEDIA'}
            )
        )
