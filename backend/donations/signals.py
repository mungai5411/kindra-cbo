from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from accounts.models import User
from .models import Donor

@receiver(post_save, sender=User)
def create_or_update_donor_profile(sender, instance, created, **kwargs):
    """
    Automatically sync Donor profile when a user with role=DONOR is updated.
    Note: Donor profiles are often created during the donation process, 
    but we want to ensure they stay in sync with the User model if linked.
    """
    if instance.role == User.Role.DONOR:
        # If the user has a donor profile, sync it
        if hasattr(instance, 'donor_profile'):
            profile = instance.donor_profile
            updated = False
            
            fullname = instance.get_full_name() or instance.username
            if profile.full_name != fullname:
                profile.full_name = fullname
                updated = True
                
            if profile.email != instance.email:
                profile.email = instance.email
                updated = True
                
            if updated:
                profile.save()
        # Note: We don't auto-create Donor profile here because Donor profiles 
        # might need additional info like organization details usually provided during donation.
