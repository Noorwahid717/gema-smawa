// Debug script untuk memeriksa session dan user data
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugUserData() {
  console.log('🔍 Debugging User Data...\n');

  try {
    // 1. Check all students in database
    console.log('1. Checking all students in database:');
    const students = await prisma.student.findMany({
      select: {
        id: true,
        studentId: true,
        email: true,
        fullName: true,
        class: true,
        status: true
      }
    });
    
    console.log('Students found:', students.length);
    students.forEach(student => {
      console.log(`- ID: ${student.id}, NIS: ${student.studentId}, Name: ${student.fullName}, Email: ${student.email}`);
    });

    // 2. Check articles
    console.log('\n2. Checking articles:');
    const articles = await prisma.article.findMany({
      select: {
        id: true,
        slug: true,
        title: true
      }
    });
    
    console.log('Articles found:', articles.length);
    articles.forEach(article => {
      console.log(`- ID: ${article.id}, Slug: ${article.slug}, Title: ${article.title}`);
    });

    // 3. Check existing feedback
    console.log('\n3. Checking existing feedback:');
    const feedback = await prisma.articleFeedback.findMany({
      include: {
        student: {
          select: {
            studentId: true,
            fullName: true
          }
        },
        article: {
          select: {
            title: true,
            slug: true
          }
        }
      }
    });
    
    console.log('Feedback records:', feedback.length);
    feedback.forEach(fb => {
      console.log(`- Student: ${fb.student?.fullName} (${fb.student?.studentId}), Article: ${fb.article?.title}, Rating: ${fb.rating}`);
    });

    console.log('\n✅ Debug completed!');
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run debug
debugUserData();