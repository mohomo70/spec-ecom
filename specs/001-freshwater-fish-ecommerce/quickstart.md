# Quick Start Guide: Freshwater Fish Ecommerce Platform

**Date**: 2025-10-21
**Target Audience**: Developers setting up the project locally
**Estimated Setup Time**: 30-45 minutes

## Prerequisites

### System Requirements
- **Operating System**: Linux, macOS, or Windows (WSL2)
- **Node.js**: Version 18.17 or higher
- **Python**: Version 3.11 or higher
- **PostgreSQL**: Version 13 or higher
- **Git**: Version 2.30 or higher
- **Docker** (optional, for containerized development)

### Required Tools
```bash
# Install Node.js (using nvm recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18.17
nvm use 18.17

# Install Python and pip
# (Installation varies by OS - use system package manager)

# Install Docker and Docker Compose
# Ubuntu/Debian:
sudo apt update && sudo apt install docker.io docker-compose

# macOS (using Homebrew):
brew install docker docker-compose

# Windows: Download from docker.com

# Alternative: Install PostgreSQL directly (if not using Docker)
# Ubuntu/Debian:
sudo apt update && sudo apt install postgresql postgresql-contrib

# macOS (using Homebrew):
brew install postgresql
brew services start postgresql

# Windows: Download from postgresql.org
```

## Project Setup

### 1. Clone and Initialize Repository

```bash
# Clone the repository
git clone <repository-url>
cd freshwater-fish-ecommerce

# Switch to feature branch
git checkout 001-freshwater-fish-ecommerce

# Install root dependencies (if any)
npm install
```

### 2. Backend Setup (Django)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials and secret keys

# Create PostgreSQL database
createdb freshwater_fish_db

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Load initial data (if available)
python manage.py loaddata initial_data.json

# Start development server
python manage.py runserver
```

**Expected Output:**
```
Django version 4.2.x, using settings 'config.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
```

### 3. Frontend Setup (Next.js)

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with API endpoints and configuration

# Start development server
npm run dev
```

**Expected Output:**
```
▲ Next.js 15.x.x
- Local:        http://localhost:3000
- Environments: .env.local
- Experiments:  app
```

### 4. Database Configuration

#### Option 1: Using Docker Compose (Recommended)

```bash
# Start PostgreSQL with Docker Compose
docker compose up -d postgres

# Wait for database to be ready
sleep 10
```

#### Option 2: Direct PostgreSQL Installation

Create a PostgreSQL database and user:

```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create database and user
CREATE DATABASE freshwater_fish_db;
CREATE USER fish_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE freshwater_fish_db TO fish_user;
ALTER USER fish_user CREATEDB;
```

Update your `.env` files with database credentials:

**Backend (.env):**
```env
DATABASE_URL=postgresql://fish_user:your_secure_password@localhost:5432/freshwater_fish_db
SECRET_KEY=your-django-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Development Workflow

### Starting the Development Environment

#### Option 1: Using Docker Compose (Recommended)

```bash
# Start all services
docker compose up -d

# Terminal 1: Start Django backend
cd backend
source venv/bin/activate
python manage.py runserver

# Terminal 2: Start Next.js frontend
cd frontend
npm run dev
```

#### Option 2: Manual Setup

```bash
# Terminal 1: Start Django backend
cd backend
source venv/bin/activate
python manage.py runserver

# Terminal 2: Start Next.js frontend
cd frontend
npm run dev

# Terminal 3: Start PostgreSQL (if not running as service)
sudo systemctl start postgresql  # Linux
brew services start postgresql   # macOS
```

### Running Tests

```bash
# Backend tests
cd backend
source venv/bin/activate
python manage.py test

# Frontend tests
cd frontend
npm test

# E2E tests (if configured)
npm run test:e2e
```

### Database Management

```bash
# Create new migration
cd backend
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser for admin access
python manage.py createsuperuser

# Access Django admin
# Visit: http://localhost:8000/admin/
```

## Key URLs and Endpoints

### Development URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/v1
- **Django Admin**: http://localhost:8000/admin/
- **API Documentation**: http://localhost:8000/api/docs/ (if configured)

### API Endpoints
- `GET /api/v1/products/` - List/search products
- `POST /api/v1/auth/register/` - User registration
- `POST /api/v1/auth/login/` - User authentication
- `GET /api/v1/orders/` - User's order history
- `POST /api/v1/checkout/` - Create order

## Troubleshooting

### Common Issues

**Database Connection Error:**
```bash
# If using Docker Compose
docker compose ps
docker compose logs postgres

# If using direct PostgreSQL
sudo systemctl status postgresql  # Linux
brew services list | grep postgresql  # macOS

# Reset database
dropdb freshwater_fish_db
createdb freshwater_fish_db
python manage.py migrate
```

**Port Already in Use:**
```bash
# Find process using port
lsof -i :8000  # Backend port
lsof -i :3000  # Frontend port

# Kill process
kill -9 <PID>
```

**Module Not Found Errors:**
```bash
# Reinstall dependencies
cd backend && pip install -r requirements.txt
cd frontend && rm -rf node_modules && npm install
```

**CORS Issues:**
- Ensure `ALLOWED_HOSTS` in Django settings includes frontend URL
- Check CORS middleware configuration in Django

### Performance Optimization

```bash
# Clear Next.js cache
cd frontend
rm -rf .next && npm run build

# Django cache clear
cd backend
python manage.py clear_cache
```

## Development on VPS

### Running in Development Mode

Since you're developing directly on your VPS, you can run the application in development mode:

1. **Start PostgreSQL** (using Docker):
   ```bash
   docker compose up -d postgres
   ```

2. **Start Django backend**:
   ```bash
   cd backend
   source venv/bin/activate
   python manage.py runserver 0.0.0.0:8000
   ```

3. **Start Next.js frontend**:
   ```bash
   cd frontend
   npm run dev -- -H 0.0.0.0
   ```

4. **Access your application**:
   - Frontend: `http://your-vps-ip:3000`
   - Backend API: `http://your-vps-ip:8000`
   - Admin: `http://your-vps-ip:8000/admin/`

### Environment Configuration

Your `.env` file is already configured for development with your VPS IP (45.140.147.81) included in ALLOWED_HOSTS and CORS settings.

## Next Steps

1. **Explore the Admin Interface**: Visit `/admin/` to manage products and orders
2. **Test Core Functionality**: Try registering a user and browsing products
3. **Review API Documentation**: Check `/api/docs/` for detailed endpoint information
4. **Run the Test Suite**: Ensure all tests pass before making changes
5. **Set Up Monitoring**: Configure logging and error tracking for production
6. **Database Management with Docker**: Use `docker compose down` to stop services, `docker compose up -d` to restart

## Support

- **Documentation**: Check `/docs/` directory for detailed guides
- **Issues**: Report bugs in the project issue tracker
- **Discussions**: Use project discussions for questions

---

**Note**: This guide assumes a standard development environment. Adjust paths and commands based on your specific setup.