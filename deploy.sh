#!/bin/bash
set -e

cd /root/emergency-food-tracker

echo "=== Quick Deploy ==="

# Install deps if needed (cached by npm)
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
    echo "Installing dependencies..."
    npm ci
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Build Next.js locally (uses .next/cache - much faster)
echo "Building Next.js..."
npm run build

# Build Docker image using compose
echo "Building Docker image..."
docker compose build app

# Restart the app
echo "Restarting app..."
docker compose up -d app

echo "=== Deploy complete ==="
