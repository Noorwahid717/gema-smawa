import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedRoadmapAssignments() {
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
        dueDate: new Date('2024-12-15T23:59:59Z'),
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
        title: "Assignment 2: HTML Lanjutan",
        description: "Pelajari Semantic HTML, form kompleks, dan aksesibilitas. Buat form pendaftaran online dengan struktur HTML yang semantik dan accessible.",
        subject: "Web Development - HTML Lanjutan",
        dueDate: new Date('2024-12-22T23:59:59Z'),
        maxSubmissions: 30,
        status: 'active',
        instructions: JSON.stringify([
          "✅ BASIC TARGETS:",
          "🏗️ Pelajari Semantic HTML - Memahami penggunaan header, nav, main, footer, article, section",
          "📝 Pelajari Form Kompleks - Menguasai berbagai input: textarea, radio, checkbox, select, button",
          "♿ Pelajari Aksesibilitas Dasar - Implementasi alt text, label form, dan prinsip web accessible",
          "",
          "🌟 ADVANCED TARGETS (BONUS):",
          "📋 Latihan: Form Pendaftaran - Buat form pendaftaran online sederhana dengan validasi HTML5",
          "🎯 Implementasi ARIA Labels - Tambahkan ARIA labels untuk aksesibilitas yang lebih baik",
          "",
          "📁 STRUKTUR FILE:",
          "- index.html (halaman dengan semantic structure)",
          "- form.html (form pendaftaran)",
          "- styles.css (styling untuk accessibility)",
          "- README.md (dokumentasi semantic HTML)",
          "",
          "🎯 SKILLS YANG DIPELAJARI:",
          "- Semantic HTML, Form Lanjutan, Aksesibilitas",
          "- HTML5 Elements, Web Standards"
        ]),
        allowedFileTypes: "html,css,js,md,zip",
        maxFileSize: 5242880, // 5MB
        createdBy: admin.id,
      },
      {
        title: "Assignment 3: CSS Lanjutan",
        description: "Kuasai CSS modern dengan Flexbox, Grid, responsive design, dan animasi. Buat layout blog dengan dark/light theme dan animasi yang menarik.",
        subject: "Web Development - CSS Lanjutan",
        dueDate: new Date('2024-12-30T23:59:59Z'),
        maxSubmissions: 30,
        status: 'active',
        instructions: JSON.stringify([
          "✅ BASIC TARGETS:",
          "📐 Kuasai Flexbox & Grid - Memahami dan menggunakan Flexbox dan CSS Grid untuk layout",
          "📱 Pelajari Responsive Design - Implementasi media query dan mobile-first approach",
          "✨ Buat Animasi CSS - Menguasai transitions, animations, dan transform",
          "🔧 Gunakan CSS Variables - Implementasi CSS custom properties untuk maintainability",
          "",
          "🌟 ADVANCED TARGETS (BONUS):",
          "📰 Latihan: Layout Blog - Buat layout blog dengan header, sidebar, dan konten utama",
          "🎭 Latihan: Animasi Hover - Tambahkan animasi hover yang menarik pada tombol dan elemen",
          "🎨 Buat Dark/Light Theme - Implementasi theme switcher menggunakan CSS variables",
          "",
          "📁 STRUKTUR FILE:",
          "- index.html (layout blog)",
          "- styles.css (CSS dengan Grid/Flexbox)",
          "- theme.css (dark/light theme)",
          "- script.js (theme switcher)",
          "- README.md (dokumentasi CSS techniques)",
          "",
          "🎯 SKILLS YANG DIPELAJARI:",
          "- Flexbox, CSS Grid, Responsive Design",
          "- CSS Animations, CSS Variables"
        ]),
        allowedFileTypes: "html,css,js,md,png,jpg,zip",
        maxFileSize: 7340032, // 7MB
        createdBy: admin.id,
      },
      {
        title: "Assignment 4: JavaScript Lanjutan",
        description: "Kuasai DOM manipulation, event handling, dan LocalStorage. Buat kalkulator, mini game, dan aplikasi yang menyimpan data user.",
        subject: "Web Development - JavaScript Lanjutan",
        dueDate: new Date('2025-01-05T23:59:59Z'),
        maxSubmissions: 30,
        status: 'upcoming',
        instructions: JSON.stringify([
          "✅ BASIC TARGETS:",
          "🎯 Kuasai DOM Manipulation - Menguasai querySelector, innerHTML, dan createElement",
          "⚡ Pelajari Event Handling - Implementasi event listener untuk click, input, submit, mouseover",
          "📊 Pahami Array & Object - Menguasai manipulasi array dan object dalam JavaScript",
          "💾 Gunakan LocalStorage - Implementasi penyimpanan data di browser dengan localStorage",
          "",
          "🌟 ADVANCED TARGETS (BONUS):",
          "🧮 Latihan: Kalkulator Sederhana - Buat kalkulator dengan operasi dasar menggunakan JavaScript",
          "👋 Latihan: Simpan Nama User - Simpan nama pengguna di LocalStorage dan tampilkan saat buka halaman",
          "🎮 Buat Mini Game - Implementasi logika sederhana seperti tebak angka atau rock-paper-scissors",
          "",
          "📁 STRUKTUR FILE:",
          "- index.html (halaman utama)",
          "- calculator.html (kalkulator)",
          "- game.html (mini game)",
          "- script.js (DOM manipulation)",
          "- storage.js (LocalStorage functions)",
          "- styles.css (styling)",
          "",
          "🎯 SKILLS YANG DIPELAJARI:",
          "- DOM Manipulation, Event Handling, Array & Object",
          "- LocalStorage, Async Programming"
        ]),
        allowedFileTypes: "html,css,js,json,zip",
        maxFileSize: 5242880, // 5MB
        createdBy: admin.id,
      },
      {
        title: "Assignment 5: Mini Proyek - Aplikasi Interaktif",
        description: "Bangun mini project yang menggabungkan semua skill yang telah dipelajari. Fokus pada fungsionalitas, user experience, dan kualitas code.",
        subject: "Web Development - Mini Proyek",
        dueDate: new Date('2025-01-10T23:59:59Z'),
        maxSubmissions: 30,
        status: 'upcoming',
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
        title: "Assignment 6: Skill Tambahan (Advanced)",
        description: "Eksplorasi teknologi web modern: Git, CSS preprocessor, atau JavaScript framework. Pilih salah satu skill lanjutan dan buat project showcase.",
        subject: "Web Development - Skill Tambahan",
        dueDate: new Date('2025-01-15T23:59:59Z'),
        maxSubmissions: 30,
        status: 'upcoming',
        instructions: JSON.stringify([
          "✅ BASIC TARGETS:",
          "🔧 Pilih Advanced Skill - Git & GitHub, Sass/SCSS, atau Vue.js/React basics",
          "📚 Setup Environment - Install tools dan setup development environment",
          "🎯 Implementasi Mini Project - Buat project kecil menggunakan skill yang dipilih",
          "📖 Dokumentasi - Tulis dokumentasi pembelajaran dan refleksi",
          "",
          "🌟 ADVANCED TARGETS (BONUS):",
          "🚀 Deploy Project - Deploy ke GitHub Pages, Netlify, atau Vercel",
          "🎨 Advanced Styling - Gunakan Sass mixins, variables, atau CSS-in-JS",
          "📱 Component-Based - Buat reusable components (jika pilih framework)",
          "🔄 Version Control - Gunakan Git workflow dengan branches dan commits yang baik",
          "",
          "📁 STRUKTUR FILE:",
          "- README.md (dokumentasi pembelajaran)",
          "- project/ (folder project utama)",
          "- setup-guide.md (panduan setup environment)",
          "- reflection.md (refleksi pembelajaran)",
          "- resources.md (link dan referensi)",
          "",
          "🎯 SKILLS YANG DIPELAJARI:",
          "- Advanced Web Technologies, Development Workflow",
          "- Documentation Skills, Self-Directed Learning"
        ]),
        allowedFileTypes: "html,css,js,scss,vue,jsx,md,json,zip",
        maxFileSize: 15728640, // 15MB
        createdBy: admin.id,
      },
      {
        title: "Assignment 7: Website Tips Belajar Interaktif",
        description: "Kembangkan website tips belajar dengan accordion, modal, dan toggle dark mode. Proyek ini fokus pada UX interaktif dan konten dinamis.",
        subject: "Web Development - Interactive UX",
        dueDate: new Date('2025-01-20T23:59:59Z'),
        maxSubmissions: 30,
        status: 'upcoming',
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
      },
      {
        title: "Assignment 8: Aplikasi Resep Masak",
        description: "Bangun aplikasi resep masak dengan pencarian, filter, dan integrasi API. Proyek ini mengajarkan fetch API dan pengelolaan data kompleks.",
        subject: "Web Development - API Integration",
        dueDate: new Date('2025-01-25T23:59:59Z'),
        maxSubmissions: 25,
        status: 'upcoming',
        instructions: JSON.stringify([
          "✅ BASIC TARGETS:",
          "- Buat layout daftar resep dan detail",
          "- Implementasikan pencarian berdasarkan nama resep",
          "- Tampilkan detail resep saat dipilih",
          "",
          "🌟 ADVANCED TARGETS (BONUS):",
          "- Gunakan API publik untuk data asli (TheMealDB atau Spoonacular)",
          "- Tambahkan filter diet (vegetarian, halal, dll)",
          "- Simpan resep favorit di LocalStorage",
          "",
          "📁 STRUKTUR FILE:",
          "- index.html",
          "- recipe.css",
          "- api.js",
          "- favorites.js",
          "",
          "🎯 SKILLS YANG DIPELAJARI:",
          "- Fetch API advanced",
          "- DOM manipulation lanjutan",
          "- API error handling",
          "- Pagination concepts",
          "- Data persistence"
        ]),
        allowedFileTypes: "html,css,js,json,zip",
        maxFileSize: 7340032, // 7MB
        createdBy: admin.id,
      },
      {
        title: "Assignment 9: Dashboard Statistik Sekolah",
        description: "Rancang dashboard statistik dengan chart library dan layout profesional. Proyek ini mengajarkan data visualization dan dashboard design.",
        subject: "Web Development - Data Visualization",
        dueDate: new Date('2025-01-30T23:59:59Z'),
        maxSubmissions: 25,
        status: 'upcoming',
        instructions: JSON.stringify([
          "✅ BASIC TARGETS:",
          "- Rancang layout dashboard dengan card statistik dan grafik",
          "- Tampilkan grafik sederhana dari data statis",
          "- Buat tabel data dengan sorting atau pagination dasar",
          "",
          "🌟 ADVANCED TARGETS (BONUS):",
          "- Ambil data dari API menggunakan fetch",
          "- Tambahkan filter waktu (mingguan/bulanan)",
          "- Implementasikan mode fullscreen untuk grafik",
          "",
          "📁 STRUKTUR FILE:",
          "- index.html",
          "- dashboard.css",
          "- charts.js",
          "- data.js",
          "",
          "🎯 SKILLS YANG DIPELAJARI:",
          "- Chart.js atau library serupa",
          "- Layout dashboard",
          "- Fetch data external",
          "- Table sorting dan pagination",
          "- Responsive grid systems"
        ]),
        allowedFileTypes: "html,css,js,json,zip",
        maxFileSize: 10485760, // 10MB
        createdBy: admin.id,
      },
      {
        title: "Assignment 10: Platform Microvolunteering Sekolah (Final Project)",
        description: "Bangun aplikasi web kompleks untuk platform volunteer sekolah dengan autentikasi, manajemen state, dan integrasi map. Ini adalah proyek final yang menggabungkan semua skills.",
        subject: "Full-Stack Web Development",
        dueDate: new Date('2025-02-10T23:59:59Z'),
        maxSubmissions: 20,
        status: 'upcoming',
        instructions: JSON.stringify([
          "✅ BASIC TARGETS:",
          "- Buat halaman daftar kegiatan dengan informasi tugas",
          "- Implementasikan form pendaftaran volunteer dengan validasi",
          "- Tambahkan status tugas dan filter kategori",
          "",
          "🌟 ADVANCED TARGETS (BONUS):",
          "- Simulasikan login anggota menggunakan penyimpanan lokal",
          "- Tambahkan fitur chat singkat atau komentar",
          "- Integrasikan peta untuk lokasi kegiatan (Leaflet.js)",
          "",
          "📁 STRUKTUR PROJECT:",
          "- index.html (landing page)",
          "- dashboard.html (volunteer dashboard)",
          "- css/ (folder styles)",
          "- js/ (folder scripts)",
          "- data/ (folder JSON data)",
          "- assets/ (images, icons)",
          "",
          "🎯 SKILLS YANG DIGUNAKAN:",
          "- Manajemen state kompleks",
          "- Autentikasi sederhana",
          "- Multiple pages navigation",
          "- Map integration",
          "- Form validation advanced",
          "- LocalStorage management",
          "",
          "📊 KRITERIA PENILAIAN:",
          "- Functionality (40%)",
          "- Code Quality (25%)",
          "- UI/UX Design (20%)",
          "- Documentation (15%)"
        ]),
        allowedFileTypes: "html,css,js,json,png,jpg,jpeg,zip",
        maxFileSize: 20971520, // 20MB
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

    console.log(`\n🎉 Successfully created ${createdCount} assignments sesuai roadmap!`);
    console.log('\n📚 Assignment Structure:');
    console.log('├── Proyek 1-3: Basic Web Development (HTML, CSS, JS)');
    console.log('├── Proyek 4-6: Data Management & CRUD Operations');
    console.log('├── Proyek 7-9: Advanced Features & API Integration');
    console.log('└── Proyek 10: Full-Stack Final Project');
    
    console.log('\n⏰ Timeline:');
    console.log('- Active assignments: 1-3 (Due Dec 2024)');
    console.log('- Upcoming assignments: 4-10 (Due Jan-Feb 2025)');
    console.log('- Progressive difficulty: Beginner → Intermediate → Advanced');

  } catch (error) {
    console.error('❌ Error seeding roadmap assignments:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
if (require.main === module) {
  seedRoadmapAssignments()
    .then(() => {
      console.log('\n✅ Roadmap assignments seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export default seedRoadmapAssignments;