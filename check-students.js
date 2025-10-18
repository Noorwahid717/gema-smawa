const { PrismaClient } = require('@prisma/client');

async function checkStudents() {
  const prisma = new PrismaClient();
  
  try {
    const students = await prisma.student.findMany();
    console.log('Students in database:', students.length);
    students.forEach(student => {
      console.log('- ID:', student.studentId, 'Name:', student.name, 'Status:', student.status);
    });
    
    const testStudent = await prisma.student.findUnique({
      where: { studentId: '2024001' }
    });
    console.log('Test student exists:', !!testStudent);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStudents();
