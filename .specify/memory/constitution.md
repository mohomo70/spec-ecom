<!--
Sync Impact Report:
Version: 1.0.0 (new)
Modified principles: none (new constitution)
Added: Performance-First, SEO-Optimized, Security-First, Scalable Architecture, API Contract Standards
Removed: none
Templates requiring updates:
  - ✅ .specify/templates/plan-template.md - Constitution Check section references updated
  - ✅ .specify/templates/spec-template.md - compliant with no changes needed
  - ✅ .specify/templates/tasks-template.md - compliant with no changes needed
Follow-up TODOs: none
-->

# Freshwater Fish Ecommerce Constitution

## Core Principles

### I. Performance-First
All features must prioritize performance from the start. Page loads under 2 seconds, API responses under 200ms, database queries optimized with proper indexing. Lazy loading, code splitting, and Redis caching are mandatory. No premature optimization; every performance decision must be measured and justified. Core Web Vitals (LCP, FID, CLS) must score 90+ on Google PageSpeed.

### II. SEO-Optimized
Every page requires unique, descriptive metadata. Structured data (JSON-LD) for products, semantic HTML, and mobile-first responsive design. Dynamic sitemap generation, canonical URLs, image alt attributes, and meaningful URL structures. Robots.txt and schema.org markup for all content types. Open Graph and Twitter Card metadata for social sharing.

### III. Security-First
JWT authentication with refresh tokens, HTTPS-only in production, CORS properly configured, input validation on both frontend and backend. SQL injection prevention through Django ORM, XSS protection, rate limiting on API endpoints. Environment variables for sensitive data, password hashing, secure session management. Regular dependency updates and security audits.

### IV. Scalable Architecture
Separation of frontend (Next.js) and backend (Django REST Framework) as independent services. PostgreSQL for transactional data, Redis for caching and session storage. Microservices-ready structure with clear API boundaries. Horizontal scaling support through stateless backend design. Database queries optimized with proper indexing, eager loading for N+1 problem prevention.

### V. API Contract Standards
RESTful API design with consistent `/api/v1/` prefix. Versioned endpoints, comprehensive error handling with meaningful messages. OpenAPI documentation for all endpoints. Request/response validation through serializers. Standardized HTTP status codes, pagination for list endpoints, filtering and searching capabilities.

## Technology Stack

### Required Technologies
- Frontend: Next.js 15 (App Router), TypeScript, Tailwind CSS, Shadcn/ui
- Backend: Django REST Framework, Python 3.11+
- Database: PostgreSQL with proper indexing
- Caching: Redis for sessions and API response caching
- State Management: Zustand for client state, TanStack Query for server state
- Forms: React Hook Form with Zod validation
- Deployment: Docker, Nginx, manual VPS deployment

### Performance Requirements
- Page load: <2 seconds
- API response: <200ms (p95)
- Database queries: indexed, <50ms for read operations
- Cache hit rate: >80% for frequently accessed data
- Uptime: 99.9%
- Google PageSpeed: 90+ score

## Development Workflow

### Code Standards
- TypeScript strict mode enabled
- ESLint for code quality
- Prettier for consistent formatting
- Git conventions with clear commit messages
- Feature branches with descriptive names

### Deployment Process
- Docker Compose for local development
- Manual deployment to custom VPS
- Nginx as reverse proxy with SSL
- Environment-specific configuration
- Database migrations before deployment
- Static asset optimization and CDN-ready

## Governance

This constitution supersedes all other practices and guidelines. Amendments require documentation, team approval, and version tracking. All development must verify compliance with these principles before merge. Performance and SEO requirements are non-negotiable for production releases. Security vulnerabilities must be addressed immediately.

**Version**: 1.0.0 | **Ratified**: 2025-01-27 | **Last Amended**: 2025-01-27
