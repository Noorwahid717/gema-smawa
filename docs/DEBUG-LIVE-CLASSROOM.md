# 🔍 Debug: Admin Tidak Bisa Akses Live Classroom

## 🚨 **Problem:**
Setelah admin login via `/admin/login`, saat mengakses Live Classroom muncul pesan:
> "Masuk untuk bergabung - Siaran langsung hanya dapat diakses oleh guru (admin) dan siswa yang sudah masuk."

---

## ✅ **Solusi yang Sudah Diterapkan:**

### 1. **Loading State Added**
- Tambah check `authStatus === 'loading'` untuk menunggu NextAuth session
- Tampilkan loading spinner saat memeriksa autentikasi

### 2. **Debug Logging**
- Console log akan menampilkan status autentikasi
- Check browser console (F12) untuk melihat:
  ```javascript
  {
    authStatus: "authenticated" | "unauthenticated" | "loading",
    authSession: { email, role, ... },
    studentSession: null | { fullName, ... },
    isAdmin: true | false
  }
  ```

### 3. **Improved Auth Logic**
- Cek admin: `authSession?.user?.role === 'ADMIN'`
- Cek siswa: `studentSession !== null`
- Allow akses jika salah satu true

---

## 🧪 **Testing Steps:**

### **Test 1: Check Admin Session**
1. Login sebagai admin di `/admin/login`
2. Buka browser console (F12)
3. Jalankan:
   ```javascript
   // Check NextAuth session
   fetch('/api/auth/session')
     .then(r => r.json())
     .then(console.log)
   ```
4. Harus return:
   ```json
   {
     "user": {
       "id": "...",
       "email": "admin@smawahidiyah.edu",
       "role": "ADMIN"
     }
   }
   ```

### **Test 2: Verify Auth on Live Page**
1. Login admin
2. Akses `/classroom/gema-classroom-1/live`
3. Check console log - harus muncul:
   ```
   🔐 Auth Debug: {
     authStatus: "authenticated",
     authSession: { email: "admin@...", role: "ADMIN" },
     studentSession: null,
     isAdmin: true
   }
   ```

### **Test 3: Direct API Check**
```bash
# Check if admin user exists in database
npm run db:seed  # Pastikan ada user admin
```

---

## 🔧 **Possible Issues & Fixes:**

### **Issue 1: Admin User Tidak Ada di Database**
**Check:**
```bash
# Lihat console saat seed
npm run db:seed
```

**Fix:**
Pastikan ada user dengan:
- Email: `admin@smawahidiyah.edu`
- Password: `admin123!@#`
- Role: `ADMIN`

### **Issue 2: NextAuth Session Tidak Tersimpan**
**Check:**
- Cookie `next-auth.session-token` ada di browser?
- Environment variables `NEXTAUTH_SECRET` sudah set?

**Fix:**
```env
# File .env
NEXTAUTH_SECRET=your-super-secret-key-here-change-in-production
NEXTAUTH_URL=http://localhost:3000
```

### **Issue 3: SessionProvider Tidak Berfungsi**
**Check:**
- `AppSessionProvider` sudah wrap semua page?
- Import dari `next-auth/react` benar?

**Fix sudah dilakukan:**
- ✅ Root layout sudah wrap dengan `<AppSessionProvider>`

---

## 🎯 **Quick Fix Script:**

Jalankan script ini untuk memastikan setup benar:

```bash
# 1. Generate Prisma client
npm run db:generate

# 2. Push schema ke database
npm run db:push

# 3. Seed admin user
npm run db:seed

# 4. Restart dev server
npm run dev
```

---

## 🔍 **Manual Debugging:**

### **Step 1: Check Browser Console**
Buka `/classroom/gema-classroom-1/live` dan lihat console log.

**Expected Output:**
```
🔐 Auth Debug: {
  authStatus: "authenticated",
  authSession: { 
    user: { 
      email: "admin@smawahidiyah.edu",
      role: "ADMIN" 
    }
  },
  studentSession: null,
  isAdmin: true
}
```

### **Step 2: Check Network Tab**
1. Open DevTools → Network
2. Filter: `session`
3. Check response dari `/api/auth/session`

**Expected:**
```json
{
  "user": {
    "email": "admin@smawahidiyah.edu",
    "role": "ADMIN"
  },
  "expires": "..."
}
```

### **Step 3: Check Cookies**
1. DevTools → Application → Cookies
2. Look for: `next-auth.session-token`
3. Should have value and not expired

---

## 🚀 **Alternative Solution: Temporary Bypass**

Jika masih tidak bisa, gunakan bypass sementara untuk testing:

```typescript
// File: src/app/classroom/[id]/live/page.tsx
// Line ~125

// TEMPORARY: Allow all access for testing
const isAuthenticated = true  // Force allow untuk testing

// Original code (commented):
// const isAuthenticated = isAdmin || !!studentSession
```

⚠️ **Jangan deploy dengan bypass ini!**

---

## 📊 **Status Check Commands:**

```bash
# Check database connection
npm run db:push

# Check if admin exists
psql $DATABASE_URL -c "SELECT email, role FROM users WHERE role='ADMIN';"

# Check Prisma client
npm run db:generate

# Restart with clean cache
rm -rf .next
npm run dev
```

---

## 🎓 **Expected Behavior After Fix:**

### **For Admin:**
1. Login → `/admin/login` ✅
2. Go to `/classroom/gema-classroom-1/live` ✅
3. See "Memeriksa autentikasi..." (loading) ⏳
4. See Live Room with "Host" controls ✅

### **For Student:**
1. Login → `/student/login` ✅
2. Go to `/classroom/gema-classroom-1/live` ✅
3. See "Memeriksa autentikasi..." (loading) ⏳
4. See Live Room with "Viewer" mode ✅

---

## 📞 **Next Steps:**

1. **Restart dev server** - `npm run dev`
2. **Clear browser cache** - Ctrl+Shift+R
3. **Re-login admin** - `/admin/login`
4. **Check console** - Look for `🔐 Auth Debug:`
5. **Try accessing live** - `/classroom/gema-classroom-1/live`

Jika masih error, kirim screenshot dari:
- Browser console log
- Network tab (session request)
- Application → Cookies

---

## ✅ **Success Indicators:**

Anda berhasil jika melihat:
- ✅ Loading spinner muncul sebentar
- ✅ Console log menunjukkan `isAdmin: true`
- ✅ Halaman live room muncul dengan kontrol host
- ✅ Tombol "Start Broadcasting" tersedia

---

**🔍 Debug selesai! Coba restart dan test lagi.** 🚀
