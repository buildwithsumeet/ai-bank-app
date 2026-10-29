#!/usr/bin/env bash
# ==============================================================================
# 🔄 Apex Bank - Database Disaster Recovery & Restore Runbook
# ==============================================================================
set -euo pipefail

BACKUP_FILE="${1:-}"
CONTAINER_NAME="apex-bank-mongodb"

if [ -z "${BACKUP_FILE}" ]; then
    echo "❌ Usage: ./scripts/restore.sh <path-to-backup.gz>"
    echo "Example: ./scripts/restore.sh ./backups/mongodb/bankdb_backup_20261029_120000.gz"
    exit 1
fi

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "❌ Error: Backup archive '${BACKUP_FILE}' not found."
    exit 1
fi

echo "================================================================="
echo "⚠️ [DevOps Restore] Restoring 'bankdb' from snapshot: ${BACKUP_FILE}"
echo "================================================================="

if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    cat "${BACKUP_FILE}" | docker exec -i "${CONTAINER_NAME}" mongorestore \
        --archive \
        --gzip \
        --drop \
        --nsInclude="bankdb.*"

    echo "✅ Database restore completed successfully into '${CONTAINER_NAME}'."
else
    mongorestore --archive="${BACKUP_FILE}" --gzip --drop --nsInclude="bankdb.*"
    echo "✅ Database restore completed successfully on host MongoDB."
fi

echo "================================================================="
