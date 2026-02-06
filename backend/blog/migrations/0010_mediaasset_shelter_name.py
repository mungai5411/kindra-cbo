# Generated manually for shelter_name field addition
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0009_alter_teammember_bio'),
    ]

    operations = [
        migrations.AddField(
            model_name='mediaasset',
            name='shelter_name',
            field=models.CharField(blank=True, help_text='Community center or shelter name displayed on the photo', max_length=200),
        ),
    ]
