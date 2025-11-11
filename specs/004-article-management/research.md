# Research Findings: Article Management System

**Date**: 2025-01-27
**Research Tasks**: Resolved technical decisions for article management implementation

## Decision: HTML Sanitization Library

**Chosen**: bleach (Python library) for backend sanitization

**Rationale**: bleach is the industry standard for HTML sanitization in Python/Django applications. It's actively maintained, secure, and allows fine-grained control over allowed HTML tags and attributes. Integrates seamlessly with Django and provides whitelist-based sanitization which is safer than blacklist approaches.

**Alternatives Considered**:
- html-sanitizer: Rejected due to less active maintenance and smaller community
- Manual regex-based sanitization: Rejected due to security risks and maintenance burden
- Frontend-only sanitization: Rejected because security must be enforced on backend

**Implementation Notes**: Use bleach with a whitelist of safe HTML tags (p, h1-h6, ul, ol, li, strong, em, a, img, blockquote) and safe attributes (href, src, alt, title). Strip all script tags and event handlers.

## Decision: Rich Text Editor

**Chosen**: Tiptap or similar WYSIWYG editor for frontend

**Rationale**: Tiptap is a modern, extensible rich text editor built on ProseMirror. It's framework-agnostic, accessible, and provides excellent developer experience. Supports HTML output which aligns with our sanitization approach. Alternatively, React Quill or Slate could work, but Tiptap has better TypeScript support and extensibility.

**Alternatives Considered**:
- Plain textarea: Rejected due to poor user experience for rich content
- Markdown editor: Rejected because spec requires HTML output
- Draft.js: Rejected due to complexity and maintenance overhead

**Implementation Notes**: Configure editor to output clean HTML, validate on frontend, then sanitize on backend before storage.

## Decision: Image Storage Strategy

**Chosen**: URL-based image storage (external URLs or Django media files)

**Rationale**: Aligns with existing product image pattern (image_url field). Allows flexibility for CDN usage, external image hosting, or local file storage. Simpler than implementing full file upload system initially.

**Alternatives Considered**:
- Direct file upload to S3/Cloudinary: Rejected as out of scope for MVP, can be added later
- Base64 encoding: Rejected due to performance and database size concerns

**Implementation Notes**: Support both URL input and file upload (store as URL after processing). Featured image stored as single URL field, content images embedded in HTML body.

## Decision: Excerpt Generation Strategy

**Chosen**: Auto-generate from first 150-200 characters of HTML content (stripped of tags), with optional manual override field

**Rationale**: Provides good default behavior while allowing admins to craft better excerpts when needed. Stripping HTML ensures clean text previews. 150-200 characters is standard for article previews.

**Alternatives Considered**:
- Always manual: Rejected due to extra admin work
- Always auto-generated: Rejected because manual excerpts can be more compelling
- First paragraph extraction: Rejected due to complexity with HTML parsing

**Implementation Notes**: Store excerpt as separate field (nullable). If null, generate on-the-fly from content. If provided, use manual excerpt.

## Decision: Slug Generation

**Chosen**: Django's django.utils.text.slugify() with uniqueness checking

**Rationale**: Standard Django approach, handles Unicode properly, creates SEO-friendly URLs. Add numeric suffix for duplicates (e.g., "my-article", "my-article-2").

**Alternatives Considered**:
- UUID-based slugs: Rejected due to poor SEO and readability
- Manual slug entry: Rejected due to extra admin work and potential errors

**Implementation Notes**: Generate slug from title on save, check uniqueness, append number if needed. Store in unique indexed field.

## Decision: Structured Data Schema

**Chosen**: Schema.org Article markup (JSON-LD format)

**Rationale**: Industry standard for article content, supported by all major search engines. JSON-LD is easier to implement than microdata and doesn't require HTML changes.

**Alternatives Considered**:
- Microdata: Rejected due to HTML coupling and maintenance overhead
- RDFa: Rejected due to complexity

**Implementation Notes**: Include headline, author, datePublished, dateModified, image, articleBody, articleSection (category). Validate against Google's Rich Results Test.

## Decision: Category Slug Generation

**Chosen**: Same slugify approach as articles, unique per category

**Rationale**: Consistent with article slug strategy, enables clean category URLs (/articles/category/care-guides).

**Alternatives Considered**:
- ID-based category URLs: Rejected due to poor SEO
- No category URLs: Rejected because spec requires category pages (FR-020)

**Implementation Notes**: Generate slug from category name, ensure uniqueness, store in indexed field.

## Decision: Pagination Strategy

**Chosen**: Cursor-based pagination for articles listing

**Rationale**: Better performance than offset-based pagination for large datasets, especially with ordering by publish_date. Prevents duplicate/missing items when new articles are published during pagination.

**Alternatives Considered**:
- Offset-based pagination: Rejected due to performance issues at scale
- Infinite scroll: Rejected as not specified in requirements, can be added later

**Implementation Notes**: Use Django REST Framework's CursorPagination with page_size=20 (matches existing product pagination).

## Decision: Draft Visibility

**Chosen**: Admins can see drafts in admin interface, drafts excluded from public listings

**Rationale**: Matches spec requirement (FR-009). Admins need to preview and manage drafts separately from published content.

**Alternatives Considered**:
- Show drafts to all users: Rejected as violates spec
- No draft state: Rejected as violates spec (FR-008)

**Implementation Notes**: Filter published articles in public API endpoints, include drafts in admin endpoints with proper permission checks.

