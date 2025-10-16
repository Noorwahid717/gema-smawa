import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { seedPortfolio } from './seed-portfolio'
import { seedCodingLab } from './seed-coding-lab'

const prisma = new PrismaClient()

async function main() {
  // Create admin users
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  await prisma.admin.upsert({
    where: { email: 'admin@smawahidiyah.edu' },
    update: {},
    create: {
      email: 'admin@smawahidiyah.edu',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'SUPER_ADMIN'
    }
  })

  await prisma.admin.upsert({
    where: { email: 'gema@smawahidiyah.edu' },
    update: {},
    create: {
      email: 'gema@smawahidiyah.edu',
      password: hashedPassword,
      name: 'GEMA Admin',
      role: 'ADMIN'
    }
  })

  // Create sample announcements
  await prisma.announcement.createMany({
    data: [
      {
        title: 'Pendaftaran GEMA Batch 2025 Dibuka!',
        content: 'Hai calon santri teknologi! Pendaftaran untuk program GEMA tahun 2025 sudah dibuka. Buruan daftar sebelum kuota penuh!',
        type: 'info'
      },
      {
        title: 'Workshop Gratis: Introduction to AI',
        content: 'Ikuti workshop gratis tentang pengenalan Artificial Intelligence. Terbuka untuk semua siswa SMA Wahidiyah.',
        type: 'success'
      },
      {
        title: 'Prestasi GEMA di Kompetisi Nasional',
        content: 'Selamat! Tim GEMA berhasil meraih juara 2 dalam kompetisi programming nasional. Bangga dengan pencapaian kalian!',
        type: 'success'
      }
    ]
  })

  // Create sample activities
  await prisma.activity.createMany({
    data: [
      {
        title: 'Workshop Web Development',
        description: 'Belajar membuat website modern dengan React dan Next.js dari dasar hingga deployment.',
        date: new Date('2024-12-15'),
        location: 'Lab Komputer SMA Wahidiyah',
        capacity: 30,
        registered: 25
      },
      {
        title: 'Coding Bootcamp Python',
        description: 'Intensive bootcamp belajar Python untuk pemula dengan project-based learning.',
        date: new Date('2024-12-20'),
        location: 'Aula SMA Wahidiyah',
        capacity: 50,
        registered: 45
      },
      {
        title: 'Kompetisi Mobile App Development',
        description: 'Lomba pengembangan aplikasi mobile untuk tingkat SMA se-Jawa Timur.',
        date: new Date('2024-12-25'),
        location: 'Gedung Serbaguna Kedunglo',
        capacity: 100,
        registered: 80
      }
    ]
  })

  // Create sample gallery items
  await prisma.gallery.createMany({
    data: [
      {
        title: 'Workshop Web Development 2024',
        description: 'Antusiasme peserta dalam workshop web development',
        imageUrl: '/images/gallery/workshop-1.jpg',
        category: 'workshop'
      },
      {
        title: 'Tim GEMA Juara Kompetisi',
        description: 'Moment penyerahan trophy juara kompetisi',
        imageUrl: '/images/gallery/competition-1.jpg',
        category: 'achievement'
      },
      {
        title: 'Kegiatan Coding Bootcamp',
        description: 'Suasana seru coding bootcamp Python',
        imageUrl: '/images/gallery/bootcamp-1.jpg',
        category: 'bootcamp'
      },
      {
        title: 'Presentasi Project Final',
        description: 'Siswa mempresentasikan project akhir',
        imageUrl: '/images/gallery/presentation-1.jpg',
        category: 'project'
      }
    ]
  })

  // Create sample students
  const studentPassword = await bcrypt.hash('student123', 12)
  
  await prisma.student.createMany({
    data: [
      {
        studentId: '2024001',
        fullName: 'Ahmad Fahreza',
        email: 'ahmad.fahreza@student.smawahidiyah.edu',
        password: studentPassword,
        class: 'XI-A',
        phone: '08123456789',
        address: 'Jl. Raya Kediri No. 123',
        parentName: 'Bapak Ahmad Suryadi',
        parentPhone: '08123456790',
        status: 'active',
        isVerified: true
      },
      {
        studentId: '2024002', 
        fullName: 'Siti Nurhaliza',
        email: 'siti.nurhaliza@student.smawahidiyah.edu',
        password: studentPassword,
        class: 'XI-A',
        phone: '08234567890',
        address: 'Jl. Masjid Agung No. 45',
        parentName: 'Ibu Siti Aminah',
        parentPhone: '08234567891',
        status: 'active',
        isVerified: true
      },
      {
        studentId: '2024003',
        fullName: 'Muhammad Rizki',
        email: 'muhammad.rizki@student.smawahidiyah.edu', 
        password: studentPassword,
        class: 'XI-B',
        phone: '08345678901',
        address: 'Jl. Pondok Pesantren No. 67',
        parentName: 'Bapak Muhammad Yusuf',
        parentPhone: '08345678902',
        status: 'active',
        isVerified: true
      }
    ]
  })

  console.log('Database seeded successfully!')
  console.log('Sample Student Accounts:')
  console.log('- NIS: 2024001, Password: student123 (Ahmad Fahreza - XI-A)')
  console.log('- NIS: 2024002, Password: student123 (Siti Nurhaliza - XI-A)')
  console.log('- NIS: 2024003, Password: student123 (Muhammad Rizki - XI-B)')

  // Seed portfolio assignment and sample submission snapshot
  await seedPortfolio(prisma)

  // Seed coding lab with exercises and test cases
  await seedCodingLab(prisma)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
