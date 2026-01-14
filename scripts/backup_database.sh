#!/bin/bash

# Kindra CBO - Database Backup Script
# This script creates a backup of the PostgreSQL database and uploads it to S3 (optional)

set -e

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="kindra_cbo_backup_${TIMESTAMP}.sql"
RETENTION_DAYS=30

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Starting database backup...${NC}"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Get database credentials from .env
if [ -f backend/.env ]; then
    export $(cat backend/.env | grep -v '^#' | xargs)
else
    echo -e "${RED}Error: backend/.env file not found${NC}"
    exit 1
fi

# Create backup
echo -e "${YELLOW}Creating database dump...${NC}"
docker-compose exec -T postgres pg_dump -U ${DB_USER:-postgres} ${DB_NAME:-kindra_cbo_db} > ${BACKUP_DIR}/${BACKUP_FILE}

# Compress backup
echo -e "${YELLOW}Compressing backup...${NC}"
gzip ${BACKUP_DIR}/${BACKUP_FILE}
BACKUP_FILE="${BACKUP_FILE}.gz"

echo -e "${GREEN}✓ Backup created: ${BACKUP_DIR}/${BACKUP_FILE}${NC}"

# Upload to S3 (optional)
if [ ! -z "$AWS_STORAGE_BUCKET_NAME" ]; then
    echo -e "${YELLOW}Uploading to S3...${NC}"
    aws s3 cp ${BACKUP_DIR}/${BACKUP_FILE} s3://${AWS_STORAGE_BUCKET_NAME}/backups/${BACKUP_FILE}
    echo -e "${GREEN}✓ Backup uploaded to S3${NC}"
fi

# Clean up old backups
echo -e "${YELLOW}Cleaning up old backups (older than ${RETENTION_DAYS} days)...${NC}"
find ${BACKUP_DIR} -name "kindra_cbo_backup_*.sql.gz" -mtime +${RETENTION_DAYS} -delete
echo -e "${GREEN}✓ Old backups cleaned up${NC}"

echo -e "${GREEN}Backup completed successfully!${NC}"
