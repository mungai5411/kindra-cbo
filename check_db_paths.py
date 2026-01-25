import os
import django
import sys
from pathlib import Path
from dotenv import load_dotenv

# Define paths
BASE_DIR = Path(__file__).resolve().parent
BACKEND_DIR = BASE_DIR / 'backend'
ENV_FILE = BACKEND_DIR / '.env'

# Add backend to path
sys.path.append(str(BACKEND_DIR))

# Load environment variables
if ENV_FILE.exists():
    print(f"Loading .env from {ENV_FILE}")
    load_dotenv(ENV_FILE)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kindra_cbo.settings')
django.setup()

from accounts.models import User
from django.conf import settings
from django.db import connection

# Force stdout flush
sys.stdout.reconfigure(line_buffering=True)

print(f"\n--- DEBUG START ---")
print(f"DB Engine: {settings.DATABASES['default']['ENGINE']}")
print(f"DB Name: {settings.DATABASES['default']['NAME']}")
print(f"Cloudinary Cloud Name Env Var Present: {'CLOUDINARY_CLOUD_NAME' in os.environ}")

try:
    users = User.objects.exclude(profile_picture='').exclude(profile_picture__isnull=True)
    count = users.count()
    print(f"Found {count} users with profile pictures.")

    for user in users:
        print(f"\nUser: {user.email}")
        print(f"  Field .name: '{user.profile_picture.name}'")
        try:
            print(f"  Field .url:  '{user.profile_picture.url}'")
        except Exception as e:
            print(f"  Error getting .url: {e}")
        
        if user.profile_picture.name.startswith('media/'):
            print("  [!] DETECTED WRONG PREFIX 'media/' in database field!")
        elif user.profile_picture.name.startswith('/media/'):
            print("  [!] DETECTED WRONG PREFIX '/media/' in database field!")
except Exception as e:
    print(f"Error querying users: {e}")

print(f"\n--- DEBUG END ---")
