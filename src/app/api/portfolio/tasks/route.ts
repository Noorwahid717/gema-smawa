import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

const MAX_TAGS = 8
const MAX_TITLE_LENGTH = 120
const MAX_SUMMARY_LENGTH = 480

function parseTags(value?: string | string[] | null): string[] {
  if (!value) return []
  const tags = Array.isArray(value) ? value : value.split(',')
  const normalized = tags
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0)
  return Array.from(new Set(normalized)).slice(0, MAX_TAGS)
}

export async function GET(request: Request) {
  // Allow access for both admin (NextAuth) and student (custom auth)
  // Students will access this via frontend with student session
  // Adminas will access this via NextAuth session
  
  const searchParams = new URL(request.url).searchParams
  const classLevel = searchParams.get('classLevel') ?? undefined
  const includeInactive = searchParams.get('includeInactive') === 'true'

  const tasks = await prisma.portfolioTask.findMany({
    where: {
      ...(classLevel ? { classLevel } : {}),
      ...(includeInactive ? {} : { isActive: true })
    },
    orderBy: { createdAt: 'desc' }
  })

  const data = tasks.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description,
    classLevel: task.classLevel,
    isActive: task.isActive,
    tags: parseTags(task.tags),
    instructions: task.instructions,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt
  }))

  return NextResponse.json({ success: true, data })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.userType !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  let payload: unknown

  try {
    payload = await request.json()
  } catch (_error) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (typeof payload !== 'object' || payload === null) {
    return NextResponse.json({ error: 'Payload must be an object' }, { status: 400 })
  }

  const body = payload as Record<string, unknown>

  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const description = typeof body.description === 'string' ? body.description.trim() : ''
  const classLevel = typeof body.classLevel === 'string' ? body.classLevel.trim() : ''
  const instructions = typeof body.instructions === 'string' ? body.instructions.trim() : undefined
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

  if (body.summary && typeof body.summary === 'string' && body.summary.length > MAX_SUMMARY_LENGTH) {
    return NextResponse.json({ error: 'Summary exceeds maximum length' }, { status: 400 })
  }

  try {
    const task = await prisma.portfolioTask.upsert({
      where: {
        title_classLevel: {
          title,
          classLevel
        }
      },
      update: {
        description,
        tags: tags.join(','),
        instructions,
        isActive
      },
      create: {
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
        id: task.id,
        title: task.title,
        description: task.description,
        classLevel: task.classLevel,
        tags,
        instructions: task.instructions,
        isActive: task.isActive
      }
    })
  } catch (error) {
    console.error('Failed to upsert portfolio task', error)
    return NextResponse.json({ error: 'Failed to save portfolio task' }, { status: 500 })
  }
}