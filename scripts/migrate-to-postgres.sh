#!/bin/bash

# Database Migration Script - Switch from SQLite to PostgreSQL
echo "🔄 Migrating from SQLite to PostgreSQL..."

# Step 1: Generate new Prisma client
echo "📦 Generating Prisma client for PostgreSQL..."
npx prisma generate

# Step 2: Push schema to database (create tables)
echo "📋 Creating database schema..."
npx prisma db push --force-reset

# Step 3: Run seed (create admin user and sample data)
echo "🌱 Seeding database..."
npx prisma db seed

echo "✅ Migration completed!"
echo ""
echo "🎉 Database ready with:"
echo "   - Admin user: admin@smawahidiyah.edu / admin123"
echo "   - Sample announcements and activities"
echo "   - PostgreSQL schema optimized for production"
echo ""
echo "🚀 Ready for deployment!"