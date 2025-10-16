import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { WebLabDifficulty, WebLabStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as WebLabStatus
    const difficulty = searchParams.get('difficulty') as WebLabDifficulty
    const classLevel = searchParams.get('classLevel')

    const assignments = await prisma.webLabAssignment.findMany({
      where: {
        ...(status && { status }),
        ...(difficulty && { difficulty }),
        ...(classLevel && { classLevel }),
      },
      include: {
        admin: {
          select: { name: true, email: true }
        },
        _count: {
          select: { submissions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: assignments
    })
  } catch (error) {
    console.error('Error fetching web lab assignments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      difficulty,
      classLevel,
      instructions,
      starterHtml,
      starterCss,
      starterJs,
      requirements,
      hints,
      solutionHtml,
      solutionCss,
      solutionJs,
      points,
      timeLimit,
      status
    } = body

    if (!title || !description || !instructions) {
      return NextResponse.json(
        { error: 'Title, description, and instructions are required' },
        { status: 400 }
      )
    }

    const assignment = await prisma.webLabAssignment.create({
      data: {
        title,
        description,
        difficulty: difficulty || WebLabDifficulty.BEGINNER,
        classLevel,
        instructions,
        starterHtml,
        starterCss,
        starterJs,
        requirements: requirements ? JSON.parse(JSON.stringify(requirements)) : null,
        hints: hints ? JSON.parse(JSON.stringify(hints)) : null,
        solutionHtml,
        solutionCss,
        solutionJs,
        points: points || 100,
        timeLimit,
        status: status || WebLabStatus.DRAFT,
        createdBy: session.user.id
      },
      include: {
        admin: {
          select: { name: true, email: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: assignment
    })
  } catch (error) {
    console.error('Error creating web lab assignment:', error)
    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    )
  }
}