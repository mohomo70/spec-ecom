<!--
Sync Impact Report:
Version: 1.0.0 -> 2.0.0
Modified principles:
  - Performance-First -> Full-Stack Contract (Next.js + Django)
  - SEO-Optimized -> Content & SEO Source of Truth
  - Security-First -> Secure Auth & Admin Guardrails
  - Scalable Architecture -> Catalog Integrity & Filterable Data
  - API Contract Standards -> Manual VPS Delivery & Runtime Reliability
Added sections:
  - Testing & QA
Removed sections:
  - None
Templates requiring updates:
  - ✅ .specify/templates/plan-template.md (Core Principles list)
Follow-up TODOs: none
-->

# Spec E-Com Constitution

## Core Principles

### I. Full-Stack Contract (Next.js + Django)
Frontend work stays inside Next.js 15 App Router with React 19, Tailwind v4, Shadcn UI, TanStack Query 5, Zustand, React Hook Form + Zod, and TipTap editors as defined in `frontend/package.json`. All data access goes through `frontend/src/lib/api.ts` so shared auth headers, error handling, and JSON pagination semantics stay intact. Backend APIs live under `/api/` with admin-only endpoints namespaced at `/api/v1/admin/` (see `backend/config/urls.py`). New endpoints must be built with Django REST Framework, `django-filter`, serializer validation, and explicit caching or `select_related/prefetch_related` usage just like `ProductListView` and `ProductDetailView`. Any deviation from this contract (for example bypassing `apiClient` or adding untyped fetchers) is a violation because it breaks token handling, test fixtures, and the pagination data model that Playwright and React Query already rely on. Rationale: keeping a single full-stack contract avoids duplicated fetching strategies and ensures the existing admin tooling and tests continue to work without rework.

### II. Catalog Integrity & Filterable Data
`FishProduct`, `PlantCategory`, `Category`, and related models in `backend/api/models.py` define the single source of truth for the catalog. Plant inventory adds botanical metadata, CO₂ needs, light levels, hero eligibility, and feature flags (`PLANTS_ENABLED` / `NEXT_PUBLIC_PLANTS_ENABLED`) that power the plant quick-links on `/products` and the dedicated admin tables. Every product must ship with detailed care instructions, difficulty ratings, minimum tank sizes, SEO title/description fields, and image metadata that feeds both storefront cards and admin lists. The public catalog endpoints must continue to filter by search, price, categories, tank requirements, and plant attributes, and must stay cached for 60 seconds via `django.core.cache` to keep filter toggles responsive. Admin APIs enforce validation (e.g., plants require `botanical_name` and `plant_category`) and have regression tests in `backend/api/tests/test_admin_products.py`; frontend Playwright coverage in `frontend/tests/catalog/plants.spec.ts` ensures the toggles, quick-link education card, and detail routing stay intact. Rationale: customers rely on precise species data and filters; breaking these contracts corrupts both SEO and purchasing flows.

### III. Content & SEO Source of Truth
Long-form education drives traffic, so articles, categories, and featured images defined in `backend/api/models.py` plus sanitized via `bleach` in `ArticleCreateSerializer` remain mandatory. Article creation requires alt text when an image URL exists, and content is HTML-cleaned before persistence to block XSS. On the storefront, metadata lives in `frontend/src/lib/seo.ts` and powers `<Head>` usage with JSON-LD for both listings and detail pages (`buildProductListJsonLd`, `buildProductDetailJsonLd`). Product cards lazy-load images, maintain semantic headings, and surface plant helper copy; admin editors use TipTap with the same schema. New pages must emit structured data and human-readable titles/descriptions (e.g., see `/products/page.tsx`), and any new content channel must plug into the same SEO helper so schema.org output does not fork. Rationale: our organic acquisition is tied to these helpers and sanitizers; skipping them would undo proven SEO value and content safety.

### IV. Secure Auth & Admin Guardrails
Authentication is email-based via the custom `User` model and JWT tokens issued with `rest_framework_simplejwt` (rotating refresh, blacklist enabled). All profile data, addresses, orders, and admin interactions use DRF serializers plus explicit permissions such as `IsAdminOnly` and `IsAuthenticated`. Frontend state is centralized in `useAuthStore` (Zustand) and tokens are attached only through `apiClient`, so components never talk directly to `localStorage`. Media uploads (product images, featured images) must continue to flow through the validated upload paths (`ProductImageUploadView`, `validate_image_file`) with per-file checks, transactional saves, and cleanup routines to prevent orphaned files. CORS, SECRET_KEY, DB credentials, and feature flags stay in environment variables controlled by Docker Compose. Any new admin UI must enforce role checks client-side and server-side, and all sensitive endpoints must log meaningful errors while returning standardized HTTP status codes. Rationale: centralizing auth and validation keeps customer data safe and enables admin tooling without exposing superuser access.

### V. Manual VPS Delivery & Runtime Reliability
We deploy manually to a custom VPS using the Docker assets under `docker/`: Compose files spin up PostgreSQL 13, Redis 7, Django, and Next.js; Nginx configs terminate TLS, and `backup.sh` handles pg_dump snapshots plus retention cleanup. Health probes live at `/health/` (database ping + timestamp) and Compose healthchecks already call them. Redis-backed caching powers catalog responses while PostgreSQL stores transactional data; migrations must run before each deployment, and static/media assets stay under the configured storage (filesystem by default with optional CDN toggle via `USE_CDN`). When adding services or queues, they must be represented in Compose, include healthchecks, and document any new environment variables. Deploys are rejected if `docker compose` cannot come up cleanly, if healthchecks fail, or if backups have not run in the preceding 24 hours. Rationale: the project intentionally favors transparent manual deploys over opaque CI; following the documented runtime shape is what keeps production predictable.

## Technology Stack

### Required Technologies
- Frontend: Next.js 15 App Router + React 19, TypeScript (strict mode), Tailwind CSS v4, Shadcn/ui, Lucide icons, TanStack Query 5, Zustand 5, React Hook Form 7 with Zod 4, TipTap 2 editors, Playwright for browser tests.
- Backend: Python 3.11, Django 4.2, Django REST Framework 3.14, `rest_framework_simplejwt`, `django-filter`, `django-cors-headers`, `Pillow` for media, `bleach` for content sanitization.
- Data & Infra: PostgreSQL 13 (Dockerized), Redis 7 for caching/session storage, local filesystem media with optional CDN toggle, Docker Compose + Nginx reverse proxy, manual VPS hosting.
- Tooling: ESLint (configured via `eslint.config.mjs`), Next lint/type checks (manually enforced due to `ignoreDuringBuilds`), `manage.py test api.tests`, `npx playwright test`, database backup automation via `docker/backup.sh`.

### Runtime Guardrails
- Catalog list/detail endpoints must cache responses for at least 60 seconds and continue using `select_related`/`prefetch_related` plus query param filtering identical to `ProductListView`.
- Frontend catalog rendering must derive filters from URL search params and push updates via `router.replace` (see `/products/page.tsx`) to keep SSR/CSR parity.
- All new fetchers must reuse `apiClient` so JWT headers, error normalization, and pagination parsing remain centralized.
- Articles and product detail pages must call the helpers in `frontend/src/lib/seo.ts` to emit JSON-LD, and all product images need `loading="lazy"` plus alt text.
- Feature flags controlling plants (`PLANTS_ENABLED`/`NEXT_PUBLIC_PLANTS_ENABLED`) must stay in sync between backend settings and `next.config.ts`, and code must read them through the typed helpers.

## Development Workflow

### Code Standards
- Use feature branches with descriptive names and conventional commits tying back to specs.
- TypeScript strict mode is already enabled; run `npm run lint` (ESLint) locally because production builds ignore lint/type errors in `next.config.ts`.
- Backend contributions must include serializer validation and DRF view tests (`python manage.py test api.tests`) for any new path, mirroring the existing catalog and admin coverage.
- Avoid direct DOM or fetch usage outside approved hooks; compose new UI from Shadcn primitives and shared components in `frontend/src/components`.

