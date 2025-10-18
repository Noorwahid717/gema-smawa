import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session || session.user.userType !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const submission = await prisma.codingLabSubmission.findUnique({
    where: { id },
  })

  if (!submission || submission.studentId !== session.user.id) {
    return NextResponse.json({ error: 'Submission tidak ditemukan' }, { status: 404 })
  }

  const body = await request.json()

  const { html, css, js, lockedAt } = body

  const version = await prisma.codingLabVersion.create({
    data: {
      submissionId: submission.id,
      title: submission.title,
      summary: submission.summary,
      classLevel: submission.classLevel,
      tags: submission.tags,
      html: html,
      css: css,
      js: js,
      artifactType: submission.draftArtifact,
      archivePath: submission.draftArchivePath,
      archiveSize: submission.draftArchiveSize ?? undefined,
      metadata: submission.draftMetadata,
      lockedAt: lockedAt ? new Date(lockedAt) : new Date(),
    }
  })

  return NextResponse.json({ success: true, data: version })
}
