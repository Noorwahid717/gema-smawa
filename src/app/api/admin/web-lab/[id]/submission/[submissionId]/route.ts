import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; submissionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: assignmentId, submissionId } = await params

    const submission = await prisma.webLabSubmission.findUnique({
      where: { id: submissionId },
      include: {
        student: {
          select: {
            fullName: true,
            studentId: true,
            class: true
          }
        },
        assignment: {
          select: {
            title: true,
            description: true,
            points: true,
            requirements: true
          }
        },
        evaluation: true
      }
    })

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    // Verify that the submission belongs to the assignment
    if (submission.assignmentId !== assignmentId) {
      return NextResponse.json({ error: 'Submission does not belong to this assignment' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: submission
    })
  } catch (error) {
    console.error('Error fetching web lab submission:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submission' },
      { status: 500 }
    )
  }
}