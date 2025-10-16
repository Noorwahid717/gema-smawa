import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.userType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const exerciseId = searchParams.get('exerciseId')
    const studentId = searchParams.get('studentId')
    const status = searchParams.get('status')

    const submissions = await prisma.codingSubmission.findMany({
      where: {
        ...(exerciseId ? { exerciseId } : {}),
        ...(studentId ? { studentId } : {}),
        ...(status ? { status: status as 'DRAFT' | 'SUBMITTED' | 'EVALUATING' | 'APPROVED' | 'REJECTED' } : {})
      },
      include: {
        exercise: {
          select: {
            id: true,
            title: true,
            lab: {
              select: {
                id: true,
                title: true,
                language: true
              }
            }
          }
        },
        student: {
          select: {
            id: true,
            studentId: true,
            fullName: true,
            class: true
          }
        },
        evaluation: {
          select: {
            id: true,
            overallScore: true,
            feedback: true,
            evaluatedAt: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = submissions.map((submission: any) => ({
      id: submission.id,
      exerciseId: submission.exerciseId,
      studentId: submission.studentId,
      status: submission.status,
      score: submission.score,
      executionTime: submission.executionTime,
      memoryUsed: submission.memoryUsed,
      testResults: submission.testResults,
      submittedAt: submission.submittedAt,
      attempts: submission.attempts,
      createdAt: submission.createdAt,
      exercise: {
        id: submission.exercise.id,
        title: submission.exercise.title,
        lab: submission.exercise.lab
      },
      student: submission.student,
      evaluation: submission.evaluation
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching coding submissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coding submissions' },
      { status: 500 }
    )
  }
}