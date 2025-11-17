# Data Model: Admin Dashboard

**Feature**: 006-admin-dashboard | **Date**: 2025-01-27

## Overview

Admin dashboard manages existing entities. No new models required. This document describes entity relationships, validation rules, and state transitions relevant to admin operations.

## Entities

### User

**Purpose**: User accounts with admin role capability

**Attributes**:
- `id` (UUID, Primary Key) - Unique identifier
- `email` (String, Unique, Not Null) - Email address, used for login
- `username` (String, Not Null) - Username
- `first_name` (String, Optional) - User's first name
- `last_name` (String, Optional) - User's last name
- `role` (String, Choices: 'user'/'admin', Default='user') - User role (read-only in admin dashboard)
- `is_active` (Boolean, Default=True) - Account status
- `date_joined` (DateTime, Auto) - Account creation timestamp

**Constraints**:
- Email must be unique
- Role can only be 'user' or 'admin'
- Role field read-only in admin dashboard (changes via Django admin only)
- Cannot delete self (admin user)

**Relationships**:
- One-to-one with UserProfile
- One-to-many with Order
- One-to-many with ShippingAddress
- One-to-many with Article (as author)

**State Transitions**:
- Create: New user created with role='user' (admin can create, but role assignment via Django admin)
- Update: Email, name, is_active can be updated (role read-only)
- Delete: User can be deleted (except self)

### UserProfile

**Purpose**: Extended user information and preferences

**Attributes**:
- `user` (UUID, Foreign Key to User, Primary Key) - One-to-one with User
- `experience_level` (String, Choices: 'beginner'/'intermediate'/'advanced', Default='beginner')
- `preferred_tank_size` (Integer, Optional) - Tank size in gallons
- `newsletter_subscribed` (Boolean, Default=False)
- `marketing_emails` (Boolean, Default=False)

**Relationships**:
- One-to-one with User

### FishProduct

**Purpose**: Product catalog items

**Attributes**:
- `id` (UUID, Primary Key)
- `species_name` (String, Max 100, Not Null)
- `scientific_name` (String, Max 150, Optional)
- `description` (Text, Not Null)
- `price` (Decimal, Min 0, Not Null)
- `stock_quantity` (Integer, Min 0, Default=0)
- `is_available` (Boolean, Default=True)
- `difficulty_level` (String, Choices: 'beginner'/'intermediate'/'advanced')
- `min_tank_size_gallons` (Integer, Min 1, Not Null)
- `ph_range_min`, `ph_range_max` (Decimal, 0-14, Optional)
- `temperature_range_min`, `temperature_range_max` (Integer, Optional)
- `max_size_inches` (Decimal, Optional)
- `lifespan_years` (Integer, Optional)
- `diet_type` (String, Choices: 'herbivore'/'carnivore'/'omnivore', Optional)
- `compatibility_notes` (Text, Optional)
- `care_instructions` (Text, Not Null)
- `image_url` (URL, Optional)
- `additional_images` (JSON, Default=[])
- `seo_title` (String, Max 60, Optional)
- `seo_description` (String, Max 160, Optional)
- `created_at` (DateTime, Auto)
- `updated_at` (DateTime, Auto)

**Constraints**:
- Price must be >= 0
- Stock quantity must be >= 0
- Min tank size must be >= 1
- PH range must be 0-14
- Categories must exist before assignment

**Relationships**:
- Many-to-many with Category
- One-to-many with ProductImage
- One-to-many with OrderItem

**State Transitions**:
- Create: New product with default values
- Update: All fields editable except created_at
- Delete: Can delete if no orders reference it (or cascade)

### Category

**Purpose**: Product organization structure

**Attributes**:
- `id` (UUID, Primary Key)
- `name` (String, Max 50, Unique, Not Null)
- `slug` (String, Max 50, Unique, Auto-generated)
- `description` (Text, Optional)
- `image_url` (URL, Optional)
- `parent_category` (UUID, Foreign Key to Category, Optional) - Self-referential
- `display_order` (Integer, Default=0)
- `is_active` (Boolean, Default=True)
- `created_at` (DateTime, Auto)

**Constraints**:
- Name must be unique
- Slug auto-generated from name, must be unique
- Parent category cannot create circular references
- Cannot delete category with products assigned (or must handle cascade)

