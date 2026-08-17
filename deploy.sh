#!/bin/bash
# Deployment script for VPS via Docker Compose

echo "Starting deployment..."
# Pull the latest code (uncomment if using git)
# git pull origin main

echo "Building Docker containers..."
docker compose build

echo "Applying Database Migrations..."
# Start dependencies (postgres) first if they are not running
docker compose up -d gencsosyal-postgres
# Wait for postgres to be healthy is handled automatically by depends_on in docker-compose run
docker compose run --rm gencsosyal-migrate
MIGRATION_STATUS=$?

if [ $MIGRATION_STATUS -ne 0 ]; then
  echo "❌ Database migration failed. Deployment stopped. Rollback recommended."
  exit 1
fi

echo "✅ Migrations successful. Starting Application..."
docker compose up -d gencsosyal-app nginx

echo "Cleaning up dangling images..."
docker image prune -f

echo "Deployment finished successfully!"
