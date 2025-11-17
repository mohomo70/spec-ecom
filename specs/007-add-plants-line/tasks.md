# Tasks: Aquarium Plant Product Line

**Input**: Design documents from `/specs/007-add-plants-line/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Enable feature flags, seed data, and config parity so plant work mirrors existing UX.

- [x] T001 Add `PLANTS_ENABLED` env flag and `PRODUCT_TYPES` tuple in `backend/config/settings.py` with defaults in `backend/.env.example`.
- [x] T002 [P] Propagate `PLANTS_ENABLED` flag to the frontend by updating `frontend/next.config.ts` and exposing it through `frontend/src/lib/api.ts`.
- [x] T003 Create reusable seed command `backend/api/management/commands/seed_plants.py` plus `backend/api/fixtures/plant_categories.json` with carpeting/sword/stem defaults referenced in quickstart.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database, serializers, and shared DTO updates required before any story work.

- [x] T004 Extend `backend/api/models.py` Product definition with `product_type` enum and embedded plant attribute fields aligned to `data-model.md`.
- [x] T005 Generate migration `backend/api/migrations/00xx_add_plants_models.py` covering Product changes and the new PlantCategory table.
- [x] T006 Update `backend/api/admin.py` to register PlantCategory and expose product_type filters for Product admin listings.
- [x] T007 Expand `backend/api/serializers/admin.py` and `backend/api/serializers/products.py` to validate plant attributes and serialize plant category metadata.
- [x] T008 Refresh `backend/api/views/products.py` caching/filter helpers so list/detail endpoints honor `product_type` and category filters with Redis tags for plants.
- [x] T009 Update shared TypeScript DTOs in `frontend/src/lib/api/admin.ts` and `frontend/src/lib/api.ts` to include `product_type`, plant attributes, and hero eligibility fields.
- [x] T010 Ensure plant products reuse pricing/inventory pipelines by extending `backend/api/services/orders.py`, checkout serializers, and regression tests in `backend/api/tests/test_checkout.py`.

**Checkpoint**: Plant-aware data model and shared DTOs are ready; user stories can start.

---

## Phase 3: User Story 1 – Admin manages plant catalog (Priority: P1) 🎯 MVP

**Goal**: Allow admins to create/manage plant categories and products with the same UX as fish management.

**Independent Test**: Using the admin UI, create carpeting/sword/stem categories, add a plant product with care data, and confirm it persists plus appears via admin preview APIs without touching storefront.

### Implementation

- [x] T011 [US1] Implement PlantCategory CRUD endpoints in `backend/api/views/admin.py` and register routes in `backend/api/urls/admin.py`.
- [x] T012 [P] [US1] Extend admin product endpoints in `backend/api/views/products.py` to upsert plant-specific fields, hero eligibility, and category assignments.
- [x] T013 [US1] Add DRF test coverage for plant admin flows in `backend/api/tests/test_admin_products.py` covering category CRUD + product validation.
- [x] T014 [P] [US1] Update `frontend/src/lib/api/admin.ts` mutations to send plant attributes and fetch `product_type` filtered listings.
- [x] T015 [P] [US1] Enhance `frontend/src/components/admin/ProductForm.tsx` to show plant-specific inputs, validation, and preview copy while matching existing styling.
- [x] T016 [US1] Update `frontend/src/components/admin/ProductTable.tsx` and `frontend/src/app/admin/products/page.tsx` with `product_type` filters, plant columns, and category badges.
- [x] T017 [US1] Build a plant category management view at `frontend/src/app/admin/plant-categories/page.tsx` reusing the fish admin table patterns.
- [x] T018 [US1] Block deletion/archiving of PlantCategory records in `backend/api/views/admin.py` when products reference them and return descriptive errors.
- [x] T019 [US1] Surface category-delete warnings in `frontend/src/components/admin/ProductTable.tsx`/`plant-categories/page.tsx` with disables + toast messaging.
- [ ] T020 [US1] Add Playwright coverage `frontend/tests/admin/plants.spec.ts` for CRUD plus guarded delete scenarios.

**Checkpoint**: Admins can fully manage plant catalog data and verify via automated tests.

---

## Phase 4: User Story 2 – Homepage quick links feature plants (Priority: P2)

**Goal**: Display a fifth “Plants” quick-link card beside Species, Fish Care, and Aquascaping tiles while retaining optional hero support for future campaigns.

**Independent Test**: Enable the Plants card and confirm the quick-link rail shows five evenly spaced cards on desktop and wraps gracefully on mobile; disable the flag and confirm it falls back to the original four cards without layout shifts.

- [ ] T021 [US2] Extend homepage quick-link configuration (CMS or `frontend/src/app/page.tsx` constants) to add a Plants card with label, icon, description, and CTA to `/products?product_type=plant`.
- [ ] T022 [P] [US2] Update `frontend/src/app/page.tsx` quick-link section to support five cards, responsive wrapping, and hover states identical to existing cards.
- [ ] T023 [US2] Add analytics tracking for `quicklink.plants.click` in `frontend/src/lib/analytics.ts`.
- [ ] T024 [US2] Create Playwright regression `frontend/tests/home/quicklinks-plants.spec.ts` to snapshot desktop/mobile layouts and navigation for the Plants card.
- [ ] T025 [US2] Document quick-link enablement flag (`ENABLE_PLANTS_QUICK_LINK`) and fallback behavior in `specs/007-add-plants-line/quickstart.md`.
- [ ] T026 [US2] (Optional hero) Extend hero slot model/serializer in `backend/api/models.py` and `backend/api/serializers/marketing.py` with `variant=plant`, featured product reference, and fallback collection slug.
- [ ] T027 [US2] (Optional hero) Add `/api/v1/homepage/heroes` controller updates plus Playwright regression `frontend/tests/home/hero-plants.spec.ts` to verify hero parity when enabled.

---

## Phase 5: User Story 3 – Shoppers browse plant categories (Priority: P3)

**Goal**: Let shoppers filter catalog pages by plant categories, view plant detail pages with care info, and add to cart using existing flows.

**Independent Test**: Visit `/products?product_type=plant`, filter by category, open a plant PDP, verify care sections, and add to cart successfully.

- [ ] T028 [US3] Add `product_type` and `category` filter handling plus plant attribute serialization to `/api/v1/catalog/products` + detail endpoints in `backend/api/views/products.py`.
- [ ] T029 [P] [US3] Expand catalog contract + tests in `backend/api/tests/test_catalog_products.py` to cover plant filters and stock gating.
- [ ] T030 [US3] Update `frontend/src/app/products/page.tsx` to surface plant/fish toggle, category chips, hero-style cards for plants, and highlight the Plants quick-link destination.
- [ ] T031 [P] [US3] Enhance `frontend/src/lib/api/products.ts` with hooks that request plant attributes and cache responses via TanStack Query keys.
- [ ] T032 [US3] Refresh `frontend/src/app/products/[id]/page.tsx` to show care requirements, compatibility, hero eligibility badges, and CTA parity without diverging from fish layout.
- [ ] T033 [US3] Add Playwright journey `frontend/tests/catalog/plants.spec.ts` covering filter + PDP view + add-to-cart flow.
- [ ] T034 [US3] Hide add-to-cart buttons and replace with educational messaging in listing + PDP components when plant inventory hits zero.
- [ ] T035 [US3] Add SEO metadata + JSON-LD for plant listing and PDP pages via `frontend/src/app/products/page.tsx`, `[id]/page.tsx`, and `frontend/src/lib/seo.ts`.

**Checkpoint**: Shoppers can self-serve plant catalog pages with the same UX as fish products.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final documentation, analytics, and resilience tasks spanning all stories.

- [ ] T036 [P] Document updated quickstart + rollout guidance in `specs/007-add-plants-line/quickstart.md`, including hero fallback steps and analytics dashboards.
- [ ] T037 Add hero + catalog analytics wiring in `frontend/src/lib/analytics.ts` to emit `hero.plant.click` and `catalog.plant.filter` events.
- [ ] T038 [P] Run Lighthouse + performance validations recorded in `frontend/tests/perf/homepage.lighthouse.mjs` ensuring hero render stays ≤1s.
- [ ] T039 Harden Redis cache keys + invalidation scripts in `backend/api/management/commands/cache_clear.py` for plant endpoints.
- [ ] T040 Instrument admin workflow timing (SC-001) by logging CRUD session durations in `frontend/src/lib/analytics.ts` and `backend/api/views/admin.py`.
- [ ] T041 Add bounce-rate dashboards (SC-004) via analytics queries or Looker config referencing plant listing routes documented in `docs/analytics/plant-dashboard.md`.

---

## Dependencies & Execution Order

- **Phase Dependencies**: Setup → Foundational → (US1, US2, US3 in order of priority) → Polish.
- **User Story Dependencies**: US1 (admin data) must finish before US2/US3 consume plant catalog outputs; US2 and US3 can proceed in parallel once US1 exposes stable data.
- **Task Dependencies**:
  - T004 depends on T001–T003 (config + seeds).
  - T005 depends on T004.
  - T007–T010 depend on T004/T005.
  - US1 tasks (T011–T020) depend on Foundational completion.
  - US2 tasks (T021–T027) depend on US1 (hero-eligible products) plus Foundational.
  - US3 tasks (T028–T035) depend on US1 + Foundational to ensure catalog data exists.
  - Polish tasks (T036–T041) depend on all user stories.

---

## Parallel Execution Examples

### User Story 1
```text
Parallel models/API work:
  - T011 backend PlantCategory endpoints
  - T014 frontend admin API client updates
  - T015 admin ProductForm UX changes
```

### User Story 2
```text
Parallel hero enhancements:
  - T021 backend hero model/serializer
  - T025 frontend hero data hook
  - T026 homepage hero rendering
```

### User Story 3
```text
Parallel shopper flows:
  - T028 backend catalog filter logic
  - T030 listing page filters
  - T032 PDP care section updates
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phases 1–2.
2. Deliver US1 (admin CRUD) and validate via Playwright + DRF tests.
3. Release admin-only beta while storefront still fish-only.

### Incremental Delivery
1. After MVP, add US2 hero to drive awareness.
2. Follow with US3 to expose complete shopper journey.
3. Run quickstart + analytics checks after each increment.

### Parallel Team Strategy
1. Shared team tackles Setup + Foundational.
2. Assign US1 to backend-heavy dev, US2 to marketing/frontend dev, US3 to storefront dev once foundations land.
3. Use parallel tasks flagged [P] to avoid blocking (e.g., frontend hooks vs backend endpoints).

---

## Task Summary

- **Total tasks**: 41
- **Per User Story**:
  - US1: 10 tasks
  - US2: 7 tasks
  - US3: 8 tasks
- **Parallel Opportunities**: T002, T012, T014, T015, T022, T025, T029, T031, T036, T038 are flagged [P] for concurrent work.
- **Independent Tests**:
  - US1: Admin creates/edits plant catalog entries end-to-end.
  - US2: Plant hero renders + falls back when product unavailable.
  - US3: Shopper filters + views plant PDP + adds to cart while respecting SEO + zero-stock guards.
- **MVP Scope**: Complete through Phase 3 (US1) to unlock admin data entry while keeping shopper experience unchanged until later phases.

