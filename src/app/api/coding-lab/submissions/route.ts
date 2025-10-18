import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { CODING_LAB_MAX_EDITOR_SIZE, normalizeTags } from '@/lib/coding-lab'
import { CodingLabSubmissionStatus, CodingLabArtifactType } from '@prisma/client'

function validateEditorSize(label: string, value?: string | null) {
  if (!value) return
  if (value.length > CODING_LAB_MAX_EDITOR_SIZE) {
    throw new Error(`${label} melebihi batas ${CODING_LAB_MAX_EDITOR_SIZE} karakter`)
  }
}

export async function GET(request: Request) {
  // Allow access for both admin (NextAuth) and student (custom auth)
  // Students will access this via frontend with student session
  
  const { searchParams } = new URL(request.url)
  const taskId = searchParams.get('taskId') ?? undefined
  const studentIdParam = searchParams.get('studentId') ?? undefined

  // Check if there's a NextAuth session (for admin)
  const session = await getServerSession(authOptions)
  const isStudent = session && session.user.userType === 'student'
  
  // For students using custom auth, studentId will come from frontend
  // For NextAuth users, use session ID
  const studentId = isStudent ? session.user.id : studentIdParam

  if (!studentId) {
    return NextResponse.json({ error: 'Student id is required' }, { status: 400 })
  }

  if (isStudent && studentId !== session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const submissions = await prisma.codingLabSubmission.findMany({
    where: {
      studentId,
      ...(taskId ? { taskId } : {})
    },
    include: {
      task: true,
      lastVersion: true,
      evaluations: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          rubricScores: true
        }
      }
    }
  })

  const data = submissions.map(submission => ({
    id: submission.id,
    taskId: submission.taskId,
    studentId: submission.studentId,
    title: submission.title,
    summary: submission.summary,
    classLevel: submission.classLevel,
    tags: normalizeTags(submission.tags),
    status: submission.status,
    draft: {
      html: submission.draftHtml,
      css: submission.draftCss,
      js: submission.draftJs,
      artifactType: submission.draftArtifact,
      archivePath: submission.draftArchivePath,
      archiveSize: submission.draftArchiveSize,
      metadata: submission.draftMetadata
    },
    grade: submission.grade,
    reviewerId: submission.reviewerId,
    reviewerNote: submission.reviewerNote,
    submittedAt: submission.submittedAt,
    returnedAt: submission.returnedAt,
    createdAt: submission.createdAt,
    updatedAt: submission.updatedAt,
    task: {
      id: submission.task.id,
      title: submission.task.title,
      classLevel: submission.task.classLevel,
      tags: normalizeTags(submission.task.tags)
    },
    latestVersion: submission.lastVersion
      ? {
          id: submission.lastVersion.id,
          html: submission.lastVersion.html,
          css: submission.lastVersion.css,
          js: submission.lastVersion.js,
          artifactType: submission.lastVersion.artifactType,
          archivePath: submission.lastVersion.archivePath,
          createdAt: submission.lastVersion.createdAt
        }
      : null,
    evaluation:
      submission.evaluations.length > 0
        ? {
            id: submission.evaluations[0].id,
            overallScore: submission.evaluations[0].overallScore,
            overallNote: submission.evaluations[0].overallNote,
            status: submission.evaluations[0].status,
            createdAt: submission.evaluations[0].createdAt,
            rubricScores: submission.evaluations[0].rubricScores.map(score => ({
              id: score.id,
              criterion: score.criterion,
              score: score.score,
              maxScore: score.maxScore,
              comment: score.comment
            }))
          }
        : null
  }))

  return NextResponse.json({ success: true, data })
}

