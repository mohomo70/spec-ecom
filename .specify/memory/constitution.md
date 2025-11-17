<!--
Sync Impact Report:
Version: 2.0.0 -> 2.1.0
Modified principles:
  - Full-Stack Contract (Next.js + Django)
  - Catalog Integrity & Filterable Data
  - Content & SEO Source of Truth
  - Secure Auth & Admin Guardrails
  - Manual VPS Delivery & Runtime Reliability
Added sections:
  - None
Removed sections:
  - None
Templates requiring updates:
  - ✅ /home/envy/project/spec-ecom/.specify/templates/plan-template.md (Core Principles list)
Follow-up TODOs: none
-->

# Spec E-Com Constitution

## Core Principles

### I. Full-Stack Contract (Next.js + Django)
Frontend work stays inside the Next.js 15 App Router with React 19, TypeScript strict mode, Tailwind CSS v4, Shadcn UI primitives, Lucide icons, TanStack Query 5 (plus Devtools), Zustand in `frontend/src/lib/stores/auth.ts`, React Hook Form 7 with Zod 4, and the TipTap editor in `frontend/src/components/articles/RichTextEditor.tsx`. `frontend/src/components/providers.tsx` owns a single `QueryClient` (5-minute stale time, one retry), so every new hook must compose the shared client. All data access flows through `frontend/src/lib/api.ts` or the typed extensions in `frontend/src/lib/api/admin.ts`, which set the `NEXT_PUBLIC_API_URL` base path, JSON body handling, error normalization, and `Authorization` headers sourced from `localStorage`. Backend APIs remain organized under `/api/` (auth, catalog, categories, orders, addresses, articles) with admin-only surfaces namespaced at `/api/v1/admin/` as defined in `backend/api/urls.py`. New endpoints must use Django REST Framework 3.14 with `django-filter`, serializers, and `select_related()/prefetch_related()` patterns that match `ProductListView` and `ProductDetailView` in `backend/api/views/products.py`. A fetcher that bypasses `apiClient` or a DRF view that omits serializers/pagination is non-compliant because it fractures auth, error handling, caching, and the assumptions built into React Query hooks and admin tables. Rationale: one full-stack contract keeps tokens, pagination, and test fixtures stable across teams.

### II. Catalog Integrity & Filterable Data
`FishProduct`, `Category`, `PlantCategory`, and `ProductImage` in `backend/api/models.py` are the single source of truth for inventory. Plant records carry botanical names, light/CO₂ needs, substrate notes, hero eligibility, and feature flags. `PLANTS_ENABLED` in `backend/config/settings.py` and `NEXT_PUBLIC_PLANTS_ENABLED` in `frontend/next.config.ts` must stay aligned; `OrderCreateSerializer` enforces the backend flag even if UI toggles disagree. `ProductListView` exposes search, product type, fish and plant category slugs, difficulty, price, tank size, pH, temperature, diet, and max size filters while caching every response for 60 seconds and filtering `is_available` SKUs only. Plant categories live at `/api/products/plant-categories/` and power the `usePlantCategories` hook in `frontend/src/lib/api/products.ts`; storefront catalog pages (`frontend/src/app/products/page.tsx`) mirror every filter in `URLSearchParams` via `router.replace` so SSR/CSR stay in sync. Admin flows must continue to rely on `frontend/src/lib/api/admin.ts` for listing, editing, and uploading images through `ProductImageUploadView`, which uses `validate_image_file` plus transactional saves and cleanup. Regression tests in `backend/api/tests/test_catalog_products.py` and `test_admin_products.py` plus the Playwright suite at `frontend/tests/catalog/plants.spec.ts` are mandatory when catalog behavior changes. Rationale: accurate filters, hero content, and validation prevent duplicate species data and keep shoppers, SEO, and admin tooling aligned.

### III. Content & SEO Source of Truth
Articles, education cards, and structured product data must flow through the existing sanitization and SEO helpers. `ArticleCreateSerializer` cleans HTML with `bleach`, enforces featured-image alt text, and auto-populates meta titles/descriptions, while authors edit through the TipTap-based `RichTextEditor`. Product and article listings call `buildProductListingMeta`/`buildProductListJsonLd`, and detail views call `buildProductDetailMeta`/`buildProductDetailJsonLd` from `frontend/src/lib/seo.ts` (see `frontend/src/app/products/page.tsx` and `[id]/page.tsx`). Cards lazy-load images, keep semantic headings, and surface helper copy for plants. Any new content surface must reuse the same helpers and sanitization rules—introducing alternate schema generators or unsanitized HTML invalidates SEO guarantees and reopens XSS vectors. Rationale: organic acquisition depends on consistent metadata, and the sanitizers are the only thing standing between TipTap HTML and the public site.

### IV. Secure Auth & Admin Guardrails
Auth is anchored by the custom `User` model (`backend/api/models.py`) and `rest_framework_simplejwt` with rotating refresh tokens, blacklist enforcement, and JWT authentication configured in `backend/config/settings.py`. `backend/api/views/auth.py` handles register/login/me/logout using `AuthProfileSerializer`, and all profile/address/order endpoints rely on DRF serializers plus permissions such as `IsAuthenticated` or `IsAdminOnly`. Frontend login and registration flows (`frontend/src/app/(auth)/login/page.tsx`, `/register`) write tokens to `localStorage`, hydrate `useAuthStore`, and let `apiClient` attach headers; other components only call the store or `apiClient`/`AdminApiClient` helpers, never `localStorage` directly. Admin APIs stay under `/api/v1/admin/` and are consumed exclusively through `frontend/src/lib/api/admin.ts`, which standardizes conflict detection, pagination, and file uploads (the only sanctioned direct `fetch`). Image uploads must pass through `ProductImageUploadView`, `validate_image_file`, and the cleanup routines already in place. Sensitive code must log meaningful errors and return explicit HTTP status codes on both the Django and React sides. Rationale: centralizing token handling and admin gates keeps customer data contained and prevents regressions that leak privileged endpoints.

### V. Manual VPS Delivery & Runtime Reliability
Deployments are manual to the VPS using the assets under `docker/`. `docker/docker-compose.prod.yml` stands up PostgreSQL 13, Redis 7 (reserved for future cache work), the Django backend, Next.js frontend, and Nginx with healthchecks that call `/health/` and container-level `curl` probes. `docker/backup.sh` performs `pg_dump`, compression, verification, retention cleanup, and optional notifications—production deployments run it (and migrations) before rolling out new containers. Because Redis is not yet wired into Django (`django-redis` is not configured), caches default to Django’s per-process backend; do not assume cross-process caching until settings change. `next.config.ts` intentionally ignores lint/type failures, so `npm run lint`, `npm run build`, and `python manage.py test api.tests` must be run locally before pushing. Environment variables (notably `PLANTS_ENABLED`, `NEXT_PUBLIC_API_URL`, DB credentials, CDN flags) live in the Compose `.env` files and must remain consistent across backend and frontend containers. Adding services or queues demands Compose definitions, healthchecks, documented env vars, and updated backup/restore procedures. Deploys are blocked if Compose fails to start, `/health/` is unhealthy, Playwright tests regress, or the latest verified backup is older than 24 hours. Rationale: manual releases make runtime state explicit, but only if every change documents its container footprint and recovery path.

## Technology Stack

### Required Technologies
- Frontend: Next.js 15 App Router + React 19, TypeScript (strict), Tailwind CSS v4, Shadcn/ui, Lucide icons, TanStack Query 5 + Devtools, Zustand 5, React Hook Form 7 with Zod 4, TipTap 2 editors, Playwright (`frontend/tests`) for browser flows.
- Backend: Python 3.11, Django 4.2, Django REST Framework 3.14, `rest_framework_simplejwt`, `django-filter`, `django-cors-headers`, `Pillow`, `bleach`, `python-decouple`, PostgreSQL driver (`psycopg2-binary`).
- Data & Infra: PostgreSQL 13 via Docker Compose, Redis 7 container (reserved for future caching), local filesystem media with optional CDN toggle via `USE_CDN`, Nginx reverse proxy, manual VPS hosting, `docker/backup.sh` for database retention.
- Tooling: ESLint (`eslint.config.mjs`), Tailwind/PostCSS v4, `next.config.ts` (lint/type ignores demand manual enforcement), `python manage.py test api.tests`, `npx playwright test`, `docker compose` workflows for dev/prod.

### Runtime Guardrails
- `backend/api/views/products.py` must keep `select_related`/`prefetch_related` usage and 60-second caching; any new filters use the same query param names to keep React Query hooks stable.
- `frontend/src/app/products/page.tsx` (and any replacements) must derive filters from `URLSearchParams` and write via `router.replace` to maintain SSR/CSR parity and tracking.
- All new fetchers (user, catalog, admin, content) must call `apiClient` or `AdminApiClient`; direct `fetch` is only allowed inside the existing admin image upload helper.
- Product and article pages must call the SEO helpers in `frontend/src/lib/seo.ts` and keep `<img>` tags lazily loaded with alt text sourced from the data model.
- Feature flags (`PLANTS_ENABLED` / `NEXT_PUBLIC_PLANTS_ENABLED`) stay in sync between settings, `next.config.ts`, and React helpers; backend enforcement (`OrderCreateSerializer`) is the source of truth.

## Development Workflow

### Code Standards
- Use feature branches with descriptive names and conventional commits tied to `/specs`.
- Run `npm run lint` and `npm run build` locally because `next.config.ts` disables build-time lint/type enforcement; address eslint and tsc output before merging.
- Backend work must add serializer validation plus DRF tests (`python manage.py test api.tests`) that mirror catalog/admin patterns.
- Compose UI from Shadcn primitives and shared components in `frontend/src/components`; avoid bespoke DOM manipulation or standalone `fetch` calls.

### Testing & QA
- Backend: `python manage.py test api.tests` must remain green; extend `backend/api/tests` whenever filters, permissions, or serializers change.
- Frontend: `npx playwright test frontend/tests` exercises catalog toggles, detail navigation, and helper cards; add specs for new high-value flows and run them before deploys.
- Manual smoke tests cover `/products`, `/articles`, `/products/[id]`, admin dashboards, and `/health/` after each deploy.
- During local QA keep TanStack Query Devtools enabled (default) and clear `localStorage` between auth mutations to avoid token drift.

### Deployment Process
- Local dev uses `docker/docker-compose.dev.yml` for Postgres, Redis, backend, and frontend; `.env` files feed both Django (`python-decouple`) and Next.js.
- Production deploys build `docker/Dockerfile.backend` and `docker/Dockerfile.frontend`, run migrations, execute `docker/backup.sh`, then roll forward with `docker-compose.prod.yml` behind the provided Nginx configs.
- Health endpoints at `/health/` must report `status: healthy` before traffic cutover; rollbacks redeploy the previous Compose bundle and restore the most recent verified backup.
- Media lives under `backend/media`. Switching to CDN storage requires setting `USE_CDN`, wiring the storage backend, and documenting required env vars before shipping.

## Governance

This constitution supersedes prior guidance. Every plan produced from `/speckit.plan` must include a Constitution Check referencing these five principles, and merges require proof that `python manage.py test api.tests` and `npx playwright test frontend/tests` passed. Amendments need explicit rationale, a semantic version bump, and an updated Sync Impact Report. Ratification stays at 2025-01-27; Last Amended updates whenever this file changes. Compliance reviews before deployment must confirm: all new requests route through `apiClient`/`AdminApiClient`, catalog filters remain URL-driven, SEO helpers wrap new routes, auth/role enforcement exists client + server-side, Compose manifests and `.env` files reflect runtime changes, `/health/` is green, and the latest `docker/backup.sh` artifact is <24 hours old.

**Version**: 2.1.0 | **Ratified**: 2025-01-27 | **Last Amended**: 2025-11-17
