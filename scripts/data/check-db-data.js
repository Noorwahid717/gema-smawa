const { PrismaClient } = require('@prisma/client');

async function checkData() {
  const prisma = new PrismaClient();

  try {
    const codingLabsCount = await prisma.codingLab.count();
    const codingExercisesCount = await prisma.codingExercise.count();
    const codingSubmissionsCount = await prisma.codingSubmission.count();

    console.log('Database counts:');
    console.log(`Coding Labs: ${codingLabsCount}`);
    console.log(`Coding Exercises: ${codingExercisesCount}`);
    console.log(`Coding Submissions: ${codingSubmissionsCount}`);

    if (codingSubmissionsCount > 0) {
      const submissions = await prisma.codingSubmission.findMany({
        take: 3,
        include: {
          exercise: {
            include: {
              lab: true
            }
          },
          evaluation: true
        }
      });
      console.log('Sample submissions:', JSON.stringify(submissions, null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();