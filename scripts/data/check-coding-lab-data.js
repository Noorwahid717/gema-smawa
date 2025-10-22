const { PrismaClient } = require('@prisma/client')

async function checkCodingLabData() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Checking Coding Lab Data...\n')
    
    // Check coding labs
    const labs = await prisma.codingLab.findMany({
      include: {
        exercises: true
      }
    })
    console.log(`📚 Coding Labs: ${labs.length}`)
    labs.forEach(lab => {
      console.log(`  - ${lab.title} (${lab.language}) - ${lab.exercises.length} exercises`)
    })
    
    // Check coding lab tasks (old model)
    const tasks = await prisma.codingLabTask.findMany()
    console.log(`\n�� Coding Lab Tasks: ${tasks.length}`)
    tasks.forEach(task => {
      console.log(`  - ${task.title} (${task.classLevel})`)
    })
    
    // Check submissions
    const submissions = await prisma.codingLabSubmission.findMany()
    console.log(`\n📤 Submissions: ${submissions.length}`)
    
    // Check exercises
    const exercises = await prisma.codingExercise.findMany()
    console.log(`\n🎯 Exercises: ${exercises.length}`)
    
    console.log('\n✅ Data check completed!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkCodingLabData()
