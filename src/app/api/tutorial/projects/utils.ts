import { DEFAULT_PROJECTS } from '@/data/tutorial-roadmap'
import { prisma } from '@/lib/prisma'

export const TABLE_MISSING_ERROR_CODES = new Set(['P2021', 'P2022'])
export const FALLBACK_NOTICE =
  'Checklist default ditampilkan karena tabel checklist proyek belum tersedia.'
export const MIGRATION_INSTRUCTION =
  'Silakan jalankan `prisma migrate deploy` atau `prisma db push` setelah memperbarui schema Prisma.'

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const sanitizeStringArray = (value: unknown) => {
  if (!value) return [] as string[]

  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item : String(item ?? '')))
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }

  if (typeof value === 'string') {
    return value
      .split('\n')
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }

  return [] as string[]
}

export const mapProject = (project: {
  id: string
  title: string
  slug: string
  goal: string
  skills: unknown
  basicTargets: unknown
  advancedTargets: unknown
  reflectionPrompt: string | null
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}) => ({
  id: project.id,
  title: project.title,
  slug: project.slug,
  goal: project.goal,
  skills: Array.isArray(project.skills) ? project.skills.map(String) : [],
  basicTargets: Array.isArray(project.basicTargets) ? project.basicTargets.map(String) : [],
  advancedTargets: Array.isArray(project.advancedTargets) ? project.advancedTargets.map(String) : [],
  reflectionPrompt: project.reflectionPrompt,
  order: project.order,
  isActive: project.isActive,
  createdAt: project.createdAt.toISOString(),
  updatedAt: project.updatedAt.toISOString(),
})

export const buildFallbackProjects = () => {
  const now = new Date()
  return DEFAULT_PROJECTS.map((project, index) =>
    mapProject({
      id: project.id,
      title: project.title,
      slug: project.slug,
      goal: project.goal,
      skills: project.skills,
      basicTargets: project.basicTargets,
      advancedTargets: project.advancedTargets,
      reflectionPrompt: project.reflectionPrompt ?? null,
      order: project.order ?? index + 1,
      isActive: project.isActive,
      createdAt: now,
      updatedAt: now,
    }),
  )
}

export async function generateUniqueSlug(title: string, excludeId?: string) {
  const baseSlug = slugify(title)
  let slug = baseSlug
  let counter = 1

  while (true) {
    const existing = await prisma.classroomProjectChecklist.findFirst({
      where: {
        slug,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    })

    if (!existing) {
      return slug
    }

    slug = `${baseSlug}-${counter}`
    counter += 1
  }
}
