import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';

/**
 * DEBUG ENDPOINT
 * GET /api/python-coding-lab/debug-session
 * Check session status for Python Coding Lab
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    console.log('\n=========================================');
    console.log('🔍 PYTHON CODING LAB - DEBUG SESSION');
    console.log('=========================================');
    console.log('📍 URL:', request.url);
    console.log('🍪 Cookies:', request.cookies.getAll());
    console.log('🎫 Session exists:', !!session);
    
    if (session) {
      console.log('📋 Full session object:', JSON.stringify(session, null, 2));
    }
    console.log('=========================================\n');

    return NextResponse.json({
      success: true,
      hasSession: !!session,
      session: session || null,
      cookies: request.cookies.getAll(),
      headers: {
        cookie: request.headers.get('cookie'),
        authorization: request.headers.get('authorization'),
      },
      checks: {
        hasUser: !!session?.user,
        hasRole: !!session?.user?.role,
        role: session?.user?.role || null,
        isStudent: session?.user?.role === 'STUDENT',
        userType: session?.user?.userType || null,
      },
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : null,
      },
      { status: 500 }
    );
  }
}
