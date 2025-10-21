# Data Model: Freshwater Fish Ecommerce Platform

**Date**: 2025-10-21
**Purpose**: Define database schema and relationships for freshwater fish ecommerce platform

## Core Entities

### FishProduct
Represents individual fish species/varieties available for sale.

**Fields**:
- `id`: UUID, Primary Key
- `species_name`: String(100), required - Common name (e.g., "Guppy")
- `scientific_name`: String(150), optional - Scientific classification
- `description`: Text, required - Detailed description with care requirements
- `price`: Decimal(10,2), required - Sale price in USD
- `stock_quantity`: Integer, required, default=0 - Available inventory
- `is_available`: Boolean, default=True - Product availability status
- `difficulty_level`: Choice('beginner', 'intermediate', 'advanced'), required
- `min_tank_size_gallons`: Integer, required - Minimum tank size
- `ph_range_min`: Decimal(3,1), optional - Minimum pH level
- `ph_range_max`: Decimal(3,1), optional - Maximum pH level
- `temperature_range_min`: Integer, optional - Min temperature in Fahrenheit
- `temperature_range_max`: Integer, optional - Max temperature in Fahrenheit
- `max_size_inches`: Decimal(5,1), optional - Adult size
- `lifespan_years`: Integer, optional - Expected lifespan
- `diet_type`: Choice('herbivore', 'carnivore', 'omnivore'), optional
- `compatibility_notes`: Text, optional - Tank mate compatibility info
- `care_instructions`: Text, required - Detailed care guide
- `image_url`: URL, optional - Primary product image
- `additional_images`: JSON array of URLs, optional
- `seo_title`: String(60), optional - SEO-optimized title
- `seo_description`: String(160), optional - SEO meta description
- `created_at`: DateTime, auto
- `updated_at`: DateTime, auto

**Relationships**:
- Many-to-Many with Category (through ProductCategory)
- One-to-Many with ProductVariant (optional for size/color variations)

**Validation Rules**:
- Price must be > 0
- Stock quantity must be >= 0
- pH range min <= max if both provided
- Temperature range min <= max if both provided
- SEO fields auto-generated from species_name if not provided

### Category
Organizes fish products by type for browsing.

**Fields**:
- `id`: UUID, Primary Key
- `name`: String(50), required, unique - Category name (e.g., "Tetras")
- `slug`: String(50), required, unique - URL-friendly identifier
- `description`: Text, optional - Category description
- `image_url`: URL, optional - Category representative image
- `parent_category`: ForeignKey to Category, optional - For subcategories
- `display_order`: Integer, default=0 - Sort order in navigation
- `is_active`: Boolean, default=True
- `created_at`: DateTime, auto

**Relationships**:
- Many-to-Many with FishProduct
- Self-referential for parent/child categories

### User
Customer account information.

**Fields**:
- `id`: UUID, Primary Key
- `email`: Email, required, unique
- `username`: String(30), required, unique
- `first_name`: String(30), optional
- `last_name`: String(30), optional
- `phone`: String(15), optional
- `date_joined`: DateTime, auto
- `last_login`: DateTime, optional
- `is_active`: Boolean, default=True
- `is_staff`: Boolean, default=False

**Relationships**:
- One-to-Many with Order
- One-to-Many with ShippingAddress
- One-to-One with UserProfile (extends with preferences)

### UserProfile
Extended user information and preferences.

**Fields**:
- `user`: OneToOne to User, Primary Key
- `experience_level`: Choice('beginner', 'intermediate', 'advanced'), default='beginner'
- `preferred_tank_size`: Integer, optional - Gallons
- `newsletter_subscribed`: Boolean, default=False
- `marketing_emails`: Boolean, default=False

### Order
Purchase transaction record.

**Fields**:
- `id`: UUID, Primary Key
- `order_number`: String(20), unique, auto-generated - Human-readable order ID
- `user`: ForeignKey to User, required
- `status`: Choice('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'), default='pending'
- `total_amount`: Decimal(10,2), required
- `shipping_amount`: Decimal(10,2), default=0
- `tax_amount`: Decimal(10,2), default=0
- `discount_amount`: Decimal(10,2), default=0
- `payment_status`: Choice('pending', 'paid', 'failed', 'refunded'), default='pending'
- `payment_method`: String(50), optional
- `shipping_address`: ForeignKey to ShippingAddress, required
- `billing_address`: ForeignKey to ShippingAddress, optional
- `order_notes`: Text, optional
- `tracking_number`: String(50), optional
- `estimated_delivery`: Date, optional
- `created_at`: DateTime, auto
- `updated_at`: DateTime, auto

**Relationships**:
- One-to-Many with OrderItem

**Business Rules**:
- Order number format: FW{YYYY}{MM}{DD}{XXXX} (e.g., FW202310210001)
- Status transitions: pending → confirmed → processing → shipped → delivered
- Cancellation only allowed in pending/confirmed status

### OrderItem
Individual items within an order.

**Fields**:
- `id`: UUID, Primary Key
- `order`: ForeignKey to Order, required
- `product`: ForeignKey to FishProduct, required
- `quantity`: Integer, required, min=1
- `unit_price`: Decimal(10,2), required - Price at time of order
- `total_price`: Decimal(10,2), required - quantity * unit_price
- `product_snapshot`: JSON, required - Product data at order time

### ShippingAddress
Customer shipping/billing addresses.

**Fields**:
- `id`: UUID, Primary Key
- `user`: ForeignKey to User, required
- `address_type`: Choice('shipping', 'billing'), required
- `first_name`: String(30), required
- `last_name`: String(30), required
- `company`: String(50), optional
- `address_line_1`: String(100), required
- `address_line_2`: String(100), optional
- `city`: String(50), required
- `state`: String(50), required
- `postal_code`: String(10), required
- `country`: String(2), required, default='US' - ISO country code
- `phone`: String(15), optional
- `is_default`: Boolean, default=False
- `created_at`: DateTime, auto

**Validation Rules**:
- Only one default address per user per type
- Postal code validation based on country

### ProductVariant (Optional)
For future expansion - different sizes/colors of same species.

**Fields**:
- `id`: UUID, Primary Key
- `product`: ForeignKey to FishProduct, required
- `variant_name`: String(50), required - e.g., "Albino", "Long-fin"
- `price_modifier`: Decimal(10,2), default=0 - Additional cost
- `stock_quantity`: Integer, required
- `image_url`: URL, optional

## Database Indexes

### Performance Indexes
- `FishProduct.species_name` (GIN index for full-text search)
- `FishProduct.price` (BTREE)
- `FishProduct.difficulty_level` (BTREE)
- `FishProduct.min_tank_size_gallons` (BTREE)
- `Order.user_id, Order.created_at` (composite)
- `Order.status, Order.created_at` (composite)
- `OrderItem.order_id` (BTREE)
- `Category.parent_category_id` (BTREE)

### Unique Constraints
- `User.email`
- `User.username`
- `Category.name`
- `Category.slug`
- `Order.order_number`

## Data Relationships Diagram

```
User (1) ──── (M) Order (1) ──── (M) OrderItem (M) ──── (1) FishProduct
  │              │                      │
  │              │                      │
  └──── (1) UserProfile                 │
         │                              │
         └──── (M) ShippingAddress      │
                                        │
Category (M) ───────────────────────────┼──── (M) FishProduct
                                        │
                                        └──── (1) ProductVariant (optional)
```

## Migration Strategy

1. **Initial Schema**: Core entities (FishProduct, Category, User, Order, OrderItem, ShippingAddress)
2. **Phase 2**: UserProfile, ProductVariant (if needed)
3. **Phase 3**: Additional fields based on analytics and user feedback

## Data Integrity Rules

- Foreign key constraints on all relationships
- Check constraints for positive prices and quantities
- Database triggers for order total calculation
- Soft deletes for audit trail (is_active flags)

## Performance Considerations

- Read-heavy workload (product catalog browsing)
- Optimized for complex filtering (price, difficulty, tank size)
- Efficient pagination for large product lists
- Cached frequently accessed data (categories, popular products)