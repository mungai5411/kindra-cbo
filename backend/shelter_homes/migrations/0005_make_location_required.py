# Generated migration for making latitude and longitude required

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shelter_homes', '0004_shelterhome_latitude_shelterhome_longitude'),
    ]

    operations = [
        migrations.AlterField(
            model_name='shelterhome',
            name='latitude',
            field=models.DecimalField(decimal_places=6, help_text='Exact latitude coordinate (required for map pinning)', max_digits=9),
        ),
        migrations.AlterField(
            model_name='shelterhome',
            name='longitude',
            field=models.DecimalField(decimal_places=6, help_text='Exact longitude coordinate (required for map pinning)', max_digits=9),
        ),
    ]
