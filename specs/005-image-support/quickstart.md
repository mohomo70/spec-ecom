# Quickstart Guide: Image Support

**Feature**: Image Support for Backend and Database  
**Date**: 2025-01-27

## Overview

This guide covers setting up image upload functionality with CDN-ready architecture. The implementation uses Django's storage backend abstraction, allowing migration to CDN through configuration changes only.

## Prerequisites

- Django 4.2.7+
- PostgreSQL database
- Pillow 10.1.0+ (already in requirements.txt)
- Existing Product, Category, Article models

## Initial Setup (Local Storage)

### 1. Install Dependencies

Dependencies are already in `requirements.txt`:
- `Pillow==10.1.0` - Image processing and validation

No additional packages required for local storage.

### 2. Configure Storage Settings

**File**: `backend/config/settings.py`

```python
# Media files configuration (already exists)
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Storage backend (defaults to FileSystemStorage)
# No explicit configuration needed for local storage
DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'
```

### 3. Create Image Models

Run migration to create ProductImage, CategoryImage, ArticleImage models:

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

### 4. Configure URL Routing

**File**: `backend/config/urls.py`

Media file serving is already configured for development:

```python
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

For production, configure Nginx to serve media files directly (see Production section).

### 5. Create Media Directories

Django will create directories automatically, but you can pre-create:

```bash
mkdir -p backend/media/products
mkdir -p backend/media/categories
mkdir -p backend/media/articles
```

## CDN Migration (Future)

### Step 1: Install CDN Storage Package

For AWS S3:
```bash
pip install django-storages boto3
```

For Cloudinary:
```bash
pip install django-storages cloudinary
```

For Google Cloud:
```bash
pip install django-storages google-cloud-storage
```

Add to `requirements.txt`:
```
django-storages==1.14.2
boto3==1.34.0  # For AWS S3
```

### Step 2: Update Settings

**File**: `backend/config/settings.py`

```python
# Add to INSTALLED_APPS
INSTALLED_APPS = [
    # ... existing apps
    'storages',  # Add this
]

# Storage configuration
USE_CDN = config('USE_CDN', default=False, cast=bool)

if USE_CDN:
    # CDN Configuration (AWS S3 example)
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    AWS_STORAGE_BUCKET_NAME = config('AWS_STORAGE_BUCKET_NAME')
    AWS_S3_REGION_NAME = config('AWS_S3_REGION_NAME', default='us-east-1')
    AWS_S3_CUSTOM_DOMAIN = config('AWS_S3_CUSTOM_DOMAIN')  # CloudFront domain
    AWS_ACCESS_KEY_ID = config('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = config('AWS_SECRET_ACCESS_KEY')
    AWS_S3_OBJECT_PARAMETERS = {
        'CacheControl': 'max-age=86400',  # 1 day cache
    }
    AWS_DEFAULT_ACL = 'public-read'
    MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/media/'
else:
    # Local storage (current)
    DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'
    MEDIA_ROOT = BASE_DIR / 'media'
    MEDIA_URL = 'media/'
```

### Step 3: Environment Variables

**File**: `.env` (local)
```bash
USE_CDN=False
```

**File**: `.env.production` (CDN)
```bash
USE_CDN=True
AWS_STORAGE_BUCKET_NAME=your-bucket-name
AWS_S3_REGION_NAME=us-east-1
AWS_S3_CUSTOM_DOMAIN=cdn.example.com
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

### Step 4: Migrate Existing Files (Optional)

Create management command to upload existing files to CDN:

```python
# backend/api/management/commands/migrate_to_cdn.py
from django.core.management.base import BaseCommand
from api.models import ProductImage, CategoryImage, ArticleImage
from django.core.files.storage import default_storage
import os

class Command(BaseCommand):
    def handle(self, *args, **options):
        # Migrate ProductImages
        for img in ProductImage.objects.all():
            if img.image and not img.image.name.startswith('http'):
                with open(img.image.path, 'rb') as f:
                    default_storage.save(img.image.name, f)
                self.stdout.write(f'Migrated {img.image.name}')
        
        # Repeat for CategoryImage and ArticleImage
```

Run migration:
```bash
python manage.py migrate_to_cdn
```

### Step 5: Verify CDN URLs

After migration, image URLs should automatically use CDN domain:
- Local: `/media/products/2025/01/27/uuid.jpg`
- CDN: `https://cdn.example.com/media/products/2025/01/27/uuid.jpg`

No code changes needed - Django's `.url` property handles this automatically.

## Production Setup

### Nginx Configuration (Local Storage)

**File**: `/etc/nginx/sites-available/your-site`

```nginx
server {
    # ... existing configuration
    
    # Serve media files directly (bypasses Django)
    location /media/ {
        alias /path/to/backend/media/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### Nginx Configuration (CDN)

If using CDN, configure Nginx to proxy or redirect:

```nginx
# Option 1: Redirect to CDN
location /media/ {
    return 301 https://cdn.example.com$request_uri;
}

# Option 2: Proxy to CDN (if needed)
location /media/ {
    proxy_pass https://cdn.example.com;
}
```

## Testing

### Test Image Upload

```bash
# Upload product image
curl -X POST http://localhost:8000/api/v1/products/{product_id}/images/ \
  -H "Authorization: Bearer {token}" \
  -F "primary_image=@/path/to/image.jpg" \
  -F "is_primary=true"
```

### Test Image URL Generation

```python
# In Django shell
from api.models import ProductImage

img = ProductImage.objects.first()
print(img.image.url)  # Should return correct URL (local or CDN)
```

### Verify Storage Backend

```python
# In Django shell
from django.core.files.storage import default_storage
print(default_storage.__class__.__name__)
# Should print: FileSystemStorage (local) or S3Boto3Storage (CDN)
```

## Key Points for CDN Migration

1. **No Code Changes Required**: Models, views, serializers remain unchanged
2. **URL Generation**: Always use `.url` property, never hardcode paths
3. **Storage Abstraction**: Django handles differences between local and CDN
4. **Configuration Only**: Change `DEFAULT_FILE_STORAGE` in settings.py
5. **Environment Variables**: Use `USE_CDN` flag to toggle storage backend

## Troubleshooting

### Images Not Serving (Local)

- Check `MEDIA_ROOT` path exists and is writable
- Verify `MEDIA_URL` in settings matches URL pattern
- Check Nginx configuration (production)
- Ensure `DEBUG=True` includes static/media serving (development)

### CDN Migration Issues

- Verify AWS credentials are correct
- Check S3 bucket permissions (public-read for images)
- Verify CloudFront distribution is configured (if using)
- Check CORS settings if accessing from different domain

### File Not Found After CDN Migration

- Run migration script to upload existing files
- Verify file paths match between local and CDN
- Check S3 bucket structure matches local directory structure

## Next Steps

1. Implement image upload endpoints (see tasks.md)
2. Add image validation (format, size, dimensions)
3. Implement file deletion signals
4. Test with local storage
5. When ready, migrate to CDN using steps above

