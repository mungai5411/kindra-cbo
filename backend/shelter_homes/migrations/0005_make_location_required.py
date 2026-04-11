# Migration to populate NULL latitude/longitude and make them required

from django.db import migrations, models

def populate_null_coordinates(apps, schema_editor):
    """Populate NULL latitude/longitude with Kenya center coordinates"""
    ShelterHome = apps.get_model('shelter_homes', 'ShelterHome')
    # Nairobi, Kenya center point
    default_latitude = -1.286389
    default_longitude = 36.817223
    
    # Update all shelters with NULL coordinates
    ShelterHome.objects.filter(latitude__isnull=True).update(latitude=default_latitude)
    ShelterHome.objects.filter(longitude__isnull=True).update(longitude=default_longitude)

class Migration(migrations.Migration):

    dependencies = [
        ('shelter_homes', '0004_shelterhome_latitude_shelterhome_longitude'),
    ]

    operations = [
        # First, populate NULL values with defaults
        migrations.RunPython(populate_null_coordinates),
        
        # Then make the fields NOT NULL
        migrations.AlterField(
            model_name='shelterhome',
            name='latitude',
            field=models.DecimalField(decimal_places=6, help_text='Exact latitude coordinate (required for map pinning)', max_digits=9, null=False),
        ),
        migrations.AlterField(
            model_name='shelterhome',
            name='longitude',
            field=models.DecimalField(decimal_places=6, help_text='Exact longitude coordinate (required for map pinning)', max_digits=9, null=False),
        ),
    ]
