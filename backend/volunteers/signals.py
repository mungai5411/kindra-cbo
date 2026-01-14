from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from accounts.models import User
from .models import Volunteer

@receiver(post_save, sender=User)
def create_or_update_volunteer_profile(sender, instance, created, **kwargs):
    """
    Automatically create a Volunteer profile when a user with role=VOLUNTEER is created or updated.
    """
    if instance.role == User.Role.VOLUNTEER:
        # Create profile if it doesn't exist
        if not hasattr(instance, 'volunteer_profile'):
            Volunteer.objects.create(
                user=instance,
                full_name=instance.get_full_name(),
                email=instance.email,
                phone_number=instance.phone_number or '',
                join_date=timezone.now().date(),
                status=Volunteer.Status.ACTIVE
            )
        else:
            # Sync full_name and email if they changed
            profile = instance.volunteer_profile
            updated = False
            if profile.full_name != instance.get_full_name():
                profile.full_name = instance.get_full_name()
                updated = True
            if profile.email != instance.email:
                profile.email = instance.email
                updated = True
            if updated:
                profile.save()
