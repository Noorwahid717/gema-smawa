const { PrismaClient } = require('@prisma/client');

async function checkSeedData() {
  const prisma = new PrismaClient();

  try {
    const classroomCount = await prisma.classroomProjectChecklist.count();
    const assignmentCount = await prisma.assignment.count();
    const submissionCount = await prisma.submission.count();

    console.log('📊 Current Database Status:');
    console.log(`Classroom Project Checklists (Roadmap): ${classroomCount}`);
    console.log(`Assignments: ${assignmentCount}`);
    console.log(`Submissions: ${submissionCount}`);

    if (classroomCount > 0) {
      console.log('\n📚 Sample Classroom Roadmaps:');
      const roadmaps = await prisma.classroomProjectChecklist.findMany({
        take: 3,
        select: {
          title: true,
          slug: true,
          goal: true,
          skills: true,
          order: true
        }
      });
      console.log(JSON.stringify(roadmaps, null, 2));
    }

    if (assignmentCount > 0) {
      console.log('\n📝 Sample Assignments:');
      const assignments = await prisma.assignment.findMany({
        take: 3,
        select: {
          title: true,
          subject: true,
          dueDate: true,
          status: true
        }
      });
      console.log(JSON.stringify(assignments, null, 2));
    }

  } catch (error) {
    console.error('Error checking seed data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSeedData();