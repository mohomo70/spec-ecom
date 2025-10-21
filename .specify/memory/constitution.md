# Freshwater Aquarium Fish Ecommerce Constitution
<!-- Example: Spec Constitution, TaskFlow Constitution, etc. -->

## Core Principles

### Performance-First
<!-- Example: I. Library-First -->
All code and features must prioritize performance; Implement efficient algorithms, lazy loading, caching, and optimization techniques to ensure fast load times and smooth user experience.
<!-- Example: Every feature starts as a standalone library; Libraries must be self-contained, independently testable, documented; Clear purpose required - no organizational-only libraries -->

### SEO-Optimized
<!-- Example: II. CLI Interface -->
Every page and feature must implement best SEO practices; Use semantic HTML, structured data, meta tags, fast loading, and mobile-first design to maximize search engine visibility.
<!-- Example: Every library exposes functionality via CLI; Text in/out protocol: stdin/args → stdout, errors → stderr; Support JSON + human-readable formats -->

### User Experience Focused
<!-- Example: III. Test-First (NON-NEGOTIABLE) -->
Design and development must center on user experience; Ensure intuitive navigation, responsive design, accessibility compliance, and engaging interfaces for all users.
<!-- Example: TDD mandatory: Tests written → User approved → Tests fail → Then implement; Red-Green-Refactor cycle strictly enforced -->

### Scalable Architecture
<!-- Example: IV. Integration Testing -->
Build with scalability in mind; Use modular code, microservices where appropriate, optimized databases, and cloud-native solutions to handle growth in users and data.
<!-- Example: Focus areas requiring integration tests: New library contract tests, Contract changes, Inter-service communication, Shared schemas -->

### Security and Compliance
<!-- Example: V. Observability, VI. Versioning & Breaking Changes, VII. Simplicity -->
Implement robust security measures and ensure compliance; Secure payment processing, data encryption, GDPR/CCPA compliance, and regular security audits.
<!-- Example: Text I/O ensures debuggability; Structured logging required; Or: MAJOR.MINOR.BUILD format; Or: Start simple, YAGNI principles -->

## Technology Stack and Standards
<!-- Example: Additional Constraints, Security Requirements, Performance Standards, etc. -->

Frontend: React with Next.js for SSR and SEO; Backend: Node.js with Express; Database: MongoDB for scalability; Hosting: Cloud platform with CDN for performance; Monitoring: Tools for performance tracking and SEO analytics.
<!-- Example: Technology stack requirements, compliance standards, deployment policies, etc. -->

## Development Workflow
<!-- Example: Development Workflow, Review Process, Quality Gates, etc. -->

Agile methodology with sprints; Mandatory code reviews for all changes; Automated testing for performance and SEO; CI/CD pipeline with performance benchmarks; Regular audits for compliance and security.
<!-- Example: Code review requirements, testing gates, deployment approval process, etc. -->

## Governance
<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

This constitution supersedes all other practices; Amendments require team consensus, documentation, and a migration plan; All changes must verify compliance with performance and SEO principles.
<!-- Example: All PRs/reviews must verify compliance; Complexity must be justified; Use [GUIDANCE_FILE] for runtime development guidance -->

**Version**: 1.0.0 | **Ratified**: 2025-10-21 | **Last Amended**: 2025-10-21
<!-- Example: Version: 2.1.1 | Ratified: 2025-06-13 | Last Amended: 2025-07-16 -->
