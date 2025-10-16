import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { WebLabDifficulty, WebLabStatus } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const assignment = await prisma.webLabAssignment.findUnique({
      where: { id },
      include: {
        admin: {
          select: { name: true, email: true }
        },
        submissions: {
          include: {
            student: {
              select: { fullName: true, class: true }
            },
            evaluation: true
          }
        },
        _count: {
          select: { submissions: true }
        }
      }
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: assignment
    })
  } catch (error) {
    console.error('Error fetching web lab assignment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignment' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

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

    const assignment = await prisma.webLabAssignment.update({
      where: { id },
      data: {
        title,
        description,
        difficulty,
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
        points,
        timeLimit,
        status
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
    console.error('Error updating web lab assignment:', error)
    return NextResponse.json(
      { error: 'Failed to update assignment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await prisma.webLabAssignment.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Assignment deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting web lab assignment:', error)
    return NextResponse.json(
      { error: 'Failed to delete assignment' },
      { status: 500 }
    )
  }
}