import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { normalizeTags } from '@/lib/coding-lab'
import { CodingLabSubmissionStatus } from '@prisma/client'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.userType !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const searchParams = new URL(request.url).searchParams
  const classLevel = searchParams.get('classLevel') ?? undefined
  const status = searchParams.get('status') ?? undefined
  const tag = searchParams.get('tag') ?? undefined

  const submissions = await prisma.codingLabSubmission.findMany({
    where: {
      ...(classLevel ? { classLevel } : {}),
      ...(status ? { status: status as CodingLabSubmissionStatus } : {}),
      ...(tag
        ? {
            OR: [
              { tags: { contains: tag } },
              { task: { tags: { contains: tag } } }
            ]
          }
        : {})
    },
    include: {
      student: true,
      task: true,
      lastVersion: true,
      evaluations: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { rubricScores: true }
      }
    },
    orderBy: { updatedAt: 'desc' }
  })

  const submissionsWithNormalizedTags = submissions.map(submission => ({
    ...submission,
    normalizedTags: normalizeTags(submission.tags || ''),
    taskNormalizedTags: normalizeTags(submission.task?.tags || '')
  }))

  const data = submissionsWithNormalizedTags.map(submission => ({
    id: submission.id,
    status: submission.status,
    title: submission.title,
    summary: submission.summary,
    classLevel: submission.classLevel,
    tags: submission.normalizedTags,
    submittedAt: submission.submittedAt,
    updatedAt: submission.updatedAt,
    grade: submission.grade,
    student: {
      id: submission.student.id,
      name: submission.student.fullName,
      email: submission.student.email,
      classLevel: submission.student.class
    },
    task: {
      id: submission.task.id,
      title: submission.task.title,
      tags: submission.taskNormalizedTags
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
            rubricScores: submission.evaluations[0].rubricScores
          }
        : null
  }))

  return NextResponse.json({ success: true, data })
}
