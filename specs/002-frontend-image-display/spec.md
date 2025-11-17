# Feature Specification: Frontend Image Display Integration

**Feature Branch**: `001-frontend-image-display`  
**Created**: 2025-11-12  
**Status**: Draft  
**Input**: User description: "Update all frontend pages to display images using new backend image upload fields (primary_image_url, images array, featured_image_url_from_upload) with backward compatibility for legacy image_url fields"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Product Images Display (Priority: P1)

As a user browsing products, I want to see product images displayed correctly on all product pages, so I can visually identify and evaluate products before purchasing.

**Why this priority**: Product images are critical for e-commerce user experience. Without proper image display, users cannot make informed purchase decisions, directly impacting conversion rates.

**Independent Test**: Can be fully tested by navigating to product list and detail pages, verifying that uploaded product images appear correctly, and confirming fallback to legacy images when new images are not available.

**Acceptance Scenarios**:

1. **Given** a product has uploaded images via the new image upload system, **When** a user views the product list page, **Then** the primary product image is displayed in the product card
2. **Given** a product has uploaded images via the new image upload system, **When** a user views the product detail page, **Then** the primary image is displayed prominently and gallery images (non-primary) are shown in a thumbnail grid
3. **Given** a product only has legacy image_url field, **When** a user views any product page, **Then** the legacy image is displayed as fallback
4. **Given** a product has both new uploaded images and legacy image_url, **When** a user views any product page, **Then** the new uploaded images take priority over legacy images

---

### User Story 2 - Article Featured Images Display (Priority: P1)

As a user browsing articles, I want to see featured images displayed correctly on all article pages, so I can visually identify articles and understand their content at a glance.

**Why this priority**: Featured images enhance article discoverability and engagement. They are the primary visual element that draws users to read articles.

**Independent Test**: Can be fully tested by navigating to article list, detail, and category pages, verifying that uploaded featured images appear correctly, and confirming fallback to legacy images when new images are not available.

**Acceptance Scenarios**:

1. **Given** an article has an uploaded featured image via the new image upload system, **When** a user views the article list page, **Then** the featured image is displayed in the article card
2. **Given** an article has an uploaded featured image via the new image upload system, **When** a user views the article detail page, **Then** the featured image is displayed prominently at the top of the article
3. **Given** an article only has legacy featured_image_url field, **When** a user views any article page, **Then** the legacy image is displayed as fallback
4. **Given** an article has both new uploaded image and legacy featured_image_url, **When** a user views any article page, **Then** the new uploaded image takes priority over legacy image

---

### User Story 3 - Shopping Cart and Orders Image Display (Priority: P2)

As a user managing my shopping cart or viewing order history, I want to see product images displayed correctly, so I can easily identify products in my cart and past orders.

**Why this priority**: Images in cart and orders help users verify they have the correct items, improving confidence in purchases and order management.

**Independent Test**: Can be fully tested by adding products to cart, viewing cart page, placing an order, and viewing order history, verifying that product images appear correctly in all contexts.

**Acceptance Scenarios**:

1. **Given** a product with uploaded images is added to the shopping cart, **When** a user views the cart page, **Then** the product image is displayed next to the product name
2. **Given** an order contains products with uploaded images, **When** a user views the order history page, **Then** product images are displayed for each order item
3. **Given** a product in cart or order only has legacy image_url, **When** a user views cart or order pages, **Then** the legacy image is displayed as fallback

---

### User Story 4 - SEO and Social Media Image Metadata (Priority: P2)

As a content creator or marketer, I want article featured images to be properly included in Open Graph and Twitter Card metadata, so articles display correctly when shared on social media platforms.

**Why this priority**: Proper social media image metadata increases click-through rates and engagement when articles are shared, improving content discoverability.

**Independent Test**: Can be fully tested by viewing article detail page source code, verifying that og:image and twitter:image meta tags contain the correct image URLs from uploaded images or legacy fields.

**Acceptance Scenarios**:

1. **Given** an article has an uploaded featured image, **When** the article detail page is rendered, **Then** Open Graph og:image meta tag contains the uploaded image URL
2. **Given** an article has an uploaded featured image, **When** the article detail page is rendered, **Then** Twitter Card twitter:image meta tag contains the uploaded image URL
3. **Given** an article only has legacy featured_image_url, **When** the article detail page is rendered, **Then** social media meta tags use the legacy image URL as fallback

---

### Edge Cases

- What happens when a product has multiple images but none marked as primary? (System should use first image from array)
- What happens when an image URL is invalid or returns 404? (System should display "No Image" placeholder)
- What happens when both new and legacy image fields are null/empty? (System should display "No Image Available" message)
- How does the system handle image loading errors? (System should gracefully fallback to placeholder without breaking page layout)
- What happens when image URLs are relative vs absolute? (System should handle both formats correctly)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Frontend MUST display product images using priority order: primary_image_url → primary image from images array → first image from images array → legacy image_url
- **FR-002**: Frontend MUST display article featured images using priority order: featured_image_url_from_upload → legacy featured_image_url
- **FR-003**: Frontend MUST update all product display pages (list, detail, cart, orders) to use new image fields with backward compatibility
- **FR-004**: Frontend MUST update all article display pages (list, detail, category) to use new image fields with backward compatibility
- **FR-005**: Frontend MUST update TypeScript interfaces to include new image fields (primary_image_url, images array, featured_image_url_from_upload) while maintaining legacy field support
- **FR-006**: Frontend MUST display gallery images (non-primary product images) in product detail pages when available
- **FR-007**: Frontend MUST include uploaded featured images in Open Graph and Twitter Card meta tags for article pages
- **FR-008**: Frontend MUST gracefully handle missing images by displaying appropriate placeholder text or icons
- **FR-009**: Frontend MUST use alt text from uploaded images when available, falling back to entity name (product species_name or article title)
- **FR-010**: Frontend MUST maintain image aspect ratios and responsive sizing across all display contexts

### Key Entities *(include if feature involves data)*

- **Product Image Data**: Contains primary_image_url (direct URL), images array (all images with metadata including id, url, is_primary, display_order, alt_text, caption), and legacy image_url (fallback)
- **Article Image Data**: Contains featured_image_url_from_upload (new uploaded image URL), and legacy featured_image_url (fallback)
- **Image Display Context**: Product list cards, product detail pages, shopping cart items, order history items, article list cards, article detail pages, article category pages

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All product images display correctly on product list page with 100% of products showing images when available (either new uploaded or legacy)
- **SC-002**: All product images display correctly on product detail page with primary image visible and gallery images accessible, with 100% success rate for products with uploaded images
- **SC-003**: All article featured images display correctly on article list and detail pages with 100% of articles showing images when available (either new uploaded or legacy)
- **SC-004**: Shopping cart and order history pages display product images correctly with 100% of items showing images when available
- **SC-005**: Social media meta tags (Open Graph, Twitter Cards) contain correct image URLs for 100% of articles with uploaded or legacy images
- **SC-006**: Image fallback chain works correctly with 0% of pages breaking when legacy images are used as fallback
- **SC-007**: All TypeScript interfaces updated to include new image fields without breaking existing functionality, with 0 compilation errors
- **SC-008**: Image loading errors are handled gracefully with appropriate placeholders displayed, resulting in 0% of pages showing broken image icons

## Assumptions

- Backend API already returns new image fields (primary_image_url, images array, featured_image_url_from_upload) in addition to legacy fields
- Image URLs returned by backend are absolute URLs or can be resolved relative to API base URL
- Legacy image_url and featured_image_url fields will remain in API responses for backward compatibility
- Users may have products/articles with only legacy images, only new uploaded images, or both
- Image upload functionality is already implemented in backend (covered in separate feature spec 005-image-support)

## Dependencies

- Backend image upload API endpoints must be functional and returning new image fields
- Backend serializers must include primary_image_url, images array, and featured_image_url_from_upload in API responses
- Existing frontend API client must be able to handle new response fields
- TypeScript/Next.js build system must support updated interfaces

## Out of Scope

- Image upload functionality (covered in feature 005-image-support)
- Image editing or manipulation in frontend
- Image optimization or lazy loading implementation (assumes existing Next.js Image component handles this)
- CDN integration (handled at backend level)
- Image caching strategies beyond browser defaults
- Image format conversion or resizing
