import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db.models import Q
from accounts.models import User, Notification

class Command(BaseCommand):
    help = 'Cleans up inactive user profiles after 6 months and sends monthly follow-up notifications.'

    def handle(self, *args, **options):
        now = timezone.now()
        self.stdout.write(f"Starting inactivity cleanup at {now}")
        
        # 1. Monthly Follow-up Notifications (1-5 months inactive)
        # We track month 1, 2, 3, 4, 5
        for month in range(1, 6):
            # Users who haven't logged in for 'month' months
            # Buffer of 1 day to avoid daily spam if they fall exactly in the range
            days_inactive = month * 30
            # Target users who hit exactly this milestone (within a 1 day window)
            target_date_start = now - datetime.timedelta(days=days_inactive + 1)
            target_date_end = now - datetime.timedelta(days=days_inactive)
            
            inactive_users = User.objects.filter(
                last_login__gte=target_date_start,
                last_login__lt=target_date_end,
                is_active=True
            ).exclude(role=User.Role.ADMIN)
            
            for user in inactive_users:
                self.send_inactivity_notification(user, month)
                self.stdout.write(f"Notification sent to {user.email} for {month} month(s) inactivity")
        
        # 2. Deletion after 6 months (180 days) of inactivity
        six_months_ago = now - datetime.timedelta(days=180)
        # Also include users who NEVER logged in and were created > 6 months ago
        users_to_delete = User.objects.filter(
            Q(last_login__lt=six_months_ago) | Q(last_login__isnull=True, created_at__lt=six_months_ago),
            is_active=True
        ).exclude(role=User.Role.ADMIN)
        
        count = users_to_delete.count()
        for user in users_to_delete:
            email = user.email
            user.delete()
            self.stdout.write(self.style.WARNING(f"Deleted user profile (6 months inactivity): {email}"))
        
        self.stdout.write(self.style.SUCCESS(f"Task completed. {count} users deleted."))

    def send_inactivity_notification(self, user, months):
        titles = {
            1: "We miss you at Kindra!",
            2: "Checking in on your activity",
            3: "Still there? Kindra updates waiting",
            4: "Your profile is scheduled for archival",
            5: "FINAL WARNING: Profile Deletion Imminent"
        }
        
        messages = {
            1: "It's been a month since your last login. Come back and see what's new in the community!",
            2: "We noticed you haven't been active for 2 months. Stay connected with Kindra CBO!",
            3: "Three months of inactivity. Your account is still safe, but we'd love to have you back.",
            4: "Four months inactive. Please note that accounts inactive for 6 months are automatically archived/deleted for data privacy and security.",
            5: "CRITICAL: Your account has been inactive for 5 months. It will be PERMANENTLY DELETED in 30 days including all profile data if you do not login now."
        }
        
        Notification.objects.create(
            recipient=user,
            title=titles.get(months, "Account Activity Notice"),
            message=messages.get(months, "Please check in to keep your account active."),
            type=Notification.Type.WARNING if months >= 4 else Notification.Type.INFO,
            category=Notification.Category.SYSTEM
        )
