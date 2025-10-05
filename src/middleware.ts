import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    console.log('\n=========================================')
    console.log('🔐 MIDDLEWARE EXECUTION')
    console.log('=========================================')
    console.log('📍 Path:', pathname)
    console.log('🎫 Token exists:', !!token)
    
    if (token) {
      console.log('📋 Token details:')
      console.log('   - ID:', token.id)
      console.log('   - Email:', token.email)
      console.log('   - Role:', token.role)
      console.log('   - User Type:', token.userType)
      console.log('   - Sub:', token.sub)
    } else {
      console.log('❌ No token found')
    }
    console.log('=========================================')

    // Proteksi route admin (kecuali halaman login)
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      console.log('🛡️ Admin route protection check')
      
      const userRole = typeof token?.role === 'string' ? token.role.toUpperCase() : ''
      const userType = typeof token?.userType === 'string' ? token.userType : undefined

      console.log('   Checking credentials:')
      console.log('   - User Role:', userRole)
      console.log('   - User Type:', userType)
      console.log('   - Is Admin Role?', userRole === 'SUPER_ADMIN' || userRole === 'ADMIN')
      console.log('   - Is Admin Type?', userType === 'admin')

      // Jika tidak ada token, redirect ke login dengan callback
      if (!token) {
        console.log('❌ NO TOKEN - Redirecting to login')
        console.log('=========================================')
        const loginUrl = new URL('/admin/login', req.url)
        loginUrl.searchParams.set('callbackUrl', req.url)
        return NextResponse.redirect(loginUrl)
      }

      // Validasi role & tipe user untuk akses admin
      const hasValidRole = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN'
      const hasValidType = userType === 'admin'
      
      if (!hasValidRole || !hasValidType) {
        console.log('❌ INVALID CREDENTIALS - Redirecting to login')
        console.log('   Reason:')
        if (!hasValidRole) console.log('   - Invalid role:', token?.role, '(expected: ADMIN or SUPER_ADMIN)')
        if (!hasValidType) console.log('   - Invalid user type:', token?.userType, '(expected: admin)')
        console.log('=========================================')
        return NextResponse.redirect(new URL('/admin/login', req.url))
      }

      console.log('✅ ADMIN ACCESS GRANTED')
      console.log('=========================================')
    }

    // Semua route student bypass NextAuth (custom auth sendiri)
    if (pathname.startsWith('/student')) {
      console.log('Middleware - Student route access allowed (custom auth)')
      return NextResponse.next()
    }

    // Jika user admin sudah login dan mengakses /admin/login, arahkan ke dashboard
    if (pathname === '/admin/login' && token) {
      console.log('🔄 Admin login page accessed with token')
      const userRole = typeof token?.role === 'string' ? token.role.toUpperCase() : ''
      const isAdmin = (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') && token.userType === 'admin'

      console.log('   Is authenticated admin?', isAdmin)
      
      if (isAdmin) {
        console.log('✅ Admin already logged in, redirecting to dashboard')
        console.log('=========================================')
        return NextResponse.redirect(new URL('/admin/dashboard', req.url))
      }
    }

    console.log('✅ Middleware passed - Proceeding to route')
    console.log('=========================================\n')
    
    // Tidak ada auto-redirect untuk student login/register (pakai session management custom)
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        console.log('\n=========================================')
        console.log('🔓 AUTHORIZED CALLBACK')
        console.log('=========================================')
        console.log('📍 Path:', pathname)
        console.log('🎫 Token exists:', !!token)
        
        if (token) {
          console.log('📋 Token in authorized:')
          console.log('   - ID:', token.id)
          console.log('   - Role:', token.role)
          console.log('   - User Type:', token.userType)
        }

        // Selalu izinkan halaman login/register
        if (
          pathname === '/admin/login' ||
          pathname === '/student/login' ||
          pathname === '/student/register'
        ) {
          console.log('✅ Login/Register page - ALLOWED')
          console.log('=========================================\n')
          return true
        }

        // Semua route student diizinkan (auth custom)
        if (pathname.startsWith('/student')) {
          console.log('✅ Student route - ALLOWED (custom auth)')
          console.log('=========================================\n')
          return true
        }

        // Route admin butuh token valid + role & tipe yang sesuai
        if (pathname.startsWith('/admin')) {
          console.log('🛡️ Admin route authorization check')
          
          if (!token) {
            console.log('❌ No token - DENIED')
            console.log('=========================================\n')
            return false
          }
          
          const userRole = typeof token?.role === 'string' ? token.role.toUpperCase() : ''
          const hasValidRole = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN'
          const hasValidType = token?.userType === 'admin'
          
          console.log('   Validation results:')
          console.log('   - Has token:', !!token)
          console.log('   - Has valid role:', hasValidRole, `(${userRole})`)
          console.log('   - Has valid type:', hasValidType, `(${token?.userType})`)
          
          const isAuthorized = !!token && hasValidRole && hasValidType
          
          if (isAuthorized) {
            console.log('✅ Admin authorized - ALLOWED')
          } else {
            console.log('❌ Admin not authorized - DENIED')
            console.log('   Missing requirements:')
            if (!hasValidRole) console.log('   - Valid admin role')
            if (!hasValidType) console.log('   - Admin user type')
          }
          
          console.log('=========================================\n')
          return isAuthorized
        }

        // Public routes
        console.log('✅ Public route - ALLOWED')
        console.log('=========================================\n')
        return true
      },
    },
  }
)

export const config = {
  // Lindungi semua route admin kecuali halaman login itu sendiri
  matcher: ['/admin/:path*'],
}
