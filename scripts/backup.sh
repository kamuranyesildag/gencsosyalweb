#!/usr/bin/env bash
# ==============================================================================
# Genç Sosyal - Database Backup & Recovery Script
# Performs automated backups for PostgreSQL (production) or PGlite (local fallback).
# Retains the last 7 daily backups to prevent disk overflow.
# ==============================================================================

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p "${BACKUP_DIR}"

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Starting Genç Sosyal database backup..."

if [ -n "${DATABASE_URL:-}" ]; then
  # Production PostgreSQL backup using pg_dump
  BACKUP_FILE="${BACKUP_DIR}/gencsosyal_db_${TIMESTAMP}.sql.gz"
  echo "Target: Remote PostgreSQL Database"
  
  if command -v pg_dump >/dev/null 2>&1; then
    pg_dump "${DATABASE_URL}" | gzip > "${BACKUP_FILE}"
    echo "✓ Backup created successfully: ${BACKUP_FILE}"
    echo "Size: $(du -h "${BACKUP_FILE}" | cut -f1)"
  else
    echo "⚠️ Warning: pg_dump utility not installed in current environment."
    echo "Skipping pg_dump. Make sure PostgreSQL client tools are installed in your container."
  fi
else
  # Local PGlite backup (archive the database directory)
  if [ -d "./database" ]; then
    BACKUP_FILE="${BACKUP_DIR}/gencsosyal_pglite_${TIMESTAMP}.tar.gz"
    echo "Target: Local PGlite Database Directory (./database)"
    tar -czf "${BACKUP_FILE}" ./database
    echo "✓ PGlite backup created successfully: ${BACKUP_FILE}"
    echo "Size: $(du -h "${BACKUP_FILE}" | cut -f1)"
  else
    echo "⚠️ Neither DATABASE_URL nor ./database directory exists. Nothing to backup."
    exit 0
  fi
fi

# Cleanup old backups (keep last 7)
echo "Cleaning up older backups (retaining latest 7)..."
find "${BACKUP_DIR}" -type f -name "gencsosyal_*" | sort -r | tail -n +8 | xargs -r rm -f
echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Backup process completed."
