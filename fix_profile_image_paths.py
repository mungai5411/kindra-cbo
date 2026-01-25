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

# Set the provided DATABASE_URL
os.environ['DATABASE_URL'] = "postgresql://neondb_owner:npg_5kef3MpyEBdl@ep-royal-dew-ah6fklls-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
print("Using provided NeonDB DATABASE_URL.")

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kindra_cbo.settings')
django.setup()

from accounts.models import User
from django.conf import settings

# Force stdout flush
sys.stdout.reconfigure(line_buffering=True)

print(f"DB Engine: {settings.DATABASES['default']['ENGINE']}")
print(f"DB Name: {settings.DATABASES['default']['NAME']}")

print("Starting profile picture path fix on NeonDB...")

try:
    users = User.objects.exclude(profile_picture='').exclude(profile_picture__isnull=True)
    found_count = users.count()
    print(f"Found {found_count} users with profile pictures.")

    fixed_count = 0
    for user in users:
        original_name = user.profile_picture.name
        if not original_name:
            continue
            
        new_name = original_name
        
        # Check for 'media/' prefix
        if new_name.startswith('media/'):
            new_name = new_name[6:] # Remove 'media/'
        elif new_name.startswith('/media/'):
            new_name = new_name[7:] # Remove '/media/'
            
        if new_name != original_name:
            print(f"Fixing user {user.email}: '{original_name}' -> '{new_name}'")
            user.profile_picture.name = new_name
            user.save(update_fields=['profile_picture'])
            fixed_count += 1
        else:
             # print(f"Skipping OK user {user.email}: '{original_name}'")
             pass
    
    print(f"Done. Fixed {fixed_count} profile picture paths.")

except Exception as e:
    print(f"Error accessing database: {e}")
