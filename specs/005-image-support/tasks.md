# Tasks: Image Support for Backend and Database

**Input**: Design documents from `/specs/005-image-support/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - not explicitly requested in feature specification, so test tasks are not included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/api/`, `backend/config/` at repository root
- Paths shown below follow Django project structure from plan.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and storage configuration for CDN-ready architecture

- [ ] T001 Configure storage settings for CDN-ready architecture in backend/config/settings.py
- [ ] T002 [P] Create media directories structure (products/, categories/, articles/) in backend/media/
- [ ] T003 [P] Verify Pillow installation and version in backend/requirements.txt

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Create image validation functions in backend/api/validators.py
- [ ] T005 [P] Implement file deletion signal handlers in backend/api/signals.py
- [ ] T006 [P] Create base image serializer mixin for URL generation in backend/api/serializers.py
- [ ] T007 Create admin permission check utility for image uploads in backend/api/permissions.py

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Upload Product Images (Priority: P1) 🎯 MVP

**Goal**: Administrators can upload product images when creating or updating fish products through the API. The system accepts image files, validates them, stores them securely, and returns accessible URLs.

**Independent Test**: Can be fully tested by creating a product via API with an image file upload, verifying the image is stored and accessible via returned URL, and confirming the image displays correctly in product listings.

### Implementation for User Story 1

- [ ] T008 [P] [US1] Create ProductImage model in backend/api/models.py
- [ ] T009 [US1] Create database migration for ProductImage model in backend/api/migrations/
- [ ] T010 [US1] Run migration to create product_images table
- [ ] T011 [P] [US1] Create ProductImageSerializer in backend/api/serializers.py
- [ ] T012 [US1] Implement primary image constraint logic in ProductImageSerializer (only one primary per product)
- [ ] T013 [US1] Create product image upload view in backend/api/views/products.py
- [ ] T014 [US1] Implement image validation in upload view (format, size, dimensions, integrity)
- [ ] T015 [US1] Implement error handling with HTTP status codes (400, 413, 415) in backend/api/views/products.py
- [ ] T016 [US1] Add product image upload route in backend/api/urls/products.py
- [ ] T017 [US1] Add admin-only permission check to image upload endpoint
- [ ] T018 [US1] Implement image file deletion when replaced in backend/api/views/products.py
- [ ] T019 [US1] Update FishProduct serializer to include primary image URL in backend/api/serializers.py

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Upload Multiple Product Images (Priority: P1)

**Goal**: Administrators can upload multiple additional images for a single product, allowing galleries and detailed product views.

**Independent Test**: Can be fully tested by uploading multiple images to a product, verifying all images are stored with unique identifiers, and confirming all images are returned in product API responses.

### Implementation for User Story 2

- [ ] T020 [US2] Extend product image upload endpoint to accept multiple images in backend/api/views/products.py
- [ ] T021 [US2] Implement maximum 10 additional images limit validation in backend/api/views/products.py
- [ ] T022 [US2] Add display_order field handling for gallery ordering in ProductImageSerializer
- [ ] T023 [US2] Create list product images endpoint (GET) in backend/api/views/products.py
- [ ] T024 [US2] Add list product images route in backend/api/urls/products.py
- [ ] T025 [US2] Update product serializer to include all images (primary + additional) in backend/api/serializers.py
- [ ] T026 [US2] Implement image update endpoint (PUT) in backend/api/views/products.py
- [ ] T027 [US2] Add image update route in backend/api/urls/products.py
- [ ] T028 [US2] Implement image delete endpoint (DELETE) in backend/api/views/products.py
- [ ] T029 [US2] Add image delete route in backend/api/urls/products.py

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Upload Category Images (Priority: P2)

**Goal**: Administrators can upload category images to visually represent product categories in navigation and category pages.

**Independent Test**: Can be fully tested by creating or updating a category with an image upload, verifying the image is stored and accessible, and confirming category API responses include the image URL.

### Implementation for User Story 3

- [ ] T030 [P] [US3] Create CategoryImage model in backend/api/models.py
- [ ] T031 [US3] Create database migration for CategoryImage model in backend/api/migrations/
- [ ] T032 [US3] Run migration to create category_images table
- [ ] T033 [P] [US3] Create CategoryImageSerializer in backend/api/serializers.py
- [ ] T034 [US3] Create category image upload view in backend/api/views/categories.py
- [ ] T035 [US3] Implement image validation in category upload view
- [ ] T036 [US3] Add category image upload route in backend/api/urls/categories.py
- [ ] T037 [US3] Add admin-only permission check to category image upload endpoint
- [ ] T038 [US3] Implement category image file deletion when replaced in backend/api/views/categories.py
- [ ] T039 [US3] Create category image delete endpoint (DELETE) in backend/api/views/categories.py
- [ ] T040 [US3] Add category image delete route in backend/api/urls/categories.py
- [ ] T041 [US3] Update Category serializer to include image URL in backend/api/serializers.py

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Upload Article Featured Images (Priority: P2)

**Goal**: Administrators can upload featured images for blog articles to enhance visual appeal and social media sharing.

