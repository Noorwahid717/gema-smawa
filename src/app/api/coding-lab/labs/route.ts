import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const labs = await prisma.codingLab.findMany({
      where: {
        isActive: true
      },
      include: {
        exercises: {
          where: {
            isActive: true
          },
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
