import django
import os
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kindra_cbo.settings')
django.setup()

from donations.models import Campaign

def check_campaigns():
    try:
        count = Campaign.objects.count()
        active_count = Campaign.objects.filter(status='ACTIVE').count()
        print(f"Total campaigns: {count}")
        print(f"Active campaigns: {active_count}")
        
        if count > 0:
            for c in Campaign.objects.all()[:3]:
                print(f"- {c.title} ({c.status})")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_campaigns()