**Independent Test**: Can be fully tested by creating or updating an article with a featured image upload, verifying the image is stored and accessible, and confirming article API responses include the image URL.

### Implementation for User Story 4

- [ ] T042 [P] [US4] Create ArticleImage model in backend/api/models.py
- [ ] T043 [US4] Create database migration for ArticleImage model in backend/api/migrations/
- [ ] T044 [US4] Run migration to create article_images table
- [ ] T045 [P] [US4] Create ArticleImageSerializer in backend/api/serializers.py
- [ ] T046 [US4] Create article image upload view in backend/api/views/articles.py
- [ ] T047 [US4] Implement image validation in article upload view
- [ ] T048 [US4] Add article image upload route in backend/api/urls/articles.py
- [ ] T049 [US4] Add admin-only permission check to article image upload endpoint
- [ ] T050 [US4] Implement article image file deletion when replaced in backend/api/views/articles.py
- [ ] T051 [US4] Create article image delete endpoint (DELETE) in backend/api/views/articles.py
- [ ] T052 [US4] Add article image delete route in backend/api/urls/articles.py
- [ ] T053 [US4] Update Article serializer to include featured image URL in backend/api/serializers.py

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T054 [P] Add database indexes for image queries (product+is_primary, product+display_order) in migrations
- [ ] T055 [P] Update OpenAPI documentation with image endpoints in specs/005-image-support/contracts/
- [ ] T056 Verify all image URLs use .url property (never hardcoded paths) across all serializers
- [ ] T057 [P] Add image URL to existing product/category/article list endpoints in backend/api/serializers.py
- [ ] T058 Test CDN-ready configuration (verify DEFAULT_FILE_STORAGE abstraction works)
- [ ] T059 [P] Code cleanup and refactoring (remove any hardcoded /media/ paths)
- [ ] T060 Run quickstart.md validation steps
- [ ] T061 Verify file deletion signals work for all image types
- [ ] T062 Performance testing: Verify image upload meets <2s response time for files <2MB
- [ ] T063 [P] Implement corrupted file handling: Add error handling for Pillow Image.verify() failures in backend/api/validators.py
- [ ] T064 [P] Implement disk space error handling: Add try-catch for OSError/IOError during file save, return HTTP 507/413 in backend/api/views/
- [ ] T065 [P] Implement transaction rollback: Ensure image file deletion if entity creation fails using database transactions in backend/api/views/
- [ ] T066 [P] Implement database maintenance error handling: Add HTTP 503 response for database connection errors in backend/api/views/
- [ ] T067 Performance validation: Verify SC-001 - Upload completes in <5 seconds per image
- [ ] T068 Performance validation: Verify SC-002 - 95% of valid uploads succeed without errors
- [ ] T069 Performance validation: Verify SC-004 - 100% of invalid files rejected with clear error messages
- [ ] T070 Performance validation: Verify SC-005 - Image URLs accessible within 1 second of upload completion
- [ ] T071 Performance validation: Verify SC-006 - System supports 10 additional images per product without degradation
- [ ] T072 Performance validation: Verify SC-007 - Image URLs display correctly in frontend applications
- [ ] T073 Performance validation: Verify SC-008 - Image associations maintained correctly during updates/deletes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Depends on User Story 1 completion (extends product image functionality)
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Independent from US1/US2
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Independent from US1/US2/US3

### Within Each User Story

- Models before migrations
- Migrations before views
- Serializers before views (for validation logic)
- Views before URL routes
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes:
  - User Story 1 can start
  - User Stories 3 and 4 can start in parallel (independent from US1/US2)
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members (US3 and US4 are independent)

---

## Parallel Example: User Story 1

```bash
# Launch model creation (can be done together):
Task: "Create ProductImage model in backend/api/models.py"
Task: "Create ProductImageSerializer in backend/api/serializers.py"
```

---

## Parallel Example: User Stories 3 and 4

```bash
# After Foundational phase, US3 and US4 can run in parallel:
# Developer A: User Story 3
Task: "Create CategoryImage model in backend/api/models.py"
Task: "Create CategoryImageSerializer in backend/api/serializers.py"

# Developer B: User Story 4
Task: "Create ArticleImage model in backend/api/models.py"
Task: "Create ArticleImageSerializer in backend/api/serializers.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (MVP)
   - Developer B: User Story 3 (independent)
   - Developer C: User Story 4 (independent)
3. After User Story 1 completes:
   - Developer A: User Story 2 (extends US1)
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **CDN Migration**: All tasks use storage backend abstraction - no hardcoded paths. Future CDN migration requires only settings.py changes.

---

## Task Summary

- **Total Tasks**: 73
- **Phase 1 (Setup)**: 3 tasks
- **Phase 2 (Foundational)**: 4 tasks
- **Phase 3 (User Story 1)**: 12 tasks
- **Phase 4 (User Story 2)**: 10 tasks
- **Phase 5 (User Story 3)**: 12 tasks
- **Phase 6 (User Story 4)**: 12 tasks
- **Phase 7 (Polish)**: 20 tasks (9 original + 4 edge case handling + 7 performance validation)

**Suggested MVP Scope**: Phases 1, 2, and 3 (User Story 1) - 19 tasks total

