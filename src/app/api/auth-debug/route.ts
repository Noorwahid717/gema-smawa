import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    
    // Get all admins from database
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      session,
      admins,
      hasSession: !!session,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      nextAuthSecret: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT_SET'
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Auth debug error:', error);
    
    return NextResponse.json({
      error: errorMessage,
      session: null,
      hasSession: false,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}