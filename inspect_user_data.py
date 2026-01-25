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

# Set the provided DATABASE_URL logic again to ensure connection
os.environ['DATABASE_URL'] = "postgresql://neondb_owner:npg_5kef3MpyEBdl@ep-royal-dew-ah6fklls-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kindra_cbo.settings')
django.setup()

from accounts.models import User
from accounts.serializers import UserSerializer
from django.conf import settings

# Force stdout flush
sys.stdout.reconfigure(line_buffering=True)

print(f"\n--- CONFIGURATION CHECK ---")
print(f"MEDIA_URL: {settings.MEDIA_URL}")
print(f"CLOUDINARY_CLOUD_NAME present: {'CLOUDINARY_CLOUD_NAME' in os.environ}")

print(f"\n--- DATA INSPECTION ---")
users = User.objects.exclude(profile_picture='').exclude(profile_picture__isnull=True)

for user in users:
    print(f"User: {user.email}")
    print(f"  Raw DB Field: '{user.profile_picture.name}'")
    try:
        print(f"  Model URL property: '{user.profile_picture.url}'")
    except Exception as e:
        print(f"  Model URL error: {e}")
        
    # Test Serializer
    serializer = UserSerializer(user)
    print(f"  Serialized profile_picture: '{serializer.data.get('profile_picture')}'")
    print("-" * 30)

print("\nDone.")
