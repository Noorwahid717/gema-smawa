const { PrismaClient } = require('@prisma/client');

async function seedAssignments() {
  const prisma = new PrismaClient();

  try {
    console.log('🚀 Seeding Assignments berdasarkan Kurikulum SMA...\n');

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

    // Clear existing assignments
    await prisma.assignment.deleteMany({});
    console.log('🧹 Cleared existing assignments\n');

    // Assignments berdasarkan roadmap stages
    const assignments = [
      // Stage 1: Dasar-dasar Web
      {
        title: "Tugas 1: HTML Dasar - Halaman Biodata",
        description: "Buat halaman biodata pribadi menggunakan HTML dasar. Halaman harus berisi informasi diri, foto, dan struktur yang rapi.",
        subject: "Web Development - HTML Dasar",
        dueDate: new Date('2025-01-15T23:59:59Z'),
        maxSubmissions: 30,
        status: 'active',
        instructions: JSON.stringify([
          "📋 SYARAT WAJIB:",
          "✅ Gunakan minimal 5 elemen HTML dasar (h1-h6, p, img, a, ul/ol)",
          "✅ Include foto profil dan informasi pribadi lengkap",
          "✅ Buat struktur yang logis dan mudah dibaca",
          "✅ Validasi HTML menggunakan validator online",
          "",
          "🎯 KRITERIA PENILAIAN:",
          "• Struktur HTML yang benar (20%)",
          "• Kelengkapan informasi (20%)",
          "• Kerapian dan organisasi (20%)",
          "• Semantic HTML usage (20%)",
          "• Kreativitas (20%)",
          "",
          "📤 FORMAT PENGUMPULAN:",
          "Upload file HTML dalam format .html atau .zip"
        ]),
        allowedFileTypes: ".html,.zip,.rar",
        maxFileSize: 5242880, // 5MB
        createdBy: admin.id,
      },
      {
        title: "Tugas 2: CSS Dasar - Styling Biodata",
        description: "Lengkapi halaman biodata dengan CSS untuk membuat tampilan yang menarik dan profesional.",
        subject: "Web Development - CSS Dasar",
        dueDate: new Date('2025-01-22T23:59:59Z'),
        maxSubmissions: 30,
        status: 'active',
        instructions: JSON.stringify([
          "📋 SYARAT WAJIB:",
          "✅ External CSS file terpisah dari HTML",
          "✅ Minimal 3 warna yang berbeda",
          "✅ Minimal 2 jenis font (heading dan body)",
          "✅ Layout yang responsive minimal untuk desktop",
          "✅ Hover effects pada link dan button",
          "",
          "🎯 KRITERIA PENILAIAN:",
          "• CSS Organization (20%)",
          "• Color scheme & typography (20%)",
          "• Layout & spacing (20%)",
          "• Responsive design (20%)",
          "• CSS best practices (20%)",
          "",
          "📤 FORMAT PENGUMPULAN:",
          "Upload folder berisi index.html + style.css"
        ]),
        allowedFileTypes: ".html,.css,.zip,.rar",
        maxFileSize: 10485760, // 10MB
        createdBy: admin.id,
      },
      {
        title: "Tugas 3: JavaScript Dasar - Interaktif Biodata",
        description: "Tambahkan interaksi JavaScript pada halaman biodata untuk membuatnya lebih dinamis.",
        subject: "Web Development - JavaScript Dasar",
        dueDate: new Date('2025-01-29T23:59:59Z'),
        maxSubmissions: 30,
        status: 'active',
        instructions: JSON.stringify([
          "📋 SYARAT WAJIB:",
          "✅ Minimal 3 interaksi JavaScript",
          "✅ Form validation sederhana",
          "✅ Dynamic content update",
          "✅ Event handling (click, hover, dll)",
          "✅ External JavaScript file",
          "",
          "🎯 CONTOH INTERAKSI:",
          "• Tombol ubah tema (dark/light mode)",
          "• Form kontak dengan validasi",
          "• Toggle show/hide informasi",
          "• Dynamic greeting berdasarkan waktu",
          "",
          "🎯 KRITERIA PENILAIAN:",
          "• JavaScript functionality (30%)",
          "• Code organization (20%)",
          "• Error handling (20%)",
          "• User experience (15%)",
          "• Code comments (15%)"
        ]),
        allowedFileTypes: ".html,.css,.js,.zip,.rar",
        maxFileSize: 10485760, // 10MB
        createdBy: admin.id,
      },

      // Stage 2: Layout dan Responsivitas
      {
        title: "Tugas 4: CSS Layout - Portfolio Responsive",
        description: "Buat halaman portfolio responsive menggunakan CSS Grid dan Flexbox dengan minimal 3 halaman.",
        subject: "Web Development - CSS Layout",
        dueDate: new Date('2025-02-05T23:59:59Z'),
        maxSubmissions: 30,
        status: 'active',
        instructions: JSON.stringify([
          "📋 SYARAT WAJIB:",
          "✅ Minimal 3 halaman (Home, About, Portfolio)",
          "✅ Responsive design (mobile, tablet, desktop)",
          "✅ Penggunaan CSS Grid dan Flexbox",
          "✅ Navigation menu yang functional",
          "✅ Minimal 6 project dalam portfolio",
          "",
          "🎯 RESPONSIVE BREAKPOINTS:",
          "• Mobile: max-width 768px",
          "• Tablet: 768px - 1024px",
          "• Desktop: min-width 1024px",
          "",
          "🎯 KRITERIA PENILAIAN:",
          "• Layout implementation (25%)",
          "• Responsive design (25%)",
          "• Content organization (20%)",
          "• Navigation UX (15%)",
          "• Code quality (15%)"
        ]),
        allowedFileTypes: ".html,.css,.zip,.rar",
        maxFileSize: 15728640, // 15MB
        createdBy: admin.id,
      },

      // Stage 3: JavaScript Interaktif
      {
        title: "Tugas 5: JavaScript App - Todo List Interaktif",
        description: "Buat aplikasi Todo List lengkap dengan fitur tambah, edit, hapus, dan penyimpanan local storage.",
        subject: "Web Development - JavaScript Interaktif",
        dueDate: new Date('2025-02-12T23:59:59Z'),
        maxSubmissions: 30,
        status: 'active',
        instructions: JSON.stringify([
          "📋 SYARAT WAJIB:",
          "✅ CRUD operations (Create, Read, Update, Delete)",
          "✅ Local Storage untuk persistensi data",
          "✅ Form validation",
          "✅ Status filter (All, Active, Completed)",
          "✅ Responsive design",
          "✅ Modern UI/UX",
          "",
          "🎯 FITUR BONUS (+poin tambahan):",
          "• Due date dengan reminder",
          "• Categories/tags untuk todo",
          "• Drag & drop untuk reorder",
          "• Export/import todo list",
          "",
          "🎯 KRITERIA PENILAIAN:",
          "• Functionality (30%)",
          "• UI/UX Design (20%)",
          "• Code quality (20%)",
          "• Data persistence (15%)",
          "• Error handling (15%)"
        ]),
        allowedFileTypes: ".html,.css,.js,.zip,.rar",
        maxFileSize: 10485760, // 10MB
        createdBy: admin.id,
      },
      {
        title: "Tugas 6: JavaScript App - Weather Dashboard",
        description: "Buat dashboard cuaca yang mengambil data dari API eksternal dengan fitur pencarian kota dan forecast.",
        subject: "Web Development - API Integration",
        dueDate: new Date('2025-02-19T23:59:59Z'),
        maxSubmissions: 30,
        status: 'active',
        instructions: JSON.stringify([
          "📋 SYARAT WAJIB:",
          "✅ Integrasi dengan Weather API (OpenWeatherMap atau similar)",
          "✅ Pencarian kota secara real-time",
          "✅ Current weather display",
          "✅ 5-day weather forecast",
          "✅ Loading states dan error handling",
          "✅ Responsive design",
          "",
          "🎯 FITUR TAMBAHAN:",
          "• Geolocation untuk current location",
          "• Favorite cities",
          "• Weather alerts",
          "• Temperature unit conversion (C/F)",
          "",
          "🎯 KRITERIA PENILAIAN:",
          "• API Integration (25%)",
          "• Data handling (20%)",
          "• UI/UX (20%)",
          "• Error handling (15%)",
          "• Code organization (20%)",
          "",
          "⚠️ CATATAN:",
          "Dapatkan API key gratis dari OpenWeatherMap.org"
        ]),
        allowedFileTypes: ".html,.css,.js,.zip,.rar",
        maxFileSize: 10485760, // 10MB
        createdBy: admin.id,
      },

      // Stage 4: Framework Modern (React)
      {
        title: "Tugas 7: React Components - Personal Dashboard",
        description: "Buat dashboard pribadi menggunakan React dengan berbagai komponen interaktif.",
        subject: "Web Development - React Framework",
        dueDate: new Date('2025-02-26T23:59:59Z'),
        maxSubmissions: 30,
        status: 'active',
        instructions: JSON.stringify([
          "📋 SYARAT WAJIB:",
          "✅ Minimal 5 komponen React berbeda",
          "✅ State management dengan useState",
          "✅ Props passing antar komponen",
          "✅ Event handling",
          "✅ Conditional rendering",
          "✅ Modern React patterns (hooks)",
          "",
          "🎯 KOMPONEN YANG HARUS ADA:",
          "• Header dengan navigation",
          "• Profile card",
          "• Stats/metrics display",
          "• Todo list component",
          "• Weather widget",
          "",
          "🎯 KRITERIA PENILAIAN:",
          "• Component architecture (25%)",
          "• State management (20%)",
          "• React best practices (20%)",
          "• UI/UX implementation (20%)",
          "• Code organization (15%)",
          "",
          "📤 FORMAT PENGUMPULAN:",
          "Upload source code lengkap dengan package.json"
        ]),
        allowedFileTypes: ".js,.jsx,.json,.zip,.rar",
        maxFileSize: 20971520, // 20MB
        createdBy: admin.id,
      },

      // Stage 5: Database & Backend
      {
        title: "Tugas 8: Full-Stack App - Blog System",
        description: "Buat sistem blog lengkap dengan frontend React dan backend Node.js + database.",
        subject: "Web Development - Full-Stack",
        dueDate: new Date('2025-03-05T23:59:59Z'),
        maxSubmissions: 30,
        status: 'active',
        instructions: JSON.stringify([
          "📋 SYARAT WAJIB:",
          "✅ Frontend: React dengan routing",
          "✅ Backend: Node.js + Express",
          "✅ Database: MongoDB atau PostgreSQL",
          "✅ REST API untuk CRUD operations",
          "✅ Authentication (register/login)",
          "✅ Responsive design",
          "",
          "🎯 FITUR MINIMAL:",
          "• User registration & login",
          "• Create, read, update, delete posts",
          "• Comment system",
          "• User profiles",
          "• Search functionality",
          "",
          "🎯 KRITERIA PENILAIAN:",
          "• Full-stack integration (25%)",
          "• API design (20%)",
          "• Database design (15%)",
          "• Authentication (15%)",
          "• UI/UX completeness (15%)",
          "• Code quality (10%)",
          "",
          "📤 FORMAT PENGUMPULAN:",
          "Upload full project dengan README dan setup instructions"
        ]),
        allowedFileTypes: ".js,.jsx,.json,.sql,.zip,.rar",
        maxFileSize: 52428800, // 50MB
        createdBy: admin.id,
      },

      // Stage 6: Project Akhir
      {
        title: "PROJECT AKHIR: Aplikasi Web Lengkap",
        description: "Buat project akhir yang mengintegrasikan semua teknologi yang telah dipelajari selama semester.",
        subject: "Web Development - Project Akhir",
        dueDate: new Date('2025-03-15T23:59:59Z'),
        maxSubmissions: 30,
        status: 'active',
        instructions: JSON.stringify([
          "📋 SYARAT MINIMAL PROJECT:",
          "✅ Full-stack application (Frontend + Backend + Database)",
          "✅ User authentication & authorization",
          "✅ Minimal 3 entitas/model dalam database",
          "✅ RESTful API design",
          "✅ Responsive web design",
          "✅ Modern UI/UX dengan framework CSS",
          "✅ Form validation dan error handling",
          "✅ Documentation lengkap (README)",
          "",
          "🎯 CONTOH PROJECT IDEAS:",
          "• E-commerce platform",
          "• Learning management system",
          "• Social media dashboard",
          "• Task management app",
          "• Restaurant ordering system",
          "• Personal finance tracker",
          "",
          "🎯 KRITERIA PENILAIAN AKHIR:",
          "• Project complexity & scope (20%)",
          "• Technical implementation (25%)",
          "• Code quality & organization (15%)",
          "• UI/UX design (15%)",
          "• Documentation (10%)",
          "• Innovation & creativity (10%)",
          "• Presentation & demo (5%)",
          "",
          "📤 FORMAT PENGUMPULAN:",
          "• Source code lengkap dalam repository Git",
          "• Link deployment (production)",
          "• Dokumentasi dan user manual",
          "• Video demo project (3-5 menit)"
        ]),
        allowedFileTypes: ".js,.jsx,.ts,.tsx,.json,.sql,.md,.zip,.rar",
        maxFileSize: 104857600, // 100MB
        createdBy: admin.id,
      }
    ];

    // Insert assignments
    for (const assignment of assignments) {
      await prisma.assignment.create({
        data: assignment
      });
    }

    console.log(`✅ Successfully seeded ${assignments.length} assignments`);
    console.log('📚 Assignments created for SMA Web Development curriculum');

  } catch (error) {
    console.error('❌ Error seeding assignments:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAssignments();