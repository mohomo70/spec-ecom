# Implementation Plan: Aquarium Plant Product Line

**Branch**: `[007-add-plants-line]` | **Date**: 2025-11-17 | **Spec**: `/specs/007-add-plants-line/spec.md`
**Input**: Feature specification from `/specs/007-add-plants-line/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Introduce aquarium plants as a first-class catalog line by extending the existing product model with a `product_type` flag, seeding plant categories, exposing admin CRUD, updating catalog UI, adding a fifth “Plants” quick-link card on the homepage rail, and keeping UX identical to current fish flows so future product types (e.g., accessories) can plug into the same experience while still supporting an optional plant-focused hero variant.

## Technical Context

**Language/Version**: Python 3.11 (backend), TypeScript/Next.js 15 (frontend)  
**Primary Dependencies**: Django REST Framework, PostgreSQL, Redis, Next.js App Router, Tailwind CSS, Shadcn/ui, Zustand, TanStack Query, React Hook Form + Zod  
**Storage**: PostgreSQL for canonical product/category data; Redis caching for catalog endpoints and sessions  
**Testing**: pytest + DRF APIClient for backend, Playwright & React Testing Library for frontend regression plus Storybook visual checks  
**Target Platform**: Dockerized Linux services deployed on VPS behind Nginx/SSL  
**Project Type**: Web application (separate frontend + backend services)  
**Performance Goals**: Page load <2s, hero perceived render ≤1s, API p95 <200ms, DB reads <50ms, cache hit rate >80% on blended product endpoints  
**Constraints**: Plant UI must reuse existing components/layout tokens; maintain SEO metadata + product schema; no new auth flows; preserve accessibility + responsive rules established for fish catalog  
**Scale/Scope**: Catalog must handle mixed product inventory in tens of thousands of SKUs, homepage hero traffic for entire user base, and admin workflows for multiple merchants

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance (Post-Design)

- **Performance-First**: PASS – indexed `product_type`, cache-aware list/detail endpoints, lightweight quick-link config, and shared hero component keep Core Web Vitals within targets.
- **SEO-Optimized**: PASS – plant listings, PDPs, and the new homepage Plants card reuse semantic markup, metadata, and JSON-LD patterns from existing cards.
- **Security-First**: PASS – no new auth surface; admin CRUD and quick-link toggles reuse existing permissions, and all inputs validated via current schemas.
- **Scalable Architecture**: PASS – unified product model plus configurable homepage modules avoid new services while remaining extensible.
- **API Contract Standards**: PASS – documented `/api/v1/catalog/plants`, admin endpoints, and hero APIs follow REST conventions with pagination, filtering, and OpenAPI coverage (quick-link rail uses existing CMS/config).

### Design Artifacts Quality Check

- **Data Model**: PASS – `data-model.md` enumerates Product extensions, PlantCategory schema, hero relationships, quick-link configuration metadata, and validation/state rules.
- **API Contracts**: PASS – `contracts/catalog-openapi.yaml` documents admin + shopper endpoints plus schemas for hero configuration (quick-link cards reuse frontend config).
- **Quickstart Guide**: PASS – `quickstart.md` describes prerequisites, migrations, seeding scripts, env flags, quick-link toggle guidance, and parity testing steps.
- **Research Findings**: PASS – `research.md` records chosen architecture for unified product model, UI parity (quick-links + hero), and caching/measurement.

### Final Constitution Compliance Status

**OVERALL STATUS**: FULLY COMPLIANT

Design adheres to every constitutional pillar and documents deliverables needed for planning handoff.

## Project Structure

### Documentation (this feature)

```text
specs/007-add-plants-line/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md             # created by /speckit.tasks
```

### Source Code (repository root)

```text
backend/
├── api/
│   ├── serializers/
│   ├── views/
│   ├── urls.py
│   └── tests/
├── models/
├── services/
└── settings.py

frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   └── admin/
│   ├── components/
│   │   └── admin/
│   ├── lib/
│   └── styles/
└── tests/
```

**Structure Decision**: Existing dual-service web app; this feature updates both `backend/` (models, serializers, views) and `frontend/src/app` plus shared UI components to maintain UX parity.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| _None_ | – | – |
