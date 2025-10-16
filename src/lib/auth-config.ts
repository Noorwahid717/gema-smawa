import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'

const isProduction = process.env.NODE_ENV === 'production'

const resolveCookieDomain = () => {
  if (!isProduction) {
    return undefined
  }

  const domainFromEnv = process.env.NEXTAUTH_COOKIE_DOMAIN
  if (domainFromEnv) {
    return domainFromEnv
  }

  const urlFromEnv = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL

  if (!urlFromEnv) {
    return undefined
  }

  try {
    const hostname = new URL(urlFromEnv).hostname

    // Avoid setting cookie domain for localhost or invalid hostnames
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.localhost')
    ) {
      return undefined
    }

    return hostname
  } catch (error) {
    console.error('Failed to resolve cookie domain from URL:', urlFromEnv, error)
    return undefined
  }
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: '/admin/login', // Custom admin login page
  },
  providers: [
    // Admin Login Provider
    CredentialsProvider({
      id: 'admin',
      name: 'Admin Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('\n=========================================')
        console.log('🔐 ADMIN AUTHORIZE CALLBACK')
        console.log('=========================================')
        console.log('📧 Email provided:', credentials?.email)
        console.log('🔑 Password provided:', credentials?.password ? '***' : 'NO')
        console.log('🌍 Environment:', process.env.NODE_ENV)
        console.log('⏰ Timestamp:', new Date().toISOString())
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials')
          console.log('=========================================\n')
          return null
        }

        try {
          const admin = await prisma.admin.findUnique({
            where: {
              email: credentials.email
            }
          })

          console.log('👤 Admin found:', admin ? 'YES' : 'NO')
          if (admin) {
            console.log('📋 Admin details:', {
              id: admin.id,
              email: admin.email,
              name: admin.name,
              role: admin.role
            })
          }

          if (!admin) {
            console.log('❌ Admin not found in database')
            console.log('=========================================\n')
            return null
          }

          const isPasswordValid = await verifyPassword(
            credentials.password,
            admin.password
          )

          console.log('🔓 Password valid:', isPasswordValid ? 'YES' : 'NO')

          if (!isPasswordValid) {
            console.log('❌ Invalid password')
            console.log('=========================================\n')
            return null
          }

          const userObject = {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
            userType: 'admin' as const
          }

          console.log('✅ Authorization successful!')
          console.log('📦 Returning user object:', userObject)
          console.log('=========================================\n')

          return userObject
        } catch (error) {
          console.error('❌ Error in authorize callback:', error)
          console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
          console.log('=========================================\n')
          return null
        }
      }
    }),
    // Student Login Provider
    CredentialsProvider({
      id: 'student',
      name: 'Student Login',
      credentials: {
        studentId: { label: 'Student ID', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.studentId || !credentials?.password) {
          return null
        }

        const student = await prisma.student.findUnique({
          where: {
            studentId: credentials.studentId
          }
        })

        if (!student || student.status !== 'active') {
          return null
        }

        const isPasswordValid = await verifyPassword(
          credentials.password,
          student.password
        )

        if (!isPasswordValid) {
          return null
        }

        // Update last login
        await prisma.student.update({
          where: { id: student.id },
          data: { lastLoginAt: new Date() }
        })

        return {
          id: student.id,
          email: student.email,
          name: student.fullName,
          studentId: student.studentId,
          class: student.class || undefined,
          role: 'STUDENT',
          userType: 'student'
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: isProduction ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
        // CRITICAL: Don't set domain for Vercel - let browser handle it
        domain: undefined
      }
    },
    callbackUrl: {
      name: isProduction ? '__Secure-next-auth.callback-url' : 'next-auth.callback-url',
      options: {
        httpOnly: false, // Must be false for client-side redirect
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
        domain: undefined
      }
    },
    csrfToken: {
      name: isProduction ? '__Host-next-auth.csrf-token' : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
        domain: undefined
      }
    }
  },
  // Enable debug mode di production untuk troubleshooting
  debug: true,
  callbacks: {
    async jwt({ token, user, trigger, account }) {
      console.log('\n=========================================')
      console.log('🎫 JWT CALLBACK')
      console.log('=========================================')
      console.log('🔄 Trigger:', trigger)
      console.log('🌍 Environment:', process.env.NODE_ENV)
      console.log('⏰ Timestamp:', new Date().toISOString())
      console.log('👤 User object:', user ? {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        userType: user.userType
      } : 'null')
      console.log('🎟️ Token before:', {
        sub: token.sub,
        id: token.id,
        email: token.email,
        role: token.role,
        userType: token.userType
      })
      console.log('🔐 Account:', account ? { provider: account.provider, type: account.type } : 'null')
      
      if (user) {
        console.log('✅ Updating token with user data...')
        token.role = user.role
        token.id = user.id
        token.userType = user.userType
        token.studentId = user.studentId
        token.class = user.class
        
        console.log('📝 Token updated successfully')
      }
      
      console.log('🎟️ Token after:', {
        sub: token.sub,
        id: token.id,
        email: token.email,
        role: token.role,
        userType: token.userType
      })
      console.log('=========================================\n')
      
      return token
    },
    async session({ session, token }) {
      console.log('\n=========================================')
      console.log('📋SESSION CALLBACK')
      console.log('=========================================')
      console.log('🌍 Environment:', process.env.NODE_ENV)
      console.log('⏰ Timestamp:', new Date().toISOString())
      console.log('🎟️ Token:', {
        sub: token.sub,
        id: token.id,
        email: token.email,
        role: token.role,
        userType: token.userType
      })
      console.log('📋 Session before:', {
        user: session.user ? {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role,
          userType: session.user.userType
        } : 'null'
      })
      
      if (token) {
        console.log('✅ Updating session with token data...')
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.userType = token.userType as string
        session.user.studentId = token.studentId as string
        session.user.class = token.class as string
        console.log('📝 Session updated successfully')
      }
      
      console.log('📋 Session after:', {
        user: {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role,
          userType: session.user.userType
        }
      })
      console.log('=========================================\n')
      
      return session
    },
    async redirect({ url, baseUrl }) {
      console.log('\n=========================================')
      console.log('🔀 REDIRECT CALLBACK')
      console.log('=========================================')
      console.log('🔗 URL:', url)
      console.log('🏠 Base URL:', baseUrl)
      console.log('🌍 Environment:', process.env.NODE_ENV)
      console.log('⏰ Timestamp:', new Date().toISOString())
      
      // Always redirect to the provided callback URL if it's within our domain
      if (url.startsWith(baseUrl)) {
        console.log('✅ URL starts with base URL')
        console.log('🎯 Redirecting to:', url)
        console.log('=========================================\n')
        return url
      }
      
      // Handle relative paths
      if (url.startsWith('/')) {
        const fullUrl = `${baseUrl}${url}`
        console.log('✅ Relative path detected')
        console.log('🔗 Converting to full URL:', fullUrl)
        console.log('=========================================\n')
        return fullUrl
      }
      
      // Default redirect for admin after successful login
      if (url === baseUrl || url === `${baseUrl}/`) {
        const dashboardUrl = `${baseUrl}/admin/dashboard`
        console.log('✅ Base URL or root detected')
        console.log('🎯 Default admin redirect to:', dashboardUrl)
        console.log('=========================================\n')
        return dashboardUrl
      }
      
      // CRITICAL: If URL contains admin/dashboard, ensure proper redirect
      if (url.includes('/admin/dashboard')) {
        const dashboardUrl = url.startsWith('http') ? url : `${baseUrl}${url}`
        console.log('✅ Admin dashboard URL detected')
        console.log('🎯 Ensuring proper dashboard redirect:', dashboardUrl)
        console.log('=========================================\n')
        return dashboardUrl
      }
      
      // For unknown or external URLs, redirect to admin dashboard as fallback
      console.log('⚠️ Unknown URL pattern, using fallback')
      const fallbackUrl = `${baseUrl}/admin/dashboard`
      console.log('🎯 Fallback redirect to:', fallbackUrl)
      console.log('=========================================\n')
      return fallbackUrl
    }
  }
}