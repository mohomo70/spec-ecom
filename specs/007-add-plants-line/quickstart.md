# Quickstart – Aquarium Plant Product Line

## Prerequisites
1. Docker + Docker Compose installed.
2. `.env` files updated with `PRODUCT_TYPES=fish,plant`, feature flag `ENABLE_PLANTS=1`, and homepage config `ENABLE_PLANTS_QUICK_LINK=1`.
3. AWS S3/Cloudinary credentials for plant imagery already configured (same bucket as fish assets).

## Setup Steps
1. **Install deps**
   ```bash
   cd /home/envy/project/spec-ecom
   pnpm install
   pip install -r backend/requirements.txt
   ```
2. **Run migrations + seed categories**
   ```bash
   docker compose up -d db redis
   python backend/manage.py migrate
   python backend/manage.py loaddata fixtures/plant_categories.json
   ```
3. **Start services**
   ```bash
   docker compose up backend frontend
   ```
4. **Seed plant data**
   ```bash
   python backend/manage.py seed_plants
   # optionally add --sample-products once PlantProduct model is available
   ```

## Verification Checklist
- Visit `http://localhost:3000/admin/products`, filter `product_type=plant`, confirm CRUD works and UI matches fish experience.
- Hit `GET /api/v1/catalog/products?product_type=plant` and verify response cached (Redis key `catalog:plant:list`).
- Load homepage, confirm quick-link rail now shows five cards (Plants routes to `/products?product_type=plant`) and responsive wrapping works.
- Load homepage hero; toggle featured product availability and ensure fallback CTA renders (if hero variant enabled).
- Run automated tests:
  ```bash
  pytest backend
  pnpm test
  pnpm test:e2e
  ```

## Rollout Notes
- Launch behind feature flags `plants.enabled` and `plants.quick_link.enabled`; enable once plant catalog populated.
- Configure analytics dashboard to watch `hero.plants.click_through_rate` and `quicklink.plants.ctr` KPIs.
- Update sitemap + structured data via existing generation script (`pnpm sitemap:build`).

