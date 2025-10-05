import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

// Helper untuk logging yang lebih informatif
function log(message: string, data?: object) {
  console.log(`[GEMA-MIDDLEWARE] ${message}`, data ? JSON.stringify(data, null, 2) : '')
}

export default withAuth(
  // Fungsi ini hanya berjalan jika `withAuth` menemukan token yang valid.
  // Jika tidak ada token, `withAuth` akan otomatis redirect ke halaman login.
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    log('Request received', { path: pathname, tokenExists: !!token })

    if (token) {
      log('Token details', {
        role: token.role,
        userType: token.userType,
        name: token.name,
        email: token.email,
      })
    }

    const userRole = typeof token?.role === 'string' ? token.role.toUpperCase() : ''
    const userType = token?.userType
    const isAdminRoute = pathname.startsWith('/admin')

    // 1. Logika untuk rute Admin
    if (isAdminRoute) {
      const hasAdminRole = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN'
      const hasAdminType = userType === 'admin'

      // Jika pengguna mencoba mengakses rute admin tetapi tidak memiliki role/tipe yang sesuai
      if (!hasAdminRole || !hasAdminType) {
        log('Authorization failed for admin route. Redirecting to login.', {
          path: pathname,
          userRole,
          userType,
        })
        // Redirect ke halaman login dengan pesan error
        const loginUrl = new URL('/admin/login', req.url)
        loginUrl.searchParams.set('error', 'AccessDenied')
        return NextResponse.redirect(loginUrl)
      }

      // Jika pengguna admin yang sudah login mencoba mengakses halaman login,
      // arahkan ke dashboard.
      if (pathname === '/admin/login') {
        log('Admin already logged in. Redirecting to dashboard.', { user: token?.name })
        return NextResponse.redirect(new URL('/admin/dashboard', req.url))
      }

      log('Admin access granted.', { path: pathname, user: token?.name })
    }

    // 2. Logika untuk rute Student (jika ada proteksi khusus di masa depan)
    if (pathname.startsWith('/student')) {
      // Saat ini, rute student bersifat publik atau memiliki mekanisme auth sendiri.
      // Biarkan request berlanjut.
      log('Student route access. Passing through.', { path: pathname })
      return NextResponse.next()
    }

    // Jika semua pengecekan lolos, lanjutkan request
    return NextResponse.next()
  },
  {
    // Konfigurasi ini memberitahu `withAuth` halaman mana yang harus di-redirect
    // jika token tidak ditemukan.
    pages: {
      signIn: '/admin/login',
      error: '/admin/login', // Halaman untuk menampilkan error (misal: Access Denied)
    },
  }
)

// Konfigurasi matcher:
// Middleware ini akan berjalan untuk SEMUA rute yang cocok.
// Logika di dalam middleware akan menentukan proteksi berdasarkan path.
export const config = {
  matcher: [
    /*
     * Cocokkan semua path, kecuali:
     * - /api (API routes)
     * - /_next/static (static files)
     * - /_next/image (image optimization files)
     * - /favicon.ico (favicon file)
     * - /gema.svg, /file.svg, etc. (public assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|gema.svg|file.svg|globe.svg|next.svg|vercel.svg|window.svg|videos/.*).*)',
  ],
}
