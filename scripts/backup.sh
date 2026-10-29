#!/usr/bin/env bash
# ==============================================================================
# 💾 Apex Bank - Automated MongoDB Backup Runbook (Disaster Recovery)
# ==============================================================================
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups/mongodb}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="bankdb_backup_${TIMESTAMP}.gz"
CONTAINER_NAME="apex-bank-mongodb"

mkdir -p "${BACKUP_DIR}"

echo "================================================================="
echo "💾 [DevOps Backup] Starting automated MongoDB snapshot..."
echo "================================================================="

if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "📦 Dumping database 'bankdb' from container '${CONTAINER_NAME}'..."
    docker exec "${CONTAINER_NAME}" mongodump \
        --db=bankdb \
        --archive \
        --gzip > "${BACKUP_DIR}/${FILENAME}"

    echo "✅ Backup created successfully: ${BACKUP_DIR}/${FILENAME}"
    echo "📊 Snapshot size: $(du -h "${BACKUP_DIR}/${FILENAME}" | cut -f1)"

    # Prune snapshots older than 7 days
    echo "🧹 Pruning backups older than 7 days..."
    find "${BACKUP_DIR}" -type f -name "bankdb_backup_*.gz" -mtime +7 -delete || true
    echo "✅ Backup retention policy verified (7-day rolling window)."
else
    echo "⚠️ Warning: Container '${CONTAINER_NAME}' is not currently running."
    echo "Attempting host mongodump on localhost:27017..."
    mongodump --db=bankdb --archive="${BACKUP_DIR}/${FILENAME}" --gzip || {
        echo "❌ Error: Could not connect to MongoDB."
        exit 1
    }
fi

echo "================================================================="
