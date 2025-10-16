import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    labId: string
  }>
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.userType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { labId } = await params

    const exercises = await prisma.codingExercise.findMany({
      where: { labId },
      include: {
        testCases: {
          select: {
            id: true,
            input: true,
            expectedOutput: true,
            isHidden: true,
            explanation: true
          }
        },
        _count: {
          select: {
            submissions: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = exercises.map((exercise: any) => ({
      id: exercise.id,
      title: exercise.title,
      description: exercise.description,
      difficulty: exercise.difficulty,
      points: exercise.points,
      timeLimit: exercise.timeLimit,
      memoryLimit: exercise.memoryLimit,
      instructions: exercise.instructions,
      starterCode: exercise.starterCode,
      solutionCode: exercise.solutionCode,
      hints: exercise.hints ? JSON.parse(exercise.hints) : [],
      tags: exercise.tags ? JSON.parse(exercise.tags) : [],
      isActive: exercise.isActive,
      testCasesCount: exercise.testCases.length,
      submissionsCount: exercise._count.submissions,
      testCases: exercise.testCases,
      createdAt: exercise.createdAt
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching coding exercises:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coding exercises' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.userType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { labId } = await params
    const body = await request.json()
    const {
      title,
      description,
      difficulty,
      points,
      timeLimit,
      memoryLimit,
      instructions,
      starterCode,
      solutionCode,
      hints = [],
      tags = [],
      isActive = true
    } = body

    if (!title || !instructions || !starterCode) {
      return NextResponse.json(
        { error: 'Title, instructions, and starter code are required' },
        { status: 400 }
      )
    }

    // Verify lab exists
    const lab = await prisma.codingLab.findUnique({
      where: { id: labId }
    })

    if (!lab) {
      return NextResponse.json(
        { error: 'Coding lab not found' },
        { status: 404 }
      )
    }

    const exercise = await prisma.codingExercise.create({
      data: {
        labId,
        title,
        description,
        difficulty: difficulty || 'BEGINNER',
        points: points || 10,
        timeLimit: timeLimit || 30,
        memoryLimit: memoryLimit || 256,
        instructions,
        starterCode,
        solutionCode,
        hints: JSON.stringify(hints),
        tags: JSON.stringify(tags),
        isActive
      },
      include: {
        testCases: true,
        _count: {
          select: {
            submissions: true
          }
        }
      }
    })

    const data = {
      id: exercise.id,
      title: exercise.title,
      description: exercise.description,
      difficulty: exercise.difficulty,
      points: exercise.points,
      timeLimit: exercise.timeLimit,
      memoryLimit: exercise.memoryLimit,
      instructions: exercise.instructions,
      starterCode: exercise.starterCode,
      solutionCode: exercise.solutionCode,
      hints: exercise.hints ? JSON.parse(exercise.hints) : [],
      tags: exercise.tags ? JSON.parse(exercise.tags) : [],
      isActive: exercise.isActive,
      testCasesCount: exercise.testCases.length,
      submissionsCount: exercise._count.submissions,
      testCases: exercise.testCases,
      createdAt: exercise.createdAt
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error creating coding exercise:', error)
    return NextResponse.json(
      { error: 'Failed to create coding exercise' },
      { status: 500 }
    )
  }
}