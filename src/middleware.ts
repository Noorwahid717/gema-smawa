import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    console.log('Middleware - Path:', pathname)
    console.log('Middleware - Token exists:', !!token)
    console.log('Middleware - Token role:', token?.role)
    console.log('Middleware - User type:', token?.userType)

    // Proteksi route admin (kecuali halaman login)
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      const userRole = typeof token?.role === 'string' ? token.role.toUpperCase() : ''
      const userType = typeof token?.userType === 'string' ? token.userType : undefined

      // Jika tidak ada token, redirect ke login dengan callback
      if (!token) {
        console.log('Middleware - No token, redirecting to admin login')
        const loginUrl = new URL('/admin/login', req.url)
        loginUrl.searchParams.set('callbackUrl', req.url)
        return NextResponse.redirect(loginUrl)
      }

      // Validasi role & tipe user untuk akses admin
      if ((userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') || userType !== 'admin') {
        console.log('Middleware - Invalid admin access:')
        console.log('  - Token role:', token?.role)
        console.log('  - Token userType:', token?.userType)
        console.log('  - Expected role: SUPER_ADMIN or ADMIN')
        console.log('  - Expected userType: admin')
        return NextResponse.redirect(new URL('/admin/login', req.url))
      }

      console.log('Middleware - Admin access granted for role:', userRole)
    }

    // Semua route student bypass NextAuth (custom auth sendiri)
    if (pathname.startsWith('/student')) {
      console.log('Middleware - Student route access allowed (custom auth)')
      return NextResponse.next()
    }

    // Jika user admin sudah login dan mengakses /admin/login, arahkan ke dashboard
    if (pathname === '/admin/login' && token) {
      const userRole = typeof token?.role === 'string' ? token.role.toUpperCase() : ''
      const isAdmin = (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') && token.userType === 'admin'

      if (isAdmin) {
        console.log('Middleware - Admin already logged in, redirecting to admin dashboard')
        return NextResponse.redirect(new URL('/admin/dashboard', req.url))
      }
    }

    // Tidak ada auto-redirect untuk student login/register (pakai session management custom)
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        console.log('Middleware authorized callback - Path:', pathname)
        console.log('Middleware authorized callback - Token exists:', !!token)

        // Izinkan akses jika token ada dan mencoba mengakses dashboard admin
        if (token && pathname === '/admin/dashboard') {
          return true
        }

        // Selalu izinkan halaman login/register
        if (
          pathname === '/admin/login' ||
          pathname === '/student/login' ||
          pathname === '/student/register'
        ) {
          return true
        }

        // Semua route student diizinkan (auth custom)
        if (pathname.startsWith('/student')) {
          console.log('Middleware authorized callback - Student route allowed (custom auth)')
          return true
        }

        // Route admin butuh token valid + role & tipe yang sesuai
        if (pathname.startsWith('/admin')) {
          const hasValidToken = !!token
          const userRole = typeof token?.role === 'string' ? token.role.toUpperCase() : ''
          const hasValidRole = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN'
          const hasValidType = token?.userType === 'admin'
          console.log(
            'Middleware authorized callback - Admin check:',
            hasValidToken,
            hasValidRole,
            hasValidType
          )
          return hasValidToken && hasValidRole && hasValidType
        }

        // Public routes
        return true
      },
    },
  }
)

export const config = {
  // Lindungi semua route admin kecuali halaman login itu sendiri
  matcher: ['/admin/:path*'],
}
