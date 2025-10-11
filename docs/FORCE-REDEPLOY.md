# Force Vercel Redeploy - PostgreSQL Fix

## 🚨 ISSUE: Vercel masih menggunakan SQLite schema lama

**Error yang terjadi:**
```
"provider = \"sqlite\"" 
```

**Padahal kita sudah update ke:**
```
"provider = \"postgresql\""
```

## ✅ SOLUTION STEPS:

### 1. Update Environment Variables di Vercel Dashboard

**CRITICAL:** Tambahkan/Update environment variables ini:

```bash
DATABASE_URL=postgresql://neondb_owner:npg_wS5r8XtiTzJQ@ep-calm-salad-a1ln0go2-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

**Steps:**
1. Go to: https://vercel.com/dashboard
2. Select project: `landing-page-gema`
3. Settings → Environment Variables
4. Update `DATABASE_URL` untuk **Production** environment
5. Redeploy

### 2. Force Redeploy

```bash
# Option 1: Via Git
git commit --allow-empty -m "Force redeploy with PostgreSQL"
git push origin main

# Option 2: Via Vercel CLI
vercel --prod --force

# Option 3: Via Dashboard
# Vercel Dashboard → Deployments → Redeploy
```

### 3. Verify Deployment

Setelah redeploy, cek apakah schema sudah updated:

```bash
curl -X POST "https://landing-page-gema.vercel.app/api/seed?secret=gema-sma-wahidiyah-super-secret-production-key-2025-kediri"
```

**Expected success:**
```json
{
  "message": "Database seeded successfully!",
  "admins": [...]
}
```

## 🔍 Debug Commands

```bash
# Check current deployment
curl https://landing-page-gema.vercel.app/api/debug-session

# Check database connection
curl -X POST https://landing-page-gema.vercel.app/api/seed?secret=YOUR_SECRET
```

---

**Status:** Waiting for Vercel environment variables update + redeploy