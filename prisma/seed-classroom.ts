import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CLASSROOMS = [
  {
    id: 'gema-classroom-1',
    title: 'GEMA - Generasi Muda Informatika',
    slug: 'gema-classroom-1',
    description:
      'Kelas ekstrakulikuler informatika SMA Wahidiyah Kediri. Belajar web development, programming, dan teknologi terkini.',
    teacherId: 'admin-gema-001'
  },
  {
    id: 'gema-advanced-1',
    title: 'GEMA Advanced - Full Stack Development',
    slug: 'gema-advanced-1',
    description:
      'Kelas lanjutan untuk siswa yang ingin mendalami full stack web development dengan React, Node.js, dan database.',
    teacherId: 'admin-gema-001'
  }
]

async function upsertClassroom(classroom: (typeof CLASSROOMS)[number]) {
  return prisma.classroom.upsert({
    where: { id: classroom.id },
    update: {
      title: classroom.title,
      slug: classroom.slug,
      description: classroom.description,
      teacherId: classroom.teacherId
    },
    create: classroom
  })
}

async function main() {
  console.log('🏫 Seeding Classroom data...')

  for (const classroom of CLASSROOMS) {
    const seeded = await upsertClassroom(classroom)
    console.log(`✅ Classroom ready: ${seeded.id} – ${seeded.title}`)
  }

  console.log('🎉 Classroom seeding completed!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error('❌ Error seeding classroom:', error)
    await prisma.$disconnect()
    process.exit(1)
  })
