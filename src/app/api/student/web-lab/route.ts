import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { WebLabStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 401 })
    }

    // Verify student exists and is active
    const student = await prisma.student.findUnique({
      where: { studentId },
      select: { id: true, class: true, status: true }
    })

    if (!student || student.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const assignments = await prisma.webLabAssignment.findMany({
      where: {
        status: WebLabStatus.PUBLISHED,
        OR: [
          { classLevel: null },
          { classLevel: 'All Classes' },
          { classLevel: student.class }
        ]
      },
      include: {
        submissions: {
          where: { studentId: student.id },
          select: {
            id: true,
            status: true,
            score: true,
            submittedAt: true
          }
        },
        _count: {
          select: { submissions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: assignments
    })
  } catch (error) {
    console.error('Error fetching web lab assignments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    )
  }
}