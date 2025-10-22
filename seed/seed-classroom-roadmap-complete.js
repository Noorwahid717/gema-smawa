const { PrismaClient } = require('@prisma/client');

async function seedClassroomRoadmap() {
  const prisma = new PrismaClient();

  try {
    console.log('🚀 Seeding Classroom Roadmap: Web Development SMA...\n');

    // Clear existing data first
    await prisma.classroomProjectChecklist.deleteMany({});
    console.log('🧹 Cleared existing classroom project checklists\n');

    // 1. Dasar-dasar Web
    await prisma.classroomProjectChecklist.create({
      data: {
        title: "1. Dasar-dasar Web",
        slug: "dasar-dasar-web",
        goal: "Mengenal bagaimana web bekerja dan membuat halaman web sederhana dengan HTML, CSS, JavaScript",
        skills: [
          "HTML Dasar",
          "CSS Dasar",
          "JavaScript Dasar",
          "Struktur Web",
          "Browser & Server"
        ],
        basicTargets: [
          {
            title: "📚 Pelajari HTML Dasar",
            description: "Memahami elemen dasar HTML: heading, paragraf, link, gambar, list, tabel, form",
            completed: false
          },
          {
            title: "🎨 Pelajari CSS Dasar",
            description: "Memahami selector, warna, font, box model, layout dasar",
            completed: false
          },
          {
            title: "⚡ Pelajari JavaScript Dasar",
            description: "Memahami variabel, tipe data, operator, kondisi, loop, fungsi",
            completed: false
          },
          {
            title: "👤 Latihan: Buat Halaman Biodata",
            description: "Buat halaman biodata sederhana menggunakan HTML + CSS",
            completed: false
          }
        ],
        advancedTargets: [
          {
            title: "🎯 Latihan: Tambah Interaksi JS",
            description: "Tambahkan interaksi sederhana dengan JS (contoh: tombol ubah warna background)",
            completed: false
          },
          {
            title: "🔍 Eksplorasi Developer Tools",
            description: "Belajar menggunakan browser developer tools untuk debugging",
            completed: false
          }
        ],
        reflectionPrompt: "Apa yang sudah kamu pelajari tentang web development? Bagaimana kamu bisa mengaplikasikannya dalam kehidupan sehari-hari?",
        order: 1,
        isActive: true
      }
    });

    // 2. Layout dan Responsivitas
    await prisma.classroomProjectChecklist.create({
      data: {
        title: "2. Layout dan Responsivitas",
        slug: "layout-responsivitas",
        goal: "Membuat layout web yang rapi dan responsive menggunakan CSS Grid, Flexbox, dan Media Queries",
        skills: [
          "CSS Layout",
          "Flexbox",
          "CSS Grid",
          "Media Queries",
          "Responsive Design"
        ],
        basicTargets: [
          {
            title: "📐 Pelajari CSS Flexbox",
            description: "Memahami konsep flexbox untuk layout satu dimensi",
            completed: false
          },
          {
            title: "🔲 Pelajari CSS Grid",
            description: "Memahami konsep grid untuk layout dua dimensi",
            completed: false
          },
          {
            title: "📱 Pelajari Media Queries",
            description: "Memahami cara membuat design responsive",
            completed: false
          },
          {
            title: "🏗️ Latihan: Buat Layout Portfolio",
            description: "Buat layout portfolio responsive dengan grid dan flexbox",
            completed: false
          }
        ],
        advancedTargets: [
          {
            title: "🎨 Latihan: Mobile-First Design",
            description: "Implementasi mobile-first approach dalam design",
            completed: false
          },
          {
            title: "⚡ Optimasi Performance",
            description: "Pelajari teknik optimasi loading dan performance web",
            completed: false
          }
        ],
        reflectionPrompt: "Mengapa responsive design penting dalam era mobile saat ini?",
        order: 2,
        isActive: true
      }
    });

    // 3. JavaScript Interaktif
    await prisma.classroomProjectChecklist.create({
      data: {
        title: "3. JavaScript Interaktif",
        slug: "javascript-interaktif",
        goal: "Membuat aplikasi web interaktif dengan JavaScript modern: DOM manipulation, event handling, dan AJAX",
        skills: [
          "DOM Manipulation",
          "Event Handling",
          "AJAX/Fetch API",
          "ES6+ Features",
          "Asynchronous Programming"
        ],
        basicTargets: [
          {
            title: "🎯 Pelajari DOM Manipulation",
            description: "Memahami cara mengubah elemen HTML dengan JavaScript",
            completed: false
          },
          {
            title: "👆 Pelajari Event Handling",
            description: "Memahami cara menangani event user (click, hover, dll)",
            completed: false
          },
          {
            title: "🌐 Pelajari Fetch API",
            description: "Memahami cara mengambil data dari API menggunakan fetch",
            completed: false
          },
          {
            title: "📝 Latihan: Todo App",
            description: "Buat aplikasi todo list interaktif dengan local storage",
            completed: false
          }
        ],
        advancedTargets: [
          {
            title: "🔄 Latihan: Weather App",
            description: "Buat aplikasi cuaca yang mengambil data dari API eksternal",
            completed: false
          },
          {
            title: "💾 State Management",
            description: "Pelajari cara mengelola state aplikasi yang kompleks",
            completed: false
          }
        ],
        reflectionPrompt: "Bagaimana JavaScript membuat web menjadi lebih interaktif dan dinamis?",
        order: 3,
        isActive: true
      }
    });

    // 4. Framework Modern
    await prisma.classroomProjectChecklist.create({
      data: {
        title: "4. Framework Modern",
        slug: "framework-modern",
        goal: "Belajar menggunakan framework modern seperti React untuk membangun aplikasi web yang kompleks",
        skills: [
          "React Fundamentals",
          "Component Architecture",
          "State Management",
          "Hooks",
          "Modern Development Tools"
        ],
        basicTargets: [
          {
            title: "⚛️ Pelajari React Dasar",
            description: "Memahami konsep component, props, dan state",
            completed: false
          },
          {
            title: "🪝 Pelajari React Hooks",
            description: "Memahami useState, useEffect, dan custom hooks",
            completed: false
          },
          {
            title: "📦 Pelajari NPM & Build Tools",
            description: "Memahami cara menggunakan package manager dan build tools",
            completed: false
          },
          {
            title: "🛠️ Latihan: React Components",
            description: "Buat berbagai komponen React yang reusable",
            completed: false
          }
        ],
        advancedTargets: [
          {
            title: "🎯 Latihan: Full-Stack App",
            description: "Buat aplikasi full-stack dengan React dan backend API",
            completed: false
          },
          {
            title: "🚀 Deployment & Production",
            description: "Pelajari cara deploy aplikasi React ke production",
            completed: false
          }
        ],
        reflectionPrompt: "Apa keuntungan menggunakan framework seperti React dibanding vanilla JavaScript?",
        order: 4,
        isActive: true
      }
    });

    // 5. Database & Backend
    await prisma.classroomProjectChecklist.create({
      data: {
        title: "5. Database & Backend",
        slug: "database-backend",
        goal: "Belajar membuat backend API dan mengelola database untuk aplikasi web yang lengkap",
        skills: [
          "REST API Design",
          "Database Design",
          "Server-Side Programming",
          "Authentication",
          "Data Validation"
        ],
        basicTargets: [
          {
            title: "🗄️ Pelajari Database Design",
            description: "Memahami konsep relational database dan schema design",
            completed: false
          },
          {
            title: "🔧 Pelajari Node.js & Express",
            description: "Memahami cara membuat server dan API dengan Node.js",
            completed: false
          },
          {
            title: "🔐 Pelajari Authentication",
            description: "Memahami cara mengimplementasi login dan authorization",
            completed: false
          },
          {
            title: "📡 Latihan: REST API",
            description: "Buat REST API sederhana untuk CRUD operations",
            completed: false
          }
        ],
        advancedTargets: [
          {
            title: "🔗 Latihan: Full-Stack Integration",
            description: "Integrasikan frontend React dengan backend API",
            completed: false
          },
          {
            title: "☁️ Cloud Deployment",
            description: "Deploy aplikasi full-stack ke cloud platform",
            completed: false
          }
        ],
        reflectionPrompt: "Mengapa backend development penting dalam ekosistem web development?",
        order: 5,
        isActive: true
      }
    });

    // 6. Project Akhir
    await prisma.classroomProjectChecklist.create({
      data: {
        title: "6. Project Akhir",
        slug: "project-akhir",
        goal: "Membuat project akhir yang mengintegrasikan semua pengetahuan web development yang telah dipelajari",
        skills: [
          "Full-Stack Development",
          "Project Management",
          "Code Quality",
          "Testing",
          "Deployment"
        ],
        basicTargets: [
          {
            title: "📋 Planning & Design",
            description: "Rancang project akhir dengan spesifikasi yang jelas",
            completed: false
          },
          {
            title: "⚙️ Development Phase",
            description: "Implementasi fitur-fitur utama project",
            completed: false
          },
          {
            title: "🧪 Testing & Debugging",
            description: "Test aplikasi dan perbaiki bug yang ditemukan",
            completed: false
          },
          {
            title: "📤 Final Deployment",
            description: "Deploy project ke production environment",
            completed: false
          }
        ],
        advancedTargets: [
          {
            title: "🎨 UI/UX Optimization",
            description: "Optimalkan user experience dan interface design",
            completed: false
          },
          {
            title: "📊 Performance Optimization",
            description: "Optimalkan loading speed dan performance aplikasi",
            completed: false
          },
          {
            title: "🔒 Security Implementation",
            description: "Implementasi security best practices",
            completed: false
          }
        ],
        reflectionPrompt: "Apa yang telah kamu pelajari selama perjalanan web development ini? Bagaimana kamu akan terus mengembangkan skill ini?",
        order: 6,
        isActive: true
      }
    });

    console.log('✅ Classroom roadmap seeded successfully!');
    console.log('📚 Created 6 learning stages for SMA Web Development curriculum');

  } catch (error) {
    console.error('❌ Error seeding classroom roadmap:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedClassroomRoadmap();