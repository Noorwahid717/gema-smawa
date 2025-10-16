import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.userType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const labs = await prisma.codingLab.findMany({
      include: {
        exercises: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            points: true,
            isActive: true
          }
        },
        _count: {
          select: {
            exercises: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const data = labs.map(lab => ({
      id: lab.id,
      title: lab.title,
      description: lab.description,
      difficulty: lab.difficulty,
      language: lab.language,
      points: lab.points,
      duration: lab.duration,
      isActive: lab.isActive,
      exercisesCount: lab._count.exercises,
      exercises: lab.exercises,
      createdAt: lab.createdAt
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching coding labs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coding labs' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.userType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, difficulty, language, points, duration, isActive = true } = body

    if (!title || !language) {
      return NextResponse.json(
        { error: 'Title and language are required' },
        { status: 400 }
      )
    }

    const lab = await prisma.codingLab.create({
      data: {
        title,
        description,
        difficulty: difficulty || 'BEGINNER',
        language,
        points: points || 100,
        duration: duration || 60,
        isActive
      },
      include: {
        exercises: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            points: true,
            isActive: true
          }
        },
        _count: {
          select: {
            exercises: true
          }
        }
      }
    })

    const data = {
      id: lab.id,
      title: lab.title,
      description: lab.description,
      difficulty: lab.difficulty,
      language: lab.language,
      points: lab.points,
      duration: lab.duration,
      isActive: lab.isActive,
      exercisesCount: lab._count.exercises,
      exercises: lab.exercises,
      createdAt: lab.createdAt
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error creating coding lab:', error)
    return NextResponse.json(
      { error: 'Failed to create coding lab' },
      { status: 500 }
    )
  }
}