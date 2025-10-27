# Data Model: JWT Authentication System

**Feature**: 003-jwt-auth | **Date**: 2025-06-19

## Entities

### User

**Purpose**: Represents a user account in the system

**Attributes**:
- `id` (Integer, Primary Key) - Auto-generated unique identifier
- `email` (String, Unique, Not Null) - User's email address, used for login
- `password` (String, Hashed, Not Null) - Hashed password using Django's PBKDF2
- `first_name` (String, Optional) - User's display name
- `role` (String, Default='user') - User role: 'user' or 'admin'
- `date_joined` (DateTime, Auto) - Account creation timestamp
- `is_active` (Boolean, Default=True) - Account status flag

**Constraints**:
- Email must be unique across all users
- Email format must be valid (validated by frontend and backend)
- Password minimum 8 characters
- Role can only be 'user' or 'admin' (choices: ROLE_CHOICES)
- Default role for new users: 'user'

**Relationships**:
- One User can have many authentication sessions (via JWT tokens, not stored in DB)
- One User belongs to zero or more orders (future feature)

**State Transitions**:
1. Registration: User created with role='user', is_active=True
2. Login: User receives JWT token, no DB change
3. Logout: JWT token invalidated on client, no DB change
4. Profile update: first_name, email can be updated by user; role updated by admin only
5. Deactivation: is_active set to False (future feature)

**Validation Rules**:
- Email: Must match regex pattern `^[^@]+@[^@]+\.[^@]+$`
- Password: Minimum 8 characters, stored as hash
- Name: No special restrictions (allows special characters)

**Indexes**:
- `email` - Unique index for fast login lookups
- `role` - Index for admin/user filtering (future admin features)

## Authentication Flow (No Stored Entities)

**JWT Token**:
- Contains: user_id, email, role, token type, expiration timestamp
- Signed with HS256 algorithm
- No database storage (stateless)
- Client-side storage in localStorage
- Expires after 1 hour

**Session Management**:
- Stateless design (no session table)
- Token validated on each request
- Token expiration triggers silent redirect to login
- No session invalidation logic (deferred)

## Schema Migration

```python
# Backend schema changes

# Add to existing User model (extends AbstractUser)
class User(AbstractUser):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('admin', 'Admin'),
    ]
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='user'
    )
```

**Migration impact**: Adds single field to existing User table, backward compatible

