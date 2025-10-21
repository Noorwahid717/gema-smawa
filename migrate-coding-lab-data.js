const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function migrateCodingLabData() {
  console.log('🔄 Starting Coding Lab Data Migration...\n')

  try {
    // Get all existing CodingLabTask data
    const tasks = await prisma.codingLabTask.findMany({
      orderBy: { createdAt: 'asc' }
    })

    console.log(`📋 Found ${tasks.length} CodingLabTask records to migrate\n`)

    for (const task of tasks) {
      console.log(`Migrating: ${task.title}`)

      // Map class level to difficulty
      const difficultyMap = {
        'X': 'BEGINNER',
        'XI': 'INTERMEDIATE', 
        'XII': 'ADVANCED'
      }

      // Create new CodingLab
      const lab = await prisma.codingLab.create({
        data: {
          title: task.title,
          description: task.description,
          difficulty: difficultyMap[task.classLevel] || 'BEGINNER',
          language: getLanguageFromTags(task.tags),
          points: getPointsFromDifficulty(difficultyMap[task.classLevel] || 'BEGINNER'),
          duration: getDurationFromDifficulty(difficultyMap[task.classLevel] || 'BEGINNER'),
          isActive: task.isActive
        }
      })

      console.log(`  ✅ Created CodingLab: ${lab.title} (${lab.id})`)

      // Create corresponding CodingExercise
      const exercise = await prisma.codingExercise.create({
        data: {
          labId: lab.id,
          title: task.title,
          description: task.description,
          difficulty: difficultyMap[task.classLevel] || 'BEGINNER',
          points: getPointsFromDifficulty(difficultyMap[task.classLevel] || 'BEGINNER'),
          timeLimit: getTimeLimitFromDifficulty(difficultyMap[task.classLevel] || 'BEGINNER'),
          memoryLimit: 256, // Default 256MB
          instructions: task.instructions || 'Complete the coding task according to the requirements.',
          starterCode: getStarterCode(task.tags),
          solutionCode: null, // Will be added later
          hints: JSON.stringify(['Think step by step', 'Test your solution with different inputs']),
          tags: task.tags,
          isActive: task.isActive
        }
      })

      console.log(`  ✅ Created CodingExercise: ${exercise.title} (${exercise.id})`)

      // Create sample test cases
      const testCases = generateTestCases(task.tags, task.classLevel)
      for (const testCase of testCases) {
        await prisma.codingTestCase.create({
          data: {
            exerciseId: exercise.id,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            isHidden: testCase.isHidden,
            explanation: testCase.explanation
          }
        })
      }

      console.log(`  ✅ Created ${testCases.length} test cases\n`)
    }

    console.log('🎉 Migration completed successfully!')
    
    // Verify migration
    const newLabs = await prisma.codingLab.findMany({
      include: {
        exercises: {
          include: {
            testCases: true
          }
        }
      }
    })

    console.log(`\n📊 Migration Summary:`)
    console.log(`   CodingLabs: ${newLabs.length}`)
    console.log(`   Total Exercises: ${newLabs.reduce((sum, lab) => sum + lab.exercises.length, 0)}`)
    console.log(`   Total Test Cases: ${newLabs.reduce((sum, lab) => 
      sum + lab.exercises.reduce((exSum, ex) => exSum + ex.testCases.length, 0), 0)}`)

  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

function getLanguageFromTags(tags) {
  const tagString = tags?.toLowerCase() || ''
  if (tagString.includes('python')) return 'Python'
  if (tagString.includes('javascript') || tagString.includes('js')) return 'JavaScript'
  if (tagString.includes('java')) return 'Java'
  return 'Python' // Default
}

function getPointsFromDifficulty(difficulty) {
  switch (difficulty) {
    case 'BEGINNER': return 50
    case 'INTERMEDIATE': return 100
    case 'ADVANCED': return 150
    default: return 50
  }
}

function getDurationFromDifficulty(difficulty) {
  switch (difficulty) {
    case 'BEGINNER': return 30
    case 'INTERMEDIATE': return 60
    case 'ADVANCED': return 90
    default: return 30
  }
}

function getTimeLimitFromDifficulty(difficulty) {
  switch (difficulty) {
    case 'BEGINNER': return 30
    case 'INTERMEDIATE': return 60
    case 'ADVANCED': return 120
    default: return 30
  }
}

function getStarterCode(tags) {
  const tagString = tags?.toLowerCase() || ''
  if (tagString.includes('python')) {
    return '# Write your Python code here\n\ndef solution():\n    # Your code goes here\n    pass\n\nif __name__ == "__main__":\n    solution()'
  }
  if (tagString.includes('javascript') || tagString.includes('js')) {
    return '// Write your JavaScript code here\n\nfunction solution() {\n    // Your code goes here\n}\n\n// Call the function\nsolution();'
  }
  return '// Write your code here\n\nfunction solution() {\n    // Your code goes here\n}\n\nsolution();'
}

function generateTestCases(tags, classLevel) {
  const tagString = tags?.toLowerCase() || ''
  
  if (tagString.includes('algoritma') || tagString.includes('flowchart')) {
    return [
      { input: '5', expectedOutput: '25', isHidden: false, explanation: 'Calculate square of 5' },
      { input: '10', expectedOutput: '100', isHidden: false, explanation: 'Calculate square of 10' },
      { input: '0', expectedOutput: '0', isHidden: true, explanation: 'Edge case: square of 0' }
    ]
  }
  
  if (tagString.includes('python') && tagString.includes('variabel')) {
    return [
      { input: 'Hello World', expectedOutput: 'Hello World', isHidden: false, explanation: 'String output test' },
      { input: '123', expectedOutput: '123', isHidden: false, explanation: 'Number output test' }
    ]
  }
  
  if (tagString.includes('percabangan') || tagString.includes('if-else')) {
    return [
      { input: '85', expectedOutput: 'A', isHidden: false, explanation: 'Grade A for score 85' },
      { input: '75', expectedOutput: 'B', isHidden: false, explanation: 'Grade B for score 75' },
      { input: '65', expectedOutput: 'C', isHidden: true, explanation: 'Grade C for score 65' }
    ]
  }
  
  // Default test cases
  return [
    { input: 'test', expectedOutput: 'success', isHidden: false, explanation: 'Basic functionality test' },
    { input: 'edge', expectedOutput: 'handled', isHidden: true, explanation: 'Edge case test' }
  ]
}

migrateCodingLabData()
