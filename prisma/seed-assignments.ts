import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedAssignments() {
  try {
    // Cari admin user untuk createdBy field
    let admin = await prisma.admin.findFirst({
      where: { email: 'admin@smawahidiyah.edu' }
    });

    // Jika admin belum ada, buat admin default
    if (!admin) {
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      admin = await prisma.admin.create({
        data: {
          email: 'admin@smawahidiyah.edu',
          password: hashedPassword,
          name: 'Admin GEMA',
          role: 'ADMIN'
        }
      });
      
      console.log('✅ Admin user created');
    }

    // Sample assignments data
    const assignments = [
      {
        title: "Project Website Portfolio",
        description: "Buat website portfolio pribadi menggunakan HTML, CSS, dan JavaScript. Upload dalam bentuk zip file dengan struktur folder yang rapi.",
        subject: "Web Development",
        dueDate: new Date('2024-12-30T23:59:59Z'),
        maxSubmissions: 30,
        status: 'active',
        instructions: JSON.stringify([
          "Website harus responsive dan mobile-friendly",
          "Minimal 3 halaman: Home, About, Portfolio",
          "Gunakan semantic HTML dan clean CSS",
          "Include dokumentasi singkat dalam README.md"
        ]),
        createdBy: admin.id,
      },
      {
        title: "Algoritma Sorting Implementation",
        description: "Implementasi algoritma bubble sort dan quick sort dalam bahasa Python dengan dokumentasi dan analisis kompleksitas.",
        subject: "Programming",
        dueDate: new Date('2024-12-25T23:59:59Z'),
        maxSubmissions: 30,
        status: 'active',
        instructions: JSON.stringify([
          "Implementasi kedua algoritma dalam file terpisah",
          "Include test cases dengan berbagai ukuran data",
          "Dokumentasi analisis Big O notation",
          "Comparison chart performa kedua algoritma"
        ]),
        createdBy: admin.id,
      },
      {
        title: "Database ERD Design",
        description: "Rancang Entity Relationship Diagram untuk sistem perpustakaan digital dengan minimal 5 entitas dan relasi yang tepat.",
        subject: "Database",
        dueDate: new Date('2025-01-05T23:59:59Z'),
        maxSubmissions: 30,
        status: 'upcoming',
        instructions: JSON.stringify([
          "Gunakan tools seperti Draw.io atau Lucidchart",
          "Minimal 5 entitas dengan atribut lengkap",
          "Relasi antar entitas harus jelas (1:1, 1:M, M:N)",
          "Export dalam format PDF atau PNG"
        ]),
        createdBy: admin.id,
      },
      {
        title: "Mobile App UI Design",
        description: "Design interface untuk aplikasi mobile e-learning menggunakan Figma dengan prototype interaktif.",
        subject: "UI/UX Design",
        dueDate: new Date('2025-01-10T23:59:59Z'),
        maxSubmissions: 25,
        status: 'upcoming',
        instructions: JSON.stringify([
          "Minimal 5 screen utama dengan navigasi",
          "Consistent design system (colors, typography, spacing)",
          "Interactive prototype dengan transitions",
          "Export artboard dan share Figma link"
        ]),
        createdBy: admin.id,
      }
    ];

    // Create assignments
    for (const assignmentData of assignments) {
      const existingAssignment = await prisma.assignment.findFirst({
        where: { title: assignmentData.title }
      });

      if (!existingAssignment) {
        await prisma.assignment.create({
          data: assignmentData
        });
        console.log(`✅ Created assignment: ${assignmentData.title}`);
      } else {
        console.log(`⏭️  Assignment already exists: ${assignmentData.title}`);
      }
    }

    console.log('🎉 Sample assignments seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding assignments:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
seedAssignments();