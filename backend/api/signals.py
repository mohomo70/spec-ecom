"""
Django signals for image file management.
"""

from django.db.models.signals import pre_delete
from django.dispatch import receiver
import os


@receiver(pre_delete)
def delete_image_file(sender, instance, **kwargs):
    """Delete image file from storage when model instance is deleted."""
    if hasattr(instance, 'image') and instance.image:
        if instance.image.name:
            try:
                if os.path.isfile(instance.image.path):
                    os.remove(instance.image.path)
            except (ValueError, OSError):
                pass

