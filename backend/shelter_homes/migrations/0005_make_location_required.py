# Migration to add latitude and longitude fields (nullable for transition)
# Coordinates will be user-provided through the LocationPicker UI
# API validation ensures coordinates are provided for new shelters

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shelter_homes', '0004_shelterhome_latitude_shelterhome_longitude'),
    ]

    operations = [
        # Keep fields nullable during transition - users choose their own coordinates
        migrations.AlterField(
            model_name='shelterhome',
            name='latitude',
            field=models.DecimalField(
                decimal_places=6, 
                help_text='Exact latitude coordinate (required for map pinning)', 
                max_digits=9,
                null=True,
                blank=True
            ),
        ),
        migrations.AlterField(
            model_name='shelterhome',
            name='longitude',
            field=models.DecimalField(
                decimal_places=6, 
                help_text='Exact longitude coordinate (required for map pinning)', 
                max_digits=9,
                null=True,
                blank=True
            ),
        ),
    ]
