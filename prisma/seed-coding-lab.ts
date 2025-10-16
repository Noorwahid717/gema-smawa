import { PrismaClient, CodingDifficulty } from '@prisma/client'

export async function seedCodingLab(prisma: PrismaClient) {
  // Ensure there is at least one admin for evaluations
  const admin = await prisma.admin.findFirst({ orderBy: { createdAt: 'asc' } })

  if (!admin) {
    console.warn('⚠️  Skip coding lab seed: admin data is missing')
    return
  }

  console.log('🌱 Seeding coding labs...')

  // Create coding labs
  const basicLab = await prisma.codingLab.upsert({
    where: { id: 'basic-algorithms-lab' },
    update: {},
    create: {
      id: 'basic-algorithms-lab',
      title: 'Basic Algorithms',
      description: 'Pelajari konsep fundamental programming dan algoritma dasar. Cocok untuk pemula yang baru belajar programming.',
      difficulty: CodingDifficulty.BEGINNER,
      language: 'JavaScript',
      points: 100,
      duration: 60,
      isActive: true
    }
  })

  const dataStructuresLab = await prisma.codingLab.upsert({
    where: { id: 'data-structures-lab' },
    update: {},
    create: {
      id: 'data-structures-lab',
      title: 'Data Structures',
      description: 'Kuasai struktur data fundamental seperti array, linked list, stack, dan queue.',
      difficulty: CodingDifficulty.INTERMEDIATE,
      language: 'Python',
      points: 150,
      duration: 90,
      isActive: true
    }
  })

  console.log('📚 Creating coding exercises...')

  // Basic Algorithms Exercises
  const sumArrayExercise = await prisma.codingExercise.upsert({
    where: { id: 'sum-array-exercise' },
    update: {},
    create: {
      id: 'sum-array-exercise',
      labId: basicLab.id,
      title: 'Sum Array Elements',
      description: 'Write a function that returns the sum of all elements in an array.',
      difficulty: CodingDifficulty.BEGINNER,
      points: 10,
      timeLimit: 30,
      memoryLimit: 256,
      instructions: `Buat fungsi yang menerima array angka dan mengembalikan jumlah semua elemen dalam array.

**Contoh:**
- Input: [1, 2, 3, 4, 5]
- Output: 15

**Catatan:**
- Array akan selalu berisi angka positif
- Array tidak akan kosong`,
      starterCode: `function sumArray(arr) {
  // Tulis kode Anda di sini

}`,
      solutionCode: `function sumArray(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}`,
      hints: JSON.stringify([
        'Gunakan loop untuk mengiterasi setiap elemen array',
        'Inisialisasi variabel sum dengan 0',
        'Tambahkan setiap elemen ke variabel sum'
      ]),
      tags: JSON.stringify(['array', 'loop', 'sum', 'beginner']),
      isActive: true
    }
  })

  const findMaxExercise = await prisma.codingExercise.upsert({
    where: { id: 'find-max-exercise' },
    update: {},
    create: {
      id: 'find-max-exercise',
      labId: basicLab.id,
      title: 'Find Maximum Value',
      description: 'Write a function that finds the maximum value in an array.',
      difficulty: CodingDifficulty.BEGINNER,
      points: 15,
      timeLimit: 30,
      memoryLimit: 256,
      instructions: `Buat fungsi yang menerima array angka dan mengembalikan nilai maksimum dalam array.

**Contoh:**
- Input: [3, 7, 2, 9, 5]
- Output: 9

**Catatan:**
- Array akan selalu berisi setidaknya satu angka
- Angka bisa positif atau negatif`,
      starterCode: `function findMax(arr) {
  // Tulis kode Anda di sini

}`,
      solutionCode: `function findMax(arr) {
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }
  return max;
}`,
      hints: JSON.stringify([
        'Inisialisasi max dengan elemen pertama array',
        'Iterasi dari indeks 1 sampai akhir array',
        'Bandingkan setiap elemen dengan nilai max saat ini'
      ]),
      tags: JSON.stringify(['array', 'loop', 'maximum', 'comparison']),
      isActive: true
    }
  })

  // Data Structures Exercises
  const stackExercise = await prisma.codingExercise.upsert({
    where: { id: 'stack-implementation' },
    update: {},
    create: {
      id: 'stack-implementation',
      labId: dataStructuresLab.id,
      title: 'Stack Implementation',
      description: 'Implement a stack data structure with push, pop, and peek operations.',
      difficulty: CodingDifficulty.INTERMEDIATE,
      points: 25,
      timeLimit: 45,
      memoryLimit: 256,
      instructions: `Implementasikan struktur data Stack dengan operasi berikut:
- push(item): menambah item ke stack
- pop(): menghapus dan mengembalikan item teratas
- peek(): melihat item teratas tanpa menghapus
- isEmpty(): cek apakah stack kosong

**Contoh penggunaan:**
\`\`\`python
stack = Stack()
stack.push(1)
stack.push(2)
print(stack.peek())  # Output: 2
print(stack.pop())   # Output: 2
print(stack.pop())   # Output: 1
\`\`\``,
      starterCode: `class Stack:
    def __init__(self):
        # Inisialisasi stack
        pass

    def push(self, item):
        # Tambah item ke stack
        pass

    def pop(self):
        # Hapus dan kembalikan item teratas
        pass

    def peek(self):
        # Lihat item teratas tanpa menghapus
        pass

    def isEmpty(self):
        # Cek apakah stack kosong
        pass`,
      solutionCode: `class Stack:
    def __init__(self):
        self.items = []

    def push(self, item):
        self.items.append(item)

    def pop(self):
        if not self.isEmpty():
            return self.items.pop()
        return None

    def peek(self):
        if not self.isEmpty():
            return self.items[-1]
        return None

    def isEmpty(self):
        return len(self.items) == 0`,
      hints: JSON.stringify([
        'Gunakan list sebagai penyimpanan internal',
        'push: tambah ke akhir list',
        'pop: hapus dari akhir list',
        'peek: lihat elemen terakhir list'
      ]),
      tags: JSON.stringify(['stack', 'data-structure', 'list', 'intermediate']),
      isActive: true
    }
  })

  console.log('🧪 Creating test cases...')

  // Test cases for Sum Array
  await prisma.codingTestCase.createMany({
    data: [
      {
        exerciseId: sumArrayExercise.id,
        input: '[1, 2, 3, 4, 5]',
        expectedOutput: '15',
        isHidden: false,
        explanation: 'Jumlah semua elemen: 1+2+3+4+5 = 15'
      },
      {
        exerciseId: sumArrayExercise.id,
        input: '[10, 20, 30]',
        expectedOutput: '60',
        isHidden: false,
        explanation: 'Jumlah: 10+20+30 = 60'
      },
      {
        exerciseId: sumArrayExercise.id,
        input: '[7]',
        expectedOutput: '7',
        isHidden: true,
        explanation: 'Array dengan satu elemen'
      }
    ],
    skipDuplicates: true
  })

  // Test cases for Find Max
  await prisma.codingTestCase.createMany({
    data: [
      {
        exerciseId: findMaxExercise.id,
        input: '[3, 7, 2, 9, 5]',
        expectedOutput: '9',
        isHidden: false,
        explanation: 'Nilai maksimum adalah 9'
      },
      {
        exerciseId: findMaxExercise.id,
        input: '[-1, -5, -3]',
        expectedOutput: '-1',
        isHidden: false,
        explanation: 'Dalam array negatif, -1 adalah yang terbesar'
      },
      {
        exerciseId: findMaxExercise.id,
        input: '[42]',
        expectedOutput: '42',
        isHidden: true,
        explanation: 'Array dengan satu elemen'
      }
    ],
    skipDuplicates: true
  })

  // Test cases for Stack
  await prisma.codingTestCase.createMany({
    data: [
      {
        exerciseId: stackExercise.id,
        input: 'push(1), push(2), peek()',
        expectedOutput: '2',
        isHidden: false,
        explanation: 'Peek setelah push 1 dan 2 harus mengembalikan 2'
      },
      {
        exerciseId: stackExercise.id,
        input: 'push(5), pop()',
        expectedOutput: '5',
        isHidden: false,
        explanation: 'Pop setelah push 5 harus mengembalikan 5'
      },
      {
        exerciseId: stackExercise.id,
        input: 'isEmpty()',
        expectedOutput: 'True',
        isHidden: true,
        explanation: 'Stack kosong harus mengembalikan True untuk isEmpty'
      }
    ],
    skipDuplicates: true
  })

  console.log('✅ Coding lab seeding completed!')
  console.log(`📊 Created ${await prisma.codingLab.count()} labs`)
  console.log(`📝 Created ${await prisma.codingExercise.count()} exercises`)
  console.log(`🧪 Created ${await prisma.codingTestCase.count()} test cases`)
}