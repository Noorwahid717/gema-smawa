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

    // Get all coding labs
    const allLabs = await prisma.codingLab.findMany({
      where: { isActive: true },
      include: {
        exercises: {
          where: { isActive: true }
        }
      }
    })

    // Get student's submissions
    const submissions = await prisma.codingSubmission.findMany({
      where: { studentId },
      include: {
        exercise: {
          include: {
            lab: true
          }
        },
        evaluation: true
      }
    })

    // Calculate progress per lab
    const labProgress = allLabs.map(lab => {
      const labSubmissions = submissions.filter(sub => sub.exercise.labId === lab.id)
      const completedExercises = labSubmissions.filter(sub => 
        sub.status === 'APPROVED' || (sub.evaluation !== null)
      ).length

      return {
        labId: lab.id,
        totalExercises: lab.exercises.length,
        completedExercises,
        isCompleted: completedExercises === lab.exercises.length && lab.exercises.length > 0
      }
    })

    // Calculate overall statistics
    const totalLabs = allLabs.length
    const completedLabs = labProgress.filter(lp => lp.isCompleted).length
    const totalExercises = allLabs.reduce((sum, lab) => sum + lab.exercises.length, 0)
    const completedExercises = labProgress.reduce((sum, lp) => sum + lp.completedExercises, 0)
    const totalPoints = allLabs.reduce((sum, lab) => sum + lab.points, 0)
    
    // Calculate earned points from approved submissions
    const approvedSubmissions = submissions.filter(sub => 
      sub.evaluation !== null
    )
    const earnedPoints = approvedSubmissions.reduce((sum, sub) => sum + (sub.exercise?.points || 0), 0)

    // Calculate average score
    const evaluatedSubmissions = submissions.filter(sub => sub.evaluation?.overallScore)
    const averageScore = evaluatedSubmissions.length > 0 
      ? Math.round(evaluatedSubmissions.reduce((sum, sub) => sum + (sub.evaluation?.overallScore || 0), 0) / evaluatedSubmissions.length)
      : 0

    // Calculate current streak (simplified - consecutive days with submissions)
    const currentStreak = 0 // TODO: Implement streak calculation

    const data = {
      labs: labProgress,
      totalLabs,
      completedLabs,
      totalExercises,
      completedExercises,
      totalPoints,
      totalEarnedPoints: earnedPoints,
      averageScore,
      currentStreak
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching student progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    )
  }
}
