#!/bin/bash
set -Eeuo pipefail

echo "Starting Genç Sosyal deployment process..."

# 1. Verification of environment and dependencies
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH."
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo "❌ docker compose is not installed or not in PATH."
    exit 1
fi

if [ ! -f .env ]; then
    echo "❌ .env file not found. Please copy .env.example to .env and configure it."
    exit 1
fi

# 2. Pull the latest code (uncomment if you want deploy.sh to handle pulling)
# git pull origin main

echo "✅ Environment verified. Building Docker containers..."
docker compose build

echo "✅ Build completed. Starting services..."
# This single command will deterministically start:
# 1. postgres (and wait for health)
# 2. migrate (and wait for successful completion)
# 3. app (and wait for health)
# 4. nginx
docker compose up -d

# 3. Migration Check & Health Verification
echo "⏳ Waiting for application to report healthy state (timeout: 60s)..."
MAX_RETRIES=12
RETRY_COUNT=0
HEALTH_OK=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    # Docker inspect health status
    APP_STATUS=$(docker inspect --format='{{json .State.Health.Status}}' gencsosyal-app 2>/dev/null || echo '"unknown"')
    
    if [ "$APP_STATUS" == '"healthy"' ]; then
        HEALTH_OK=true
        break
    elif [ "$APP_STATUS" == '"unhealthy"' ]; then
        echo "❌ Application became unhealthy!"
        break
    fi
    
    # Check if migrate container failed
    MIGRATE_EXIT=$(docker inspect --format='{{.State.ExitCode}}' gencsosyal-migrate 2>/dev/null || echo '0')
    if [ "$MIGRATE_EXIT" != "0" ]; then
        echo "❌ Database migration container failed with exit code $MIGRATE_EXIT."
        docker compose logs gencsosyal-migrate
        break
    fi

    sleep 5
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "  ... checking health ($RETRY_COUNT/$MAX_RETRIES)"
done

if [ "$HEALTH_OK" = true ]; then
    echo "✅ Application is HEALTHY."
    echo "🧹 Cleaning up dangling images..."
    docker image prune -f
    echo "🚀 Deployment finished successfully!"
else
    echo "❌ Deployment failed health checks or timed out."
    echo "To rollback, you can run: git checkout <previous_commit> && ./deploy.sh"
    echo "Here are the recent app logs:"
    docker compose logs --tail=50 gencsosyal-app
    exit 1
fi
