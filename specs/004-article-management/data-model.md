# Data Model: Article Management System

**Feature**: 004-article-management | **Date**: 2025-01-27

## Entities

### ArticleCategory

**Purpose**: Represents a classification group for organizing articles

**Attributes**:
- `id` (UUID, Primary Key) - Auto-generated unique identifier
- `name` (String(100), Unique, Not Null) - Category name (e.g., "Care Guides", "Breeding Tips")
- `slug` (String(100), Unique, Not Null) - SEO-friendly URL slug generated from name
- `description` (Text, Optional) - Category description for admin reference
- `created_at` (DateTime, Auto) - Category creation timestamp

**Constraints**:
- Name must be unique across all categories
- Slug must be unique and URL-safe
- Name cannot be empty
- Slug auto-generated from name using slugify, with uniqueness check

**Relationships**:
- One ArticleCategory can have many Articles (one-to-many)
- Articles belong to exactly one category (required)

**Indexes**:
- `name` - Unique index for fast lookups
- `slug` - Unique index for URL routing and SEO

**State Transitions**:
1. Creation: Category created with name, slug auto-generated
2. No edit/delete: Categories cannot be modified or deleted after creation (per FR-030)

**Validation Rules**:
- Name: 1-100 characters, required
- Slug: Auto-generated, URL-safe, unique
- Description: Optional, no length limit

### Article

**Purpose**: Represents a content piece with rich text, images, and SEO metadata

**Attributes**:
- `id` (UUID, Primary Key) - Auto-generated unique identifier
- `title` (String(200), Not Null) - Article title
- `slug` (String(200), Unique, Not Null) - SEO-friendly URL slug generated from title
- `content` (Text, Not Null) - Rich text HTML content (sanitized)
- `excerpt` (Text, Optional) - Manual excerpt override (if null, auto-generated from content)
- `featured_image_url` (URL, Optional) - Featured image URL for listings and headers
- `featured_image_alt_text` (String(200), Optional) - Alt text for featured image (required when featured_image_url is provided)
- `category` (ForeignKey to ArticleCategory, Not Null) - Article category assignment
- `author` (ForeignKey to User, Not Null) - Article author (admin who created it)
- `status` (String(20), Not Null, Default='draft') - Publish status: 'draft' or 'published'
- `meta_title` (String(60), Optional) - SEO meta title (defaults to title if not provided)
- `meta_description` (String(160), Optional) - SEO meta description (auto-generated if not provided)
- `created_at` (DateTime, Auto) - Article creation timestamp
- `updated_at` (DateTime, Auto) - Last modification timestamp
- `published_at` (DateTime, Optional) - Publication timestamp (set when status changes to 'published')

**Constraints**:
- Title must be provided and non-empty
- Content must be provided and non-empty (after HTML sanitization)
- Category must be selected (required foreign key)
- Slug must be unique and URL-safe
- Status must be either 'draft' or 'published'
- Meta title max 60 characters (SEO best practice)
- Meta description max 160 characters (SEO best practice)
- Content must be sanitized HTML (no script tags, dangerous attributes)

**Relationships**:
- Many Articles belong to one ArticleCategory (many-to-one, required)
- Many Articles belong to one User (author, many-to-one, required)
- Content images embedded in HTML content (not separate entities)

**Indexes**:
- `slug` - Unique index for URL routing
- `status` - Index for filtering published articles
- `category_id` - Index for category filtering
- `published_at` - Index for ordering (newest first)
- `created_at` - Index for admin sorting
- Composite index on `(status, published_at)` - For public listing queries

**State Transitions**:
1. Creation: Article created with status='draft', slug auto-generated from title
2. Publishing: status changes to 'published', published_at set to current timestamp
3. Editing: updated_at updated, content/slug regenerated if title changed
4. Deletion: Article removed from system (soft delete not required per spec)

**Validation Rules**:
- Title: 1-200 characters, required, cannot be empty
- Content: Required, must contain valid HTML (will be sanitized)
- Slug: Auto-generated from title, unique, URL-safe
- Excerpt: Optional, if provided max 500 characters
- Featured image URL: Optional, must be valid URL format if provided
- Featured image alt text: Optional, but required when featured_image_url is provided, max 200 characters
- Meta title: Optional, max 60 characters (warn if longer)
- Meta description: Optional, max 160 characters (warn if longer)
- Status: Must be 'draft' or 'published'
- Category: Required, must reference existing ArticleCategory

**Content Sanitization**:
- Allowed HTML tags: p, h1, h2, h3, h4, h5, h6, ul, ol, li, strong, em, a, img, blockquote, br
- Allowed attributes:
  - `a`: href (must be safe URL), title
  - `img`: src (must be safe URL), alt, title, width, height
  - All other tags: title only
- Stripped: script, style, iframe, object, embed, form, input, button, and all event handlers

**Excerpt Generation**:
- If excerpt field is null: Auto-generate from first 150-200 characters of content (HTML stripped)
- If excerpt provided: Use manual excerpt
- Generation happens on save if excerpt is null

## Database Schema

```sql
-- ArticleCategory table
CREATE TABLE article_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_article_categories_slug ON article_categories(slug);
CREATE INDEX idx_article_categories_name ON article_categories(name);

-- Article table
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image_url VARCHAR(500),
    featured_image_alt_text VARCHAR(200),
    category_id UUID NOT NULL REFERENCES article_categories(id) ON DELETE RESTRICT,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    meta_title VARCHAR(60),
    meta_description VARCHAR(160),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_article_category FOREIGN KEY (category_id) REFERENCES article_categories(id),
    CONSTRAINT fk_article_author FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_category ON articles(category_id);
CREATE INDEX idx_articles_published_at ON articles(published_at);
CREATE INDEX idx_articles_created_at ON articles(created_at);
CREATE INDEX idx_articles_status_published ON articles(status, published_at) WHERE status = 'published';
```

## Performance Considerations

1. **Indexing Strategy**:
   - Composite index on (status, published_at) for efficient public listing queries
   - Category index for filtering
   - Slug index for URL lookups

2. **Query Optimization**:
   - Use select_related for category and author to avoid N+1 queries
   - Paginate article listings (20 per page)
   - Cache category list (rarely changes)

3. **Content Storage**:
   - Store sanitized HTML in text field (PostgreSQL handles large text efficiently)
   - Consider full-text search index on title and content for future search feature

4. **Image Handling**:
   - Featured images stored as URLs (external or media file URLs)
   - Content images embedded in HTML (URLs in img src attributes)
   - No separate image entity needed for MVP

