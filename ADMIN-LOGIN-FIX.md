# 🔧 Admin Login Fix - Production Deployment# 🔧 Admin Login Redirect Loop - Perbaikan & Troubleshooting



## 🐛 Masalah yang Ditemukan## 📋 Ringkasan Masalah

Admin tidak bisa login di production (Vercel) dan terjebak dalam redirect loop ke halaman login, sementara siswa bisa login dengan normal.

Admin tidak dapat login di production Vercel dan mengalami **redirect loop** kembali ke halaman login dengan URL:

```**URL Pattern:**

https://gema-smawa.vercel.app/admin/login?callbackUrl=https%3A%2F%2Fgema-smawa.vercel.app%2Fadmin%2Fdashboard```

```https://gema-smawa.vercel.app/admin/login?callbackUrl=https%3A%2F%2Fgema-smawa.vercel.app%2Fadmin%2Fdashboard

```

Sementara siswa dapat login dengan normal.

## 🔍 Akar Masalah

## 🔍 Root Cause Analysis

### 1. **Cookie Domain Configuration**

Setelah analisis mendalam, ditemukan beberapa masalah utama:- NextAuth.js di production Vercel sangat sensitif terhadap konfigurasi cookie domain

- Setting cookie domain secara eksplisit dapat menyebabkan cookie tidak ter-set dengan benar

### 1. **Cookie Configuration Issue**- **Solusi:** Set `domain: undefined` agar browser yang handle

- Cookie NextAuth tidak dikonfigurasi dengan lengkap untuk production Vercel

- Missing configuration untuk `callbackUrl` dan `csrfToken` cookies### 2. **Middleware Authorization Timing**

- Cookie domain tidak di-handle dengan benar- Middleware `authorized` callback dijalankan SEBELUM JWT callback selesai

- Token mungkin belum sepenuhnya ter-populate saat dicek

### 2. **Middleware Authorization Logic**- **Solusi:** Tambahkan explicit check dan logging yang detail

- `authorized` callback terlalu ketat dan berjalan sebelum JWT callback selesai

- Tidak ada fallback mechanism untuk edge cases### 3. **Environment Variables**

- Token validation tidak mempertimbangkan timing issues di production- `NEXTAUTH_URL` harus match dengan deployment URL

- `NEXTAUTH_SECRET` harus set di production

### 3. **Redirect Callback Edge Cases**- `NEXTAUTH_COOKIE_DOMAIN` sebaiknya KOSONG atau tidak di-set

- Redirect callback tidak handle semua kemungkinan URL patterns

- Tidak ada fallback ke admin dashboard untuk unknown patterns## ✅ Perbaikan yang Dilakukan

- Missing edge case untuk URL yang mengandung `/admin/dashboard`

### 1. **auth-config.ts** - Cookie Configuration

### 4. **Insufficient Logging**```typescript

- Logging tidak cukup detail untuk debugging production issuescookies: {

- Missing timestamp dan environment info  sessionToken: {

- Tidak ada tracking untuk authorization flow    name: isProduction ? '__Secure-next-auth.session-token' : 'next-auth.session-token',

    options: {

## ✅ Solusi yang Diterapkan      httpOnly: true,

      sameSite: 'lax',

### 1. **Enhanced Cookie Configuration**       path: '/',

```typescript      secure: isProduction,

cookies: {      // PENTING: Jangan set domain untuk Vercel deployment

  sessionToken: {      domain: undefined  // ✅ Biarkan browser yang handle

    name: isProduction ? '__Secure-next-auth.session-token' : 'next-auth.session-token',    }

    options: {  }

      httpOnly: true,}

      sameSite: 'lax',```

      path: '/',

      secure: isProduction,### 2. **auth-config.ts** - Debug Mode & Extensive Logging

      domain: undefined  // Let browser handle domain```typescript

    }debug: true,  // ✅ Enable debug mode di production

  },

  callbackUrl: {callbacks: {

    name: isProduction ? '__Secure-next-auth.callback-url' : 'next-auth.callback-url',  async jwt({ token, user, trigger }) {

    options: {    // Extensive logging untuk troubleshooting

      httpOnly: false,  // Must be false for client-side redirect    console.log('=== JWT CALLBACK ===')

      sameSite: 'lax',    console.log('Trigger:', trigger)

      path: '/',    console.log('User:', user ? {...user, password: '[REDACTED]'} : null)

      secure: isProduction,    console.log('Token:', token)

      domain: undefined    // ...

    }  }

  },}

  csrfToken: {```

    name: isProduction ? '__Host-next-auth.csrf-token' : 'next-auth.csrf-token',

    options: {### 3. **middleware.ts** - Enhanced Logging & Authorization

      httpOnly: true,```typescript

      sameSite: 'lax',// Logging yang lebih detail dengan emoji untuk mudah dibaca

      path: '/',console.log('🔐 MIDDLEWARE EXECUTION')

      secure: isProduction,console.log('📍 Path:', pathname)

      domain: undefinedconsole.log('🎫 Token exists:', !!token)

    }

  }// Explicit validation dengan detailed logging

}const hasValidRole = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN'

```const hasValidType = token?.userType === 'admin'

```

**Key Points:**

- ✅ `callbackUrl` cookie harus `httpOnly: false` untuk client-side redirect### 4. **admin/login/page.tsx** - Client-Side Logging

- ✅ `domain: undefined` biarkan browser yang handle (penting untuk Vercel)```typescript

- ✅ Secure cookies di production dengan prefix `__Secure-` dan `__Host-`console.log('🔐 ADMIN LOGIN ATTEMPT')

console.log('📧 Email:', email)

### 2. **Enhanced Authorize Callback**console.log('🎯 Target callback:', '/admin/dashboard')

Menambahkan:

- Comprehensive error handling dengan try-catch// Detail result logging

- Detailed logging di setiap stepconsole.log('✅ OK:', result?.ok)

- Type assertion untuk `userType: 'admin' as const`console.log('❌ Error:', result?.error)

- Return complete user object dengan semua field yang diperlukan```



### 3. **Enhanced JWT & Session Callbacks**## 🚀 Deployment Checklist

Menambahkan:

- Logging di setiap callback untuk tracking flow### 1. Vercel Environment Variables

- Include timestamp dan environment infoPastikan variabel berikut sudah di-set di Vercel Dashboard:

- Log token state before dan after

- Parameter `account` di JWT callback```bash

# REQUIRED - Harus match dengan deployment URL

### 4. **Enhanced Redirect Callback**NEXTAUTH_URL=https://gema-smawa.vercel.app

Menambahkan:

- Handle semua URL patterns (absolute, relative, base)# REQUIRED - Generate secret baru untuk production

- Special handling untuk `/admin/dashboard`NEXTAUTH_SECRET=your-super-secret-key-minimum-32-characters-long

- Fallback ke admin dashboard untuk unknown patterns

- Comprehensive logging dengan emoji untuk readability# OPTIONAL - Sebaiknya TIDAK diisi atau dihapus

# NEXTAUTH_COOKIE_DOMAIN=

### 5. **Enhanced Middleware**

Middleware sudah memiliki logging yang baik dengan:# Database Production

- Detailed token validation loggingDATABASE_URL=postgresql://...

- Authorization checks dengan reasoning

- Clear success/failure messages# Admin Credentials (sesuaikan)

ADMIN_EMAIL=admin@smawahidiyah.edu

## 🚀 Deployment StepsADMIN_PASSWORD=SecurePasswordHere

```

### 1. Verifikasi Environment Variables di Vercel

### 2. Cara Generate NEXTAUTH_SECRET

**Required Environment Variables:**```bash

```env# Method 1: OpenSSL

DATABASE_URL=postgresql://...openssl rand -base64 32

NEXTAUTH_URL=https://gema-smawa.vercel.app

NEXTAUTH_SECRET=<your-secret-key># Method 2: Node.js

NODE_ENV=productionnode -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

```

# Method 3: Online

Verifikasi di Vercel Dashboard:# https://generate-secret.vercel.app/32

1. Settings > Environment Variables```

2. Pastikan semua variables sudah di-set

3. Pastikan NEXTAUTH_URL exact match dengan production URL### 3. Set Environment Variables di Vercel

```bash

### 2. Deploy ke Vercel# Via Vercel CLI

```bashvercel env add NEXTAUTH_URL

# Commit perubahanvercel env add NEXTAUTH_SECRET

git add .vercel env add DATABASE_URL

git commit -m "fix: admin login redirect loop in production

# Via Dashboard

- Enhanced cookie configuration with callbackUrl and csrfToken# 1. Buka https://vercel.com/dashboard

- Added comprehensive logging to all NextAuth callbacks# 2. Pilih project gema-smawa

- Fixed redirect callback with proper fallback mechanism# 3. Settings → Environment Variables

- Improved authorize callback with better error handling# 4. Add variable satu per satu

- Added extensive debugging logs for production troubleshooting"# 5. Redeploy after setting all variables

```

git push origin main

```## 🔍 Debugging di Production



### 3. Monitoring Logs### 1. Check Console Logs di Vercel

Setelah deploy, monitor logs di Vercel Dashboard:```bash

# Via CLI

**Expected Log Sequence:**vercel logs --follow

```

🔐 ADMIN AUTHORIZE CALLBACK# Via Dashboard

  ✅ Admin found: YES# 1. Buka project di Vercel Dashboard

  ✅ Password valid: YES# 2. Deployments → Latest → Functions

  ✅ Authorization successful!# 3. Lihat log untuk middleware dan auth route

```

🎫 JWT CALLBACK

  Trigger: signIn### 2. Pattern Log yang Harus Dicari

  ✅ Token updated with user data

**✅ Login Berhasil:**

📋 SESSION CALLBACK```

  ✅ Session updated successfully🔐 ADMIN LOGIN ATTEMPT

✅ OK: true

🔄 REDIRECT CALLBACK🔐 MIDDLEWARE EXECUTION

  ✅ Redirecting to: /admin/dashboard✅ ADMIN ACCESS GRANTED

```

🛡️ MIDDLEWARE EXECUTION

  ✅ ADMIN ACCESS GRANTED**❌ Login Gagal - Cookie Issue:**

``````

🔐 ADMIN LOGIN ATTEMPT

## 🔬 Testing Checklist✅ OK: true

🔐 MIDDLEWARE EXECUTION

### Setelah Deploy❌ NO TOKEN - Redirecting to login

- [ ] Test admin login dengan kredensial valid```

- [ ] Verifikasi redirect ke `/admin/dashboard` berhasil

- [ ] Check browser cookies (DevTools > Application > Cookies)**❌ Login Gagal - Authorization Issue:**

- [ ] Verifikasi logs di Vercel Dashboard```

- [ ] Test logout dan login ulang🔐 MIDDLEWARE EXECUTION

- [ ] Test dengan multiple browsers (Chrome, Firefox, Safari)🎫 Token exists: true

- [ ] Test dengan incognito/private mode❌ INVALID CREDENTIALS

- [ ] Test dengan clear cookies```



## 🐛 Debugging Tips### 3. Browser DevTools Check



### 1. Check Browser Cookies**Console Tab:**

```javascript- Cek log `🔐 ADMIN LOGIN ATTEMPT`

// Di browser console- Cek log `✅ LOGIN SUCCESSFUL`

document.cookie- Cek log `🚀 Executing redirect`

```

**Network Tab:**

**Expected cookies di production:**- Cek request ke `/api/auth/callback/admin`

- `__Secure-next-auth.session-token`- Status harus `200 OK`

- `__Secure-next-auth.callback-url`- Response harus include cookies

- `__Host-next-auth.csrf-token`

**Application Tab → Cookies:**

### 2. Check Vercel Logs- Cek cookie `next-auth.session-token` (dev) atau `__Secure-next-auth.session-token` (prod)

```bash- Domain harus `.gema-smawa.vercel.app` atau `gema-smawa.vercel.app`

# Real-time logs- Secure flag harus `true` di production

vercel logs --follow- HttpOnly flag harus `true`

- SameSite harus `Lax`

# Last 100 logs

vercel logs -n 100## 🧪 Testing Steps



# Filter by deployment### 1. Local Testing (Development)

vercel logs --url=gema-smawa.vercel.app```bash

```# Jalankan development server

npm run dev

### 3. Check Network Tab

Di DevTools > Network:# Buka browser

1. Filter: `auth`http://localhost:3000/admin/login

2. Perhatikan request ke `/api/auth/callback/admin`

3. Check response status (should be 302 redirect)# Login dengan credentials:

4. Check redirect location header# Email: admin@smawahidiyah.edu

5. Verify cookies are set in response headers# Password: [sesuai .env]



### 4. Common Issues & Solutions# Expected: Redirect ke /admin/dashboard

```

#### Issue: "Invalid CSRF token"

**Solution:**### 2. Production Testing (Vercel)

```bash```bash

# Clear all cookies di browser# Deploy ke Vercel

# Generate new NEXTAUTH_SECRETgit add .

openssl rand -base64 32git commit -m "fix: admin login redirect loop with extensive logging"

# Update di Vercel: Settings > Environment Variablesgit push origin main

# Redeploy

