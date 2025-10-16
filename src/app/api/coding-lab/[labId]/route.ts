import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ labId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { labId } = await params

    if (!session || session.user.userType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const lab = await prisma.codingLab.findUnique({
      where: { id: labId },
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

    if (!lab) {
      return NextResponse.json({ error: 'Lab not found' }, { status: 404 })
    }

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
    console.error('Error fetching coding lab:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ labId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { labId } = await params

    if (!session || session.user.userType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, difficulty, language, points, duration, isActive } = body

    const lab = await prisma.codingLab.update({
      where: { id: labId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(difficulty !== undefined && { difficulty }),
        ...(language !== undefined && { language }),
        ...(points !== undefined && { points: parseInt(points) }),
        ...(duration !== undefined && { duration: parseInt(duration) }),
        ...(isActive !== undefined && { isActive })
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
    console.error('Error updating coding lab:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ labId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { labId } = await params

    if (!session || session.user.userType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.codingLab.delete({
      where: { id: labId }
    })

    return NextResponse.json({ success: true, message: 'Lab deleted successfully' })
  } catch (error) {
    console.error('Error deleting coding lab:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}