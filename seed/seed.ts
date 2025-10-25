import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin users (2 admins)
  console.log('👨‍💼 Creating admin accounts...')
  const hashedPassword = await bcrypt.hash('admin123', 12)

  const admins = [
    {
      email: 'superadmin@smawahidiyah.edu',
      password: hashedPassword,
      name: 'Super Administrator',
      role: 'SUPER_ADMIN'
    },
    {
      email: 'admin.gema@smawahidiyah.edu',
      password: hashedPassword,
      name: 'Admin GEMA',
      role: 'ADMIN'
    }
  ]

  for (const admin of admins) {
    await prisma.admin.upsert({
      where: { email: admin.email },
      update: {},
      create: admin
    })
  }

  console.log('✅ Created 2 admin accounts')

  // Create student accounts (20 students)
  console.log('👨‍🎓 Creating student accounts...')

  const studentNames = [
    'Ahmad Fauzi', 'Budi Santoso', 'Citra Dewi', 'Dedi Rahman', 'Eka Putri',
    'Fajar Nugroho', 'Gita Sari', 'Hadi Wijaya', 'Indah Permata', 'Joko Susilo',
    'Kartika Ayu', 'Lutfi Hakim', 'Maya Sari', 'Nanda Putra', 'Oka Widodo',
    'Putri Lestari', 'Rizki Ramadhan', 'Sari Indah', 'Taufik Hidayat', 'Umi Kalsum'
  ]

  const students = studentNames.map((name, index) => ({
    studentId: `2025${(index + 1).toString().padStart(3, '0')}`, // 2025001, 2025002, etc.
    fullName: name,
    email: `${name.toLowerCase().replace(' ', '.')}@students.smawahidiyah.edu`,
    password: bcrypt.hashSync('student123', 12),
    class: `XII-${String.fromCharCode(65 + (index % 3))}`, // XII-A, XII-B, XII-C
    phone: `0812${Math.floor(Math.random() * 90000000 + 10000000)}`,
    address: `Jl. Sudirman No.${Math.floor(Math.random() * 100) + 1}, Kediri`,
    parentName: `Orang Tua ${name.split(' ')[0]}`,
    parentPhone: `0813${Math.floor(Math.random() * 90000000 + 10000000)}`,
    status: 'ACTIVE' as const
  }))

  for (const student of students) {
    await prisma.student.upsert({
      where: { studentId: student.studentId },
      update: {},
      create: student
    })
  }

  console.log('✅ Created 20 student accounts')

  // Create sample announcements
  console.log('📢 Creating announcements...')
  await prisma.announcement.createMany({
    data: [
      {
        title: 'Selamat Datang di Program GEMA SMA Wahidiyah!',
        content: 'Assalamualaikum warahmatullahi wabarakatuh. Selamat datang para santri teknologi di program Generasi Muda Informatika (GEMA). Mari bersama kita bangun masa depan teknologi yang lebih baik.',
        type: 'info'
      },
      {
        title: 'Jadwal Pengenalan Program GEMA',
        content: 'Pengenalan program GEMA akan dilaksanakan pada tanggal 20 Oktober 2025 di Aula SMA Wahidiyah. Wajib dihadiri oleh semua peserta.',
        type: 'warning'
      },
      {
        title: 'Workshop Coding Dasar - Gratis!',
        content: 'Workshop pengenalan coding untuk pemula akan dilaksanakan setiap Sabtu di Lab Komputer. Materi meliputi HTML, CSS, dan JavaScript.',
        type: 'success'
      }
    ]
  })

  console.log('✅ Created 3 announcements')

  // Create sample activities
  console.log('📅 Creating activities...')
  await prisma.activity.createMany({
    data: [
      {
        title: 'Workshop Web Development',
        description: 'Belajar membuat website modern dengan React dan Next.js. Cocok untuk pemula yang ingin memulai karir di dunia web development.',
        date: new Date('2025-11-15'),
        location: 'Lab Komputer SMA Wahidiyah',
        capacity: 30,
        registered: 28
      },
      {
        title: 'Lomba Karya Tulis Teknologi',
        description: 'Kompetisi menulis artikel tentang perkembangan teknologi terkini. Tema: "AI dan Masa Depan Pendidikan".',
        date: new Date('2025-11-20'),
        location: 'Aula SMA Wahidiyah',
        capacity: 50,
        registered: 35
      },
      {
        title: 'Study Group Python Programming',
        description: 'Belajar Python bersama dengan mentor berpengalaman. Project-based learning dengan fokus pada automation.',
        date: new Date('2025-11-25'),
        location: 'Ruang Kelas XII-A',
        capacity: 25,
        registered: 22
      },
      {
        title: 'Seminar "Teknologi Hijau untuk Lingkungan"',
        description: 'Seminar tentang penerapan teknologi untuk menjaga kelestarian lingkungan. Invited speaker dari ITB.',
        date: new Date('2025-12-01'),
        location: 'Gedung Serbaguna',
        capacity: 100,
        registered: 75
      }
    ]
  })

  console.log('✅ Created 4 activities')

  // Create sample gallery items
  console.log('🖼️ Creating gallery items...')
  await prisma.gallery.createMany({
    data: [
      {
        title: 'Kegiatan Pengenalan GEMA 2025',
        description: 'Moment perkenalan antara mentor dan santri baru program GEMA di Aula SMA Wahidiyah',
        imageUrl: 'https://picsum.photos/800/600?random=1',
        category: 'kegiatan'
      },
      {
        title: 'Workshop Coding Santri',
        description: 'Santri GEMA fokus belajar programming di Lab Komputer',
        imageUrl: 'https://picsum.photos/800/600?random=2',
        category: 'workshop'
      },
      {
        title: 'Tim GEMA Juara Lomba',
        description: 'Tim GEMA berhasil meraih juara dalam lomba teknologi se-Kediri',
        imageUrl: 'https://picsum.photos/800/600?random=3',
        category: 'prestasi'
      },
      {
        title: 'Belajar Bersama di Masjid',
        description: 'Kegiatan tadarus Al-Quran dan diskusi teknologi santri GEMA',
        imageUrl: 'https://picsum.photos/800/600?random=4',
        category: 'kegiatan'
      }
    ]
  })

  console.log('✅ Created 4 gallery items')

  // Create sample settings
  console.log('⚙️ Creating system settings...')
  await prisma.settings.upsert({
    where: { key: 'site_title' },
    update: {},
    create: {
      key: 'site_title',
      value: 'GEMA - Generasi Muda Informatika SMA Wahidiyah'
    }
  })

  await prisma.settings.upsert({
    where: { key: 'site_description' },
    update: {},
    create: {
      key: 'site_description',
      value: 'Program pengembangan bakat teknologi untuk santri SMA Wahidiyah Kediri'
    }
  })

  await prisma.settings.upsert({
    where: { key: 'contact_email' },
    update: {},
    create: {
      key: 'contact_email',
      value: 'gema@smawahidiyah.edu'
    }
  })

  console.log('✅ Created system settings')

  // Create Python Coding Lab tasks
  console.log('🐍 Creating Python Coding Lab tasks...')
  
  // Task 1: Hello World
  const task1 = await prisma.pythonCodingTask.upsert({
    where: { slug: 'hello-world-python' },
    update: {},
    create: {
      title: 'Hello World',
      slug: 'hello-world-python',
      description: `Tugas pertamamu adalah membuat program Python sederhana yang mencetak "Hello, World!" ke layar.

Ini adalah tugas dasar untuk memulai perjalanan programming Python kamu!`,
      difficulty: 'EASY',
      category: 'general',
      tags: '["beginner", "introduction", "basics"]',
      starterCode: `# Write your Python code here
def hello_world():
    # TODO: Return "Hello, World!"
    pass

# Test your solution
if __name__ == "__main__":
    result = hello_world()
    print(result)`,
      solutionCode: `def hello_world():
    return "Hello, World!"

if __name__ == "__main__":
    result = hello_world()
    print(result)`,
      hints: JSON.parse('["Gunakan fungsi return untuk mengembalikan string", "String di Python bisa menggunakan petik satu atau petik dua", "Pastikan ejaan dan kapitalisasi tepat!"]'),
      timeLimit: 2,
      memoryLimit: 128,
      points: 100,
      order: 1,
      isActive: true,
    },
  })

  await prisma.pythonTestCase.create({
    data: {
      taskId: task1.id,
      name: 'Test Case 1: Basic Output',
      input: '',
      expectedOutput: 'Hello, World!',
      isHidden: false,
      points: 100,
      order: 1,
    },
  })

  // Task 2: Penjumlahan Dua Bilangan
  const task2 = await prisma.pythonCodingTask.upsert({
    where: { slug: 'penjumlahan-dua-bilangan' },
    update: {},
    create: {
      title: 'Penjumlahan Dua Bilangan',
      slug: 'penjumlahan-dua-bilangan',
      description: `Buatlah fungsi yang menerima dua bilangan sebagai parameter dan mengembalikan hasil penjumlahannya.

Contoh:
- Input: 5, 3 → Output: 8
- Input: -2, 7 → Output: 5`,
      difficulty: 'EASY',
      category: 'math',
      tags: '["math", "basic", "arithmetic"]',
      starterCode: `def add_numbers(a, b):
    # TODO: Return the sum of a and b
    pass

# Test your solution
if __name__ == "__main__":
    print(add_numbers(5, 3))
    print(add_numbers(-2, 7))`,
      solutionCode: `def add_numbers(a, b):
    return a + b

if __name__ == "__main__":
    print(add_numbers(5, 3))
    print(add_numbers(-2, 7))`,
      hints: JSON.parse('["Gunakan operator + untuk penjumlahan", "Fungsi harus return hasilnya, bukan print", "Python otomatis menangani bilangan negatif"]'),
      timeLimit: 2,
      memoryLimit: 128,
      points: 100,
      order: 2,
      isActive: true,
    },
  })

  await prisma.pythonTestCase.createMany({
    data: [
      {
        taskId: task2.id,
        name: 'Test Case 1: Bilangan Positif',
        input: '',
        expectedOutput: '8',
        isHidden: false,
        points: 50,
        order: 1,
      },
      {
        taskId: task2.id,
        name: 'Test Case 2: Bilangan Negatif',
        input: '',
        expectedOutput: '5',
        isHidden: false,
        points: 50,
        order: 2,
      },
    ],
  })

  // Task 3: FizzBuzz
  const task3 = await prisma.pythonCodingTask.upsert({
    where: { slug: 'fizzbuzz' },
    update: {},
    create: {
      title: 'FizzBuzz',
      slug: 'fizzbuzz',
      description: `Buatlah fungsi FizzBuzz yang menerima sebuah bilangan n dan mengembalikan:
- "Fizz" jika n habis dibagi 3
- "Buzz" jika n habis dibagi 5
- "FizzBuzz" jika n habis dibagi 3 dan 5
- String dari bilangan tersebut jika tidak memenuhi kondisi di atas

Contoh:
- Input: 3 → Output: "Fizz"
- Input: 5 → Output: "Buzz"
- Input: 15 → Output: "FizzBuzz"
- Input: 7 → Output: "7"`,
      difficulty: 'MEDIUM',
      category: 'algorithm',
      tags: '["logic", "conditional", "modulo"]',
      starterCode: `def fizzbuzz(n):
    # TODO: Implement FizzBuzz logic
    pass

# Test your solution
if __name__ == "__main__":
    print(fizzbuzz(3))
    print(fizzbuzz(5))
    print(fizzbuzz(15))
    print(fizzbuzz(7))`,
      solutionCode: `def fizzbuzz(n):
    if n % 3 == 0 and n % 5 == 0:
        return "FizzBuzz"
    elif n % 3 == 0:
        return "Fizz"
    elif n % 5 == 0:
        return "Buzz"
    else:
        return str(n)`,
      hints: JSON.parse('["Gunakan operator modulo (%) untuk cek habis dibagi", "Cek kondisi FizzBuzz terlebih dahulu", "Jangan lupa convert angka ke string untuk return"]'),
      timeLimit: 3,
      memoryLimit: 128,
      points: 150,
      order: 3,
      isActive: true,
    },
  })

  await prisma.pythonTestCase.createMany({
    data: [
      {
        taskId: task3.id,
        name: 'Test Case 1: Fizz',
        input: '',
        expectedOutput: 'Fizz',
        isHidden: false,
        points: 37,
        order: 1,
      },
      {
        taskId: task3.id,
        name: 'Test Case 2: Buzz',
        input: '',
        expectedOutput: 'Buzz',
        isHidden: false,
        points: 37,
        order: 2,
      },
      {
        taskId: task3.id,
        name: 'Test Case 3: FizzBuzz',
        input: '',
        expectedOutput: 'FizzBuzz',
        isHidden: false,
        points: 38,
        order: 3,
      },
      {
        taskId: task3.id,
        name: 'Test Case 4: Number',
        input: '',
        expectedOutput: '7',
        isHidden: false,
        points: 38,
        order: 4,
      },
    ],
  })

  console.log('✅ Created 3 Python Coding Lab tasks with test cases')

  console.log('🎉 Database seed completed successfully!')
  console.log('')
  console.log('📊 Summary:')
  console.log('- 2 Admin accounts created')
  console.log('- 20 Student accounts created')
  console.log('- 3 Announcements created')
  console.log('- 4 Activities created')
  console.log('- 4 Gallery items created')
  console.log('- 3 Python Coding Lab tasks created')
  console.log('- System settings configured')
  console.log('')
  console.log('🔐 Admin Credentials:')
  console.log('Super Admin: superadmin@smawahidiyah.edu / admin123')
  console.log('GEMA Admin: admin.gema@smawahidiyah.edu / admin123')
  console.log('')
  console.log('👨‍🎓 Student Credentials:')
  console.log('All students: [studentId]@students.smawahidiyah.edu / student123')
  console.log('Example: 2025001@students.smawahidiyah.edu / student123')
  console.log('')
  console.log('🐍 Python Coding Lab:')
  console.log('Access at: /student/python-coding-lab')
  console.log('3 sample tasks available (Easy, Medium difficulty)')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })