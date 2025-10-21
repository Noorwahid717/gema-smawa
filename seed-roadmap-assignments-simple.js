const { PrismaClient } = require('@prisma/client');

async function seedRoadmapAssignments() {
  const prisma = new PrismaClient();

  try {
    console.log('🚀 Seeding assignments sesuai dengan classroom roadmap...\n');

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

    // Assignments berdasarkan classroom roadmap yang benar
    const roadmapAssignments = [
      {
        title: "Assignment 1: Dasar-dasar Web",
        description: "Pelajari HTML, CSS, dan JavaScript dasar. Buat halaman biodata sederhana dan tambahkan interaksi JavaScript untuk memahami bagaimana web bekerja.",
        subject: "Web Development - Dasar-dasar Web",
        dueDate: new Date('2025-01-15T23:59:59Z'),
        maxSubmissions: 30,
        status: 'active',
        instructions: JSON.stringify([
          "✅ BASIC TARGETS:",
          "📚 Pelajari HTML Dasar - Memahami elemen dasar HTML: heading, paragraf, link, gambar, list, tabel, form",
          "🎨 Pelajari CSS Dasar - Memahami selector, warna, font, box model, layout dasar",
          "⚡ Pelajari JavaScript Dasar - Memahami variabel, tipe data, operator, kondisi, loop, fungsi",
          "👤 Latihan: Buat Halaman Biodata - Buat halaman biodata sederhana menggunakan HTML + CSS",
          "",
          "🌟 ADVANCED TARGETS (BONUS):",
          "🎯 Latihan: Tambah Interaksi JS - Tambahkan interaksi sederhana dengan JS (contoh: tombol ubah warna background)",
          "🔍 Eksplorasi Developer Tools - Belajar menggunakan browser developer tools untuk debugging",
          "",
          "📁 STRUKTUR FILE:",
          "- index.html (halaman biodata)",
          "- style.css (styling halaman)",
          "- script.js (JavaScript interaksi)",
          "- README.md (dokumentasi pembelajaran)",
          "",
          "🎯 SKILLS YANG DIPELAJARI:",
          "- HTML Dasar, CSS Dasar, JavaScript Dasar",
          "- Struktur Web, Browser & Server"
        ]),
        allowedFileTypes: "html,css,js,md,png,jpg,jpeg,zip",
        maxFileSize: 5242880, // 5MB
        createdBy: admin.id,
      },
      {
        title: "Assignment 2: Mini Proyek - Aplikasi Interaktif",
        description: "Bangun mini project yang menggabungkan semua skill yang telah dipelajari. Fokus pada fungsionalitas, user experience, dan kualitas code.",
        subject: "Web Development - Mini Proyek",
        dueDate: new Date('2025-01-22T23:59:59Z'),
        maxSubmissions: 30,
        status: 'active',
        instructions: JSON.stringify([
          "✅ BASIC TARGETS:",
          "🎯 Pilih Project Idea - Pilih salah satu: To-Do App, Calculator, Quiz Game, Simple Blog",
          "🏗️ Implementasi Fitur - Minimal 3 fitur utama yang bekerja dengan baik",
          "📱 Responsive Design - Pastikan aplikasi bekerja di mobile dan desktop",
          "💾 Data Persistence - Gunakan LocalStorage untuk menyimpan data user",
          "",
          "🌟 ADVANCED TARGETS (BONUS):",
          "🎨 Custom Animations - Tambahkan animasi CSS/JS untuk better UX",
          "🔍 Search/Filter - Implementasi fitur pencarian atau filter data",
          "📤 Export Data - Fitur export data ke JSON atau CSV",
          "🌙 Dark Mode - Toggle antara light dan dark theme",
          "",
          "📁 STRUKTUR FILE:",
          "- index.html (halaman utama)",
          "- styles.css (custom styling)",
          "- app.js (logic utama aplikasi)",
          "- data.js (data management)",
          "- utils.js (helper functions)",
          "- assets/ (images, icons)",
          "",
          "🎯 SKILLS YANG DIPELAJARI:",
          "- Project Planning, Full-Stack Integration, Problem Solving",
          "- Code Organization, User Experience Design"
        ]),
        allowedFileTypes: "html,css,js,png,jpg,svg,json,zip",
        maxFileSize: 10485760, // 10MB
        createdBy: admin.id,
      },
      {
        title: "Assignment 3: Website Tips Belajar Interaktif",
        description: "Kembangkan website tips belajar dengan accordion, modal, dan toggle dark mode. Proyek ini fokus pada UX interaktif dan konten dinamis.",
        subject: "Web Development - Interactive UX",
        dueDate: new Date('2025-01-29T23:59:59Z'),
        maxSubmissions: 30,
        status: 'active',
        instructions: JSON.stringify([
          "✅ BASIC TARGETS:",
          "- Buat halaman dengan daftar tips berbentuk accordion",
          "- Tambahkan tombol detail yang menampilkan modal",
          "- Optimalkan tampilan untuk desktop dan mobile",
          "",
          "🌟 ADVANCED TARGETS (BONUS):",
          "- Muat data tips dari file JSON menggunakan fetch",
          "- Tambahkan kuis mini pilihan ganda",
          "- Implementasikan toggle dark mode dengan CSS variables",
          "",
          "📁 STRUKTUR FILE:",
          "- index.html",
          "- styles.css",
          "- app.js",
          "- data/tips.json",
          "",
          "🎯 SKILLS YANG DIPELAJARI:",
          "- Accordion UI patterns",
          "- Modal dialogs",
          "- Fetch API basics",
          "- CSS Variables",
          "- Dark mode implementation"
        ]),
        allowedFileTypes: "html,css,js,json,zip",
        maxFileSize: 7340032, // 7MB
        createdBy: admin.id,
      }
    ];

    // Clear existing assignments untuk update bersih
    console.log('🧹 Cleaning existing assignments...');
    await prisma.assignment.deleteMany({});
    console.log('✅ Existing assignments cleared');

    // Create assignments berdasarkan roadmap
    let createdCount = 0;
    for (const assignmentData of roadmapAssignments) {
      await prisma.assignment.create({
        data: assignmentData
      });
      createdCount++;
      console.log(`✅ Created: ${assignmentData.title}`);
    }

    console.log(`\n🎉 Successfully created ${createdCount} roadmap assignments!`);
    console.log('📚 Assignments are now aligned with classroom learning stages');

  } catch (error) {
    console.error('❌ Error seeding roadmap assignments:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedRoadmapAssignments();