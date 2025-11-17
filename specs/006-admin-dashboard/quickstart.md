# Quickstart Guide: Admin Dashboard

**Feature**: 006-admin-dashboard | **Date**: 2025-01-27

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL database
- Redis (for caching)
- Existing JWT authentication system (feature 003-jwt-auth)

## Development Setup

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create admin views module**:
   ```bash
   touch api/views/admin.py
   touch api/serializers/admin.py
   touch api/urls/admin.py
   ```

3. **Install dependencies** (if not already installed):
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations**:
   ```bash
   python manage.py migrate
   ```

5. **Create admin user via Django admin**:
   ```bash
   python manage.py createsuperuser
   # Or use Django admin at /admin/ to set user role to 'admin'
   ```

6. **Start development server**:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

3. **Create admin dashboard structure**:
   ```bash
   mkdir -p src/app/admin/{products,categories,orders,articles,users}
   mkdir -p src/components/admin
   mkdir -p src/lib/api
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

## API Endpoints

### Base URL
```
/api/v1/admin
```

### Authentication
All endpoints require JWT authentication with admin role:
```
Authorization: Bearer <jwt_token>
```

### Key Endpoints

- `GET /api/v1/admin/dashboard/stats` - Dashboard statistics
- `GET /api/v1/admin/users` - List users
- `POST /api/v1/admin/users` - Create user
- `PATCH /api/v1/admin/users/{id}` - Update user (role read-only)
- `GET /api/v1/admin/products` - List products
- `POST /api/v1/admin/products` - Create product
- `PATCH /api/v1/admin/products/{id}` - Update product
- `GET /api/v1/admin/categories` - List categories
- `GET /api/v1/admin/orders` - List orders
- `PATCH /api/v1/admin/orders/{id}` - Update order
- `GET /api/v1/admin/articles` - List articles
- `POST /api/v1/admin/articles` - Create article

See [contracts/admin-api.yaml](./contracts/admin-api.yaml) for full API specification.

## Frontend Routes

### Admin Dashboard Routes
- `/admin` - Dashboard overview
- `/admin/products` - Product management
- `/admin/products/new` - Create product
- `/admin/products/[id]` - Edit product
- `/admin/categories` - Category management
- `/admin/orders` - Order management
- `/admin/orders/[id]` - Order details
- `/admin/articles` - Article management
- `/admin/users` - User management

## Testing

### Backend Tests
```bash
cd backend
pytest api/tests/test_admin.py
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Key Implementation Notes

### Authentication
- Extends existing JWT system
- Check `user.role === 'admin'` in JWT token
- Role verification in permission classes

### Conflict Detection
- Frontend stores `updated_at` when entity loaded
- Backend compares timestamp on save
- Returns conflict warning if mismatch (but allows save)

### Bulk Operations
- POST to `/bulk` endpoints
- Requires confirmation for 5+ items
- Supports create, update, delete, status changes

### Role Management
- User role field is read-only in admin dashboard
- Role changes must be done via Django admin (`/admin/`)
- API rejects role modification with 403 Forbidden

## Common Tasks

### Create Admin User
1. Create user via Django admin or registration
2. Go to Django admin (`/admin/`)
3. Edit user and set role to 'admin'

### Access Admin Dashboard
1. Login with admin user credentials
2. Navigate to `/admin`
3. Dashboard displays statistics and navigation

### Manage Products
1. Navigate to `/admin/products`
2. Click "Create Product" or edit existing
3. Fill form and save
4. Upload images via product detail page

### Handle Conflicts
1. If conflict warning appears, review changes
2. Click "Save Anyway" to proceed (last-write-wins)
3. Or refresh page to see latest version

## Troubleshooting

### Cannot Access Admin Dashboard
- Verify user has `role='admin'` in database
- Check JWT token includes role in payload
- Verify authentication middleware is working

### Role Changes Not Working
- Role field is read-only in admin dashboard
- Use Django admin (`/admin/`) to change roles
- API will reject role modification attempts

### Conflict Warnings
- Normal behavior when multiple admins edit same entity
- System uses last-write-wins strategy
- Review changes before saving

### Bulk Operations Failing
- Verify all IDs are valid UUIDs
- Check entity relationships (e.g., cannot delete category with products)
- Review error messages for specific issues

