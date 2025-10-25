# Python Coding Lab - 401 Error Deep Dive Analysis

## 🎯 Analisis dari User (Sangat Akurat!)

### Temuan Kunci:

1. **Middleware TIDAK memblokir `/api/python-coding-lab/*`**
   - `matcher: ['/admin/:path*']` - Hanya protect admin routes
   - API routes Python Coding Lab seharusnya tidak terblokir middleware

2. **Handler MENGGUNAKAN Auth Check**
   - Saya keliru sebelumnya - handler MEMANG ada auth:
   ```typescript
   const session = await getServerSession(authOptions);
   if (!session || session.user.role !== 'STUDENT') {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }
   ```

3. **401 Response Pasti dari Handler GET**
   - Karena middleware tidak match, maka 401 pasti dari line 15-18 handler
   - Artinya: `session === null` atau `session.user.role !== 'STUDENT'`

## 🔍 Possible Root Causes

### 1. Session Tidak Terbentuk (`session === null`)

**Kemungkinan:**
- Cookie tidak terkirim dari browser
- Cookie domain/path mismatch
- NextAuth session token tidak valid
- `getServerSession()` gagal read cookies

**Check:**
```bash
# Test dari browser yang sudah login
# Browser DevTools > Application > Cookies
# Cari: next-auth.session-token

# Test API dengan curl + cookies
curl -H "Cookie: next-auth.session-token=..." http://localhost:3000/api/python-coding-lab/tasks
```

### 2. Session Terbentuk Tapi Role Salah

**Kemungkinan:**
- Token JWT memiliki role selain 'STUDENT'
- Type mismatch (role stored as lowercase/different case)
- Session callback tidak meng-copy role dengan benar

**Check di auth-config.ts:**
```typescript
// Student provider returns:
return {
  role: 'STUDENT',  // ✅ Uppercase
  userType: 'student'
}

// Session callback copies:
session.user.role = token.role as string  // ✅ Should be 'STUDENT'
```

### 3. Import Path Issue (Already Fixed)

**Before:**
```typescript
import { getServerSession } from 'next-auth';  // ❌ Wrong
```

**After:**
```typescript
import { getServerSession } from 'next-auth/next';  // ✅ Correct
```

**Status:** ✅ Already fixed in all 4 route files

## 🧪 Debug Strategy

### Step 1: Check Session Creation

Login sebagai student, lalu cek console logs untuk:

```
=========================================
🎫 JWT CALLBACK
=========================================
👤 User object: {
  id: '...',
  email: '...',
  role: 'STUDENT',  // ← Check this!
  userType: 'student'
}
```

### Step 2: Check Session Callback

```
=========================================
📋 SESSION CALLBACK
=========================================
📋 Session after: {
  user: {
    role: 'STUDENT'  // ← Check this!
  }
}
```

### Step 3: Test Debug Endpoint

```bash
# After login, test new debug endpoint:
curl http://localhost:3000/api/python-coding-lab/debug-session \
  -H "Cookie: $(grep next-auth ~/.cookie_file)"
```

**Expected response jika session OK:**
```json
{
  "success": true,
  "hasSession": true,
  "checks": {
    "hasUser": true,
    "hasRole": true,
    "role": "STUDENT",
    "isStudent": true,
    "userType": "student"
  }
}
```

**Response jika session NULL:**
```json
{
  "success": true,
  "hasSession": false,
  "session": null
}
```

### Step 4: Test Main Tasks Endpoint

Dengan logging yang baru ditambahkan:

```
=========================================
🐍 PYTHON CODING LAB - GET TASKS
=========================================
🎫 Session exists: true/false
📋 Session details:
   - User Role: STUDENT/null
=========================================
```

## 🔧 Additional Logging Added

### 1. `/api/python-coding-lab/tasks/route.ts`

Added extensive logging:
- Session existence check
- User role verification
- Authorization pass/fail reason

### 2. `/api/python-coding-lab/debug-session/route.ts` (NEW)

Debug endpoint untuk:
- Check session state
- Verify cookies
- Test role checks
- View headers

## 📋 Testing Checklist

### Pre-Test:
- [ ] Clear browser cache & cookies
- [ ] Restart dev server: `npm run dev`
- [ ] Open browser DevTools Console

### Test Flow:

1. [ ] **Login sebagai student**
   - URL: http://localhost:3000/student/login
   - Check console untuk JWT + Session callbacks
   - Verify role = 'STUDENT' in logs

2. [ ] **Test Debug Endpoint**
   - URL: http://localhost:3000/api/python-coding-lab/debug-session
   - Check JSON response
   - Verify: `checks.isStudent === true`

3. [ ] **Test Tasks Endpoint**
   - URL: http://localhost:3000/student/python-coding-lab
   - Check browser console
   - Check terminal logs
   - Look for: "✅ Authorization passed - Fetching tasks..."

4. [ ] **Check Network Tab**
   - Request URL
   - Status Code (should be 200, not 401)
   - Response payload
   - Request headers (Cookie should be sent)

## 🎯 Expected Results

### If Working Correctly:

**Terminal Logs:**
```
🎫 JWT CALLBACK
👤 User object: { role: 'STUDENT', ... }

📋 SESSION CALLBACK  
📋 Session after: { user: { role: 'STUDENT' } }

🐍 PYTHON CODING LAB - GET TASKS
🎫 Session exists: true
   - User Role: STUDENT
✅ Authorization passed - Fetching tasks...
```

**Browser:**
```
GET /api/python-coding-lab/tasks 200 OK
```

### If Still Failing:

**Terminal Logs:**
```
🐍 PYTHON CODING LAB - GET TASKS
🎫 Session exists: false
❌ NO SESSION FOUND
❌ UNAUTHORIZED - Reason: No session
```

**Browser:**
```
GET /api/python-coding-lab/tasks 401 Unauthorized
```

## 🚨 Next Steps Based on Results

### If session is NULL:
→ Problem: Cookie tidak terkirim atau tidak valid
→ Fix: Check cookie domain, secure flags, sameSite settings

### If session exists but role !== 'STUDENT':
→ Problem: Role type mismatch atau tidak tersimpan di JWT
→ Fix: Check JWT callback, verify token.role assignment

### If debug endpoint works but tasks endpoint fails:
→ Problem: Specific ke handler logic
→ Fix: Check Prisma query, database connection

## 📝 Files Modified

1. `/src/app/api/python-coding-lab/tasks/route.ts` - Added logging
2. `/src/app/api/python-coding-lab/debug-session/route.ts` - NEW debug endpoint

## 🔗 Related Issues

- Import path fix: ✅ DONE
- StudentLayout wrapper: ✅ DONE  
- Session debugging: 🔄 IN PROGRESS

---

**Analysis Date:** 25 Oktober 2025
**Status:** 🔍 Deep Debugging Phase
**Next Action:** User perlu login dan test debug endpoint
