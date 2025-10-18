const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStudent() {
  try {
    const student = await prisma.student.findUnique({
      where: { studentId: '2025001' }
    });

    if (student) {
      console.log('✅ Student found:');
      console.log('- ID:', student.studentId);
      console.log('- Name:', student.fullName);
      console.log('- Email:', student.email);
      console.log('- Password hash exists:', !!student.password);
    } else {
      console.log('❌ Student 2025001 not found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStudent();