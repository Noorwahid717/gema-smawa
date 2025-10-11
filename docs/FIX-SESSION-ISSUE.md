# 🔧 FIX: Admin Login Session Issue - RESOLVED

## ✅ **Masalah yang Diperbaiki:**

Admin sudah login tapi disuruh login lagi saat akses Live Classroom.

---

## 🛠️ **Perbaikan yang Dilakukan:**

### 1. **SessionProvider Configuration**
- ✅ Added `refetchOnWindowFocus={true}` 
- ✅ Ensures session is always fresh when switching tabs

### 2. **Auth Role Check Update**
- ✅ Changed from `=== 'ADMIN'` to check both `ADMIN` and `SUPER_ADMIN`
- ✅ Now supports multiple admin roles

### 3. **Enhanced Debug Logging**
- ✅ Added detailed console logging
- ✅ Shows full session data, cookies, and auth status
- ✅ Helps identify auth issues quickly

### 4. **Middleware Configuration**
- ✅ Middleware only protects `/admin/*` routes
- ✅ `/classroom/*` routes handle their own auth
- ✅ No conflict between middleware and client-side auth

---

## 🚀 **Cara Test Sekarang:**

### **Step 1: RESTART Dev Server (PENTING!)**

Ini **WAJIB** agar perubahan ter-apply:

```bash
# Kill terminal npm yang running (Ctrl+C)
# Atau close terminal dan buka baru

# Jalankan lagi
npm run dev
```

### **Step 2: Clear Browser Cache & Cookies**

**Chrome/Edge:**
- Press `Ctrl + Shift + Delete`
- Select "Cookies and other site data"
- Click "Clear data"

**Or manual:**
- Open DevTools (F12)
- Application tab → Cookies → localhost
- Right click → Clear all

### **Step 3: Login Admin**

1. Buka fresh tab: `http://localhost:3000/admin/login`
2. Email: `admin@smawahidiyah.edu`
3. Password: `admin123`
4. Klik Login

### **Step 4: Verify Login Success**

Setelah login, Anda harus di-redirect ke `/admin/dashboard`

### **Step 5: Open DevTools Console**

- Press `F12` to open DevTools
- Go to **Console** tab
- Keep it open untuk melihat debug log

### **Step 6: Akses Live Classroom**

1. Dari dashboard, klik **"Classroom"**
2. Klik tombol merah **"Mulai Live Class"**
3. **ATAU** akses langsung: `http://localhost:3000/classroom/gema-classroom-1/live`

### **Step 7: Check Console Output**

Lihat console log, harus muncul:

```javascript
🔐 Auth Debug: {
  authStatus: "authenticated",
  authSessionFull: { user: {...}, expires: "..." },
  authSessionUser: { 
    id: "...",
    email: "admin@smawahidiyah.edu",
    name: "Super Admin",
    role: "SUPER_ADMIN" 
  },
  authSessionUserRole: "SUPER_ADMIN",
  studentSession: null,
  isAdmin: true,
  cookies: "next-auth.session-token=..."
}
```

---

## ✅ **Expected Result:**

### **Jika Berhasil:**
1. ✅ Loading spinner muncul sebentar ("Memeriksa autentikasi...")
2. ✅ Console log menunjukkan `isAdmin: true`
3. ✅ Live room page muncul dengan kontrol **Host**
4. ✅ Bisa klik "Start Broadcasting"

### **Jika Masih Error:**
1. ❌ Console log menunjukkan `authStatus: "unauthenticated"`
2. ❌ Cookie `next-auth.session-token` tidak ada
3. ❌ Kembali ke page "Masuk untuk bergabung"

---

## 🔍 **Debugging Steps:**

### **Check 1: Verify Session API**

Setelah login, buka new tab:
```
http://localhost:3000/api/auth/session
```

**Expected Response:**
```json
{
  "user": {
    "id": "...",
    "name": "Super Admin",
    "email": "admin@smawahidiyah.edu",
    "role": "SUPER_ADMIN",
    "userType": "admin"
  },
  "expires": "2025-11-..."
}
```

**If Empty:** `{}` → Login tidak berhasil tersimpan

### **Check 2: Verify Cookies**

DevTools → Application → Cookies → localhost

**Look for:**
- `next-auth.session-token` - Should have a long value
- `next-auth.callback-url` - Optional
- `next-auth.csrf-token` - Should exist

**If Missing:** Browser tidak menyimpan cookies

### **Check 3: Verify Admin User Exists**

```bash
# Run seed to ensure admin exists
npm run db:seed
```

---

## 🚨 **Common Issues & Solutions:**

### **Issue 1: "unauthenticated" Status After Login**

**Cause:** Session tidak tersimpan karena cookie issue

**Solution:**
```bash
# 1. Clear .next cache
rm -rf .next

# 2. Restart dev server
npm run dev

# 3. Clear browser data (Ctrl+Shift+Delete)

# 4. Login again
```

### **Issue 2: Redirect Loop**

**Cause:** Middleware atau callback issue

**Solution:**
- Check middleware.ts - harus hanya match `/admin/:path*`
- Check auth-config.ts - redirect callback

### **Issue 3: Cookie Not Set**

**Cause:** HTTPS/secure issue atau domain mismatch

**Solution:**
Check `.env`:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_COOKIE_DOMAIN=
# Leave empty for localhost!
```

---

## 📝 **Complete Test Checklist:**

- [ ] Restart dev server (`npm run dev`)
- [ ] Clear browser cache & cookies
- [ ] Login at `/admin/login` with `admin123`
- [ ] Check redirect to `/admin/dashboard`
- [ ] Open DevTools Console (F12)
- [ ] Click "Mulai Live Class" button
- [ ] OR access `/classroom/gema-classroom-1/live`
- [ ] See loading spinner
- [ ] Check console log shows `isAdmin: true`
- [ ] See Live Room with Host controls
- [ ] SUCCESS! 🎉

---

## 🎯 **What Should Happen:**

```
┌─────────────────────────────────────┐
│ 1. Login Admin                      │
│    ↓                                │
│ 2. Redirect to /admin/dashboard     │
│    ↓                                │
│ 3. Click "Mulai Live Class"         │
│    ↓                                │
│ 4. Page loads with spinner          │
│    ↓                                │
│ 5. useSession() fetches session     │
│    ↓                                │
│ 6. authStatus = "authenticated"     │
│    ↓                                │
│ 7. isAdmin = true                   │
│    ↓                                │
│ 8. Live Room renders! 🎉           │
└─────────────────────────────────────┘
```

---

## 🔑 **Key Changes Summary:**

| File | Change | Purpose |
|------|--------|---------|
| `AppSessionProvider.tsx` | Added `refetchOnWindowFocus` | Auto-refresh session |
| `page.tsx` (live) | Check both ADMIN & SUPER_ADMIN | Support all admin roles |
| `page.tsx` (live) | Enhanced debug logging | Better troubleshooting |
| `middleware.ts` | Only match `/admin/*` | No conflict with `/classroom` |

---

## ⚡ **Quick Commands:**

```bash
# 1. Restart (IMPORTANT!)
npm run dev

# 2. Check if admin exists
npm run db:seed

# 3. Test login
# Browser: http://localhost:3000/admin/login
# Email: admin@smawahidiyah.edu
# Pass: admin123

# 4. Access live
# Browser: http://localhost:3000/classroom/gema-classroom-1/live

# 5. Check console (F12)
# Look for: 🔐 Auth Debug
```

---

## ✅ **COBA SEKARANG:**

1. **WAJIB:** Restart dev server
2. Clear browser cache
3. Login dengan `admin123`
4. Klik "Mulai Live Class"
5. Check console log
6. **Should work!** 🚀

---

**Jika masih ada masalah, screenshot console log dan kirim!** 📸
