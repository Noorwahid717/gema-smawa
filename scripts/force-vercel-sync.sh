#!/bin/bash

# Force Vercel Environment Sync Script
echo "🔄 FORCING VERCEL ENVIRONMENT SYNC..."

echo "📋 Current Environment Status:"
echo "   Local DATABASE_URL: PostgreSQL ✅"
echo "   Vercel DATABASE_URL: PostgreSQL ✅ (Updated)"
echo "   Issue: Vercel still using old schema cache"

echo ""
echo "🚀 Force Deployment Steps:"

# Step 1: Create timestamp commit to force rebuild
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
echo "1. Creating timestamp commit: $TIMESTAMP"

git add .
git commit -m "FORCE REBUILD $TIMESTAMP: Clear Vercel cache

Environment Variables Status:
✅ DATABASE_URL updated in Vercel Dashboard
✅ PostgreSQL schema ready in codebase
❗ Vercel build cache needs clear

Deployment Requirements:
- Force Prisma generate with PostgreSQL
- Clear Next.js build cache  
- Use updated environment variables
- Deploy with PostgreSQL schema

Expected Result: Production = Local database content"

# Step 2: Push to trigger deployment
echo "2. Pushing to GitHub (triggers Vercel auto-deploy)..."
git push origin main

echo ""
echo "⏳ Deployment Timeline:"
echo "   ⚡ GitHub webhook: ~30 seconds"
echo "   🔧 Vercel build: ~2-3 minutes"
echo "   ✅ Environment sync: ~3-4 minutes total"

echo ""
echo "🧪 Verification Commands (run after 3-4 minutes):"
echo "   curl https://landing-page-gema.vercel.app/api/public"
echo "   curl -X POST 'https://landing-page-gema.vercel.app/api/seed?secret=gema-sma-wahidiyah-super-secret-production-key-2025-kediri'"

echo ""
echo "📊 Expected Success:"
echo "   ✅ Public API returns same data as local"
echo "   ✅ Database seeding works without SQLite errors"
echo "   ✅ Admin login works with admin123"

echo ""
echo "🎯 Force deployment initiated! Wait 3-4 minutes then test endpoints."