export async function POST(request: Request) {
  // Allow students to save/submit coding labs
  // Authentication will be handled by frontend with studentAuth
  
  const session = await getServerSession(authOptions)

  let body: unknown

  try {
    body = await request.json()
  } catch (_error) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Payload must be an object' }, { status: 400 })
  }

  const payload = body as Record<string, unknown>

  const taskId = typeof payload.taskId === 'string' ? payload.taskId : ''
  const title = typeof payload.title === 'string' ? payload.title.trim() : ''
  const summary = typeof payload.summary === 'string' ? payload.summary.trim() : undefined
  const classLevel =
    typeof payload.classLevel === 'string'
      ? payload.classLevel.trim()
      : (session?.user.class || '')
  const tags = normalizeTags(payload.tags)
  const studentId = typeof payload.studentId === 'string' ? payload.studentId : (session?.user.id || '')
  const html = typeof payload.html === 'string' ? payload.html : undefined
  const css = typeof payload.css === 'string' ? payload.css : undefined
  const js = typeof payload.js === 'string' ? payload.js : undefined
  const requestedArtifactType =
    typeof payload.artifactType === 'string' && payload.artifactType.toUpperCase() === 'UPLOAD'
      ? CodingLabArtifactType.UPLOAD
      : CodingLabArtifactType.EDITOR

  if (!taskId) {
    return NextResponse.json({ error: 'taskId is required' }, { status: 400 })
  }

  if (!title) {
    return NextResponse.json({ error: 'Judul coding lab wajib diisi' }, { status: 400 })
  }

  if (title.length > 160) {
    return NextResponse.json({ error: 'Judul terlalu panjang (maksimal 160 karakter)' }, { status: 400 })
  }

  if (summary && summary.length > 600) {
    return NextResponse.json({ error: 'Ringkasan terlalu panjang (maksimal 600 karakter)' }, { status: 400 })
  }

  if (!classLevel) {
    return NextResponse.json({ error: 'Kelas wajib diisi' }, { status: 400 })
  }

  try {
    validateEditorSize('HTML', html)
    validateEditorSize('CSS', css)
    validateEditorSize('JavaScript', js)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }

  const existingSubmission = await prisma.codingLabSubmission.findUnique({
    where: {
      studentId_taskId: {
        studentId,
        taskId
      }
    }
  })

  const task = await prisma.codingLabTask.findUnique({
    where: { id: taskId }
  })

  if (!task) {
    return NextResponse.json({ error: 'Tugas coding lab tidak ditemukan' }, { status: 404 })
  }

  if (!task.isActive && !existingSubmission) {
    return NextResponse.json({ error: 'Tugas ini sudah ditutup' }, { status: 400 })
  }

  const canContinueExisting =
    existingSubmission &&
    (existingSubmission.status === CodingLabSubmissionStatus.DRAFT ||
      existingSubmission.status === CodingLabSubmissionStatus.RETURNED)

  if (existingSubmission && !canContinueExisting) {
    return NextResponse.json({
      error: 'Pengumpulan sudah terkunci karena telah dikirim atau dinilai'
    }, { status: 409 })
  }

  const artifactType =
    requestedArtifactType === CodingLabArtifactType.UPLOAD &&
    existingSubmission &&
    existingSubmission.draftArchivePath
      ? CodingLabArtifactType.UPLOAD
      : CodingLabArtifactType.EDITOR;

  const metadata = {
    updatedAt: new Date().toISOString(),
    source: artifactType === CodingLabArtifactType.UPLOAD ? 'upload' : 'editor',
    tags,
    classLevel
  }

  const record = existingSubmission
    ? await prisma.codingLabSubmission.update({
        where: { id: existingSubmission.id },
        data: {
          title,
          summary,
          classLevel,
          tags: tags.join(','),
          draftHtml: html,
          draftCss: css,
          draftJs: js,
          draftArtifact: artifactType,
          draftArchivePath:
            artifactType === CodingLabArtifactType.UPLOAD
              ? existingSubmission.draftArchivePath
              : null,
          draftArchiveSize:
            artifactType === CodingLabArtifactType.UPLOAD
              ? existingSubmission.draftArchiveSize
              : null,
          draftMetadata: JSON.stringify(metadata)
        }
      })
    : await prisma.codingLabSubmission.create({
        data: {
          taskId,
          studentId,
          title,
          summary,
          classLevel,
          tags: tags.join(','),
          status: CodingLabSubmissionStatus.DRAFT,
          draftHtml: html,
          draftCss: css,
          draftJs: js,
          draftArtifact: CodingLabArtifactType.EDITOR,
          draftMetadata: JSON.stringify(metadata)
        }
      })

  return NextResponse.json({
    success: true,
    data: {
      id: record.id,
      status: record.status,
      title: record.title,
      summary: record.summary,
      classLevel: record.classLevel,
      tags,
      draft: {
        html,
        css,
        js,
        artifactType: record.draftArtifact
      }
    }
  })
}