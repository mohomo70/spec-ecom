# Research Findings: Image Support for Backend and Database

**Date**: 2025-01-27
**Research Tasks**: Resolved technical decisions for image storage with CDN-ready architecture

## Decision: Storage Backend Abstraction for CDN Migration

**Chosen**: Django ImageField with DEFAULT_FILE_STORAGE configuration abstraction

**Rationale**: Django's storage backend system allows switching between local filesystem and CDN (AWS S3, Cloudinary, etc.) through settings.py configuration only. This enables zero code changes when migrating to CDN. ImageField automatically uses the configured storage backend, and the `.url` property generates correct URLs for both local and CDN storage.

**Alternatives Considered**:
- Direct file path storage: Rejected due to hardcoded paths that break with CDN migration
- Custom storage wrapper: Rejected due to unnecessary complexity when Django provides built-in abstraction
- Binary field storage: Rejected due to database bloat and performance issues

**Implementation Notes**: 
- Use `ImageField` with `storage=None` (defaults to `DEFAULT_FILE_STORAGE`)
- Never hardcode `/media/` paths - always use `.url` property
- Configure storage via environment variables for easy CDN migration
- Local storage: `FileSystemStorage` (default)
- CDN storage: `storages.backends.s3boto3.S3Boto3Storage` (when ready)

## Decision: Separate Image Models Architecture

**Chosen**: Separate ProductImage, CategoryImage, ArticleImage models with ForeignKey relationships

**Rationale**: Provides flexibility for metadata (alt text, display order, is_primary flag), supports multiple images per entity, enables proper referential integrity, and allows independent querying/management. This structure scales better than embedding images directly in parent models.

**Alternatives Considered**:
- Direct ImageField on parent models: Rejected due to limited metadata support and difficulty managing multiple images
- Single generic Image model: Rejected due to type safety and clarity concerns
- JSONField with URLs: Rejected due to lack of referential integrity and file management

**Implementation Notes**:
- ProductImage: ForeignKey to FishProduct, is_primary boolean (only one True per product)
- CategoryImage: ForeignKey to Category
- ArticleImage: ForeignKey to Article
- All use ImageField with date-based upload_to paths: `products/%Y/%m/%d/`

## Decision: File Organization Strategy

**Chosen**: Date-based directory structure with UUID filenames

**Rationale**: Date-based paths (`products/2025/01/27/`) prevent filesystem performance degradation with large directories. UUID filenames prevent conflicts and security issues from user-provided filenames. This structure works identically for local storage and CDN.

**Alternatives Considered**:
- Flat directory structure: Rejected due to filesystem performance issues with thousands of files
- Entity ID-based paths: Rejected due to potential conflicts and less intuitive organization
- Original filename preservation: Rejected due to security risks and potential conflicts

**Implementation Notes**:
- Use `upload_to='products/%Y/%m/%d/'` in ImageField
- Generate UUID-based filenames in custom upload handler or use Django's default sanitization
- Path structure: `{entity_type}/{year}/{month}/{day}/{uuid}.{ext}`

## Decision: Image Validation Approach

**Chosen**: Multi-layer validation using Django validators and Pillow

**Rationale**: Comprehensive validation prevents malicious uploads, ensures file integrity, and provides clear error messages. Pillow verification ensures files are actually valid images, not just renamed files.

**Alternatives Considered**:
- File extension only: Rejected due to security risks (malicious files with image extensions)
- Server-side only: Rejected - client-side validation improves UX but backend validation is mandatory
- Third-party validation service: Rejected due to added complexity and latency

**Implementation Notes**:
- Format validation: JPEG, PNG, WebP only
- Size validation: 5MB maximum
- Dimension validation: 4000x4000px maximum
- Integrity validation: Pillow Image.open() and verify()
- Filename sanitization: Django ImageField handles automatically

## Decision: File Deletion Strategy

**Chosen**: Automatic deletion via Django signals when images are replaced or parent entities deleted

**Rationale**: Prevents disk space waste and orphaned files. Django signals provide clean separation of concerns. Works with both local storage and CDN (storage backend handles deletion).

**Alternatives Considered**:
- Manual cleanup scripts: Rejected due to maintenance burden and potential missed deletions
- Soft delete with periodic cleanup: Rejected due to unnecessary complexity for this use case
- No automatic deletion: Rejected due to disk space concerns

**Implementation Notes**:
- Use `pre_delete` signal to delete file before database record deletion
- Handle file replacement in model save() or view logic
- Use `django-cleanup` package as alternative (optional)

## Decision: Primary Image Constraint Enforcement

**Chosen**: Database constraint + application logic to ensure only one primary image per product

**Rationale**: Database-level enforcement provides data integrity guarantee. Application logic handles the "unmark previous primary" behavior when setting new primary.

**Alternatives Considered**:
- Application logic only: Rejected due to race condition risks
- Database unique constraint on (product, is_primary=True): Rejected due to NULL handling complexity
- Separate primary_image ForeignKey: Rejected due to unnecessary model complexity

**Implementation Notes**:
- Use `unique_together` or `UniqueConstraint` on (product, is_primary) where is_primary=True
- In save() method or serializer, unmark previous primary before setting new one
- Validate in serializer to prevent multiple primaries

## Decision: Error Response Format

**Chosen**: Standard HTTP status codes (400, 413, 415) with JSON error objects

**Rationale**: Follows RESTful API best practices and aligns with existing API patterns. Standard status codes enable proper frontend error handling. JSON structure provides detailed error information.

**Alternatives Considered**:
- Always 400 with detailed JSON: Rejected due to loss of semantic HTTP status information
- Custom error format: Rejected due to inconsistency with existing API patterns
- Plain text errors: Rejected due to lack of structured error handling

**Implementation Notes**:
- 400 Bad Request: General validation errors (format, dimensions, integrity)
- 413 Payload Too Large: File size exceeds limit
- 415 Unsupported Media Type: Invalid file format
- JSON format: `{"error": "error_code", "message": "human readable", "field": "field_name"}`

## Decision: CDN Migration Path

**Chosen**: Configuration-only migration using django-storages

**Rationale**: Zero code changes required when migrating to CDN. Django's storage abstraction handles all differences. Environment variable configuration enables easy deployment across environments.

**Implementation Notes**:
- Initial implementation: Local FileSystemStorage
- Future migration: Install django-storages, change DEFAULT_FILE_STORAGE in settings
- Environment variable: `USE_CDN=True/False` to toggle storage backend
- One-time script: Migrate existing files to CDN (optional, can upload on-demand)
- No model/view/serializer changes needed

## Decision: URL Generation Strategy

**Chosen**: Always use Django's `.url` property, never hardcode paths

**Rationale**: `.url` property automatically generates correct URLs for both local storage (`/media/...`) and CDN (`https://cdn.example.com/...`). Hardcoded paths break with CDN migration.

**Implementation Notes**:
- In serializers: `obj.image.url` (not `f'/media/{obj.image.name}'`)
- In templates: `{{ image.url }}` (not hardcoded paths)
- Request context: Use `request.build_absolute_uri()` for absolute URLs in API responses

## Summary

All technical decisions prioritize CDN-ready architecture through Django's storage backend abstraction. The implementation requires zero code changes when migrating from local storage to CDN - only settings.py configuration changes are needed. This aligns with the scalability and performance requirements while maintaining code simplicity.

