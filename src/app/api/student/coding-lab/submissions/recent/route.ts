import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const studentId = session.user.id

    // Get recent submissions (last 10)
    const submissions = await prisma.codingSubmission.findMany({
      where: { studentId },
      include: {
        exercise: {
          include: {
            lab: true
          }
        },
        evaluation: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    const data = submissions.map(submission => ({
      id: submission.id,
      labTitle: submission.exercise?.lab?.title || 'Unknown Lab',
      exerciseTitle: submission.exercise?.title || 'Unknown Exercise',
      createdAt: submission.createdAt,
      status: submission.status,
      evaluation: submission.evaluation ? {
        overallScore: submission.evaluation.overallScore,
        feedback: submission.evaluation.feedback,
        evaluatedAt: submission.evaluation.evaluatedAt
      } : null
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching recent submissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent submissions' },
      { status: 500 }
    )
  }
}
