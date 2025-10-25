#!/bin/bash

# Database backup script for freshwater fish ecommerce platform
# Usage: ./backup.sh [type]
# Types: full (default), schema-only, data-only

set -e

BACKUP_TYPE=${1:-full}
PROJECT_NAME="freshwater-fish-ecommerce"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create backup directory
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        print_status "Created backup directory: $BACKUP_DIR"
    fi
}

# Full database backup
backup_full() {
    local filename="${BACKUP_DIR}/full-backup-${TIMESTAMP}.sql"
    print_status "Creating full database backup: $filename"

    docker exec ${PROJECT_NAME}_postgres_1 pg_dump \
        -U fish_user \
        --no-password \
        --format=custom \
        --compress=9 \
        --verbose \
        --file=/backups/$(basename "$filename") \
        freshwater_fish_db

    print_status "Full backup completed: $filename"
    echo "$filename"
}

# Schema-only backup
backup_schema() {
    local filename="${BACKUP_DIR}/schema-backup-${TIMESTAMP}.sql"
    print_status "Creating schema-only backup: $filename"

    docker exec ${PROJECT_NAME}_postgres_1 pg_dump \
        -U fish_user \
        --no-password \
        --schema-only \
        --no-owner \
        --no-privileges \
        freshwater_fish_db > "$filename"

    print_status "Schema backup completed: $filename"
    echo "$filename"
}

# Data-only backup
backup_data() {
    local filename="${BACKUP_DIR}/data-backup-${TIMESTAMP}.sql"
    print_status "Creating data-only backup: $filename"

    docker exec ${PROJECT_NAME}_postgres_1 pg_dump \
        -U fish_user \
        --no-password \
        --data-only \
        --no-owner \
        --no-privileges \
        --column-inserts \
        freshwater_fish_db > "$filename"

    print_status "Data backup completed: $filename"
    echo "$filename"
}

# Compress backup file
compress_backup() {
    local file="$1"
    if [ -f "$file" ]; then
        print_status "Compressing backup file..."
        gzip "$file"
        print_status "Backup compressed: ${file}.gz"
        echo "${file}.gz"
    else
        print_error "Backup file not found: $file"
        return 1
    fi
}

# Upload to remote storage (optional)
upload_to_remote() {
    local file="$1"
    # Add your remote upload logic here
    # Examples: AWS S3, Google Cloud Storage, Dropbox, etc.
    print_status "Remote upload not configured. Implement as needed."
}

# Cleanup old backups
cleanup_old_backups() {
    local days=${BACKUP_RETENTION_DAYS:-30}
    print_status "Cleaning up backups older than $days days..."

    find "$BACKUP_DIR" -name "*.sql.gz" -type f -mtime +$days -delete
    find "$BACKUP_DIR" -name "*.sql" -type f -mtime +$days -delete

    print_status "Cleanup completed"
}

# Verify backup integrity
verify_backup() {
    local file="$1"
    print_status "Verifying backup integrity..."

    if [[ "$file" == *.gz ]]; then
        # Decompress and check
        gunzip -c "$file" | head -20 > /dev/null
    else
        # Check SQL file
        head -20 "$file" > /dev/null
    fi

    if [ $? -eq 0 ]; then
        print_status "Backup integrity check passed"
        return 0
    else
        print_error "Backup integrity check failed"
        return 1
    fi
}

# Send notification (optional)
send_notification() {
    local status="$1"
    local file="$2"
    # Add notification logic here (email, Slack, etc.)
    print_status "Backup $status: $file"
}

# Main backup function
main() {
    print_status "Starting database backup (type: $BACKUP_TYPE)"

    # Check if containers are running
    if ! docker ps | grep -q "${PROJECT_NAME}"; then
        print_error "Docker containers are not running. Please start services first."
        exit 1
    fi

    create_backup_dir

    local backup_file=""

    case "$BACKUP_TYPE" in
        "full")
            backup_file=$(backup_full)
            ;;
        "schema")
            backup_file=$(backup_schema)
            ;;
        "data")
            backup_file=$(backup_data)
            ;;
        *)
            print_error "Invalid backup type. Use: full, schema, or data"
            exit 1
            ;;
    esac

    # Compress backup
    compressed_file=$(compress_backup "$backup_file")

    # Verify backup
    if verify_backup "$compressed_file"; then
        # Upload to remote storage
        upload_to_remote "$compressed_file"

        # Send success notification
        send_notification "completed successfully" "$compressed_file"

        # Cleanup old backups
        cleanup_old_backups

        print_status "🎉 Backup process completed successfully!"
        print_status "Backup file: $compressed_file"
    else
        send_notification "failed" "$backup_file"
        print_error "Backup verification failed"
        exit 1
    fi
}

# Show usage
usage() {
    echo "Database Backup Script for Freshwater Fish Ecommerce"
    echo ""
    echo "Usage: $0 [type]"
    echo ""
    echo "Types:"
    echo "  full      Full database backup (default)"
    echo "  schema    Schema-only backup"
    echo "  data      Data-only backup"
    echo ""
    echo "Examples:"
    echo "  $0              # Full backup"
    echo "  $0 schema       # Schema only"
    echo "  $0 data         # Data only"
    echo ""
    echo "Environment variables:"
    echo "  BACKUP_RETENTION_DAYS  Number of days to keep backups (default: 30)"
}

# Run main function or show usage
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    usage
else
    main
fi