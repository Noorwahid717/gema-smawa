import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import {
  FALLBACK_NOTICE,
  MIGRATION_INSTRUCTION,
  TABLE_MISSING_ERROR_CODES,
  buildFallbackProjects,
  generateUniqueSlug,
  mapProject,
  sanitizeStringArray,
} from './utils'

export async function GET() {
  try {
    const projects = await prisma.classroomProjectChecklist.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'asc' },
      ],
    })

    return NextResponse.json({
      success: true,
      data: projects.map(mapProject),
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      TABLE_MISSING_ERROR_CODES.has(error.code)
    ) {
      console.warn(
        'classroomProjectChecklist table is missing. Serving fallback checklist data.',
        error,
      )
      return NextResponse.json({
        success: true,
        data: buildFallbackProjects(),
        meta: {
          fallback: true,
          message: `${FALLBACK_NOTICE} ${MIGRATION_INSTRUCTION}`,
        },
      })
    }

    console.error('Error fetching tutorial projects:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    if (!title || !goal) {
      return NextResponse.json(
        { error: 'Judul dan tujuan wajib diisi' },
        { status: 400 },
      )
    }

    const normalizedSkills = sanitizeStringArray(skills)
    const normalizedBasicTargets = sanitizeStringArray(basicTargets)
    const normalizedAdvancedTargets = sanitizeStringArray(advancedTargets)

    if (normalizedBasicTargets.length === 0) {
      return NextResponse.json(
        { error: 'Minimal satu target dasar diperlukan' },
        { status: 400 },
      )
    }

    const slug = await generateUniqueSlug(title)

    const newProject = await prisma.classroomProjectChecklist.create({
      data: {
        title: title.trim(),
        slug,
        goal: goal.trim(),
        skills: normalizedSkills,
        basicTargets: normalizedBasicTargets,
        advancedTargets: normalizedAdvancedTargets,
        reflectionPrompt: reflectionPrompt ? String(reflectionPrompt) : null,
        order: typeof order === 'number' ? order : 0,
        isActive: typeof isActive === 'boolean' ? isActive : true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Checklist proyek berhasil dibuat',
      data: mapProject(newProject as unknown as Parameters<typeof mapProject>[0]),
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

    console.error('Error creating tutorial project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
