import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import {
  FALLBACK_NOTICE,
  MIGRATION_INSTRUCTION,
  TABLE_MISSING_ERROR_CODES,
  generateUniqueSlug,
  mapProject,
  sanitizeStringArray,
} from '../utils'

type RouteParams = { params: Promise<{ id: string }> }

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams,
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const existing = await prisma.classroomProjectChecklist.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Checklist tidak ditemukan' }, { status: 404 })
    }

    const body = await request.json()
    const {
      title,
      goal,
      skills,
      basicTargets,
      advancedTargets,
      reflectionPrompt,
      order,
      isActive,
    } = body

    const updateData: Record<string, unknown> = {}

    if (typeof title === 'string' && title.trim().length > 0 && title !== existing.title) {
      updateData.title = title.trim()
      updateData.slug = await generateUniqueSlug(title, id)
    }

    if (typeof goal === 'string' && goal.trim().length > 0) {
      updateData.goal = goal.trim()
    }

    if (skills !== undefined) {
      updateData.skills = sanitizeStringArray(skills)
    }

    if (basicTargets !== undefined) {
      const normalizedBasicTargets = sanitizeStringArray(basicTargets)
      if (normalizedBasicTargets.length === 0) {
        return NextResponse.json(
          { error: 'Minimal satu target dasar diperlukan' },
          { status: 400 },
        )
      }
      updateData.basicTargets = normalizedBasicTargets
    }

    if (advancedTargets !== undefined) {
      updateData.advancedTargets = sanitizeStringArray(advancedTargets)
    }

    if (reflectionPrompt !== undefined) {
      updateData.reflectionPrompt =
        typeof reflectionPrompt === 'string' && reflectionPrompt.trim().length > 0
          ? reflectionPrompt.trim()
          : null
    }

    if (typeof order === 'number' && Number.isFinite(order)) {
      updateData.order = order
    }

    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive
    }

    const updated = await prisma.classroomProjectChecklist.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      message: 'Checklist proyek berhasil diperbarui',
      data: mapProject(updated as unknown as Parameters<typeof mapProject>[0]),
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      TABLE_MISSING_ERROR_CODES.has(error.code)
    ) {
      return NextResponse.json(
        { error: `${FALLBACK_NOTICE} ${MIGRATION_INSTRUCTION}` },
        { status: 503 },
      )
    }

    console.error('Error updating tutorial project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams,
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const existing = await prisma.classroomProjectChecklist.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Checklist tidak ditemukan' }, { status: 404 })
    }

    await prisma.classroomProjectChecklist.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Checklist proyek berhasil dihapus',
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      TABLE_MISSING_ERROR_CODES.has(error.code)
    ) {
      return NextResponse.json(
        { error: `${FALLBACK_NOTICE} ${MIGRATION_INSTRUCTION}` },
        { status: 503 },
      )
    }

    console.error('Error deleting tutorial project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
