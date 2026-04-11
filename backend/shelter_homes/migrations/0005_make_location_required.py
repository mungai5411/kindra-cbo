# Migration to populate NULL latitude/longitude and make them required

from django.db import migrations, models, connection

def populate_null_coordinates(apps, schema_editor):
    """Populate NULL latitude/longitude with Kenya center coordinates"""
    # Use raw SQL to avoid trigger issues
    with connection.cursor() as cursor:
        # Populate latitude
        cursor.execute("""
            UPDATE shelter_homes_shelterhome 
            SET latitude = -1.286389 
            WHERE latitude IS NULL;
        """)
        
        # Populate longitude
        cursor.execute("""
            UPDATE shelter_homes_shelterhome 
            SET longitude = 36.817223 
            WHERE longitude IS NULL;
        """)

class Migration(migrations.Migration):

    dependencies = [
        ('shelter_homes', '0004_shelterhome_latitude_shelterhome_longitude'),
    ]

    operations = [
        # First, populate NULL values with defaults using raw SQL
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
