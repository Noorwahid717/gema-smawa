# 🚀 Quick Fix Guide - Admin Login Issue

## ⚡ Quick Diagnosis

**Symptom:** Admin redirect loop ke `/admin/login?callbackUrl=...`

**Cause:** Cookie/session configuration issue di production Vercel

**Fix:** Enhanced NextAuth configuration dengan proper cookie settings

---

## 🔧 Quick Fix Steps

### 1. Verify Environment Variables (2 menit)
```bash
cd /workspaces/gema-smawa
bash verify-env.sh
```

**Must have:**
- ✅ `NEXTAUTH_URL` = `https://gema-smawa.vercel.app` (no trailing slash!)
- ✅ `NEXTAUTH_SECRET` = random 32+ char string
- ✅ `DATABASE_URL` = your PostgreSQL connection string

### 2. Deploy Fix (3 menit)
```bash
# Commit changes
git add .
git commit -m "fix: admin login redirect loop in production"
git push origin main

# Or manual deploy
vercel --prod
```

### 3. Monitor Logs (1 menit)
```bash
# Watch real-time logs
vercel logs --follow

# Or check Vercel Dashboard
# https://vercel.com/dashboard → gema-smawa → Logs
```

---

## 🔍 What to Look For in Logs

### ✅ Success Pattern:
```
🔐 ADMIN AUTHORIZE CALLBACK
  ✅ Authorization successful!
🎫 JWT CALLBACK
  ✅ Token updated
📋 SESSION CALLBACK
  ✅ Session created
🔄 REDIRECT CALLBACK
  ✅ Redirecting to: /admin/dashboard
🛡️ MIDDLEWARE
  ✅ ADMIN ACCESS GRANTED
```

### ❌ Failure Patterns:

**Pattern 1: Missing Token**
```
🛡️ MIDDLEWARE
  ❌ NO TOKEN
```
**Fix:** Check cookie settings, verify NEXTAUTH_URL

**Pattern 2: Invalid Credentials**
```
🛡️ MIDDLEWARE
  ❌ INVALID CREDENTIALS
  - Invalid role: STUDENT (expected: ADMIN)
```
**Fix:** Check user role in database

**Pattern 3: Authorize Failed**
```
🔐 ADMIN AUTHORIZE CALLBACK
  ❌ Admin not found
```
**Fix:** Check email, verify user exists in database

---

## 🧪 Quick Tests

### Test 1: Check Cookies (Browser DevTools)
```
F12 → Application → Cookies → https://gema-smawa.vercel.app
```

**Should see:**
- `__Secure-next-auth.session-token`
- `__Secure-next-auth.callback-url`
- `__Host-next-auth.csrf-token`

**If missing:** Clear all cookies, try login again

### Test 2: Check Network (Browser DevTools)
```
F12 → Network → Filter: auth
```

**Look for:**
1. POST `/api/auth/callback/admin` → Status 200/302
2. Cookies in Response Headers
3. Location header pointing to `/admin/dashboard`

### Test 3: Console Logs (Browser DevTools)
```
F12 → Console
```

**Should see:**
```
🔐 ADMIN LOGIN ATTEMPT
  📧 Email: admin@example.com
  ...
✅ LOGIN SUCCESSFUL!
🚀 Executing redirect to /admin/dashboard
```

---

## 💊 Quick Fixes for Common Issues

### Issue 1: "Invalid CSRF token"
```bash
# Generate new secret
openssl rand -base64 32

# Update in Vercel
vercel env add NEXTAUTH_SECRET

# Paste the generated secret
# Select: Production
# Redeploy
vercel --prod
```

### Issue 2: "Session not persisting"
```bash
# Check NEXTAUTH_URL
vercel env ls | grep NEXTAUTH_URL

# Should be: https://gema-smawa.vercel.app
# NO trailing slash!
# NO www subdomain!

# Update if wrong
vercel env rm NEXTAUTH_URL production
vercel env add NEXTAUTH_URL
# Enter: https://gema-smawa.vercel.app
```

### Issue 3: "Middleware keeps blocking"
**Check database:**
```sql
SELECT id, email, role, "createdAt" 
FROM "Admin" 
WHERE email = 'your-admin@email.com';
```

**Role must be:** `ADMIN` or `SUPER_ADMIN` (uppercase!)

**If wrong:**
```sql
UPDATE "Admin" 
SET role = 'ADMIN' 
WHERE email = 'your-admin@email.com';
```

---

## 📋 Deployment Checklist

Before deploying:
- [ ] All changes committed
- [ ] Environment variables verified
- [ ] No TypeScript errors: `npm run build`
- [ ] Tests passing (if any)

After deploying:
- [ ] Check deployment status in Vercel Dashboard
- [ ] Monitor logs for errors
- [ ] Test admin login
- [ ] Verify redirect to dashboard
- [ ] Test logout and re-login

---

## 🆘 Still Not Working?

### Debug Mode: Get More Info

1. **Check Vercel Deployment Logs**
```bash
vercel logs -n 100
```

2. **Check Build Logs**
```bash
# In Vercel Dashboard
Deployments → Latest → View Build Logs
```

3. **Test Locally First**
```bash
# Pull production env vars
vercel env pull .env.local

# Build and run
npm run build
npm start

# Test at http://localhost:3000/admin/login
```

4. **Clear Everything**
```bash
# Browser
- Clear all site data
- Try incognito mode
- Try different browser

# Vercel
- Redeploy
- Check for stuck deployments
```

---

## 📞 Need Help?

**Check Documentation:**
- 📖 [ADMIN-LOGIN-FIX.md](./ADMIN-LOGIN-FIX.md) - Full documentation
- 📖 [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide

**Collect Debug Info:**
1. Vercel deployment logs
2. Browser console errors
3. Network tab screenshots
4. Steps to reproduce

**Contact Info:**
- GitHub Issues: Create an issue with debug info
- Vercel Support: If Vercel-specific issue

---

## 🎯 Success Criteria

✅ Admin can login
✅ Redirects to `/admin/dashboard`
✅ No redirect loops
✅ Session persists across page refreshes
✅ Logout works correctly

---

**Last Updated:** 2025-10-05  
**Estimated Fix Time:** 5-10 minutes  
**Difficulty:** ⭐⭐ (Easy with this guide)
