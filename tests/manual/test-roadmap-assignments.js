// Test script untuk verifikasi roadmap assignments
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testRoadmapAssignments() {
  console.log('🧪 Testing Roadmap Assignments...\n');

  try {
    // 1. Check total assignments
    const totalAssignments = await prisma.assignment.count();
    console.log(`📊 Total assignments in database: ${totalAssignments}`);

    // 2. Check assignments by status
    const activeAssignments = await prisma.assignment.count({
      where: { status: 'active' }
    });
    const upcomingAssignments = await prisma.assignment.count({
      where: { status: 'upcoming' }
    });
    
    console.log(`✅ Active assignments: ${activeAssignments}`);
    console.log(`⏳ Upcoming assignments: ${upcomingAssignments}\n`);

    // 3. List all assignments with key info
    const assignments = await prisma.assignment.findMany({
      select: {
        title: true,
        subject: true,
        dueDate: true,
        status: true,
        maxSubmissions: true
      },
      orderBy: { createdAt: 'asc' }
    });

    console.log('📋 Assignments Overview:');
    assignments.forEach((assignment, index) => {
      const dueDate = new Date(assignment.dueDate).toLocaleDateString('id-ID');
      const status = assignment.status === 'active' ? '🟢' : '🟡';
      
      console.log(`${index + 1}. ${status} ${assignment.title}`);
      console.log(`   Subject: ${assignment.subject}`);
      console.log(`   Due: ${dueDate} | Max: ${assignment.maxSubmissions} submissions`);
      console.log('');
    });

    // 4. Check subjects distribution
    console.log('📚 Subject Distribution:');
    const subjects = assignments.reduce((acc, assignment) => {
      acc[assignment.subject] = (acc[assignment.subject] || 0) + 1;
      return acc;
    }, {});

    Object.entries(subjects).forEach(([subject, count]) => {
      console.log(`   ${subject}: ${count} assignments`);
    });

    // 5. Timeline analysis
    console.log('\n⏰ Timeline Analysis:');
    const now = new Date();
    const dec2024 = assignments.filter(a => 
      new Date(a.dueDate) >= new Date('2024-12-01') && 
      new Date(a.dueDate) < new Date('2025-01-01')
    ).length;
    const jan2025 = assignments.filter(a => 
      new Date(a.dueDate) >= new Date('2025-01-01') && 
      new Date(a.dueDate) < new Date('2025-02-01')
    ).length;
    const feb2025 = assignments.filter(a => 
      new Date(a.dueDate) >= new Date('2025-02-01') && 
      new Date(a.dueDate) < new Date('2025-03-01')
    ).length;

    console.log(`   December 2024: ${dec2024} assignments`);
    console.log(`   January 2025: ${jan2025} assignments`);
    console.log(`   February 2025: ${feb2025} assignments`);

    console.log('\n✅ Roadmap assignments test completed successfully!');
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Check assignments in classroom dashboard');
    console.log('2. Test assignment submission as student');
    console.log('3. Verify instructions dan targets are clear');
    console.log('4. Confirm file type restrictions work');

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run test
testRoadmapAssignments();