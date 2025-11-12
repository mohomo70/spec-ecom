# Tasks: Article Management System

**Input**: Design documents from `/specs/004-article-management/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - not explicitly requested in spec, so test tasks are excluded. Focus on implementation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/`, `frontend/` at repository root
- Backend: `backend/api/models.py`, `backend/api/serializers.py`, `backend/api/views.py`, `backend/api/urls.py`
- Frontend: `frontend/src/app/articles/`, `frontend/src/components/articles/`, `frontend/src/lib/api.ts`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [X] T001 Install backend dependencies: bleach and django-bleach in backend/requirements.txt
- [X] T002 [P] Install frontend dependencies: @tiptap/react, @tiptap/starter-kit, @tiptap/extension-link, @tiptap/extension-image in frontend/package.json
- [X] T003 [P] Verify PostgreSQL database connection and migrations framework in backend/config/settings.py

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [US1] [US2] [US3] Create ArticleCategory model in backend/api/models.py with id (UUID), name (CharField, unique), slug (SlugField, unique), description (TextField, optional), created_at (DateTimeField)
- [X] T005 [US1] [US2] [US3] Create Article model in backend/api/models.py with id (UUID), title (CharField), slug (SlugField, unique), content (TextField), excerpt (TextField, optional), featured_image_url (URLField, optional), featured_image_alt_text (CharField, optional), category (ForeignKey to ArticleCategory), author (ForeignKey to User), status (CharField with choices), meta_title (CharField, optional), meta_description (CharField, optional), created_at, updated_at, published_at (DateTimeField, optional)
- [X] T006 [US1] [US2] [US3] Add database indexes to Article model in backend/api/models.py: slug (unique), status, category_id, published_at, created_at, composite index on (status, published_at)
- [X] T007 [US1] [US2] [US3] Implement slug auto-generation in ArticleCategory.save() method in backend/api/models.py using django.utils.text.slugify()
- [X] T008 [US1] [US2] [US3] Implement slug auto-generation with uniqueness check in Article.save() method in backend/api/models.py using django.utils.text.slugify() with numeric suffix for duplicates
- [X] T009 [US1] [US2] [US3] Implement published_at timestamp setting in Article.save() method in backend/api/models.py when status changes to 'published'
- [X] T010 [US1] [US2] [US3] Create and run Django migrations for ArticleCategory and Article models: python manage.py makemigrations and python manage.py migrate

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Articles (Priority: P1) 🎯 MVP

**Goal**: Users can browse and read articles organized by categories on the articles page

**Independent Test**: Navigate to /articles page and view published articles with titles, excerpts, featured images, and category information. Click on an article to view full content. Filter by category. Verify empty state when no articles exist.

### Implementation for User Story 1

- [X] T011 [P] [US1] Create ArticleCategorySerializer in backend/api/serializers.py with fields: id, name, slug, description, created_at
- [X] T012 [P] [US1] Create ArticleSummarySerializer in backend/api/serializers.py with fields: id, title, slug, excerpt (auto-generated if null), featured_image_url, featured_image_alt_text, category (nested), author (nested), published_at, created_at
- [X] T013 [US1] Implement get_excerpt() method in ArticleSummarySerializer in backend/api/serializers.py to auto-generate excerpt from content (first 150-200 chars, HTML stripped) if excerpt field is null
- [X] T014 [P] [US1] Create ArticleDetailSerializer in backend/api/serializers.py extending ArticleSummarySerializer with additional fields: content, meta_title, meta_description, status, updated_at
- [X] T015 [US1] Create ArticleViewSet in backend/api/views.py with list() method filtering published articles only, using select_related('category', 'author') for performance
- [X] T016 [US1] Implement pagination in ArticleViewSet.list() in backend/api/views.py using CursorPagination with page_size=20
- [X] T017 [US1] Add category filtering to ArticleViewSet in backend/api/views.py using DjangoFilterBackend with filterset_fields=['category']
- [X] T018 [US1] Implement ordering in ArticleViewSet in backend/api/views.py with ordering=['-published_at'] for newest first
- [X] T019 [US1] Create retrieve() method in ArticleViewSet in backend/api/views.py to get article by slug, filtering published articles only for non-admin users
- [X] T020 [US1] Add article endpoints to router in backend/api/urls.py: articles/ (list, create) and articles/<slug>/ (retrieve, update, delete)
- [X] T021 [P] [US1] Create ArticleCategoryViewSet in backend/api/views.py with list() and retrieve() methods, lookup_field='slug'
- [X] T022 [US1] Add article-categories endpoints to router in backend/api/urls.py: article-categories/ (list, create) and article-categories/<slug>/ (retrieve)
- [X] T023 [P] [US1] Create articleApi.getArticles() function in frontend/src/lib/api.ts with support for category and page parameters
- [X] T024 [P] [US1] Create articleApi.getArticle() function in frontend/src/lib/api.ts to fetch article by slug
- [X] T025 [P] [US1] Create articleApi.getCategories() function in frontend/src/lib/api.ts to fetch all categories
- [X] T026 [US1] Create ArticleList component in frontend/src/components/articles/ArticleList.tsx to display paginated list of articles with featured images, excerpts, and category info
- [X] T027 [US1] Create ArticleCard component in frontend/src/components/articles/ArticleCard.tsx to display individual article preview with title, excerpt, featured image, category, and publish date
- [X] T028 [US1] Create articles listing page in frontend/src/app/articles/page.tsx using ArticleList component with category filtering and pagination
- [X] T029 [US1] Implement empty state in frontend/src/app/articles/page.tsx when no articles exist
- [X] T030 [US1] Create article detail page in frontend/src/app/articles/[slug]/page.tsx to display full article content with title, featured image, body (HTML rendered), author, publish date, and category
- [X] T031 [US1] Add SEO metadata (meta title, meta description) to article detail page in frontend/src/app/articles/[slug]/page.tsx using Next.js metadata API
- [X] T032 [US1] Implement structured data (JSON-LD Schema.org Article) in frontend/src/app/articles/[slug]/page.tsx with headline, author, datePublished, dateModified, image, articleBody, articleSection
- [X] T033 [US1] Create article category listing page in frontend/src/app/articles/category/[slug]/page.tsx to display articles filtered by category
- [X] T034 [US1] Add canonical URL to article detail page head in frontend/src/app/articles/[slug]/page.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can view published articles, filter by category, and read full articles.

---

## Phase 4: User Story 2 - Admin Create Article (Priority: P2)

**Goal**: Admins can create new articles with title, content, and category assignment

**Independent Test**: Admin logs in, navigates to /articles/admin/create, fills out form with title, content, featured image, category (or creates new category), publish status, meta title, meta description. Submits form and verifies article appears in listing. Tests validation errors for missing required fields. Tests draft vs published status.

### Implementation for User Story 2

- [X] T035 [P] [US2] Create ArticleCreateSerializer in backend/api/serializers.py with fields: title, content, excerpt, featured_image_url, featured_image_alt_text, category (category_id), status, meta_title, meta_description, validation for required fields
- [X] T036 [US2] Implement HTML sanitization in ArticleCreateSerializer.validate_content() in backend/api/serializers.py using bleach.clean() with allowed tags (p, h1-h6, ul, ol, li, strong, em, a, img, blockquote, br) and allowed attributes
- [X] T037 [US2] Implement author assignment in ArticleCreateSerializer.create() in backend/api/serializers.py setting author from request.user
- [X] T038 [US2] Create ArticleCategoryCreateSerializer in backend/api/serializers.py with fields: name, description (optional)
- [X] T039 [US2] Implement create() method in ArticleViewSet in backend/api/views.py with admin permission check using IsAdminOrReadOnly permission class
- [X] T040 [US2] Create admin_list() action in ArticleViewSet in backend/api/views.py at /articles/admin/ endpoint showing all articles (including drafts) for admins only
- [X] T041 [US2] Implement create() method in ArticleCategoryViewSet in backend/api/views.py with admin permission check
- [X] T042 [US2] Add IsAdminOrReadOnly permission class in backend/api/views.py to restrict create/update/delete to admin users only
- [X] T043 [P] [US2] Create articleApi.createArticle() function in frontend/src/lib/api.ts with JWT token authentication
- [X] T044 [P] [US2] Create articleApi.createCategory() function in frontend/src/lib/api.ts with JWT token authentication
- [X] T045 [P] [US2] Create articleApi.getAdminArticles() function in frontend/src/lib/api.ts for admin article list endpoint
- [X] T046 [P] [US2] Install and configure Tiptap rich text editor in frontend/src/components/articles/RichTextEditor.tsx with extensions: StarterKit, Link, Image
- [X] T047 [US2] Create ArticleForm component in frontend/src/components/articles/ArticleForm.tsx with fields: title, content (RichTextEditor), excerpt (optional), featured_image_url, featured_image_alt_text (required when featured image provided), category selection, status (draft/published), meta_title, meta_description
- [X] T048 [US2] Add category creation option in ArticleForm component in frontend/src/components/articles/ArticleForm.tsx allowing admin to create new category inline
- [X] T049 [US2] Implement form validation in ArticleForm component in frontend/src/components/articles/ArticleForm.tsx with React Hook Form and Zod schema including featured_image_alt_text validation
- [X] T050 [US2] Create admin article creation page in frontend/src/app/articles/admin/create/page.tsx using ArticleForm component
- [X] T051 [US2] Implement form submission in frontend/src/app/articles/admin/create/page.tsx with error handling and success redirect
- [X] T052 [US2] Create admin article list page in frontend/src/app/articles/admin/page.tsx showing all articles (drafts and published) with edit/delete actions
- [X] T053 [US2] Implement default meta title generation in backend/api/serializers.py (use title if meta_title not provided)
- [X] T054 [US2] Implement default meta description generation in backend/api/serializers.py (auto-generate from content if meta_description not provided)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Admins can create articles and categories, and articles appear in public listings when published.

---

## Phase 5: User Story 3 - Admin Edit and Delete Articles (Priority: P3)

**Goal**: Admins can modify existing articles and remove articles that are no longer needed

**Independent Test**: Admin views an article, clicks edit, sees form pre-filled with current data. Modifies content and saves. Verifies changes appear. Tests delete functionality with confirmation. Verifies non-admin users don't see edit/delete options.

### Implementation for User Story 3

- [X] T055 [P] [US3] Create ArticleUpdateSerializer in backend/api/serializers.py extending ArticleCreateSerializer for update operations
- [X] T056 [US3] Implement update() method in ArticleViewSet in backend/api/views.py with admin permission check and HTML sanitization
- [X] T057 [US3] Implement partial_update() method in ArticleViewSet in backend/api/views.py for PATCH requests
- [X] T058 [US3] Implement destroy() method in ArticleViewSet in backend/api/views.py with admin permission check to delete articles
- [X] T059 [P] [US3] Create articleApi.updateArticle() function in frontend/src/lib/api.ts with JWT token authentication
- [X] T060 [P] [US3] Create articleApi.deleteArticle() function in frontend/src/lib/api.ts with JWT token authentication
- [X] T061 [US3] Create admin article edit page in frontend/src/app/articles/admin/[slug]/edit/page.tsx using ArticleForm component pre-filled with existing article data
- [X] T062 [US3] Implement article data fetching in frontend/src/app/articles/admin/[slug]/edit/page.tsx using articleApi.getArticle() with admin access (allows viewing drafts)
- [X] T063 [US3] Implement form submission in frontend/src/app/articles/admin/[slug]/edit/page.tsx with update API call and success redirect
- [X] T064 [US3] Add delete button in frontend/src/app/articles/admin/[slug]/edit/page.tsx with confirmation dialog
- [X] T065 [US3] Implement delete functionality in frontend/src/app/articles/admin/[slug]/edit/page.tsx calling articleApi.deleteArticle() with success redirect
- [X] T066 [US3] Add edit/delete actions to admin article list page in frontend/src/app/articles/admin/page.tsx
- [X] T067 [US3] Verify non-admin users cannot access admin routes in frontend by checking user role in page components

**Checkpoint**: All user stories should now be independently functional. Admins can create, edit, and delete articles. Users can view published articles.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T068 [P] Add error handling and validation messages in backend/api/serializers.py for all article operations
- [X] T069 [P] Add logging for article operations in backend/api/views.py (create, update, delete)
- [X] T070 [P] Implement caching for article categories list in backend/api/views.py using Redis (categories rarely change)
- [X] T071 [P] Add Open Graph metadata to article detail page in frontend/src/app/articles/[slug]/page.tsx for social sharing
- [X] T072 [P] Optimize article listing queries in backend/api/views.py with select_related and prefetch_related to prevent N+1 queries
- [X] T073 [P] Add loading states and error handling to frontend article pages in frontend/src/app/articles/
- [X] T074 [P] Implement image optimization and lazy loading for article images in frontend/src/components/articles/
- [X] T075 [P] Add accessibility improvements (ARIA labels, keyboard navigation) to ArticleForm and article components
- [X] T076 [P] Verify all SEO requirements: meta tags, structured data, semantic HTML, canonical URLs in frontend article pages
- [X] T077 [P] Add alt text attributes to all article images in frontend components (ArticleCard, article detail page) using featured_image_alt_text from API
- [X] T078 [P] Validate structured data using Google Rich Results Test and ensure all required Schema.org Article fields are present
- [X] T079 [P] Run quickstart.md validation: test all endpoints and pages match quickstart guide expectations
- [X] T080 [P] Performance testing: Verify article listing loads in <2s and detail page in <1s with 1000+ articles in database

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
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Uses ArticleCategory from US1 but can be created independently
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on US1 and US2 for articles to exist, but edit/delete logic is independent

### Within Each User Story

- Models before serializers
- Serializers before views
- Views before URLs
- Backend API before frontend integration
- Core implementation before polish

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members
- Frontend API client functions marked [P] can be created in parallel
- Frontend components marked [P] can be created in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all serializers for User Story 1 together:
Task: "Create ArticleCategorySerializer in backend/api/serializers.py"
Task: "Create ArticleSummarySerializer in backend/api/serializers.py"
Task: "Create ArticleDetailSerializer in backend/api/serializers.py"

# Launch all API client functions for User Story 1 together:
Task: "Create articleApi.getArticles() function in frontend/src/lib/api.ts"
Task: "Create articleApi.getArticle() function in frontend/src/lib/api.ts"
Task: "Create articleApi.getCategories() function in frontend/src/lib/api.ts"

# Launch all components for User Story 1 together:
Task: "Create ArticleList component in frontend/src/components/articles/ArticleList.tsx"
Task: "Create ArticleCard component in frontend/src/components/articles/ArticleCard.tsx"
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
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (backend + frontend)
   - Developer B: User Story 2 (backend + frontend)
   - Developer C: User Story 3 (backend + frontend)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- HTML sanitization is critical for security - always sanitize on backend
- SEO metadata must be included in all article pages
- Admin permissions must be enforced on both backend and frontend
