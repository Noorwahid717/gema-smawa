import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { PORTFOLIO_MAX_EDITOR_SIZE, normalizeTags } from '@/lib/portfolio'
import { PortfolioSubmissionStatus, PortfolioArtifactType } from '@prisma/client'

function validateEditorSize(label: string, value?: string | null) {
  if (!value) return
  if (value.length > PORTFOLIO_MAX_EDITOR_SIZE) {
    throw new Error(`${label} melebihi batas ${PORTFOLIO_MAX_EDITOR_SIZE} karakter`)
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const taskId = searchParams.get('taskId') ?? undefined
  const studentIdParam = searchParams.get('studentId') ?? undefined

  const isStudent = session.user.userType === 'student'
  const studentId = isStudent ? session.user.id : studentIdParam

  if (!studentId) {
    return NextResponse.json({ error: 'Student id is required' }, { status: 400 })
  }

  if (isStudent && studentId !== session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const submissions = await prisma.portfolioSubmission.findMany({
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
  const session = await getServerSession(authOptions)

  if (!session || session.user.userType !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  let body: unknown

  try {
    body = await request.json()
  } catch (error) {
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
      : session.user.class || ''
  const tags = normalizeTags(payload.tags)
  const html = typeof payload.html === 'string' ? payload.html : undefined
  const css = typeof payload.css === 'string' ? payload.css : undefined
  const js = typeof payload.js === 'string' ? payload.js : undefined
  const requestedArtifactType =
    typeof payload.artifactType === 'string' && payload.artifactType.toUpperCase() === 'UPLOAD'
      ? PortfolioArtifactType.UPLOAD
      : PortfolioArtifactType.EDITOR

  if (!taskId) {
    return NextResponse.json({ error: 'taskId is required' }, { status: 400 })
  }

  if (!title) {
    return NextResponse.json({ error: 'Judul portfolio wajib diisi' }, { status: 400 })
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

  const existingSubmission = await prisma.portfolioSubmission.findUnique({
    where: {
      studentId_taskId: {
        studentId: session.user.id,
        taskId
      }
    }
  })

  const task = await prisma.portfolioTask.findUnique({
    where: { id: taskId }
  })

  if (!task) {
    return NextResponse.json({ error: 'Tugas portfolio tidak ditemukan' }, { status: 404 })
  }

  if (!task.isActive && !existingSubmission) {
    return NextResponse.json({ error: 'Tugas ini sudah ditutup' }, { status: 400 })
  }

  const canContinueExisting =
    existingSubmission &&
    (existingSubmission.status === PortfolioSubmissionStatus.DRAFT ||
      existingSubmission.status === PortfolioSubmissionStatus.RETURNED)

  if (existingSubmission && !canContinueExisting) {
    return NextResponse.json({
      error: 'Pengumpulan sudah terkunci karena telah dikirim atau dinilai'
    }, { status: 409 })
  }

  const artifactType =
    requestedArtifactType === PortfolioArtifactType.UPLOAD &&
    existingSubmission &&
    existingSubmission.draftArchivePath
      ? PortfolioArtifactType.UPLOAD
      : PortfolioArtifactType.EDITOR

  const metadata = {
    updatedAt: new Date().toISOString(),
    source: artifactType === PortfolioArtifactType.UPLOAD ? 'upload' : 'editor',
    tags,
    classLevel
  }

  const record = existingSubmission
    ? await prisma.portfolioSubmission.update({
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
            artifactType === PortfolioArtifactType.UPLOAD
              ? existingSubmission.draftArchivePath
              : null,
          draftArchiveSize:
            artifactType === PortfolioArtifactType.UPLOAD
              ? existingSubmission.draftArchiveSize
              : null,
          draftMetadata: JSON.stringify(metadata)
        }
      })
    : await prisma.portfolioSubmission.create({
        data: {
          taskId,
          studentId: session.user.id,
          title,
          summary,
          classLevel,
          tags: tags.join(','),
          status: PortfolioSubmissionStatus.DRAFT,
          draftHtml: html,
          draftCss: css,
          draftJs: js,
          draftArtifact: PortfolioArtifactType.EDITOR,
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
