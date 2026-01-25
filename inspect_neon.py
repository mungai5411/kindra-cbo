import os
import django
import sys
from pathlib import Path
from dotenv import load_dotenv

# Define paths
BASE_DIR = Path(__file__).resolve().parent
BACKEND_DIR = BASE_DIR / 'backend'
ENV_FILE = BACKEND_DIR / '.env'

sys.path.append(str(BACKEND_DIR))
load_dotenv(ENV_FILE)

# Set database URL
os.environ['DATABASE_URL'] = "postgresql://neondb_owner:npg_5kef3MpyEBdl@ep-royal-dew-ah6fklls-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kindra_cbo.settings')
django.setup()

from accounts.models import User
from django.conf import settings

sys.stdout.reconfigure(line_buffering=True)

print(f"DB Host: {settings.DATABASES['default'].get('HOST')}")
print(f"Media URL: {settings.MEDIA_URL}")
print("-" * 40)

users = User.objects.exclude(profile_picture='').exclude(profile_picture__isnull=True)
print(f"Found {users.count()} users with pics.")

for user in users:
    print(f"User: {user.email}")
    print(f"  Field Value: '{user.profile_picture.name}'")
    # Check if this matches the log error file
    if "6832921267953829a305a363c73b1781" in user.profile_picture.name:
        print("  [MATCH] This looks like the file from the logs!")
    else:
        print("  [NO MATCH] This is a different file.")
    print("-" * 40)
