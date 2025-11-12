# Tasks: Admin Dashboard

**Input**: Design documents from `/specs/006-admin-dashboard/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - not explicitly requested in specification, so test tasks are not included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/`, `frontend/` at repository root
- Backend: `backend/api/views/`, `backend/api/serializers/`, `backend/api/urls/`
- Frontend: `frontend/src/app/`, `frontend/src/components/`, `frontend/src/lib/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create backend admin module structure (backend/api/views/admin.py, backend/api/serializers/admin.py, backend/api/urls/admin.py)
- [x] T002 Create frontend admin directory structure (frontend/src/app/admin/, frontend/src/components/admin/, frontend/src/lib/api/admin.ts)
- [x] T003 [P] Create admin API client base in frontend/src/lib/api/admin.ts
- [x] T004 [P] Create admin auth hook in frontend/src/hooks/use-admin-auth.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Update backend/api/permissions.py to add IsAdminOnly permission class (if not exists)
- [x] T006 Create admin API base URL configuration in backend/api/urls/admin.py
- [x] T007 Create admin dashboard layout component in frontend/src/app/admin/layout.tsx
- [x] T008 Create admin dashboard navigation component in frontend/src/components/admin/AdminNav.tsx
- [x] T009 Create admin API base client with JWT authentication in frontend/src/lib/api/admin.ts
- [x] T010 Create admin auth hook with role verification in frontend/src/hooks/use-admin-auth.ts
- [x] T011 Create admin route protection middleware in frontend/src/app/admin/layout.tsx
- [x] T012 Create error handling utilities for admin API in frontend/src/lib/api/admin.ts
- [x] T013 Create loading indicator component in frontend/src/components/admin/LoadingIndicator.tsx
- [x] T014 Create empty state component in frontend/src/components/admin/EmptyState.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Admin User Creation and Authentication (Priority: P1) 🎯 MVP

**Goal**: Admin users can authenticate and access admin dashboard. User list viewable with read-only role display.

**Independent Test**: Login as admin user, verify redirect to admin dashboard. View user list with roles displayed. Attempt to change role, verify read-only behavior.

### Implementation for User Story 1

- [x] T015 [US1] Create admin dashboard overview page in frontend/src/app/admin/page.tsx
- [x] T016 [US1] Create user list viewset in backend/api/views/admin.py (UserAdminViewSet)
- [x] T017 [US1] Create user admin serializer in backend/api/serializers/admin.py (UserAdminSerializer, UserAdminCreateSerializer, UserAdminUpdateSerializer)
- [x] T018 [US1] Add user list endpoint to backend/api/urls/admin.py
- [x] T019 [US1] Create user list API function in frontend/src/lib/api/admin.ts (getUsers, createUser)
- [x] T020 [US1] Create user list page in frontend/src/app/admin/users/page.tsx
- [x] T021 [US1] Create user list table component in frontend/src/components/admin/UserTable.tsx
- [x] T022 [US1] Create user form component in frontend/src/components/admin/UserForm.tsx (with role field read-only)
- [x] T023 [US1] Create user detail/edit page in frontend/src/app/admin/users/[id]/page.tsx
- [x] T024 [US1] Add role read-only validation in backend/api/serializers/admin.py (reject role changes)
- [x] T025 [US1] Add role read-only UI indication in frontend/src/components/admin/UserForm.tsx
- [x] T026 [US1] Implement admin role check in backend/api/views/admin.py (permission classes)
- [x] T027 [US1] Implement admin route protection in frontend/src/app/admin/layout.tsx (redirect non-admins)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Product Management (Priority: P1)

**Goal**: Admin users can create, view, update, and delete fish products with image management.

**Independent Test**: Create product, edit product details, upload images, delete product, filter/search products.

### Implementation for User Story 2

- [ ] T028 [P] [US2] Create product list viewset in backend/api/views/admin.py (ProductAdminViewSet)
- [ ] T029 [P] [US2] Create product admin serializer in backend/api/serializers/admin.py (ProductAdminSerializer, ProductAdminCreateSerializer, ProductAdminUpdateSerializer)
- [ ] T030 [US2] Add product endpoints to backend/api/urls/admin.py (list, create, retrieve, update, delete)
- [ ] T031 [US2] Add product image upload endpoint in backend/api/views/admin.py (ProductImageUploadView)
- [ ] T032 [US2] Add product image endpoints to backend/api/urls/admin.py
- [ ] T033 [US2] Create product API functions in frontend/src/lib/api/admin.ts (getProducts, createProduct, updateProduct, deleteProduct, uploadProductImage)
- [ ] T034 [US2] Create product list page in frontend/src/app/admin/products/page.tsx
- [ ] T035 [US2] Create product table component in frontend/src/components/admin/ProductTable.tsx
- [ ] T036 [US2] Create product form component in frontend/src/components/admin/ProductForm.tsx
- [ ] T037 [US2] Create product create page in frontend/src/app/admin/products/new/page.tsx
- [ ] T038 [US2] Create product edit page in frontend/src/app/admin/products/[id]/page.tsx
- [ ] T039 [US2] Create product image upload component in frontend/src/components/admin/ProductImageUpload.tsx
- [ ] T040 [US2] Add product search and filter functionality in frontend/src/components/admin/ProductTable.tsx
- [ ] T041 [US2] Add conflict detection for product updates in backend/api/views/admin.py (check updated_at)
- [ ] T042 [US2] Create conflict warning component in frontend/src/components/admin/ConflictWarning.tsx
- [ ] T043 [US2] Integrate conflict detection in frontend/src/components/admin/ProductForm.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Category Management (Priority: P1)

**Goal**: Admin users can manage product categories with hierarchical relationships and display order.

**Independent Test**: Create category, set parent category, edit category, reorder categories, upload category images.

### Implementation for User Story 3

- [ ] T044 [P] [US3] Create category list viewset in backend/api/views/admin.py (CategoryAdminViewSet)
- [ ] T045 [P] [US3] Create category admin serializer in backend/api/serializers/admin.py (CategoryAdminSerializer, CategoryAdminCreateSerializer, CategoryAdminUpdateSerializer)
- [ ] T046 [US3] Add category endpoints to backend/api/urls/admin.py (list, create, retrieve, update, delete)
- [ ] T047 [US3] Add category image upload endpoint in backend/api/views/admin.py (CategoryImageUploadView)
- [ ] T048 [US3] Add circular parent relationship validation in backend/api/serializers/admin.py
- [ ] T049 [US3] Create category API functions in frontend/src/lib/api/admin.ts (getCategories, createCategory, updateCategory, deleteCategory, uploadCategoryImage)
- [ ] T050 [US3] Create category list page in frontend/src/app/admin/categories/page.tsx
- [ ] T051 [US3] Create category tree component in frontend/src/components/admin/CategoryTree.tsx (hierarchical display)
- [ ] T052 [US3] Create category form component in frontend/src/components/admin/CategoryForm.tsx
- [ ] T053 [US3] Create category create page in frontend/src/app/admin/categories/new/page.tsx
- [ ] T054 [US3] Create category edit page in frontend/src/app/admin/categories/[id]/page.tsx
- [ ] T055 [US3] Add category reordering functionality in frontend/src/components/admin/CategoryTree.tsx
- [ ] T056 [US3] Add conflict detection for category updates in backend/api/views/admin.py
- [ ] T057 [US3] Integrate conflict detection in frontend/src/components/admin/CategoryForm.tsx
- [ ] T058 [US3] Add prevent delete validation for categories with products in backend/api/views/admin.py

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Order Management (Priority: P2)

**Goal**: Admin users can view and manage customer orders, update order status, and track fulfillment.

**Independent Test**: View order list, filter orders, update order status, view order details, update tracking number.

### Implementation for User Story 4

- [ ] T059 [P] [US4] Create order list viewset in backend/api/views/admin.py (OrderAdminViewSet)
- [ ] T060 [P] [US4] Create order admin serializer in backend/api/serializers/admin.py (OrderAdminSerializer, OrderAdminUpdateSerializer, OrderDetailSerializer)
- [ ] T061 [US4] Add order endpoints to backend/api/urls/admin.py (list, retrieve, update)
- [ ] T062 [US4] Add order filtering by status, payment_status, date in backend/api/views/admin.py
- [ ] T063 [US4] Create order API functions in frontend/src/lib/api/admin.ts (getOrders, getOrder, updateOrder)
- [ ] T064 [US4] Create order list page in frontend/src/app/admin/orders/page.tsx
- [ ] T065 [US4] Create order table component in frontend/src/components/admin/OrderTable.tsx
- [ ] T066 [US4] Create order detail page in frontend/src/app/admin/orders/[id]/page.tsx
- [ ] T067 [US4] Create order detail component in frontend/src/components/admin/OrderDetail.tsx
- [ ] T068 [US4] Create order status update component in frontend/src/components/admin/OrderStatusUpdate.tsx
- [ ] T069 [US4] Add order filtering UI in frontend/src/components/admin/OrderTable.tsx
- [ ] T070 [US4] Add order status validation in backend/api/serializers/admin.py (valid transitions)

**Checkpoint**: At this point, User Stories 1, 2, 3, AND 4 should all work independently

---

## Phase 7: User Story 5 - Article Management (Priority: P2)

**Goal**: Admin users can create, edit, publish, and manage blog articles and article categories.

**Independent Test**: Create article, edit article, change publish status, manage article categories, upload article images.

### Implementation for User Story 5

- [ ] T071 [P] [US5] Create article list viewset in backend/api/views/admin.py (ArticleAdminViewSet)
- [ ] T072 [P] [US5] Create article admin serializer in backend/api/serializers/admin.py (ArticleAdminSerializer, ArticleAdminCreateSerializer, ArticleAdminUpdateSerializer)
- [ ] T073 [US5] Add article endpoints to backend/api/urls/admin.py (list, create, retrieve, update, delete)
- [ ] T074 [US5] Add article category endpoints in backend/api/views/admin.py (ArticleCategoryAdminViewSet)
- [ ] T075 [US5] Add article image upload endpoint in backend/api/views/admin.py (ArticleImageUploadView)
- [ ] T076 [US5] Add auto-set published_at on status change in backend/api/views/admin.py
- [ ] T077 [US5] Create article API functions in frontend/src/lib/api/admin.ts (getArticles, createArticle, updateArticle, deleteArticle, getArticleCategories, uploadArticleImage)
- [ ] T078 [US5] Create article list page in frontend/src/app/admin/articles/page.tsx
- [ ] T079 [US5] Create article table component in frontend/src/components/admin/ArticleTable.tsx
- [ ] T080 [US5] Create article form component in frontend/src/components/admin/ArticleForm.tsx
- [ ] T081 [US5] Create article create page in frontend/src/app/admin/articles/new/page.tsx
- [ ] T082 [US5] Create article edit page in frontend/src/app/admin/articles/[id]/page.tsx
- [ ] T083 [US5] Add article status toggle in frontend/src/components/admin/ArticleForm.tsx
- [ ] T084 [US5] Create article category management in frontend/src/components/admin/ArticleCategoryManager.tsx
- [ ] T085 [US5] Add conflict detection for article updates in backend/api/views/admin.py
- [ ] T086 [US5] Integrate conflict detection in frontend/src/components/admin/ArticleForm.tsx

**Checkpoint**: At this point, User Stories 1, 2, 3, 4, AND 5 should all work independently

---

## Phase 8: User Story 6 - User Account Management (Priority: P2)

**Goal**: Admin users can view and edit user accounts and profiles. Role assignment restricted to Django admin.

**Independent Test**: View user list, edit user details (excluding role), view user profile, attempt role change (blocked).

### Implementation for User Story 6

- [ ] T087 [US6] Add user detail endpoint in backend/api/views/admin.py (UserAdminViewSet.retrieve)
- [ ] T088 [US6] Add user update endpoint in backend/api/views/admin.py (UserAdminViewSet.update, partial_update)
- [ ] T089 [US6] Add user delete endpoint in backend/api/views/admin.py (UserAdminViewSet.destroy)
- [ ] T090 [US6] Add prevent self-deletion validation in backend/api/views/admin.py
- [ ] T091 [US6] Add user profile serializer in backend/api/serializers/admin.py (UserProfileAdminSerializer)
- [ ] T092 [US6] Add user profile endpoints in backend/api/views/admin.py (UserProfileAdminViewSet)
- [ ] T093 [US6] Create user detail API functions in frontend/src/lib/api/admin.ts (getUser, updateUser, deleteUser, getUserProfile)
- [ ] T094 [US6] Update user detail/edit page in frontend/src/app/admin/users/[id]/page.tsx
- [ ] T095 [US6] Create user profile view component in frontend/src/components/admin/UserProfileView.tsx
- [ ] T096 [US6] Update user form to handle updates in frontend/src/components/admin/UserForm.tsx
- [ ] T097 [US6] Add user delete confirmation in frontend/src/components/admin/UserTable.tsx
- [ ] T098 [US6] Add prevent self-deletion UI validation in frontend/src/components/admin/UserForm.tsx

**Checkpoint**: At this point, all user stories should work independently

---

## Phase 9: Cross-Cutting Features

**Purpose**: Features that span multiple user stories

### Dashboard Statistics

- [ ] T099 Create dashboard stats endpoint in backend/api/views/admin.py (DashboardStatsView)
- [ ] T100 Add dashboard stats to backend/api/urls/admin.py
- [ ] T101 Create dashboard stats API function in frontend/src/lib/api/admin.ts (getDashboardStats)
- [ ] T102 Update dashboard overview page with statistics in frontend/src/app/admin/page.tsx
- [ ] T103 Create dashboard stats component in frontend/src/components/admin/DashboardStats.tsx

### Bulk Operations

- [ ] T104 Create bulk operations base viewset mixin in backend/api/views/admin.py (BulkOperationsMixin)
- [ ] T105 Add bulk operations endpoints to backend/api/urls/admin.py (bulk create, update, delete, status change)
- [ ] T106 Create bulk operations API functions in frontend/src/lib/api/admin.ts (bulkCreate, bulkUpdate, bulkDelete, bulkStatusChange)
- [ ] T107 Create bulk actions component in frontend/src/components/admin/BulkActions.tsx
- [ ] T108 Add bulk selection to all entity tables (UserTable, ProductTable, CategoryTree, OrderTable, ArticleTable)
- [ ] T109 Add bulk operations confirmation dialog in frontend/src/components/admin/BulkConfirmDialog.tsx

### Search and Filter

- [ ] T110 Add search functionality to all list viewsets in backend/api/views/admin.py
- [ ] T111 Add filter backends to all list viewsets in backend/api/views/admin.py (DjangoFilterBackend, SearchFilter)
- [ ] T112 Create search and filter component in frontend/src/components/admin/SearchFilter.tsx
- [ ] T113 Integrate search and filter in all list pages

### Pagination

- [ ] T114 Add pagination to all list viewsets in backend/api/views/admin.py
- [ ] T115 Create pagination component in frontend/src/components/admin/Pagination.tsx
- [ ] T116 Integrate pagination in all list tables

### Error Handling

- [ ] T117 Create error message component in frontend/src/components/admin/ErrorMessage.tsx
- [ ] T118 Add retry functionality to error messages in frontend/src/components/admin/ErrorMessage.tsx
- [ ] T119 Integrate error handling in all forms and API calls

### Empty States

- [ ] T120 Update empty state component with entity-specific messages in frontend/src/components/admin/EmptyState.tsx
- [ ] T121 Integrate empty states in all list pages

### Loading Indicators

- [ ] T122 Integrate loading indicators in all async operations (forms, tables, API calls)

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T123 [P] Add success message notifications in frontend/src/components/admin/SuccessMessage.tsx
- [ ] T124 [P] Integrate success messages after create, update, delete operations
- [ ] T125 [P] Add form data preservation on validation errors in all forms
- [ ] T126 [P] Add image preview before upload confirmation in all image upload components
- [ ] T127 [P] Add responsive design improvements for tablet devices
- [ ] T128 [P] Add keyboard navigation support in all tables
- [ ] T129 [P] Add accessibility improvements (ARIA labels, focus management)
- [ ] T130 [P] Optimize API queries with select_related/prefetch_related in all viewsets
- [ ] T131 [P] Add Redis caching for dashboard statistics
- [ ] T132 [P] Add performance monitoring and logging
- [ ] T133 [P] Update documentation in quickstart.md
- [ ] T134 [P] Code cleanup and refactoring
- [ ] T135 [P] Security hardening (CSRF protection, rate limiting on admin endpoints)
- [ ] T136 [P] Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2)
- **Cross-Cutting (Phase 9)**: Depends on user stories being complete
- **Polish (Phase 10)**: Depends on all desired user stories and cross-cutting features being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Independent, uses existing Product model
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - Independent, uses existing Category model
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Independent, uses existing Order model
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - Independent, uses existing Article model
- **User Story 6 (P2)**: Can start after Foundational (Phase 2) - Extends User Story 1 functionality

### Within Each User Story

- Backend viewsets before serializers (if needed)
- Serializers before API endpoints
- Backend API before frontend API client
- Frontend API client before components
- Components before pages
- Core implementation before conflict detection
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Backend and frontend work for same story can be parallelized (different developers)
- Different user stories can be worked on in parallel by different team members
- Cross-cutting features marked [P] can run in parallel

---

## Parallel Example: User Story 2

```bash
# Backend and frontend can be developed in parallel:
Backend Developer:
  Task: "Create product list viewset in backend/api/views/admin.py"
  Task: "Create product admin serializer in backend/api/serializers/admin.py"
  Task: "Add product endpoints to backend/api/urls/admin.py"

Frontend Developer:
  Task: "Create product API functions in frontend/src/lib/api/admin.ts"
  Task: "Create product list page in frontend/src/app/admin/products/page.tsx"
  Task: "Create product table component in frontend/src/components/admin/ProductTable.tsx"
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
5. Add User Stories 4, 5, 6 → Test independently → Deploy/Demo
6. Add Cross-Cutting Features → Test → Deploy/Demo
7. Add Polish → Final release
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Authentication)
   - Developer B: User Story 2 (Products)
   - Developer C: User Story 3 (Categories)
3. Next iteration:
   - Developer A: User Story 4 (Orders)
   - Developer B: User Story 5 (Articles)
   - Developer C: User Story 6 (User Management)
4. Final iteration:
   - All developers: Cross-cutting features and polish
5. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All models already exist - no model creation tasks needed
- Focus on viewsets, serializers, API endpoints, and frontend components

---

## Summary

**Total Tasks**: 136
**Tasks per User Story**:
- User Story 1: 13 tasks
- User Story 2: 16 tasks
- User Story 3: 15 tasks
- User Story 4: 12 tasks
- User Story 5: 16 tasks
- User Story 6: 12 tasks
- Cross-Cutting: 24 tasks
- Polish: 14 tasks
- Setup: 4 tasks
- Foundational: 10 tasks

**Parallel Opportunities**: High - Backend and frontend can be developed in parallel, multiple user stories can be worked on simultaneously after foundational phase

**Independent Test Criteria**: Each user story has clear acceptance scenarios and can be tested independently

**Suggested MVP Scope**: Phase 1 (Setup) + Phase 2 (Foundational) + Phase 3 (User Story 1) = Admin authentication and user list view

