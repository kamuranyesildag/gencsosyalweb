#!/bin/bash
set -Eeuo pipefail

echo "=================================================="
echo "GENÇ SOSYAL - SECURE VDS INSTALLER"
echo "=================================================="

# 1. Verification of environment and dependencies
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH."
    exit 1
fi

if ! command -v openssl &> /dev/null; then
    echo "❌ openssl is required to generate secure secrets. Please install it."
    exit 1
fi

if [ -f .env ]; then
    echo "ℹ️  .env file already exists. Skipping secret generation."
else
    echo -n "Enter the application domain (e.g., https://gencsosyal.com or http://localhost:3000): "
    read DOMAIN
    if [ -z "$DOMAIN" ]; then
        DOMAIN="http://localhost:3000"
    fi
    echo "🔒 Generating secure random secrets for .env..."
    
    JWT_SECRET=$(openssl rand -hex 32)
    JWT_REFRESH_SECRET=$(openssl rand -hex 32)
    JWT_EMAIL_SECRET=$(openssl rand -hex 32)
    JWT_2FA_SECRET=$(openssl rand -hex 32)
    ENCRYPTION_KEY=$(openssl rand -hex 32)
    POSTGRES_PASSWORD=$(openssl rand -hex 24)
    
    cat << ENV_EOF > .env
# Environment configuration for Genç Sosyal
APP_URL="${DOMAIN}"
FRONTEND_URL="${DOMAIN}"
CORS_ORIGIN="${DOMAIN}"

PORT=3000
NODE_ENV="production"
SETUP_COMPLETED="false"

# Database
POSTGRES_USER="gencsosyal"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD}"
POSTGRES_DB="genc_sosyal"
DATABASE_URL="postgresql://gencsosyal:${POSTGRES_PASSWORD}@gencsosyal-postgres:5432/genc_sosyal"

# Security
JWT_SECRET="${JWT_SECRET}"
JWT_REFRESH_SECRET="${JWT_REFRESH_SECRET}"
JWT_EMAIL_SECRET="${JWT_EMAIL_SECRET}"
JWT_2FA_SECRET="${JWT_2FA_SECRET}"
ENCRYPTION_KEY="${ENCRYPTION_KEY}"

ACCESS_TOKEN_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"

# Uploads
UPLOAD_DIR="/app/uploads"

# SMTP Configuration (Empty by default, will fail setup if not provided, or Setup API can handle it)
SMTP_HOST=""
SMTP_PORT=587
SMTP_SECURE="false"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="Genç Sosyal <noreply@yourdomain.com>"
ENV_EOF
    
    chmod 600 .env
    echo "✅ .env file created successfully with secure random secrets."
fi

echo "🚀 Starting deployment..."
chmod +x deploy.sh
./deploy.sh

echo "=================================================="
echo "INSTALLATION COMPLETE."
echo "Your secure secrets have been written to .env"
echo "IMPORTANT: Do NOT expose the .env file."
echo "=================================================="