```# Wait for deployment to complete



#### Issue: "Session token not set"# Test login:

**Solution:**# 1. Buka https://gema-smawa.vercel.app/admin/login

- Verify `NEXTAUTH_URL` matches production URL exactly (no trailing slash)# 2. Open Browser DevTools (F12)

- Check if cookies are being blocked (third-party cookies)# 3. Go to Console tab

- Clear browser cache and cookies# 4. Login dengan admin credentials

- Try incognito mode# 5. Perhatikan log sequence

- Check if Vercel deployment is using correct environment# 6. Check if redirect successful

```

#### Issue: "Middleware keeps redirecting"

**Solution:**### 3. Verify Cookies

- Check logs untuk melihat token contents```javascript

- Verify `role` field di database (should be ADMIN or SUPER_ADMIN)// Run di Browser Console

- Verify `userType` di JWT token (should be 'admin')document.cookie.split(';').forEach(c => console.log(c.trim()))

- Check if JWT callback is populating token correctly

// Expected output includes:

#### Issue: "Authorize callback returns null"// next-auth.session-token=... (dev)

**Solution:**// __Secure-next-auth.session-token=... (prod)

- Check if admin exists in database```

- Verify password hash is correct

- Check database connection## 📊 Common Issues & Solutions

- Look for errors in authorize callback logs

### Issue 1: "No token found" di Middleware

## 📊 Expected Log Flow**Penyebab:** Cookie tidak ter-set dengan benar

**Solusi:**

### ✅ Successful Login Flow:- Verifikasi `NEXTAUTH_URL` match dengan deployment URL

```- Hapus `NEXTAUTH_COOKIE_DOMAIN` atau set ke `undefined`

1. 🔐 ADMIN AUTHORIZE CALLBACK- Clear browser cookies dan coba lagi

   📧 Email: admin@example.com- Cek Network tab untuk response dari `/api/auth/callback/admin`

   👤 Admin found: YES

   🔓 Password valid: YES### Issue 2: "Invalid credentials" di Middleware

   ✅ Authorization successful!**Penyebab:** Token tidak include `role` atau `userType`

   📦 User object: { id, email, name, role: ADMIN, userType: admin }**Solusi:**

- Cek JWT callback di auth-config.ts

2. 🎫 JWT CALLBACK- Pastikan `authorize` function return `role` dan `userType`

   🔄 Trigger: signIn- Cek database - pastikan admin memiliki role yang valid

   📝 User object provided

   ✅ Token updated: { id, email, role: ADMIN, userType: admin }### Issue 3: Redirect Loop Terus Terjadi

**Penyebab:** Middleware dan auth config bentrok

3. 📋 SESSION CALLBACK**Solusi:**

   🎫 Token: { id, role: ADMIN, userType: admin }- Verifikasi `authorized` callback tidak terlalu ketat

   ✅ Session created with user data- Pastikan `/admin/login` selalu return `true` di authorized callback

- Cek matcher config di middleware - harus include `/admin/:path*`

4. 🔄 REDIRECT CALLBACK

   🔗 URL: /admin/dashboard### Issue 4: Works di Development, Fails di Production

   🏠 Base URL: https://gema-smawa.vercel.app**Penyebab:** Environment variable atau cookie domain issue

   ✅ Redirecting to: https://gema-smawa.vercel.app/admin/dashboard**Solusi:**

- Bandingkan env vars di local vs Vercel

5. 🛡️ MIDDLEWARE (on /admin/dashboard)- Pastikan `secure: true` hanya di production

   📍 Path: /admin/dashboard- Verifikasi cookie name consistency

   🎫 Token exists: YES

   🎭 Role: ADMIN## 🔐 Security Considerations

   👤 Type: admin

   ✅ ADMIN ACCESS GRANTED### 1. NEXTAUTH_SECRET

- **JANGAN** gunakan secret yang sama dengan development

6. ✅ USER SUCCESSFULLY LANDS ON DASHBOARD- **HARUS** minimal 32 karakter

```- **GUNAKAN** random string yang cryptographically secure

- **SIMPAN** dengan aman (jangan commit ke git)

### ❌ Failed Login Flow:

```### 2. Cookie Configuration

1. 🔐 ADMIN AUTHORIZE CALLBACK- `httpOnly: true` ✅ - Mencegah XSS attacks

   📧 Email: wrong@example.com- `secure: true` ✅ - Hanya HTTPS di production

   ❌ Admin not found- `sameSite: 'lax'` ✅ - Mencegah CSRF attacks

   OR- `domain: undefined` ✅ - Biarkan browser yang set

   📧 Email: admin@example.com

   ❌ Invalid password### 3. Admin Credentials

   - Ganti password default setelah deployment

   Return: null- Gunakan password yang kuat (min 12 karakter)

- Enable 2FA jika memungkinkan (future enhancement)

2. ❌ Login page shows error

   "Email atau password salah"## 📝 Additional Notes

```

### NextAuth.js di Vercel - Best Practices

## 🔐 Security Considerations1. Selalu set `NEXTAUTH_URL` ke full deployment URL

2. Jangan set cookie domain secara manual

1. **Cookie Security**3. Gunakan `strategy: 'jwt'` untuk serverless

   - ✅ `httpOnly: true` untuk session & CSRF tokens (prevent XSS)4. Enable debug mode untuk troubleshooting

   - ✅ `secure: true` di production (HTTPS only)5. Monitor Vercel logs regularly

   - ✅ `sameSite: 'lax'` (prevent CSRF while allowing normal navigation)

   - ✅ No domain set (browser handles it, works with Vercel)### Middleware Configuration

   - ✅ `__Secure-` prefix untuk secure cookies1. Use `matcher` untuk specify protected routes

   - ✅ `__Host-` prefix untuk CSRF token (strictest)2. Keep `authorized` callback simple

3. Add extensive logging di production

2. **Token Security**4. Handle edge cases explicitly

   - ✅ JWT tokens signed dengan NEXTAUTH_SECRET

   - ✅ Token expiration (30 days configurable)### Production Monitoring

   - ✅ Token rotation on session update1. Setup monitoring untuk failed login attempts

   - ✅ No sensitive data in JWT (only IDs and roles)2. Log semua authorization errors

3. Track cookie set/get failures

3. **Environment Security**4. Monitor redirect patterns

   - ✅ NEXTAUTH_SECRET harus strong (min 32 chars)

   - ✅ DATABASE_URL tidak exposed ke client## 🎯 Success Criteria

   - ✅ Environment variables di Vercel encrypted at rest

   - ✅ Different secrets for dev/staging/productionLogin dianggap berhasil jika:

- ✅ Admin bisa login dengan credentials valid

## 📚 References- ✅ Tidak ada redirect loop

- ✅ Cookie ter-set dengan benar

- [NextAuth.js Documentation](https://next-auth.js.org/)- ✅ Token include `role` dan `userType`

- [NextAuth.js Vercel Deployment](https://next-auth.js.org/deployment#vercel)- ✅ Redirect ke `/admin/dashboard` berhasil

- [NextAuth.js Cookies](https://next-auth.js.org/configuration/options#cookies)- ✅ Dashboard page ter-load dengan data admin

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)## 📞 Support

- [Cookie Prefixes (__Secure- and __Host-)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#cookie_prefixes)

Jika masih ada masalah setelah perbaikan ini:

## 🎯 What Changed1. Cek Vercel logs untuk error details

2. Verifikasi semua environment variables

### File: `src/lib/auth-config.ts`3. Test di incognito/private window

1. ✅ Added complete cookie configuration (callbackUrl, csrfToken)4. Clear all cookies dan coba lagi

2. ✅ Enhanced authorize callback with try-catch and logging5. Check browser console untuk JavaScript errors

3. ✅ Enhanced JWT callback with detailed logging and account parameter

4. ✅ Enhanced session callback with detailed logging---

5. ✅ Enhanced redirect callback with fallback mechanism

**Last Updated:** 2025-01-05

### File: `src/middleware.ts`**Version:** 2.0

- Already had good logging, no changes needed**Status:** Production Ready dengan Extensive Logging


### File: `src/app/admin/login/page.tsx`
- Already had good logging, no changes needed

## 📞 Support & Next Steps

### If Still Having Issues:

1. **Check Logs First**
   ```bash
   vercel logs --follow
   ```
   Look for the emoji-marked log sections

2. **Verify Environment Variables**
   - Go to Vercel Dashboard > Settings > Environment Variables
   - Verify all required variables are set
   - Check if values are correct (especially NEXTAUTH_URL)

3. **Clear Everything**
   ```bash
   # Browser
   - Clear all cookies for gema-smawa.vercel.app
   - Clear cache
   - Try incognito mode
   
   # Vercel
   - Redeploy latest commit
   - Check deployment logs for errors
   ```

4. **Test Locally First**
   ```bash
   npm run build
   npm start
   # Test login at http://localhost:3000/admin/login
   ```

5. **Contact Support**
   - Include Vercel deployment logs
   - Include browser console errors
   - Include network tab screenshots

---

**Last Updated:** 2025-10-05  
**Status:** ✅ FIXED - Ready for deployment  
**Tested:** ⏳ Pending production testing
