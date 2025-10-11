import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTestFeedback() {
  try {
    console.log('🎯 Creating test feedback data...');

    // Get the first published article
    const article = await prisma.article.findFirst({
      where: { status: 'published' }
    });

    if (!article) {
      console.log('❌ No published articles found! Please publish an article first.');
      return;
    }

    console.log(`📰 Using article: "${article.title}"`);

    // Get or create test students
    const testStudents = [
      {
        studentId: 'TEST001',
        email: 'andi.test@gmail.com',
        password: 'password123',
        fullName: 'Andi Pratama',
        class: 'XI RPL 1'
      },
      {
        studentId: 'TEST002', 
        email: 'sari.test@gmail.com',
        password: 'password123',
        fullName: 'Sari Wijaya',
        class: 'XI TKJ 2'
      },
      {
        studentId: 'TEST003',
        email: 'riko.test@gmail.com', 
        password: 'password123',
        fullName: 'Riko Hermawan',
        class: 'XII MM 1'
      }
    ];

    // Create or find students
    const students = [];
    for (const studentData of testStudents) {
      let student = await prisma.student.findUnique({
        where: { email: studentData.email }
      });

      if (!student) {
        student = await prisma.student.create({
          data: studentData
        });
        console.log(`✅ Created student: ${student.fullName}`);
      } else {
        console.log(`⏭️  Student exists: ${student.fullName}`);
      }
      students.push(student);
    }

    // Create test feedback
    const feedbackData = [
      {
        studentId: students[0].id,
        rating: 5,
        comment: 'Tutorial ini sangat membantu! Gallery yang saya buat untuk project ekskul jadi kelihatan profesional banget. Lightbox effect-nya smooth dan responsive di HP.',
        challenge: 'CSS Grid setup'
      },
      {
        studentId: students[1].id,
        rating: 5,
        comment: 'Awalnya bingung dengan CSS Grid, tapi setelah ikuti step by step jadi paham. Sekarang gallery foto event OSIS jadi rapi dan loading-nya cepat!',
        challenge: 'Responsive design'
      },
      {
        studentId: students[2].id,
        rating: 5,
        comment: 'Perfect untuk portfolio! Client saya impressed dengan gallery yang responsive dan modern. Tutorial ini worth banget untuk dipelajari.',
        challenge: 'JavaScript functionality'
      }
    ];

    for (const feedback of feedbackData) {
      // Check if feedback already exists
      const existingFeedback = await prisma.articleFeedback.findFirst({
        where: {
          articleId: article.id,
          studentId: feedback.studentId
        }
      });

      if (!existingFeedback) {
        await prisma.articleFeedback.create({
          data: {
            articleId: article.id,
            ...feedback
          }
        });
        console.log(`✅ Created feedback from: ${students.find(s => s.id === feedback.studentId)?.fullName}`);
      } else {
        console.log(`⏭️  Feedback exists from: ${students.find(s => s.id === feedback.studentId)?.fullName}`);
      }
    }

    // Update article stats
    const allFeedback = await prisma.articleFeedback.findMany({
      where: { articleId: article.id }
    });

    const averageRating = allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length;
    
    await prisma.article.update({
      where: { id: article.id },
      data: { 
        averageRating: Math.round(averageRating * 10) / 10,
        totalFeedback: allFeedback.length
      }
    });

    console.log('🎉 Test feedback data seeded successfully!');
    console.log(`📊 Article "${article.title}" now has ${allFeedback.length} feedback(s) with average rating ${Math.round(averageRating * 10) / 10}`);

  } catch (error) {
    console.error('❌ Error seeding test feedback:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTestFeedback();