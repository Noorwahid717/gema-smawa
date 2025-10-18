import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

const MAX_TAGS = 8
const MAX_TITLE_LENGTH = 120

function parseTags(value?: string | string[] | null): string[] {
  if (!value) return []
  const tags = Array.isArray(value) ? value : value.split(',')
  const normalized = tags
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0)
  return Array.from(new Set(normalized)).slice(0, MAX_TAGS)
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session || session.user.userType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const task = await prisma.codingLabTask.findUnique({
      where: { id }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const data = {
      id: task.id,
      title: task.title,
      description: task.description,
      classLevel: task.classLevel,
      isActive: task.isActive,
      tags: parseTags(task.tags),
      instructions: task.instructions,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Failed to get coding lab task', error)
    return NextResponse.json({ error: 'Failed to get coding lab task' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session || session.user.userType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    let payload: unknown

    try {
      payload = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    if (typeof payload !== 'object' || payload === null) {
      return NextResponse.json({ error: 'Payload must be an object' }, { status: 400 })
    }

    const body = payload as Record<string, unknown>

    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const description = typeof body.description === 'string' ? body.description.trim() : ''
    const classLevel = typeof body.classLevel === 'string' ? body.classLevel.trim() : ''
    const instructions = typeof body.instructions === 'string' ? body.instructions?.trim() : undefined
    const tags = parseTags(body.tags as string | string[] | null)
    const isActive = typeof body.isActive === 'boolean' ? body.isActive : true

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (title.length > MAX_TITLE_LENGTH) {
      return NextResponse.json({ error: `Title must be under ${MAX_TITLE_LENGTH} characters` }, { status: 400 })
    }

    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }

    if (description.length > 1200) {
      return NextResponse.json({ error: 'Description is too long' }, { status: 400 })
    }

    if (!classLevel) {
      return NextResponse.json({ error: 'Class level is required' }, { status: 400 })
    }

    // Check if task exists
    const existingTask = await prisma.codingLabTask.findUnique({
      where: { id }
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check for unique constraint violation if title or classLevel changed
    if (existingTask.title !== title || existingTask.classLevel !== classLevel) {
      const duplicateTask = await prisma.codingLabTask.findUnique({
        where: {
          title_classLevel: {
            title,
            classLevel
          }
        }
      })

      if (duplicateTask && duplicateTask.id !== id) {
        return NextResponse.json({
          error: 'A task with this title and class level already exists'
        }, { status: 409 })
      }
    }

    const updatedTask = await prisma.codingLabTask.update({
      where: { id },
      data: {
        title,
        description,
        classLevel,
        tags: tags.join(','),
        instructions,
        isActive
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedTask.id,
        title: updatedTask.title,
        description: updatedTask.description,
        classLevel: updatedTask.classLevel,
        tags,
        instructions: updatedTask.instructions,
        isActive: updatedTask.isActive,
        createdAt: updatedTask.createdAt,
        updatedAt: updatedTask.updatedAt
      }
    })
  } catch (error) {
    console.error('Failed to update coding lab task', error)
    return NextResponse.json({ error: 'Failed to update coding lab task' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session || session.user.userType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check if task exists
    const existingTask = await prisma.codingLabTask.findUnique({
      where: { id }
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check if task has submissions
    const submissionCount = await prisma.codingLabSubmission.count({
      where: { taskId: id }
    })

    if (submissionCount > 0) {
      return NextResponse.json({
        error: 'Cannot delete task that has student submissions. Deactivate it instead.'
      }, { status: 409 })
    }

    await prisma.codingLabTask.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete coding lab task', error)
    return NextResponse.json({ error: 'Failed to delete coding lab task' }, { status: 500 })
  }
}