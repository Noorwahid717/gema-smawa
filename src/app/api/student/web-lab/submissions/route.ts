import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { WebLabSubmissionStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const assignmentId = searchParams.get('assignmentId')

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 401 })
    }

    if (!assignmentId) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 })
    }

    // Verify student exists and is active
    const student = await prisma.student.findUnique({
      where: { studentId },
      select: { id: true, status: true }
    })

    if (!student || student.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const submission = await prisma.webLabSubmission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: student.id
        }
      },
      include: {
        assignment: true,
        evaluation: {
          include: {
            admin: {
              select: { name: true }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: submission
    })
  } catch (error) {
    console.error('Error fetching submission:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submission' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, assignmentId, html, css, js, status } = body

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 401 })
    }

    if (!assignmentId) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 })
    }

    // Verify student exists and is active
    const student = await prisma.student.findUnique({
      where: { studentId },
      select: { id: true, status: true }
    })

    if (!student || student.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const submissionData = {
      html,
      css,
      js,
      ...(status && { status }),
      ...(status === WebLabSubmissionStatus.SUBMITTED && { submittedAt: new Date() })
    }

    const submission = await prisma.webLabSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: student.id
        }
      },
      update: submissionData,
      create: {
        assignmentId,
        studentId: student.id,
        ...submissionData
      },
      include: {
        assignment: true
      }
    })

    return NextResponse.json({
      success: true,
      data: submission
    })
  } catch (error) {
    console.error('Error saving submission:', error)
    return NextResponse.json(
      { error: 'Failed to save submission' },
      { status: 500 }
    )
  }
}