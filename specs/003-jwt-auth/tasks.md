# Tasks: JWT Authentication System

**Input**: Design documents from `/specs/003-jwt-auth/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: OPTIONAL - Tests are deferred to implementation phase based on team preferences

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/` for Django API, `frontend/` for Next.js

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Install backend dependency django-rest-framework-simplejwt in requirements.txt
- [x] T002 [P] Install frontend dependencies react-hook-form, zod, @hookform/resolvers, axios, zustand via npm
- [x] T003 [P] Configure CORS settings in backend to allow frontend communication
- [x] T004 [P] Add API_BASE_URL environment variable configuration

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Update User model in backend/api/models.py to add role field with choices 'user' and 'admin'
- [x] T006 Configure SIMPLE_JWT settings in backend/settings.py with ACCESS_TOKEN_LIFETIME of 1 hour
- [x] T007 Create migration for User model role field via `python manage.py makemigrations`
- [x] T008 [P] Run migration via `python manage.py migrate`
- [x] T009 Create auth service structure in frontend/src/lib/auth.ts
- [x] T010 Create Zustand auth store in frontend/src/lib/store/auth.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Registration (Priority: P1) 🎯 MVP

**Goal**: New users can create accounts via registration form, automatically logged in after registration

**Independent Test**: Create new account through registration form, user automatically logged in and sees profile with "user" role

### Implementation for User Story 1

- [x] T011 [P] [US1] Create UserRegistrationSerializer in backend/api/serializers.py for email, password, name validation
- [x] T012 [P] [US1] Implement register view in backend/api/views.py that creates user with role='user'
- [x] T013 [P] [US1] Configure auth URL routes in backend/api/urls.py for POST /api/auth/register/
- [x] T014 [US1] Implement register function in frontend/src/lib/auth.ts that posts to /api/auth/register/ and stores token
- [x] T015 [US1] Create register page at frontend/src/app/(auth)/register/page.tsx with React Hook Form
- [x] T016 [US1] Add Zod schema validation in register page for email, password (min 8 chars), name
- [x] T017 [US1] Implement form submission handler that calls authService.register and redirects on success
- [x] T018 [US1] Add error handling and display for duplicate email validation error
- [x] T019 [US1] Add password mismatch validation for confirm password field
- [x] T020 [US1] Auto-login user after successful registration and redirect to profile or homepage

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - User Login (Priority: P1) 🎯 MVP

**Goal**: Existing users can login with email and password, receive JWT token

**Independent Test**: Login with valid credentials, receive JWT token, session persists

### Implementation for User Story 2

- [x] T021 [P] [US2] Create UserLoginSerializer in backend/api/serializers.py for email and password
- [x] T022 [P] [US2] Implement login view in backend/api/views.py that validates credentials and returns JWT
- [x] T023 [P] [US2] Configure auth URL routes in backend/api/urls.py for POST /api/auth/login/
- [x] T024 [US2] Implement login function in frontend/src/lib/auth.ts that posts to /api/auth/login/ and stores token
- [x] T025 [US2] Create login page at frontend/src/app/(auth)/login/page.tsx with React Hook Form
- [x] T026 [US2] Add Zod schema validation in login page for email and password
- [x] T027 [US2] Implement form submission handler that calls authService.login and redirects on success
- [x] T028 [US2] Add error handling for invalid credentials (same message to prevent email enumeration)
- [x] T029 [US2] Implement token persistence in localStorage for session continuity
- [x] T030 [US2] Update auth store with user data after successful login

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - View and Manage Profile (Priority: P2)

**Goal**: Logged-in users can view and update their profile information (name, email, role)

**Independent Test**: Login, navigate to profile page, view user info, update and save changes

### Implementation for User Story 3

- [x] T031 [P] [US3] Create UserProfileSerializer in backend/api/serializers.py for email, first_name, role fields
- [x] T032 [P] [US3] Implement profile view in backend/api/views.py with GET and PATCH methods
- [x] T033 [P] [US3] Add JWT authentication requirement to profile view via @permission_classes([IsAuthenticated])
- [x] T034 [P] [US3] Configure auth URL routes in backend/api/urls.py for GET/PATCH /api/auth/profile/
- [x] T035 [US3] Implement getProfile function in frontend/src/lib/auth.ts that retrieves user data with JWT
- [x] T036 [US3] Create profile page at frontend/src/app/profile/page.tsx
- [x] T037 [US3] Fetch and display user profile data (email, name, role) on page load
- [x] T038 [US3] Implement profile edit form with React Hook Form for name and email fields
- [x] T039 [US3] Add form submission handler that calls authService to update profile
- [x] T040 [US3] Display success message after profile update
- [x] T041 [US3] Add validation for email format on profile update
- [x] T042 [US3] Implement logout function in frontend and add logout button to profile page
- [x] T043 [US3] Handle token expiration by redirecting to login on 401 responses via Axios interceptor

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T044 [P] Add Axios interceptor for automatic token injection in Authorization header
- [x] T045 [P] Configure Axios response interceptor to handle 401 errors and redirect to /login
- [x] T046 [P] Add loading states to all auth forms (registration, login, profile)
- [x] T047 Style auth pages with Tailwind CSS for modern UI
- [ ] T048 Add error boundaries for better error handling
- [ ] T049 Update documentation with auth flow diagrams
- [ ] T050 Verify all acceptance scenarios from spec.md are working
- [x] T051 [P] Add password visibility toggle to password input fields
- [x] T052 [P] Add route protection middleware for profile page requiring authentication

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (Registration) can start immediately after Foundational
  - User Story 2 (Login) can start immediately after Foundational
  - User Story 3 (Profile) requires Login to be working but can be implemented in parallel after Login basics
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on US1, independently testable
- **User Story 3 (P2)**: Depends on User Story 2 (Login) being functional to test properly, but can be implemented in parallel

### Within Each User Story

- Models/serializers before views
- Backend API before frontend integration
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- Backend and frontend setup tasks (T001-T004) can run in parallel
- Foundational tasks marked [P] can run in parallel
- Once Foundational phase completes, US1 and US2 backend implementation can start in parallel
- Frontend pages can be built in parallel after backend APIs are ready
- Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all serializers/views for User Story 1 together:
Task T011: "Create UserRegistrationSerializer in backend/api/serializers.py"
Task T012: "Implement register view in backend/api/views.py"
Task T013: "Configure auth URL routes in backend/api/urls.py"

# Launch all frontend implementation together:
Task T015: "Create register page at frontend/src/app/(auth)/register/page.tsx"
Task T016: "Add Zod schema validation in register page"
Task T017: "Implement form submission handler"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Registration)
4. Complete Phase 4: User Story 2 (Login)
5. **STOP and VALIDATE**: Test both stories independently
6. Deploy/demo if ready
7. Phase 5 (Profile) can be added later as enhancement

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Registration) → Test independently → Deploy/Demo (Registration ready!)
3. Add User Story 2 (Login) → Test independently → Deploy/Demo (Basic auth complete!)
4. Add User Story 3 (Profile) → Test independently → Deploy/Demo (Full auth system!)
5. Add Polish → Production ready

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Registration - backend)
   - Developer B: User Story 1 (Registration - frontend)
   - Developer C: User Story 2 (Login - backend)
3. Once backend APIs are ready:
   - Developer A: User Story 2 (Login - frontend)
   - Developer C: User Story 3 (Profile - backend & frontend)
4. Stories integrate and complete independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- User Story 3 (Profile) requires JWT token validation, so minimal Login functionality needed to test
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Summary

**Total Tasks**: 52
- **Setup**: 4 tasks
- **Foundational**: 6 tasks (CRITICAL - BLOCKS ALL USER STORIES)
- **User Story 1 (Registration)**: 10 tasks
- **User Story 2 (Login)**: 10 tasks
- **User Story 3 (Profile)**: 13 tasks
- **Polish**: 9 tasks

**MVP Scope**: Phases 1-4 (User Stories 1 & 2) - Registration and Login functionality
**Full Scope**: All phases - Complete auth system with profile management

**Independent Test Criteria**:
- **US1**: Register → Auto-login → See profile with "user" role
- **US2**: Login with credentials → Receive JWT → Session persists
- **US3**: Login → View profile → Update info → Changes saved

**Parallel Opportunities**:
- Backend and frontend setup (4 parallel tasks)
- Multiple serializers/views within a story (marked [P])
- Different user stories can be worked on in parallel by different developers after Foundational phase

