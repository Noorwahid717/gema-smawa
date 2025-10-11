# Quick Database Setup untuk Vercel Production

## 🚨 **MASALAH UTAMA**
SQLite (`file:./prod.db`) tidak bisa digunakan di Vercel production karena filesystem read-only.

## ✅ **SOLUSI CEPAT - Vercel Postgres**

### 1. Setup Vercel Postgres (Recommended)

1. **Buka Vercel Dashboard:**
   - Go to: https://vercel.com/dashboard
   - Pilih project `landing-page-gema`
   - Tab "Storage" → "Create Database"
   - Pilih "Postgres" → Create

2. **Copy Connection String:**
   ```
   POSTGRES_URL="postgresql://username:password@host:port/database"
   ```

3. **Update Environment Variables:**
   ```bash
   # Ganti DATABASE_URL dengan Postgres URL
   DATABASE_URL=postgresql://username:password@host:port/database
   ```

4. **Redeploy + Auto Migration:**
   - Vercel akan auto-run migrations
   - Database siap dengan admin user

### 2. Alternative: Supabase (Free)

1. **Create Supabase Project:**
   - https://supabase.com/dashboard
   - New Project → Copy Database URL

2. **Update Environment Variable:**
   ```bash
   DATABASE_URL=postgresql://postgres:password@host:port/postgres
   ```

### 3. Alternative: PlanetScale (MySQL)

1. **Create Database:**
   - https://planetscale.com/
   - New Database → Copy connection string

2. **Update DATABASE_URL:**
   ```bash
   DATABASE_URL=mysql://username:password@host/database?sslaccept=strict
   ```

## 🚀 **LANGKAH CEPAT (5 menit):**

1. **Vercel Dashboard** → Storage → Create Postgres
2. **Copy DATABASE_URL** ke Environment Variables  
3. **Remove old DATABASE_URL** (SQLite)
4. **Redeploy** → Database auto-migrated
5. **Login admin:** `admin@smawahidiyah.edu` / `admin123`

## 📋 **Status Check:**
- ❌ SQLite file tidak compatible dengan Vercel
- ✅ Postgres/MySQL cloud database needed
- ✅ Auto-seeding via Prisma migrations
- ✅ Admin user akan dibuat otomatis

**5 menit setup → Admin panel working!** 🎉