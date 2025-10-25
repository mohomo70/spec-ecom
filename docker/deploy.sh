#!/bin/bash

# Production deployment script for freshwater fish ecommerce platform
# Usage: ./deploy.sh [environment]
# Environment: prod (default), staging

set -e

ENVIRONMENT=${1:-prod}
PROJECT_NAME="freshwater-fish-ecommerce"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"

echo "🚀 Deploying $PROJECT_NAME to $ENVIRONMENT environment"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker and Docker Compose are installed
check_dependencies() {
    print_status "Checking dependencies..."

    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    print_status "Dependencies check passed"
}

# Setup environment variables
setup_environment() {
    print_status "Setting up environment variables..."

    if [ ! -f ".env" ]; then
        if [ -f "docker/.env.prod" ]; then
            cp docker/.env.prod .env
            print_warning "Copied default environment file. Please update .env with your actual values!"
            print_warning "Required: SECRET_KEY, database credentials, domain settings"
            exit 1
        else
            print_error "Environment file not found. Please create .env file."
            exit 1
        fi
    fi

    print_status "Environment setup complete"
}

# Backup database before deployment
backup_database() {
    print_status "Creating database backup..."

    # Check if containers are running
    if docker ps | grep -q "${PROJECT_NAME}"; then
        # Create backup directory if it doesn't exist
        mkdir -p backups

        # Generate backup filename with timestamp
        BACKUP_FILE="backups/pre-deployment-$(date +%Y%m%d-%H%M%S).sql"

        # Create database backup
        docker exec ${PROJECT_NAME}_postgres_1 pg_dump -U fish_user freshwater_fish_db > "$BACKUP_FILE"

        if [ $? -eq 0 ]; then
            print_status "Database backup created: $BACKUP_FILE"
        else
            print_warning "Failed to create database backup"
        fi
    else
        print_warning "No running containers found, skipping database backup"
    fi
}

# Pull latest images
pull_images() {
    print_status "Pulling latest Docker images..."
    docker compose -f "$DOCKER_COMPOSE_FILE" pull
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    docker compose -f "$DOCKER_COMPOSE_FILE" exec -T backend python manage.py migrate
}

# Collect static files
collect_static() {
    print_status "Collecting static files..."
    docker compose -f "$DOCKER_COMPOSE_FILE" exec -T backend python manage.py collectstatic --noinput --clear
}

# Start services
start_services() {
    print_status "Starting services..."
    docker compose -f "$DOCKER_COMPOSE_FILE" up -d
}

# Wait for services to be healthy
wait_for_health() {
    print_status "Waiting for services to be healthy..."

    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if docker compose -f "$DOCKER_COMPOSE_FILE" ps | grep -q "healthy"; then
            print_status "All services are healthy!"
            return 0
        fi

        print_status "Waiting for services to be healthy... (attempt $attempt/$max_attempts)"
        sleep 10
        ((attempt++))
    done

    print_error "Services failed to become healthy within expected time"
    return 1
}

# Run post-deployment checks
post_deployment_checks() {
    print_status "Running post-deployment checks..."

    # Check if services are running
    if docker compose -f "$DOCKER_COMPOSE_FILE" ps | grep -q "Up"; then
        print_status "✅ Services are running"
    else
        print_error "❌ Services are not running properly"
        return 1
    fi

    # Check health endpoint
    sleep 5
    if curl -f -s http://localhost/health/ > /dev/null; then
        print_status "✅ Health check passed"
    else
        print_warning "⚠️ Health check failed - services may still be starting"
    fi

    print_status "Post-deployment checks complete"
}

# Main deployment function
deploy() {
    print_status "Starting deployment to $ENVIRONMENT environment"

    check_dependencies
    setup_environment
    backup_database
    pull_images

    print_status "Stopping existing services..."
    docker compose -f "$DOCKER_COMPOSE_FILE" down

    print_status "Starting deployment..."
    start_services

    if wait_for_health; then
        run_migrations
        collect_static
        post_deployment_checks

        print_status "🎉 Deployment completed successfully!"
        print_status "Your application should be available at:"
        print_status "  Frontend: http://your-domain.com"
        print_status "  Admin: http://your-domain.com/admin/"
        print_status "  Health: http://your-domain.com/health/"
    else
        print_error "Deployment failed - services did not become healthy"
        print_status "Check logs with: docker compose -f $DOCKER_COMPOSE_FILE logs"
        exit 1
    fi
}

# Rollback function
rollback() {
    print_warning "Rolling back deployment..."

    # Stop current services
    docker compose -f "$DOCKER_COMPOSE_FILE" down

    # Find latest backup
    LATEST_BACKUP=$(ls -t backups/pre-deployment-*.sql 2>/dev/null | head -1)

    if [ -n "$LATEST_BACKUP" ]; then
        print_status "Restoring from backup: $LATEST_BACKUP"

        # Start only database service
        docker compose -f "$DOCKER_COMPOSE_FILE" up -d postgres

        # Wait for database to be ready
        sleep 10

        # Restore backup
        docker exec -i ${PROJECT_NAME}_postgres_1 psql -U fish_user freshwater_fish_db < "$LATEST_BACKUP"

        print_status "Database restored from backup"
    else
        print_warning "No backup found for rollback"
    fi

    # Restart all services
    docker compose -f "$DOCKER_COMPOSE_FILE" up -d

    print_status "Rollback completed"
}

# Show usage
usage() {
    echo "Usage: $0 [environment] [command]"
    echo ""
    echo "Environments:"
    echo "  prod     Production environment (default)"
    echo "  staging  Staging environment"
    echo ""
    echo "Commands:"
    echo "  deploy   Full deployment (default)"
    echo "  rollback Rollback to previous version"
    echo ""
    echo "Examples:"
    echo "  $0                    # Deploy to production"
    echo "  $0 staging           # Deploy to staging"
    echo "  $0 prod rollback     # Rollback production"
}

# Main script logic
case "${2:-deploy}" in
    "deploy")
        deploy
        ;;
    "rollback")
        rollback
        ;;
    *)
        usage
        exit 1
        ;;
esac