### Testing & QA
- Backend: `python manage.py test api.tests` must stay green; extend `backend/api/tests` when expanding filters, validations, or permissions.
- Frontend: `npx playwright test frontend/tests` validates catalog toggles and navigation; add specs for any new critical flow.
- Manual smoke tests include loading `/products`, `/articles`, admin dashboards, and verifying health checks after deploy.
- TanStack Query Devtools stay enabled in development to spot stale caches or leaking queries; clear `localStorage` between auth test runs to avoid token drift.

### Deployment Process
- Local dev runs through `docker/docker-compose.dev.yml` (Postgres, Redis, backend, frontend). Environment variables live in `.env` files consumed by Compose and `python-decouple`.
- Production deploys build `Dockerfile.frontend` / `Dockerfile.backend`, run migrations, execute `docker/backup.sh`, then roll out containers behind the Nginx configs supplied in `docker/`.
- Health endpoints at `/health/` must report `status: healthy` before traffic cutover; rollbacks consist of redeploying the previous Compose bundle and restoring the latest backup.
- Media uploads live under `backend/media`; when switching to CDN storage, flip `USE_CDN` and provide the required AWS variables.

## Governance

This constitution supersedes prior guidance. Every feature plan must include a Constitution Check referencing the five principles above, and merges require documented proof that backend tests and Playwright flows remain green. Amendments need explicit rationale, semantic version bumps, and an updated Sync Impact Report. Ratification stays at 2025-01-27; Last Amended updates whenever this file changes. Compliance reviews happen before deploys and must confirm: `apiClient` coverage for new requests, filters remain URL-driven, SEO helpers wrap new routes, auth/role enforcement exists on both sides, Compose manifests stay in sync with runtime infrastructure, and backups completed within policy.

**Version**: 2.0.0 | **Ratified**: 2025-01-27 | **Last Amended**: 2025-11-17
<!--
Sync Impact Report:
Version: 1.0.0 -> 2.0.0
Modified principles:
  - Performance-First -> Full-Stack Contract (Next.js + Django)
  - SEO-Optimized -> Content & SEO Source of Truth
  - Security-First -> Secure Auth & Admin Guardrails
  - Scalable Architecture -> Catalog Integrity & Filterable Data
  - API Contract Standards -> Manual VPS Delivery & Runtime Reliability
Added sections:
  - Testing & QA
Removed sections:
  - None
Templates requiring updates:
  - ✅ .specify/templates/plan-template.md (Core Principles list)
Follow-up TODOs: none
-->

# Spec E-Com Constitution

## Core Principles

### I. Full-Stack Contract (Next.js + Django)
Frontend work stays inside Next.js 15 App Router with React 19, Tailwind v4, Shadcn UI, TanStack Query 5, Zustand, React Hook Form + Zod, and TipTap editors as defined in `frontend/package.json`. All data access goes through `frontend/src/lib/api.ts` so shared auth headers, error handling, and JSON pagination semantics stay intact. Backend APIs live under `/api/` with admin-only endpoints namespaced at `/api/v1/admin/` (see `backend/config/urls.py`). New endpoints must be built with Django REST Framework, `django-filter`, serializer validation, and explicit caching or `select_related/prefetch_related` usage just like `ProductListView` and `ProductDetailView`. Any deviation from this contract (for example bypassing `apiClient` or adding untyped fetchers) is a violation because it breaks token handling, test fixtures, and the pagination data model that Playwright and React Query already rely on. Rationale: keeping a single full-stack contract avoids duplicated fetching strategies and ensures the existing admin tooling and tests continue to work without rework.

### II. Catalog Integrity & Filterable Data
`FishProduct`, `PlantCategory`, `Category`, and related models in `backend/api/models.py` define the single source of truth for the catalog. Plant inventory adds botanical metadata, CO₂ needs, light levels, hero eligibility, and feature flags (`PLANTS_ENABLED` / `NEXT_PUBLIC_PLANTS_ENABLED`) that power the plant quick-links on `/products` and the dedicated admin tables. Every product must ship with detailed care instructions, difficulty ratings, minimum tank sizes, SEO title/description fields, and image metadata that feeds both storefront cards and admin lists. The public catalog endpoints must continue to filter by search, price, categories, tank requirements, and plant attributes, and must stay cached for 60 seconds via `django.core.cache` to keep filter toggles responsive. Admin APIs enforce validation (e.g., plants require `botanical_name` and `plant_category`) and have regression tests in `backend/api/tests/test_admin_products.py`; frontend Playwright coverage in `frontend/tests/catalog/plants.spec.ts` ensures the toggles, quick-link education card, and detail routing stay intact. Rationale: customers rely on precise species data and filters; breaking these contracts corrupts both SEO and purchasing flows.

### III. Content & SEO Source of Truth
Long-form education drives traffic, so articles, categories, and featured images defined in `backend/api/models.py` plus sanitized via `bleach` in `ArticleCreateSerializer` remain mandatory. Article creation requires alt text when an image URL exists, and content is HTML-cleaned before persistence to block XSS. On the storefront, metadata lives in `frontend/src/lib/seo.ts` and powers `<Head>` usage with JSON-LD for both listings and detail pages (`buildProductListJsonLd`, `buildProductDetailJsonLd`). Product cards lazy-load images, maintain semantic headings, and surface plant helper copy; admin editors use TipTap with the same schema. New pages must emit structured data and human-readable titles/descriptions (e.g., see `/products/page.tsx`), and any new content channel must plug into the same SEO helper so schema.org output does not fork. Rationale: our organic acquisition is tied to these helpers and sanitizers; skipping them would undo proven SEO value and content safety.

### IV. Secure Auth & Admin Guardrails
Authentication is email-based via the custom `User` model and JWT tokens issued with `rest_framework_simplejwt` (rotating refresh, blacklist enabled). All profile data, addresses, orders, and admin interactions use DRF serializers plus explicit permissions such as `IsAdminOnly` and `IsAuthenticated`. Frontend state is centralized in `useAuthStore` (Zustand) and tokens are attached only through `apiClient`, so components never talk directly to `localStorage`. Media uploads (product images, featured images) must continue to flow through the validated upload paths (`ProductImageUploadView`, `validate_image_file`) with per-file checks, transactional saves, and cleanup routines to prevent orphaned files. CORS, SECRET_KEY, DB credentials, and feature flags stay in environment variables controlled by Docker Compose. Any new admin UI must enforce role checks client-side and server-side, and all sensitive endpoints must log meaningful errors while returning standardized HTTP status codes. Rationale: centralizing auth and validation keeps customer data safe and enables admin tooling without exposing superuser access.

### V. Manual VPS Delivery & Runtime Reliability
We deploy manually to a custom VPS using the Docker assets under `docker/`: Compose files spin up PostgreSQL 13, Redis 7, Django, and Next.js; Nginx configs terminate TLS, and `backup.sh` handles pg_dump snapshots plus retention cleanup. Health probes live at `/health/` (database ping + timestamp) and Compose healthchecks already call them. Redis-backed caching powers catalog responses while PostgreSQL stores transactional data; migrations must run before each deployment, and static/media assets stay under the configured storage (filesystem by default with optional CDN toggle via `USE_CDN`). When adding services or queues, they must be represented in Compose, include healthchecks, and document any new environment variables. Deploys are rejected if `docker compose` cannot come up cleanly, if healthchecks fail, or if backups have not run in the preceding 24 hours. Rationale: the project intentionally favors transparent manual deploys over opaque CI; following the documented runtime shape is what keeps production predictable.

## Technology Stack

### Required Technologies
- Frontend: Next.js 15 App Router + React 19, TypeScript (strict mode), Tailwind CSS v4, Shadcn/ui, Lucide icons, TanStack Query 5, Zustand 5, React Hook Form 7 with Zod 4, TipTap 2 editors, Playwright for browser tests.
- Backend: Python 3.11, Django 4.2, Django REST Framework 3.14, `rest_framework_simplejwt`, `django-filter`, `django-cors-headers`, `Pillow` for media, `bleach` for content sanitization.
- Data & Infra: PostgreSQL 13 (Dockerized), Redis 7 for caching/session storage, local filesystem media with optional CDN toggle, Docker Compose + Nginx reverse proxy, manual VPS hosting.
- Tooling: ESLint (configured via `eslint.config.mjs`), Next lint/type checks (manually enforced due to `ignoreDuringBuilds`), `manage.py test api.tests`, `npx playwright test`, database backup automation via `docker/backup.sh`.

### Runtime Guardrails
- Catalog list/detail endpoints must cache responses for at least 60 seconds and continue using `select_related`/`prefetch_related` plus query param filtering identical to `ProductListView`.
- Frontend catalog rendering must derive filters from URL search params and push updates via `router.replace` (see `/products/page.tsx`) to keep SSR/CSR parity.
- All new fetchers must reuse `apiClient` so JWT headers, error normalization, and pagination parsing remain centralized.
- Articles and product detail pages must call the helpers in `frontend/src/lib/seo.ts` to emit JSON-LD, and all product images need `loading="lazy"` plus alt text.
- Feature flags controlling plants (`PLANTS_ENABLED`/`NEXT_PUBLIC_PLANTS_ENABLED`) must stay in sync between backend settings and `next.config.ts`, and code must read them through the typed helpers.

## Development Workflow

### Code Standards
- Use feature branches with descriptive names and conventional commits tying back to specs.
- TypeScript strict mode is already enabled; run `npm run lint` (ESLint) locally because production builds ignore lint/type errors in `next.config.ts`.
- Backend contributions must include serializer validation and DRF view tests (`python manage.py test api.tests`) for any new path, mirroring the existing catalog and admin coverage.
- Avoid direct DOM or fetch usage outside approved hooks; compose new UI from Shadcn primitives and shared components in `frontend/src/components`.

### Testing & QA
- Backend: `python manage.py test api.tests` must stay green; extend `backend/api/tests` when expanding filters, validations, or permissions.
- Frontend: `npx playwright test frontend/tests` validates catalog toggles and navigation; add specs for any new critical flow.
- Manual smoke tests include loading `/products`, `/articles`, admin dashboards, and verifying health checks after deploy.
- TanStack Query Devtools stay enabled in development to spot stale caches or leaking queries; clear `localStorage` between auth test runs to avoid token drift.

### Deployment Process
- Local dev runs through `docker/docker-compose.dev.yml` (Postgres, Redis, backend, frontend). Environment variables live in `.env` files consumed by Compose and `python-decouple`.
- Production deploys build `Dockerfile.frontend` / `Dockerfile.backend`, run migrations, execute `docker/backup.sh`, then roll out containers behind the Nginx configs supplied in `docker/`.
- Health endpoints at `/health/` must report `status: healthy` before traffic cutover; rollbacks consist of redeploying the previous Compose bundle and restoring the latest backup.
- Media uploads live under `backend/media`; when switching to CDN storage, flip `USE_CDN` and provide the required AWS variables.

## Governance

This constitution supersedes prior guidance. Every feature plan must include a Constitution Check referencing the five principles above, and merges require documented proof that backend tests and Playwright flows remain green. Amendments need explicit rationale, semantic version bumps, and an updated Sync Impact Report. Ratification stays at 2025-01-27; Last Amended updates whenever this file changes. Compliance reviews happen before deploys and must confirm: `apiClient` coverage for new requests, filters remain URL-driven, SEO helpers wrap new routes, auth/role enforcement exists on both sides, Compose manifests stay in sync with runtime infrastructure, and backups completed within policy.

**Version**: 2.0.0 | **Ratified**: 2025-01-27 | **Last Amended**: 2025-11-17

