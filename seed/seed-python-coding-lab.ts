import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Python Coding Lab tasks...');

  // Task 1: Hello World (Easy)
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
  });

  // Test cases for Hello World
  await prisma.pythonTestCase.createMany({
    data: [
      {
        taskId: task1.id,
        name: 'Test Case 1: Basic Output',
        input: '',
        expectedOutput: 'Hello, World!',
        isHidden: false,
        points: 100,
        order: 1,
      },
    ],
    skipDuplicates: true,
  });

  // Task 2: Penjumlahan Dua Bilangan (Easy)
  const task2 = await prisma.pythonCodingTask.upsert({
    where: { slug: 'penjumlahan-dua-bilangan' },
    update: {},
    create: {
      title: 'Penjumlahan Dua Bilangan',
      slug: 'penjumlahan-dua-bilangan',
      description: `Buatlah fungsi yang menerima dua bilangan sebagai parameter dan mengembalikan hasil penjumlahannya.

Contoh:
- Input: 5, 3
- Output: 8

- Input: -2, 7
- Output: 5`,
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
  });

  await prisma.pythonTestCase.createMany({
    data: [
      {
        taskId: task2.id,
        name: 'Test Case 1: Bilangan Positif',
        input: '',
        expectedOutput: '8',
        isHidden: false,
        points: 33,
        order: 1,
      },
      {
        taskId: task2.id,
        name: 'Test Case 2: Bilangan Negatif',
        input: '',
        expectedOutput: '5',
        isHidden: false,
        points: 33,
        order: 2,
      },
      {
        taskId: task2.id,
        name: 'Test Case 3: Nol',
        input: '',
        expectedOutput: '10',
        isHidden: true,
        points: 34,
        order: 3,
      },
    ],
    skipDuplicates: true,
  });

  // Task 3: FizzBuzz (Medium)
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
        return str(n)

if __name__ == "__main__":
    print(fizzbuzz(3))
    print(fizzbuzz(5))
    print(fizzbuzz(15))
    print(fizzbuzz(7))`,
      hints: JSON.parse('["Gunakan operator modulo (%) untuk cek habis dibagi", "Cek kondisi FizzBuzz terlebih dahulu", "Jangan lupa convert angka ke string untuk return"]'),
      timeLimit: 3,
      memoryLimit: 128,
      points: 150,
      order: 3,
      isActive: true,
    },
  });

  await prisma.pythonTestCase.createMany({
    data: [
      {
        taskId: task3.id,
        name: 'Test Case 1: Fizz',
        input: '',
        expectedOutput: 'Fizz',
        isHidden: false,
        points: 25,
        order: 1,
      },
      {
        taskId: task3.id,
        name: 'Test Case 2: Buzz',
        input: '',
        expectedOutput: 'Buzz',
        isHidden: false,
        points: 25,
        order: 2,
      },
      {
        taskId: task3.id,
        name: 'Test Case 3: FizzBuzz',
        input: '',
        expectedOutput: 'FizzBuzz',
        isHidden: false,
        points: 25,
        order: 3,
      },
      {
        taskId: task3.id,
        name: 'Test Case 4: Number',
        input: '',
        expectedOutput: '7',
        isHidden: false,
        points: 25,
        order: 4,
      },
    ],
    skipDuplicates: true,
  });

  // Task 4: Palindrome (Medium)
  const task4 = await prisma.pythonCodingTask.upsert({
    where: { slug: 'palindrome-checker' },
    update: {},
    create: {
      title: 'Palindrome Checker',
      slug: 'palindrome-checker',
      description: `Buatlah fungsi yang mengecek apakah sebuah string adalah palindrome (dibaca sama dari depan dan belakang).

Fungsi harus:
- Return True jika string adalah palindrome
- Return False jika bukan palindrome
- Ignore spasi dan case sensitivity

Contoh:
- "katak" → True
- "Katak" → True
- "python" → False
- "A man a plan a canal Panama" → True (ignore spasi)`,
      difficulty: 'MEDIUM',
      category: 'string',
      tags: '["string", "algorithm", "logic"]',
      starterCode: `def is_palindrome(text):
    # TODO: Check if text is palindrome
    pass

# Test your solution
if __name__ == "__main__":
    print(is_palindrome("katak"))
    print(is_palindrome("python"))`,
      solutionCode: `def is_palindrome(text):
    # Remove spaces and convert to lowercase
    cleaned = text.replace(" ", "").lower()
    # Check if string equals its reverse
    return cleaned == cleaned[::-1]

if __name__ == "__main__":
    print(is_palindrome("katak"))
    print(is_palindrome("python"))`,
      hints: JSON.parse('["Gunakan .lower() untuk convert ke lowercase", "Gunakan .replace() untuk hapus spasi", "String slicing [::-1] bisa reverse string"]'),
      timeLimit: 3,
      memoryLimit: 128,
      points: 150,
      order: 4,
      isActive: true,
    },
  });

  await prisma.pythonTestCase.createMany({
    data: [
      {
        taskId: task4.id,
        name: 'Test Case 1: Simple Palindrome',
        input: '',
        expectedOutput: 'True',
        isHidden: false,
        points: 50,
        order: 1,
      },
      {
        taskId: task4.id,
        name: 'Test Case 2: Not Palindrome',
        input: '',
        expectedOutput: 'False',
        isHidden: false,
        points: 50,
        order: 2,
      },
    ],
    skipDuplicates: true,
  });

  // Task 5: Faktorial (Hard)
  const task5 = await prisma.pythonCodingTask.upsert({
    where: { slug: 'faktorial-rekursif' },
    update: {},
    create: {
      title: 'Faktorial Rekursif',
      slug: 'faktorial-rekursif',
      description: `Buatlah fungsi faktorial menggunakan rekursi.

Faktorial dari n (ditulis n!) adalah hasil perkalian dari semua bilangan positif dari 1 hingga n.

Contoh:
- 5! = 5 × 4 × 3 × 2 × 1 = 120
- 3! = 3 × 2 × 1 = 6
- 0! = 1 (by definition)

Fungsi harus menggunakan rekursi (fungsi memanggil dirinya sendiri).`,
      difficulty: 'HARD',
      category: 'algorithm',
      tags: '["recursion", "math", "algorithm"]',
      starterCode: `def factorial(n):
    # TODO: Implement factorial using recursion
    # Base case: factorial of 0 or 1 is 1
    # Recursive case: n * factorial(n-1)
    pass

# Test your solution
if __name__ == "__main__":
    print(factorial(5))
    print(factorial(3))
    print(factorial(0))`,
      solutionCode: `def factorial(n):
    # Base case
    if n == 0 or n == 1:
        return 1
    # Recursive case
    return n * factorial(n - 1)

if __name__ == "__main__":
    print(factorial(5))
    print(factorial(3))
    print(factorial(0))`,
      hints: JSON.parse('["Base case: faktorial 0 dan 1 adalah 1", "Recursive case: n * factorial(n-1)", "Pastikan ada base case untuk stop rekursi"]'),
      timeLimit: 4,
      memoryLimit: 128,
      points: 200,
      order: 5,
      isActive: true,
    },
  });

  await prisma.pythonTestCase.createMany({
    data: [
      {
        taskId: task5.id,
        name: 'Test Case 1: Faktorial 5',
        input: '',
        expectedOutput: '120',
        isHidden: false,
        points: 33,
        order: 1,
      },
      {
        taskId: task5.id,
        name: 'Test Case 2: Faktorial 3',
        input: '',
        expectedOutput: '6',
        isHidden: false,
        points: 33,
        order: 2,
      },
      {
        taskId: task5.id,
        name: 'Test Case 3: Faktorial 0',
        input: '',
        expectedOutput: '1',
        isHidden: false,
        points: 34,
        order: 3,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Python Coding Lab tasks seeded successfully!');
  console.log(`📝 Created ${5} tasks with test cases`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding Python Coding Lab:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
