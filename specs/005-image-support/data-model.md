# Data Model: Image Support

**Feature**: Image Support for Backend and Database  
**Date**: 2025-01-27

## Overview

Three separate Image models (ProductImage, CategoryImage, ArticleImage) with ForeignKey relationships to their parent entities. All use Django ImageField with storage backend abstraction for CDN-ready architecture.

## Entities

### ProductImage

**Purpose**: Represents image files associated with fish products. Supports one primary image and multiple additional gallery images per product.

**Table**: `product_images`

**Fields**:
- `id` (UUID, Primary Key): Unique identifier
- `product` (ForeignKey → FishProduct): Reference to parent product (CASCADE delete)
- `image` (ImageField): Image file stored via storage backend (local or CDN)
  - `upload_to='products/%Y/%m/%d/'`: Date-based directory structure
  - `max_length=255`: Path length limit
  - `blank=True, null=True`: Optional field
- `is_primary` (Boolean): Primary image flag (only one True per product)
  - `default=False`
- `display_order` (Integer): Order for gallery display
  - `default=0`
- `alt_text` (CharField, max_length=200): Accessibility and SEO alt text
  - `blank=True`
- `caption` (CharField, max_length=255, optional): Image caption
  - `blank=True`
- `created_at` (DateTimeField): Timestamp of creation
  - `auto_now_add=True`
- `updated_at` (DateTimeField): Timestamp of last update
  - `auto_now=True`

**Constraints**:
- Unique constraint: `(product, is_primary=True)` - only one primary image per product
- ForeignKey CASCADE: Image deleted when product deleted
- Database index on `(product, is_primary)` for query optimization
- Database index on `(product, display_order)` for gallery ordering

**Validation Rules**:
- File format: JPEG, PNG, WebP only
- File size: Maximum 5MB
- Dimensions: Maximum 4000x4000 pixels
- File integrity: Valid image file (verified via Pillow)
- Filename: UUID-based (auto-generated, sanitized by Django)

**Relationships**:
- Many-to-One: Multiple ProductImages → One FishProduct

**State Transitions**:
- When `is_primary=True` set on new image: Previous primary automatically set to `False`
- When product deleted: All associated ProductImages deleted (CASCADE)
- When image replaced: Old file deleted from storage before new file saved

### CategoryImage

**Purpose**: Represents image file associated with a product category.

**Table**: `category_images`

**Fields**:
- `id` (UUID, Primary Key): Unique identifier
- `category` (ForeignKey → Category): Reference to parent category (CASCADE delete)
- `image` (ImageField): Image file stored via storage backend
  - `upload_to='categories/%Y/%m/%d/'`: Date-based directory structure
  - `max_length=255`
  - `blank=True, null=True`
- `alt_text` (CharField, max_length=200): Accessibility and SEO alt text
  - `blank=True`
- `created_at` (DateTimeField): Timestamp of creation
  - `auto_now_add=True`
- `updated_at` (DateTimeField): Timestamp of last update
  - `auto_now=True`

**Constraints**:
- ForeignKey CASCADE: Image deleted when category deleted
- One image per category (enforced in application logic, not database constraint)
- Database index on `category` for query optimization

**Validation Rules**:
- Same as ProductImage (format, size, dimensions, integrity)

**Relationships**:
- Many-to-One: Multiple CategoryImages → One Category (typically one, but model allows multiple)

**State Transitions**:
- When category deleted: Associated CategoryImage deleted (CASCADE)
- When image replaced: Old file deleted from storage before new file saved

### ArticleImage

**Purpose**: Represents featured image file associated with a blog article.

**Table**: `article_images`

**Fields**:
- `id` (UUID, Primary Key): Unique identifier
- `article` (ForeignKey → Article): Reference to parent article (CASCADE delete)
- `image` (ImageField): Image file stored via storage backend
  - `upload_to='articles/%Y/%m/%d/'`: Date-based directory structure
  - `max_length=255`
  - `blank=True, null=True`
- `alt_text` (CharField, max_length=200): Accessibility and SEO alt text
  - `blank=True`
- `created_at` (DateTimeField): Timestamp of creation
  - `auto_now_add=True`
- `updated_at` (DateTimeField): Timestamp of last update
  - `auto_now=True`

**Constraints**:
- ForeignKey CASCADE: Image deleted when article deleted
- One image per article (enforced in application logic, not database constraint)
- Database index on `article` for query optimization

**Validation Rules**:
- Same as ProductImage (format, size, dimensions, integrity)

**Relationships**:
- Many-to-One: Multiple ArticleImages → One Article (typically one, but model allows multiple)

**State Transitions**:
- When article deleted: Associated ArticleImage deleted (CASCADE)
- When image replaced: Old file deleted from storage before new file saved

## Storage Backend Abstraction

**Current (Local)**:
- Storage: `django.core.files.storage.FileSystemStorage`
- Location: `MEDIA_ROOT/products/2025/01/27/uuid.jpg`
- URL: `/media/products/2025/01/27/uuid.jpg`

**Future (CDN)**:
- Storage: `storages.backends.s3boto3.S3Boto3Storage`
- Location: S3 bucket `products/2025/01/27/uuid.jpg`
- URL: `https://cdn.example.com/media/products/2025/01/27/uuid.jpg`

**Migration**: Change `DEFAULT_FILE_STORAGE` in settings.py - no code changes required.

## Database Schema

### Indexes

**ProductImage**:
- `idx_productimage_product_primary` on `(product_id, is_primary)` WHERE `is_primary=True`
- `idx_productimage_product_order` on `(product_id, display_order)`

**CategoryImage**:
- `idx_categoryimage_category` on `(category_id)`

**ArticleImage**:
- `idx_articleimage_article` on `(article_id)`

### Foreign Key Constraints

All ForeignKeys use `on_delete=models.CASCADE` to ensure:
- Image records deleted when parent entity deleted
- Image files deleted via signals before database record deletion
- Referential integrity maintained

## Data Validation Summary

**File Format**: JPEG, PNG, WebP (validated via extension and Pillow)
**File Size**: Maximum 5MB (validated before storage)
**Dimensions**: Maximum 4000x4000 pixels (validated via Pillow)
**Integrity**: Valid image file (verified via Pillow Image.verify())
**Filename**: UUID-based, sanitized by Django ImageField
**Primary Image**: Only one `is_primary=True` per product (enforced via unique constraint + application logic)

## Migration Strategy

**Step 1**: Create new Image models (ProductImage, CategoryImage, ArticleImage)
**Step 2**: Keep existing `image_url` fields in parent models (backward compatibility)
**Step 3**: Update APIs to use new Image models
**Step 4**: Optional: Migrate existing URLs to Image models (future task)
**Step 5**: Eventually deprecate `image_url` fields (future task)

