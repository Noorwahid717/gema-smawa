import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding coding lab data...')

  // Create coding lab tasks based on SMA Informatics curriculum
  const codingLabTasks = [
    // Kelas X - Dasar Pemrograman & Algoritma
    {
      title: 'Algoritma Dasar',
      description: 'Pelajari konsep dasar algoritma dan flowchart dalam pemrograman. Buat algoritma untuk menyelesaikan masalah sehari-hari.',
      classLevel: 'X',
      tags: 'algoritma,flowchart,logika',
      instructions: 'Buat algoritma dan flowchart untuk menghitung nilai rata-rata siswa, mengkonversi suhu, dan menentukan bilangan prima.',
      createdAt: new Date('2024-01-15T00:00:00Z')
    },
    {
      title: 'Pengenalan Python',
      description: 'Belajar dasar-dasar bahasa pemrograman Python untuk siswa SMA kelas X.',
      classLevel: 'X',
      tags: 'python,dasar,variabel',
      instructions: 'Pelajari cara mendeklarasikan variabel, tipe data, input/output, dan operasi matematika dasar dalam Python.',
      createdAt: new Date('2024-01-20T00:00:00Z')
    },
    {
      title: 'Struktur Kontrol - Percabangan',
      description: 'Pelajari konsep percabangan (if-else) dalam pemrograman untuk membuat keputusan.',
      classLevel: 'X',
      tags: 'percabangan,if-else,logika',
      instructions: 'Buat program untuk menentukan grade nilai siswa, menghitung diskon belanja, dan mengecek tahun kabisat.',
      createdAt: new Date('2024-02-01T00:00:00Z')
    },
    {
      title: 'Struktur Kontrol - Perulangan',
      description: 'Pelajari konsep perulangan (loop) untuk mengulang proses dalam pemrograman.',
      classLevel: 'X',
      tags: 'perulangan,loop,for,while',
      instructions: 'Buat program untuk menghitung faktorial, mencetak pola bintang, dan menghitung jumlah deret bilangan.',
      createdAt: new Date('2024-02-15T00:00:00Z')
    },

    // Kelas XI - Struktur Data & Algoritma Lanjutan
    {
      title: 'Array dan List',
      description: 'Pelajari struktur data array untuk menyimpan kumpulan data dalam pemrograman.',
      classLevel: 'XI',
      tags: 'array,list,struktur-data',
      instructions: 'Buat program untuk mengelola data siswa menggunakan array, mencari nilai maksimum/minimum, dan mengurutkan data.',
      createdAt: new Date('2024-03-01T00:00:00Z')
    },
    {
      title: 'Stack dan Queue',
      description: 'Pelajari struktur data Stack dan Queue untuk implementasi LIFO dan FIFO.',
      classLevel: 'XI',
      tags: 'stack,queue,struktur-data',
      instructions: 'Implementasikan Stack untuk undo/redo functionality dan Queue untuk sistem antrian sederhana.',
      createdAt: new Date('2024-03-15T00:00:00Z')
    },
    {
      title: 'Linked List',
      description: 'Pelajari struktur data Linked List untuk penyimpanan data yang dinamis.',
      classLevel: 'XI',
      tags: 'linked-list,struktur-data,dinamis',
      instructions: 'Buat implementasi Linked List untuk mengelola data mahasiswa dengan operasi insert, delete, dan search.',
      createdAt: new Date('2024-04-01T00:00:00Z')
    },
    {
      title: 'Tree dan Binary Tree',
      description: 'Pelajari struktur data hierarkis Tree dan implementasi Binary Tree.',
      classLevel: 'XI',
      tags: 'tree,binary-tree,hierarki',
      instructions: 'Implementasikan Binary Tree untuk struktur organisasi sekolah dan operasi traversal (inorder, preorder, postorder).',
      createdAt: new Date('2024-04-15T00:00:00Z')
    },

    // Kelas XII - Algoritma Lanjutan & Pemrograman Kompleks
    {
      title: 'Algoritma Sorting',
      description: 'Pelajari berbagai algoritma pengurutan dan analisis kompleksitasnya.',
      classLevel: 'XII',
      tags: 'sorting,algoritma,kompleksitas',
      instructions: 'Implementasikan dan bandingkan Bubble Sort, Selection Sort, Insertion Sort, dan Quick Sort dengan analisis waktu eksekusi.',
      createdAt: new Date('2024-05-01T00:00:00Z')
    },
    {
      title: 'Algoritma Searching',
      description: 'Pelajari algoritma pencarian efisien untuk berbagai struktur data.',
      classLevel: 'XII',
      tags: 'searching,algoritma,efisiensi',
      instructions: 'Implementasikan Linear Search, Binary Search, dan algoritma pencarian pada tree dengan analisis kompleksitas.',
      createdAt: new Date('2024-05-15T00:00:00Z')
    },
    {
      title: 'Algoritma Greedy',
      description: 'Pelajari algoritma Greedy untuk pemecahan masalah optimasi.',
      classLevel: 'XII',
      tags: 'greedy,optimasi,algoritma',
      instructions: 'Implementasikan algoritma Greedy untuk masalah knapsack, coin change, dan scheduling problems.',
      createdAt: new Date('2024-06-01T00:00:00Z')
    },
    {
      title: 'Dynamic Programming',
      description: 'Pelajari teknik Dynamic Programming untuk masalah kompleks.',
      classLevel: 'XII',
      tags: 'dynamic-programming,optimasi,memoization',
      instructions: 'Implementasikan Fibonacci dengan memoization, Longest Common Subsequence, dan 0/1 Knapsack problem.',
      createdAt: new Date('2024-06-15T00:00:00Z')
    }
  ]

  console.log('📚 Creating coding lab tasks...')
  for (const task of codingLabTasks) {
    await prisma.codingLabTask.upsert({
      where: {
        title_classLevel: {
          title: task.title,
          classLevel: task.classLevel
        }
      },
      update: task,
      create: task
    })
  }

  // Create sample student submissions for demonstration
  const students = await prisma.student.findMany({ take: 3 })
  const tasks = await prisma.codingLabTask.findMany()

  if (students.length > 0 && tasks.length > 0) {
    console.log('📝 Creating sample student submissions...')

    const sampleSubmissions = [
      {
        taskId: tasks[0].id, // Algoritma Dasar
        studentId: students[0].id,
        title: 'Algoritma Penghitung Rata-rata',
        summary: 'Algoritma untuk menghitung nilai rata-rata siswa dengan flowchart lengkap',
        classLevel: 'X',
        tags: 'algoritma,flowchart,matematika',
        status: 'GRADED' as const,
        submittedAt: new Date('2024-02-10T10:00:00Z')
      },
      {
        taskId: tasks[1].id, // Python Dasar
        studentId: students[1].id,
        title: 'Program Kalkulator Sederhana Python',
        summary: 'Program Python untuk operasi matematika dasar dengan input dari user',
        classLevel: 'X',
        tags: 'python,kalkulator,matematika',
        status: 'SUBMITTED' as const,
        submittedAt: new Date('2024-02-12T14:30:00Z')
      },
      {
        taskId: tasks[4].id, // Stack dan Queue
        studentId: students[2].id,
        title: 'Implementasi Stack untuk Undo/Redo',
        summary: 'Program untuk mengimplementasikan struktur data Stack dalam simulasi text editor dengan fitur undo/redo',
        classLevel: 'XI',
        tags: 'stack,lifo,undo-redo'
      },
      {
        taskId: tasks[8].id, // Algoritma Sorting
        studentId: students[0].id,
        title: 'Perbandingan Algoritma Sorting',
        summary: 'Implementasi dan analisis performa Bubble Sort, Selection Sort, dan Quick Sort',
        classLevel: 'XII',
        tags: 'sorting,algoritma,kompleksitas',
        status: 'SUBMITTED' as const,
        submittedAt: new Date('2024-05-20T09:15:00Z')
      }
    ]

    for (const submission of sampleSubmissions) {
      const existing = await prisma.codingLabSubmission.findFirst({
        where: {
          taskId: submission.taskId,
          studentId: submission.studentId
        }
      })

      if (!existing) {
        await prisma.codingLabSubmission.create({
          data: submission
        })
      }
    }

    // Create sample evaluations for graded submissions
    const gradedSubmission = await prisma.codingLabSubmission.findFirst({
      where: { status: 'GRADED' },
      include: { versions: true }
    })

    if (gradedSubmission && gradedSubmission.versions.length > 0) {
      console.log('📊 Creating sample evaluation...')

      const admin = await prisma.admin.findFirst()
      if (admin) {
        // Create evaluation
        const evaluation = await prisma.codingLabEvaluation.upsert({
          where: {
            id: `${gradedSubmission.id}-${gradedSubmission.versions[0].id}` // Create a composite key
          },
          update: {
            overallScore: 92,
            overallNote: 'Sangat baik! Algoritma sudah benar dan flowchart jelas. Perhatikan dokumentasi yang lebih detail.',
            status: 'GRADED',
            createdAt: new Date('2024-02-15T09:00:00Z')
          },
          create: {
            submissionId: gradedSubmission.id,
            versionId: gradedSubmission.versions[0].id,
            reviewerId: admin.id,
            overallScore: 92,
            overallNote: 'Sangat baik! Algoritma sudah benar dan flowchart jelas. Perhatikan dokumentasi yang lebih detail.',
            status: 'GRADED',
            createdAt: new Date('2024-02-15T09:00:00Z')
          }
        })

        // Create rubric scores
        const rubricScores = [
          {
            evaluationId: evaluation.id,
            criterion: 'HTML_STRUCTURE' as const,
            score: 20,
            maxScore: 25,
            comment: 'Struktur algoritma sudah baik'
          },
          {
            evaluationId: evaluation.id,
            criterion: 'CSS_RESPONSIVE' as const,
            score: 23,
            maxScore: 25,
            comment: 'Flowchart sangat jelas dan mudah dipahami'
          },
          {
            evaluationId: evaluation.id,
            criterion: 'JS_INTERACTIVITY' as const,
            score: 22,
            maxScore: 25,
            comment: 'Logika pemrograman sudah tepat'
          },
          {
            evaluationId: evaluation.id,
            criterion: 'CODE_QUALITY' as const,
            score: 15,
            maxScore: 15,
            comment: 'Kode rapi dan terdokumentasi dengan baik'
          },
          {
            evaluationId: evaluation.id,
            criterion: 'CREATIVITY_BRIEF' as const,
            score: 12,
            maxScore: 10,
            comment: 'Ada inovasi dalam penyelesaian masalah'
          }
        ]

        for (const score of rubricScores) {
          await prisma.codingLabRubricScore.upsert({
            where: {
              evaluationId_criterion: {
                evaluationId: score.evaluationId,
                criterion: score.criterion
              }
            },
            update: score,
            create: score
          })
        }
      }
    }
  }

  console.log('✅ Coding lab seed data completed!')
  console.log(`📚 Created ${codingLabTasks.length} coding lab tasks`)
  console.log('📝 Created sample student submissions with evaluations')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding coding lab data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })