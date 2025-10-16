import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { WebLabSubmissionStatus } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { submissionId, score, feedback, checklist } = body

    if (!submissionId || score === undefined) {
      return NextResponse.json(
        { error: 'Submission ID and score are required' },
        { status: 400 }
      )
    }

    // Update submission status and score
    const submission = await prisma.webLabSubmission.update({
      where: { id: submissionId },
      data: {
        status: WebLabSubmissionStatus.GRADED,
        score,
        gradedAt: new Date(),
        feedback
      }
    })

    // Create or update evaluation
    const evaluation = await prisma.webLabEvaluation.upsert({
      where: { submissionId },
      update: {
        score,
        feedback,
        checklist: checklist ? JSON.parse(JSON.stringify(checklist)) : null
      },
      create: {
        submissionId,
        evaluatedBy: session.user.id,
        score,
        feedback,
        checklist: checklist ? JSON.parse(JSON.stringify(checklist)) : null
      },
      include: {
        admin: {
          select: { name: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        submission,
        evaluation
      }
    })
  } catch (error) {
    console.error('Error creating evaluation:', error)
    return NextResponse.json(
      { error: 'Failed to create evaluation' },
      { status: 500 }
    )
  }
}