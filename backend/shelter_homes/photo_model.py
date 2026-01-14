"""
Shelter Home Coordination Models
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator
from accounts.models import User
from case_management.models import Child
import uuid


class ShelterPhoto(models.Model):
    """
    Photos of shelter facilities
    """
    
    class PhotoType(models.TextChoices):
        EXTERIOR = 'EXTERIOR', _('Exterior View')
        DORMITORY = 'DORMITORY', _('Dormitory/Sleeping Area')
        FACILITIES = 'FACILITIES', _('Common Facilities')
        PLAYGROUND = 'PLAYGROUND', _('Play/Recreation Area')
        DINING = 'DINING', _('Dining Area')
        OTHER = 'OTHER', _('Other')
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shelter_home = models.ForeignKey('ShelterHome', on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='shelter_photos/%Y/%m/')
    caption = models.CharField(max_length=200, blank=True)
    photo_type = models.CharField(max_length=20, choices=PhotoType.choices, default=PhotoType.OTHER)
    is_primary = models.BooleanField(default=False, help_text=_('Primary display photo'))
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('shelter photo')
        verbose_name_plural = _('shelter photos')
        ordering = ['-is_primary', 'uploaded_at']
    
    def __str__(self):
        return f"{self.shelter_home.name} - {self.get_photo_type_display()}"
