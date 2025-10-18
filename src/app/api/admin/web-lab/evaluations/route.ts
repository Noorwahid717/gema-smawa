import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { WebLabSubmissionStatus } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting evaluation creation...')
    
    const session = await getServerSession(authOptions)
    console.log('Session user:', session?.user)
    
    if (!session?.user?.id) {
      console.log('❌ No session user ID')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { submissionId, score, feedback, checklist } = body
    
    console.log('Request body:', { submissionId, score, feedback: feedback?.substring(0, 50) })

    if (!submissionId || score === undefined || score === null || score === '') {
      console.log('❌ Missing required fields - submissionId:', !!submissionId, 'score:', score, 'type:', typeof score)
      return NextResponse.json(
        { error: 'Submission ID and score are required' },
        { status: 400 }
      )
    }

    // Verify admin exists
    const admin = await prisma.admin.findUnique({
      where: { id: session.user.id }
    })
    
    console.log('Admin lookup result:', admin ? { id: admin.id, name: admin.name } : 'NOT FOUND')
    
    if (!admin) {
      console.log('❌ Admin not found for session user ID:', session.user.id)
      return NextResponse.json({ error: 'Admin not found' }, { status: 403 })
    }

    console.log('✅ Admin verified, proceeding with evaluation...')

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

    console.log('✅ Evaluation created/updated successfully:', evaluation)

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