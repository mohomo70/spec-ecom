# Research Log – Aquarium Plant Product Line

## Decision 1: Unified product model with `product_type`
- **Decision**: Extend existing Product table record with a `product_type` enum (`fish`, `plant`, later `accessory`) and plant-specific attribute columns.
- **Rationale**: Preserves identical admin/UI flows, leverages current inventory/checkout logic, and avoids cross-table joins; future categories only add attribute groups.
- **Alternatives considered**: Separate `PlantProduct` table (adds duplicate serializers + migrations); polymorphic tables (heavier joins, inconsistent admin forms).

## Decision 2: UI parity via shared components
- **Decision**: Reuse existing fish catalog components (cards, detail layout, quick-link rail, optional hero) by feeding plant content and adjusting copy via config rather than building new widgets.
- **Rationale**: Guarantees same UX/visual style requested by user, reduces CSS drift, and minimizes accessibility/SEO revalidation; adding a fifth card is purely config-driven.
- **Alternatives considered**: New plant-specific component set (risks inconsistent UX); bespoke hero layout (larger design effort without added value).

## Decision 3: Cache + analytics strategy
- **Decision**: Keep TanStack Query caching + Redis-backed API caching for mixed catalog endpoints, tagging analytics events to distinguish plant hero interactions and clicks on the new Plants quick-link card.
- **Rationale**: Meets performance KPIs without extra infra; instrumentation enables success metrics and SC-004 monitoring.
- **Alternatives considered**: Dedicated plant cache namespace (unnecessary complexity now); client-side only analytics (misses backend attribution).

