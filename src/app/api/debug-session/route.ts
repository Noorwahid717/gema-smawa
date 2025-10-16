import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({
      session,
      hasSession: !!session,
      userRole: session?.user?.role,
      isAdmin: session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN'
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to get session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}