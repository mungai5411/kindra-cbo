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
from accounts.serializers import UserSerializer
from django.conf import settings

sys.stdout.reconfigure(line_buffering=True)

print(f"CLOUDINARY_CLOUD_NAME in env: {'CLOUDINARY_CLOUD_NAME' in os.environ}")

users = User.objects.exclude(profile_picture='').exclude(profile_picture__isnull=True)
for user in users:
    serializer = UserSerializer(user)
    print(f"URL for {user.email}: {serializer.data.get('profile_picture')}")