**Relationships**:
- Self-referential (parent_category → subcategories)
- Many-to-many with FishProduct
- One-to-many with CategoryImage

**State Transitions**:
- Create: New category, slug auto-generated
- Update: Name, description, parent, display_order, is_active editable
- Delete: Prevented if products assigned (or cascade with confirmation)

### Order

**Purpose**: Purchase transactions

**Attributes**:
- `id` (UUID, Primary Key)
- `order_number` (String, Max 20, Unique, Auto-generated)
- `user` (UUID, Foreign Key to User, Not Null)
- `status` (String, Choices: 'pending'/'confirmed'/'processing'/'shipped'/'delivered'/'cancelled', Default='pending')
- `total_amount` (Decimal, Not Null)
- `shipping_amount` (Decimal, Default=0)
- `tax_amount` (Decimal, Default=0)
- `discount_amount` (Decimal, Default=0)
- `payment_status` (String, Choices: 'pending'/'paid'/'failed'/'refunded', Default='pending')
- `payment_method` (String, Max 50, Optional)
- `shipping_address` (UUID, Foreign Key to ShippingAddress, Not Null)
- `billing_address` (UUID, Foreign Key to ShippingAddress, Optional)
- `order_notes` (Text, Optional)
- `tracking_number` (String, Max 50, Optional)
- `estimated_delivery` (Date, Optional)
- `created_at` (DateTime, Auto)
- `updated_at` (DateTime, Auto)

**Constraints**:
- Order number auto-generated, unique
- Status transitions must be valid (e.g., cannot go from 'delivered' to 'pending')
- Payment status should align with order status (e.g., 'shipped' typically requires 'paid')
- User must exist

**Relationships**:
- Many-to-one with User
- One-to-many with OrderItem
- Many-to-one with ShippingAddress (shipping_address, billing_address)

**State Transitions**:
- Create: Order created with status='pending', payment_status='pending'
- Update Status: Can update status following valid transitions
- Update Payment: Can update payment_status
- Update Tracking: Can add/update tracking_number and estimated_delivery
- Delete: Typically not allowed (historical record), or soft delete

### OrderItem

**Purpose**: Individual items within orders

**Attributes**:
- `id` (UUID, Primary Key)
- `order` (UUID, Foreign Key to Order, Not Null)
- `product` (UUID, Foreign Key to FishProduct, Not Null)
- `quantity` (Integer, Min 1, Not Null)
- `unit_price` (Decimal, Not Null) - Snapshot at time of order
- `total_price` (Decimal, Not Null) - quantity * unit_price
- `product_snapshot` (JSON, Not Null) - Product data at time of order

**Constraints**:
- Quantity must be >= 1
- Unit price and total price are snapshots (read-only after creation)
- Product snapshot preserves historical data

**Relationships**:
- Many-to-one with Order
- Many-to-one with FishProduct

**State Transitions**:
- Create: Created when order is placed, prices snapshotted
- Update: Typically read-only (historical record)
- Delete: Typically not allowed (historical record)

### Article

**Purpose**: Blog content

**Attributes**:
- `id` (UUID, Primary Key)
- `title` (String, Max 200, Not Null)
- `slug` (String, Max 200, Unique, Auto-generated)
- `content` (Text, Not Null)
- `excerpt` (Text, Optional)
- `featured_image_url` (URL, Optional)
- `featured_image_alt_text` (String, Max 200, Optional)
- `category` (UUID, Foreign Key to ArticleCategory, Not Null)
- `author` (UUID, Foreign Key to User, Not Null)
- `status` (String, Choices: 'draft'/'published', Default='draft')
- `meta_title` (String, Max 60, Optional)
- `meta_description` (String, Max 160, Optional)
- `created_at` (DateTime, Auto)
- `updated_at` (DateTime, Auto)
- `published_at` (DateTime, Optional) - Auto-set when status changes to 'published'

**Constraints**:
- Title required
- Slug auto-generated from title, must be unique
- Category must exist
- Author must exist
- Published_at set automatically when status='published'

**Relationships**:
- Many-to-one with ArticleCategory
- Many-to-one with User (as author)
- One-to-many with ArticleImage

**State Transitions**:
- Create: New article with status='draft', author auto-set to current user
- Publish: Status='draft' → 'published', published_at set to current time
- Unpublish: Status='published' → 'draft', published_at cleared
- Update: All fields editable except created_at
- Delete: Can delete article

### ArticleCategory

**Purpose**: Organization structure for articles

**Attributes**:
- `id` (UUID, Primary Key)
- `name` (String, Max 100, Unique, Not Null)
- `slug` (String, Max 100, Unique, Auto-generated)
- `description` (Text, Optional)
- `created_at` (DateTime, Auto)

**Constraints**:
- Name must be unique
- Slug auto-generated from name, must be unique

**Relationships**:
- One-to-many with Article

**State Transitions**:
- Create: New category, slug auto-generated
- Update: Name, description, slug editable
- Delete: Prevented if articles assigned (or cascade)

### ShippingAddress

**Purpose**: Customer addresses

**Attributes**:
- `id` (UUID, Primary Key)
- `user` (UUID, Foreign Key to User, Not Null)
- `address_type` (String, Choices: 'shipping'/'billing', Not Null)
- `first_name` (String, Max 30, Not Null)
- `last_name` (String, Max 30, Not Null)
- `company` (String, Max 50, Optional)
- `address_line_1` (String, Max 100, Not Null)
- `address_line_2` (String, Max 100, Optional)
- `city` (String, Max 50, Not Null)
- `state` (String, Max 50, Not Null)
- `postal_code` (String, Max 10, Not Null)
- `country` (String, Max 2, Default='US')
- `phone` (String, Max 15, Optional)
- `is_default` (Boolean, Default=False)
- `created_at` (DateTime, Auto)

**Constraints**:
- User must exist
- Unique constraint: (user, address_type, is_default) where is_default=True

**Relationships**:
- Many-to-one with User
- One-to-many with Order (as shipping_address, billing_address)

### ProductImage

**Purpose**: Image files associated with products

**Attributes**:
- `id` (UUID, Primary Key)
- `product` (UUID, Foreign Key to FishProduct, Not Null)
- `image` (ImageField, Upload to 'products/%Y/%m/%d/')
- `is_primary` (Boolean, Default=False)
- `display_order` (Integer, Default=0)
- `alt_text` (String, Max 200, Optional)
- `caption` (String, Max 255, Optional)
- `created_at` (DateTime, Auto)
- `updated_at` (DateTime, Auto)

**Constraints**:
- Only one primary image per product (unique constraint)
- Product must exist
- Image file validation (format, size)

**Relationships**:
- Many-to-one with FishProduct

**State Transitions**:
- Create: New image, if is_primary=True, unset other primary images
- Update Primary: Setting is_primary=True unsets other primary images
- Delete: Can delete image

### CategoryImage

**Purpose**: Image files associated with categories

**Attributes**:
- `id` (UUID, Primary Key)
- `category` (UUID, Foreign Key to Category, Not Null)
- `image` (ImageField, Upload to 'categories/%Y/%m/%d/')
- `alt_text` (String, Max 200, Optional)
- `created_at` (DateTime, Auto)
- `updated_at` (DateTime, Auto)

**Relationships**:
- Many-to-one with Category

### ArticleImage

**Purpose**: Image files associated with articles

**Attributes**:
- `id` (UUID, Primary Key)
- `article` (UUID, Foreign Key to Article, Not Null)
- `image` (ImageField, Upload to 'articles/%Y/%m/%d/')
- `alt_text` (String, Max 200, Optional)
- `created_at` (DateTime, Auto)
- `updated_at` (DateTime, Auto)

**Relationships**:
- Many-to-one with Article

## Admin-Specific Constraints

### Role Management
- User role field is read-only in admin dashboard
- Role changes must be done via Django admin
- API rejects role modification attempts with 403 Forbidden

### Conflict Detection
- All entities with `updated_at` field support conflict detection
- Frontend stores `updated_at` when entity loaded
- Backend compares stored timestamp with current database value on save
- If mismatch, return conflict warning but allow save (last-write-wins)

### Bulk Operations
- Supported for all entity types
- Bulk create: Array of entity data
- Bulk update: Array of (id, fields) pairs
- Bulk delete: Array of IDs
- Bulk status change: Array of (id, new_status) pairs
- Confirmation required for bulk operations affecting 5+ items

### Data Integrity
- Cannot delete category with products (or cascade with confirmation)
- Cannot delete article category with articles (or cascade)
- Cannot delete product with order items (or prevent deletion)
- Cannot delete user with orders (or prevent deletion)
- Cannot delete self (admin user)

