import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { WebLabStatus } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const { id: assignmentId } = await params

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 })
    }

    if (!assignmentId) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 })
    }

    // Verify student exists and is active
    const student = await prisma.student.findUnique({
      where: { studentId },
      select: { id: true, class: true, status: true }
    })

    if (!student || student.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Student not found or inactive' }, { status: 404 })
    }

    // Fetch specific assignment
    const assignment = await prisma.webLabAssignment.findFirst({
      where: {
        id: assignmentId,
        status: WebLabStatus.PUBLISHED,
        OR: [
          { classLevel: null },
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
            submittedAt: true,
            html: true,
            css: true,
            js: true
          },
          orderBy: { submittedAt: 'desc' },
          take: 1
        }
      }
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: assignment
    })
  } catch (error) {
    console.error('Error fetching web lab assignment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignment' },
      { status: 500 }
    )
  }
}