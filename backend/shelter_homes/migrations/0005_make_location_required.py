# No-op migration placeholder
# Coordinates (latitude/longitude) are already in the schema via 0004
# They remain nullable - users provide dynamic coordinates via LocationPicker UI

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('shelter_homes', '0004_shelterhome_latitude_shelterhome_longitude'),
    ]

    operations = [
        # No operations - coordinates already exist and are user-provided
        # This migration is a placeholder for future coordinate validation at API level
    ]
