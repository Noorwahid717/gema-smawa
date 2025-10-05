import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth-config'

export async function POST(request: NextRequest) {
  const segments = request.nextUrl.pathname.split('/').filter(Boolean)
  const classroomIndex = segments.indexOf('classroom')
  const classroomParam = classroomIndex !== -1 ? segments[classroomIndex + 1] : undefined
  const requestId = randomUUID()

  try {
    const session = await getServerSession(authOptions)

    const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN'

    if (!session || !isAdmin) {
      console.warn('[LiveSession][Start] Unauthorized access attempt', {
        requestId,
        hasSession: !!session,
        role: session?.user?.role,
        userType: session?.user?.userType
      })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!classroomParam) {
      console.warn('[LiveSession][Start] Missing classroom parameter', { requestId })
      return NextResponse.json({ error: 'Classroom id is required' }, { status: 400 })
    }

    console.log('[LiveSession][Start] Incoming request', {
      requestId,
      classroomParam,
      userId: session.user?.id,
      userRole: session.user?.role
    })

    const classroom = await prisma.classroom.findFirst({
      where: {
        OR: [{ id: classroomParam }, { slug: classroomParam }]
      }
    })

    if (!classroom) {
      console.warn('[LiveSession][Start] Classroom not found', { requestId, classroomParam })
      return NextResponse.json({ error: 'Classroom not found' }, { status: 404 })
    }

    const existingLiveSession = await prisma.liveSession.findFirst({
      where: {
        classroomId: classroom.id,
        status: 'live'
      },
      orderBy: { createdAt: 'desc' }
    })

    if (existingLiveSession) {
      console.log('[LiveSession][Start] Reusing existing live session', {
        requestId,
        classroomId: classroom.id,
        sessionId: existingLiveSession.id
      })

      // Ensure the session reflects current start time if previously stale
      const refreshedSession = await prisma.liveSession.update({
        where: { id: existingLiveSession.id },
        data: {
          status: 'live',
          startsAt: existingLiveSession.startsAt ?? new Date()
        }
      })

      return NextResponse.json({ session: refreshedSession, reused: true })
    }

    const liveSession = await prisma.liveSession.create({
      data: {
        classroomId: classroom.id,
        status: 'live',
        startsAt: new Date()
      }
    })

    console.log('[LiveSession][Start] Live session created', {
      requestId,
      classroomId: classroom.id,
      sessionId: liveSession.id
    })

    return NextResponse.json({ session: liveSession, reused: false })
  } catch (error) {
    console.error('[LiveSession][Start] Unexpected error', { requestId, error })
    return NextResponse.json({ error: 'Failed to start live session' }, { status: 500 })
  }
}
