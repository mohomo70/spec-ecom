"""
Image validation functions for file uploads.
"""

from django.core.exceptions import ValidationError
from PIL import Image
import os


def validate_image_format(value):
    """Validate image file format (JPEG, PNG, WebP only)."""
    ext = os.path.splitext(value.name)[1].lower()
    valid_extensions = ['.jpg', '.jpeg', '.png', '.webp']
    
    if ext not in valid_extensions:
        raise ValidationError(
            f'Unsupported file format. Only JPEG, PNG, and WebP formats are supported.'
        )
    
    return value


def validate_image_size(value):
    """Validate image file size (maximum 5MB)."""
    max_size = 5 * 1024 * 1024  # 5MB in bytes
    
    if value.size > max_size:
        raise ValidationError(
            f'File size exceeds 5MB limit. File size: {value.size / (1024 * 1024):.2f}MB'
        )
    
    return value


def validate_image_dimensions(value):
    """Validate image dimensions (maximum 4000x4000 pixels)."""
    try:
        img = Image.open(value)
        width, height = img.size
        max_dimension = 4000
        
        if width > max_dimension or height > max_dimension:
            raise ValidationError(
                f'Image dimensions exceed maximum limit (4000x4000 pixels). '
                f'Current dimensions: {width}x{height}'
            )
    except Exception as e:
        if isinstance(e, ValidationError):
            raise
        raise ValidationError('Invalid image file. Could not read image dimensions.')
    
    return value


def validate_image_integrity(value):
    """Validate image file integrity using Pillow."""
    try:
        img = Image.open(value)
        # Verify image integrity - this will raise an exception if corrupted
        img.verify()
        # Reset file pointer after verify (verify() may close the file)
        value.seek(0)
    except (IOError, OSError) as e:
        raise ValidationError('Invalid or corrupted image file. File integrity check failed.')
    except Exception as e:
        # Catch any other Pillow-related errors
        if isinstance(e, ValidationError):
            raise
        raise ValidationError('Invalid or corrupted image file. File integrity check failed.')
    
    return value


def validate_image_file(value):
    """Comprehensive image validation combining all checks."""
    validate_image_format(value)
    validate_image_size(value)
    validate_image_dimensions(value)
    validate_image_integrity(value)
    return value

