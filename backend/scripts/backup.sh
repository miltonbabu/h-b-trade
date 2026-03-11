#!/bin/bash

BACKUP_DIR="/var/backups/hbtrade"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="hbtrade_${DATE}.sql.gz"

mkdir -p $BACKUP_DIR

export PGPASSWORD=$DB_PASSWORD

pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME | gzip > "${BACKUP_DIR}/${BACKUP_FILE}"

find $BACKUP_DIR -name "hbtrade_*.sql.gz" -type f -mtime +7 -delete

echo "Backup created: ${BACKUP_DIR}/${BACKUP_FILE}"
