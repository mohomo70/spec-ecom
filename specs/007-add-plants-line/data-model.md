# Data Model – Aquarium Plant Product Line

## Product (extended)
- **Purpose**: Canonical catalog entity for all sellable items (fish, plants, future accessories).
- **Key Fields**:
  - `id` (UUID)
  - `slug` (unique, SEO-friendly)
  - `name`, `subtitle`, `short_description`, `long_description`
  - `product_type` (enum: `fish`, `plant`, `accessory`)
  - `base_price`, `sale_price`, `currency`
  - `inventory_quantity`, `inventory_threshold`, `is_backorderable`
  - `hero_eligible` (bool)
  - `media` (array of image/video refs with alt text)
  - `seo_meta` (title, description, structured data payload)
  - `status` (draft, published, archived) with timestamps `published_at`, `archived_at`
- **Validation/Rules**:
  - `slug` unique per catalog; generated from name but editable.
  - `product_type` required; controls which attribute groups must be present.
  - `inventory_quantity` ≥ 0; if 0 disable add-to-cart automatically.
  - `hero_eligible` allowed only when status = published and inventory > threshold.
  - Soft delete via `archived_at`; data retained for analytics.

## PlantCategory
- **Purpose**: Grouping taxonomy for plants (carpeting, sword, stem, future additions).
- **Key Fields**:
  - `id` (UUID)
  - `name` (unique)
  - `slug`
  - `description`
  - `display_order` (int)
  - `is_active` (bool)
- **Validation/Rules**:
  - `name`/`slug` unique.
  - Cannot delete/disable while `Product` records reference it.
  - Display order determines storefront filter ordering.

## PlantAttributes (embedded within Product when `product_type=plant`)
- **Purpose**: Capture horticultural specifics displayed on PDP and used in filtering.
- **Fields**:
  - `category_id` → PlantCategory
  - `botanical_name`
  - `growth_rate` (enum: slow/medium/fast)
  - `light_requirements` (enum: low/medium/high)
  - `substrate_preference` (enum)
  - `co2_requirement` (enum: none/optional/recommended)
  - `difficulty` (enum: easy/moderate/advanced)
  - `compatible_fauna` (array of tags referencing fish compatibility matrix)
  - `care_notes` (rich text/markdown)
  - `max_height_cm`, `spread_cm`
- **Validation/Rules**:
  - Required when `product_type=plant`.
  - `category_id` must reference active PlantCategory.
  - Enumerations enforced via Django choices/TS union types.

## HomepageHeroSlot
- **Purpose**: Configurable hero panels on homepage that can highlight plant content.
- **Fields**:
  - `id`
  - `variant` (enum: fish, plant, promo)
  - `headline`, `subcopy`, `cta_label`, `cta_href`
  - `mobile_media`, `desktop_media` (asset refs with alt text)
  - `featured_product_id` (optional FK Product)
  - `fallback_collection_slug`
  - `active_from`, `active_to`
- **Validation/Rules**:
  - Exactly one hero per variant active at a time.
  - Featured product must be published + hero eligible; fallback collection slug required for resilience.

## HomepageQuickLinkCard
- **Purpose**: Configurable cards in the homepage quick-link rail (Species, Fish Care, Aquascaping, etc.) now extended with a Plants entry.
- **Fields**:
  - `id` (stable key)
  - `label` (e.g., “Plants”)
  - `icon` (Lucide icon token or asset ref)
  - `description`
  - `cta_href`
  - `is_enabled`
  - `display_order`
- **Validation/Rules**:
  - Cards share a common layout; copy length must fit existing design.
  - Only five cards shown on desktop; rail auto-wraps on narrow screens.
  - Plants card defaults to disabled until catalog populated.

## Relationships
- PlantCategory 1:N Product (filtered by product_type=plant).
- Product 1:1 PlantAttributes (enforced via JSON column or related table with unique FK).
- HeroSlot optional → Product; ensures CTA route is valid; fallback ensures resilience.
- QuickLinkCard is a config collection consumed by the homepage module; Plants card links to plant listing route.

