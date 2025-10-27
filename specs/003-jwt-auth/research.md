# Research: JWT Authentication System

**Feature**: 003-jwt-auth | **Date**: 2025-06-19  
**Phase**: 0 - Outline & Research

## Research Findings

### 1. Django REST Framework SimpleJWT Implementation

**Decision**: Use `djangorestframework-simplejwt` for token generation and validation

**Rationale**:
- Industry-standard library for Django JWT auth
- Integrated with Django REST Framework
- Provides access/refresh token pair (we'll use only access tokens initially)
- Built-in views and serializers for login
- Configurable token expiration and signing
- Supports token blacklisting via Redis (future enhancement)

**Alternatives considered**:
- Manual JWT implementation with `PyJWT`: More control but reinventing the wheel
- `django-jwt-auth`: Older library, less maintained
- `djoser`: Full auth solution, more complex than needed

**Key findings**:
- Token lifetime: Configure via `settings.py` with `SIMPLE_JWT` dict
- Default access token: 5 minutes (standard for security)
- Refresh token: 1 day (we won't use initially but good to have available)
- Signing algorithm: HS256 (default, secure for our use case)
- Token storage: Client-side in localStorage (simple, no refresh needed for MVP)

### 2. Token Configuration and Expiration

**Decision**: Access tokens expire in 1 hour, silent redirect on expiration

**Rationale**:
- 1 hour balance between security and UX (avoid frequent re-logins)
- User requirement specifies "token expiration period based on security best practices"
- Long enough for normal browsing sessions
- Short enough to limit damage if compromised
- silent redirect to login page when expired (as clarified)

**Configuration**:
```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),  # Available for future use
    'ROTATE_REFRESH_TOKENS': False,  # Simple implementation
    'ALGORITHM': 'HS256',
}
```

**Alternatives considered**:
- 5 minutes: Too short, frequent disconnects
- 24 hours: Too long, security risk
- Refresh token flow: More complex, deferring for MVP

### 3. Password Hashing in Django

**Decision**: Use Django's built-in password hashing (default: PBKDF2 with SHA256)

**Rationale**:
- Django's default `make_password()` and `check_password()` are industry-standard
- PBKDF2 with SHA256 is secure and tested
- Already integrated with Django User model
- Configurable via `PASSWORD_HASHERS` setting if needed
- No additional dependencies required
- Django automatically upgrades hashing if algorithm improves

**Implementation**:
```python
from django.contrib.auth.hashers import make_password, check_password

# On registration
hashed = make_password(raw_password)

# On login
is_valid = check_password(raw_password, stored_hash)
```

**Alternatives considered**:
- bcrypt: More secure but slower, not necessary for MVP
- Argon2: State-of-art but requires additional package
- Manual hashing: Security risk, never recommended

### 4. User Model Design

**Decision**: Extend Django's AbstractUser model with role field

**Rationale**:
- Django's User model has email, password, name built-in
- AbstractUser provides all necessary fields
- Easy to extend with custom fields
- Works with existing authentication middleware
- No need to create User model from scratch

**Fields needed**:
- `email` (inherited, must be unique)
- `password` (inherited, hashed via Django)
- `first_name` (inherited, for name field)
- `role` (custom, CharField with choices: 'user', 'admin')
- `date_joined` (inherited, automatic)

**Database model**:
```python
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('admin', 'Admin'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
```

**Alternatives considered**:
- Separate Role table: Overkill for two roles
- ManyToMany relationship: Complex for simple two-role system
- Use is_staff/is_superuser: Not flexible enough

### 5. API Endpoint Design

**Decision**: RESTful endpoints following API contract standards

**Rationale**:
- Consistent with existing backend structure
- Follows REST conventions
- Clear separation of concerns (register, login, profile)
- Easy to extend with additional auth features later

**Endpoints**:
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate and receive JWT token
- `GET /api/auth/profile` - Get current user profile (protected)
- `PATCH /api/auth/profile` - Update user profile (protected)

**Request/Response patterns**:
```json
// POST /api/auth/register
Request: { "email": "...", "password": "...", "name": "..." }
Response: { "token": "jwt_token", "user": { "email", "name", "role" } }

// POST /api/auth/login
Request: { "email": "...", "password": "..." }
Response: { "token": "jwt_token", "user": { "email", "name", "role" } }

// GET /api/auth/profile
Response: { "email": "...", "name": "...", "role": "user" }
```

**Alternatives considered**:
- GraphQL: Overkill for simple auth flow
- Separate service: Unnecessary complexity
- Combined register/login: Less RESTful

### 6. Token Storage on Client

**Decision**: Store JWT token in localStorage, include in Authorization header

**Rationale**:
- Simplest implementation for MVP
- No server-side session storage needed (stateless)
- Works with automatic login after registration
- Token accessible across page reloads
- Suitable for non-sensitive apps (ecommerce use case)

**Implementation**:
```typescript
// Store token
localStorage.setItem('token', jwt_token);

// Include in requests
headers: { 'Authorization': `Bearer ${token}` }

// Retrieve on page load
const token = localStorage.getItem('token');
```

**Security considerations**:
- localStorage vulnerable to XSS attacks
- Mitigated by: HTTPS only in production, input validation, CSP headers
- For future: Consider httpOnly cookies (requires CSRF protection)

**Alternatives considered**:
- sessionStorage: Token lost on tab close, not desired
- httpOnly cookies: More secure but requires CSRF tokens, deferring
- Memory storage: Token lost on page reload, poor UX

### 7. Token Validation Middleware

**Decision**: Custom DRF permission class for token validation

**Rationale**:
- DRF provides `IsAuthenticated` permission
- SimpleJWT middleware handles token validation automatically
- Works with APIView class-based views
- Clean separation of auth logic from business logic

**Implementation**:
```python
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

class ProfileView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # request.user is available after auth
        return Response({'email': request.user.email, ...})
```

**Token expiration handling**:
- Client receives 401 Unauthorized on expired token
- Frontend redirects to login page automatically
- No refresh token flow (deferred)

**Alternatives considered**:
- Decorator-based validation: Less DRF-native
- Middleware-based: More global, potential performance impact
- Manual JWT decoding: Redundant, SimpleJWT handles it

## Summary of Technical Decisions

| Component | Decision | Rationale |
|-----------|----------|-----------|
| JWT Library | django-rest-framework-simplejwt | Industry standard, DRF integration |
| Token Lifetime | 1 hour access token | Balance security/UX |
| Token Storage | localStorage | Simple, stateless |
| Password Hashing | Django's PBKDF2 (default) | Built-in, secure |
| User Model | AbstractUser + role field | Minimal custom code |
| API Design | RESTful endpoints | Consistent with API standards |
| Profile Endpoint | GET/PATCH /api/auth/profile | Standard CRUD pattern |
| Token Validation | SimpleJWT middleware | Automatic, DRF-native |

## Dependencies to Install

```bash
pip install djangorestframework-simplejwt
```

### 8. Frontend Form Validation and State Management

**Decision**: Use React Hook Form with Zod for form validation, Zustand for auth state

**Rationale**:
- React Hook Form: Performant, minimal re-renders, built-in validation
- Zod: Type-safe schema validation, shared with backend
- Zustand: Lightweight state management for auth user data
- Native integration with Next.js App Router
- Built-in error handling and field-level validation

**Implementation**:
```typescript
// Using Zod schema
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
});

// React Hook Form integration
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(registerSchema)
});
```

**Alternatives considered**:
- Formik: More boilerplate code
- HTML5 validation: Limited customization
- Custom state management: More error-prone

### 9. Next.js App Router Authentication Flow

**Decision**: Use route groups for auth pages, middleware for token validation

**Rationale**:
- Next.js 15 App Router supports route groups `(auth)` for organization
- Client-side token check in route handlers
- Automatic redirect to login on protected routes
- Server Components for SEO-optimized static pages
- Client Components for interactive forms

**Implementation**:
```typescript
// Protected route middleware
export function checkAuth(request: Request) {
  const token = request.headers.get('Authorization');
  if (!token) {
    redirect('/login');
  }
  return token;
}

// Profile page - Server Component
export default async function ProfilePage() {
  const token = await checkAuth();
  const user = await fetch('/api/auth/profile', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return <ProfileForm initialData={user} />;
}
```

### 10. Token Storage and API Integration

**Decision**: Store JWT in localStorage, inject via Axios interceptors

**Rationale**:
- localStorage accessible across page reloads
- Axios interceptors automatically add token to requests
- Simple implementation, no server-side session needed
- Works with automatic login after registration

**Implementation**:
```typescript
// Axios interceptor for token injection
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**Alternatives considered**:
- sessionStorage: Token lost on tab close
- httpOnly cookies: Requires CSRF protection
- Memory storage: No persistence

### 11. UI Components and Styling

**Decision**: Use Shadcn/ui components with Tailwind CSS

**Rationale**:
- Shadcn/ui: Pre-built accessible components, copy-paste customization
- Tailwind CSS: Utility-first, fast development, small bundle size
- Already in tech stack (constitution-compliant)
- Modern design system, mobile-responsive out of box

**Components needed**:
- Input fields with validation states
- Button components (loading states)
- Alert/error message display
- Card components for forms
- Loading spinners

## Summary of Technical Decisions

| Component | Decision | Rationale |
|-----------|----------|-----------|
| JWT Library | django-rest-framework-simplejwt | Industry standard, DRF integration |
| Token Lifetime | 1 hour access token | Balance security/UX |
| Token Storage | localStorage | Simple, stateless |
| Password Hashing | Django's PBKDF2 (default) | Built-in, secure |
| User Model | AbstractUser + role field | Minimal custom code |
| API Design | RESTful endpoints | Consistent with API standards |
| Profile Endpoint | GET/PATCH /api/auth/profile | Standard CRUD pattern |
| Token Validation | SimpleJWT middleware | Automatic, DRF-native |
| Form Validation | React Hook Form + Zod | Type-safe, performant |
| State Management | Zustand | Lightweight, simple API |
| UI Components | Shadcn/ui + Tailwind | Modern, accessible, fast |
| API Client | Axios + interceptors | Automatic token injection |

## Dependencies to Install

### Backend
```bash
pip install djangorestframework-simplejwt
```

### Frontend
```bash
npm install react-hook-form zod @hookform/resolvers axios zustand
npm install -D @types/zod
```

## Next Steps

### Backend
- Implement User model with role field
- Create serializers for register/login/profile
- Implement auth views
- Add JWT configuration to settings
- Create API routes
- Write tests

### Frontend
- Create login page with React Hook Form
- Create register page with validation
- Create profile page displaying user info
- Implement auth service with Axios
- Add Zustand auth store
- Add token interceptor
- Write component tests

