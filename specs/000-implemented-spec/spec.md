# Feature Specification: Spec E-Com Current Scope

**Feature Branch**: `000-implemented-spec`  
**Created**: 2025-11-17  
**Status**: Draft  
**Input**: User description: "with what is implemented create a full and comprehensice spec. i you want to create a new folder start its name with 000-"

This specification captures the currently implemented experience for shoppers, content readers, and store operators in the Spec E-Com platform. It defines the user journeys, guardrails, and success measures that any future plan must continue to satisfy.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Discover and Filter Catalog (Priority: P1)

Customers browse freshwater fish and aquarium plants, refine the catalog with search and filters, and review detail pages before adding items to the cart.

**Why this priority**: This journey drives revenue and must remain fast, filterable, and informative for both fish and plant inventory.

**Independent Test**: From a signed-out browser, exercise `/products`, toggle between fish and plants, apply filters, open a detail page, and verify contextual education cards without interacting with admin tooling.

**Acceptance Scenarios**:

1. **Given** a shopper on `/products`, **When** they select product type = plants and apply price, tank size, and category filters, **Then** the grid updates to only in-stock plant SKUs matching every filter and the URL reflects each active parameter.
2. **Given** a shopper on a product detail page, **When** the SKU is out of stock, **Then** the page still shows care instructions, compatible fauna, pricing, and a clear propagation callout instead of the add-to-cart button.

---

### User Story 2 - Operate Catalog & Orders (Priority: P2)

Store administrators authenticate, manage product inventory (including plant metadata and images), oversee orders, and enforce plant feature flags from a guarded admin area.

**Why this priority**: Accurate catalog data and permissioned operations keep the storefront trustworthy and prevent accidental exposure of admin actions.

**Independent Test**: Using an admin account, access `/admin`, view dashboard stats, create/update plant categories and products, upload gallery images, and confirm JWT-protected APIs reject non-admins.

**Acceptance Scenarios**:

1. **Given** an authenticated admin, **When** they submit a new plant product without mandatory botanical details, **Then** the system blocks the save and returns field-level validation guidance.
2. **Given** the `PLANTS_ENABLED` flag is false, **When** any user attempts to purchase a plant SKU, **Then** checkout validation stops the order and explains that plants are unavailable.

---

### User Story 3 - Consume Educational Content (Priority: P3)

Visitors read long-form articles, explore categories, and rely on structured metadata that powers SEO snippets and in-product helper cards.

**Why this priority**: Educational content fuels organic acquisition and supports confident purchasing decisions.

**Independent Test**: Navigate `/articles`, switch categories, open an article, inspect page metadata/structured data in the head, and confirm text sanitization by pasting risky HTML into the admin editor and previewing the sanitized render.

**Acceptance Scenarios**:

1. **Given** an author publishes an article with a featured image, **When** they omit alt text, **Then** publishing fails with an explicit alt-text requirement so accessibility remains intact.
2. **Given** a visitor loads an article detail page, **When** they inspect the page metadata, **Then** the canonical title, description, and JSON-LD block reflect the article content and featured image.

### Edge Cases

- Catalog request returns zero matches because every active filter is mutually exclusive. The UI must surface a readable empty-state and offer a one-click reset action.
- Plants feature flag is disabled while cached catalog data still advertises plant SKUs. APIs must hide plant purchase actions, and the frontend must down-rank the plant quick link within a single cache window.
- Image uploads fail mid-way because the disk or remote storage is full. The transaction should roll back, respond with a descriptive message, and leave no orphaned files or records.
- Article content includes unsafe HTML. The sanitizer must strip unsupported tags while preserving allowed formatting and links so readers never encounter raw scripts.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The storefront MUST surface distinct navigation to catalog, plants, and content destinations on every page.
- **FR-002**: Visitors MUST be able to search by keyword and filter by type, category, difficulty, environmental ranges, diet, price, and size directly from the catalog page, with filters reflected in the URL.
- **FR-003**: Product detail pages MUST display pricing, availability, care instructions, compatible fauna, and gallery media even when the item cannot be added to the cart.
- **FR-004**: Catalog APIs MUST cache list and detail responses for at least 60 seconds while honoring all filter parameters and limiting results to available SKUs.
- **FR-005**: Plant SKUs MUST include botanical metadata, plant category, light requirements, CO₂ guidance, and education callouts wherever they appear.
- **FR-006**: Article creation MUST enforce sanitized HTML, featured image alt text, and association with a category and author before publishing.
- **FR-007**: Authentication MUST rely on user email plus password, issuing JSON Web Tokens that gate admin endpoints and user profile operations.
- **FR-008**: Admin interfaces MUST restrict create/update/delete actions to authenticated admins and reject non-admin tokens with clear unauthorized responses.
- **FR-009**: Product image management MUST support multi-file uploads, primary image designation, alt text, captions, and safe cleanup of replaced files.
- **FR-010**: Orders MUST capture shipping and billing addresses tied to the authenticated user, enforce stock checks, and record a snapshot of product data at purchase time.
- **FR-011**: System-wide feature flags (e.g., `PLANTS_ENABLED`) MUST stay synchronized between backend configuration and frontend environment variables to prevent mismatched UX.
- **FR-012**: Deployment workflows MUST require successful automated tests (backend unit tests and Playwright catalog journeys), healthy `/health/` responses, and a verified database backup within the last 24 hours before promoting changes.

### Key Entities

- **User**: Represents shoppers and administrators with email-based credentials, role designations, and profile preferences.
- **FishProduct**: Core inventory item containing species details, environmental requirements, stock counts, price, plant-specific metadata, and SEO fields.
- **Category / PlantCategory**: Hierarchical groups for fish and plant catalog navigation, powering filter chips, quick links, and validation on product creation.
- **ProductImage**: Media records tied to a product with flags for primary display, captions, alt text, and ordering used in storefront galleries.
- **Article / ArticleCategory**: Educational content entries with sanitized rich text, featured imagery, metadata, and publishing status, grouped for navigation.
- **Order / OrderItem / Address**: Transactional records capturing checkout selections, shipping/billing destinations, payment status, and product snapshots for fulfillment.

### Assumptions

- Shoppers primarily access the experience via modern browsers; legacy browser quirks are out of scope.
- Payments and shipping fulfillment are handled outside this specification, so checkout captures intent but does not integrate with carriers or gateways yet.
- Content authors are internal admins; there is no public submission workflow.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of catalog page loads (fish and plant views) render meaningful results or an empty-state message within 2 seconds on a standard broadband connection.
- **SC-002**: At least 90% of shoppers who apply three or more filters remain on the catalog page (no hard errors or forced reloads) across a 30-day observation window.
- **SC-003**: 100% of published plant products include botanical name, plant category, and light requirement data, validated through automated admin tests.
- **SC-004**: 100% of published articles contain sanitized HTML plus alt-tagged featured images, verified during content publishing and spot-checked monthly.
- **SC-005**: 0 unauthorized admin API calls succeed; every protected endpoint returns an explicit 401/403 when accessed without a valid admin token.
- **SC-006**: Database backups succeed at least once every 24 hours, and restoration drills confirm usable snapshots quarterly.
