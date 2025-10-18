import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verifikasi secret key
    if (body.secret !== process.env.SEED_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🌱 Starting assignments seed...');

    // Hapus data assignments yang ada (opsional, untuk clean slate)
    await prisma.assignment.deleteMany();
    console.log('🗑️ Cleaned existing assignments');

    // Data assignments berdasarkan roadmap stages
    const assignmentsData = [
      // Stage 1: Dasar-dasar Web
      {
        title: "🔰 Tugas 1.1: Membuat Halaman Biodata HTML",
        description: "Buat halaman biodata sederhana menggunakan HTML murni dengan struktur yang rapi dan semantic.",
        subject: "HTML Dasar",
        instructions: [
          "Gunakan elemen semantic HTML seperti header, main, section",
          "Tambahkan foto profil dengan tag img dan alt text",
          "Buat daftar hobi menggunakan ul/ol dan li",
          "Sertakan form kontak sederhana dengan input nama dan email",
          "Pastikan semua elemen memiliki struktur yang valid"
        ],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 hari dari sekarang
        status: "active",
        maxSubmissions: 1
      },
      {
        title: "🎨 Tugas 1.2: Styling Biodata dengan CSS",
        description: "Percantik halaman biodata yang sudah dibuat dengan CSS dasar dan layout yang menarik.",
        subject: "CSS Dasar",
        instructions: [
          "Gunakan CSS eksternal (file .css terpisah)",
          "Terapkan box model untuk spacing yang rapi",
          "Atur tipografi dengan font-family dan ukuran yang sesuai",
          "Buat layout menggunakan Flexbox atau CSS Grid",
          "Tambahkan hover effects pada button dan link"
        ],
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 hari
        status: "active",
        maxSubmissions: 1
      },
      {
        title: "⚡ Tugas 1.3: Interaktivitas dengan JavaScript",
        description: "Tambahkan interaktivitas pada halaman biodata menggunakan JavaScript dasar.",
        subject: "JavaScript Dasar",
        instructions: [
          "Buat tombol yang mengubah tema warna halaman (dark/light mode)",
          "Tambahkan validasi form dengan alert atau console.log",
          "Buat fungsi untuk menampilkan jam digital yang update setiap detik",
          "Implementasikan show/hide untuk section tertentu",
          "Gunakan addEventListener untuk semua event handling"
        ],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 hari
        status: "active",
        maxSubmissions: 1
      },

      // Stage 2: HTML Lanjutan
      {
        title: "📄 Tugas 2.1: Website Sekolah dengan Semantic HTML",
        description: "Buat website multi-halaman untuk sekolah menggunakan HTML semantic yang terstruktur.",
        subject: "Semantic HTML",
        instructions: [
          "Buat minimal 3 halaman: Beranda, Tentang, Kontak",
          "Gunakan nav, header, main, aside, footer pada setiap halaman",
          "Implementasikan breadcrumb navigation",
          "Buat artikel berita dengan tag article dan time",
          "Pastikan struktur heading (h1-h6) yang konsisten"
        ],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: "active",
        maxSubmissions: 1
      },
      {
        title: "📝 Tugas 2.2: Form Pendaftaran Siswa Baru",
        description: "Buat form pendaftaran siswa baru yang lengkap dengan berbagai jenis input dan validasi.",
        subject: "Form Handling",
        instructions: [
          "Buat form dengan input: text, email, tel, date, select, radio, checkbox",
          "Tambahkan label yang tepat untuk setiap input",
          "Implementasikan required attributes dan pattern validation",
          "Buat fieldset untuk mengelompokkan input terkait",
          "Tambahkan placeholder dan help text yang informatif"
        ],
        dueDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
        status: "active",
        maxSubmissions: 1
      },

      // Stage 3: CSS Lanjutan
      {
        title: "🎨 Tugas 3.1: Responsive Blog Layout",
        description: "Buat layout blog yang responsive dengan Flexbox dan CSS Grid untuk berbagai ukuran layar.",
        subject: "CSS Layout",
        instructions: [
          "Desain layout dengan header, sidebar, main content, footer",
          "Gunakan CSS Grid untuk layout utama dan Flexbox untuk komponen",
          "Implementasikan mobile-first responsive design",
          "Buat card layout untuk artikel blog",
          "Pastikan layout rapi dari mobile (320px) hingga desktop (1200px+)"
        ],
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        status: "active",
        maxSubmissions: 1
      },
      {
        title: "✨ Tugas 3.2: Animasi dan Transisi CSS",
        description: "Tambahkan animasi yang menarik dan smooth transitions pada website yang sudah dibuat.",
        subject: "CSS Animation",
        instructions: [
          "Buat loading animation dengan keyframes",
          "Tambahkan hover transitions pada button dan card",
          "Implementasikan slide-in animation untuk konten saat scroll",
          "Buat hamburger menu animation untuk mobile",
          "Gunakan CSS custom properties untuk konsistensi animasi"
        ],
        dueDate: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000),
        status: "active",
        maxSubmissions: 1
      },

      // Stage 4: JavaScript Lanjutan
      {
        title: "⚙️ Tugas 4.1: Kalkulator Interaktif",
        description: "Buat aplikasi kalkulator yang berfungsi penuh dengan JavaScript dan DOM manipulation.",
        subject: "JavaScript DOM",
        instructions: [
          "Buat interface kalkulator dengan HTML dan CSS",
          "Implementasikan operasi matematika dasar (+, -, ×, ÷)",
          "Tambahkan fitur clear, backspace, dan desimal",
          "Gunakan addEventListener untuk semua button clicks",
          "Tampilkan hasil perhitungan secara real-time"
        ],
        dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        status: "active",
        maxSubmissions: 1
      },
      {
        title: "💾 Tugas 4.2: Todo App dengan LocalStorage",
        description: "Buat aplikasi Todo List yang dapat menyimpan data di browser menggunakan LocalStorage.",
        subject: "JavaScript Storage",
        instructions: [
          "Buat interface untuk menambah, edit, dan hapus todo",
          "Implementasikan checkbox untuk menandai todo selesai",
          "Simpan semua data todo di LocalStorage",
          "Tambahkan fitur filter (All, Active, Completed)",
          "Buat counter untuk menampilkan jumlah todo yang tersisa"
        ],
        dueDate: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000),
        status: "active",
        maxSubmissions: 1
      },

      // Stage 5: Mini Proyek
      {
        title: "🎮 Proyek 5.1: Game Memory Card",
        description: "Buat game memory card (pasang emoji) yang interaktif dengan scoring system.",
        subject: "Mini Project",
        instructions: [
          "Buat grid 4x4 kartu dengan emoji acak",
          "Implementasikan flip animation untuk kartu",
          "Buat logika pencocokan dan scoring",
          "Tambahkan timer dan counter moves",
          "Buat restart button dan high score system"
        ],
        dueDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        status: "active",
        maxSubmissions: 1
      },
      {
        title: "🤖 Proyek 5.2: Chatbot Sederhana",
        description: "Buat chatbot sederhana yang dapat merespons pertanyaan dasar dengan aturan if-else.",
        subject: "Mini Project",
        instructions: [
          "Desain interface chat dengan bubble messages",
          "Buat database pertanyaan-jawaban sederhana",
          "Implementasikan auto-scroll ke pesan terbaru",
          "Tambahkan typing indicator animation",
          "Buat fallback response untuk pertanyaan tidak dikenali"
        ],
        dueDate: new Date(Date.now() + 38 * 24 * 60 * 60 * 1000),
        status: "active",
        maxSubmissions: 1
      },
      {
        title: "💼 Proyek 5.3: Coding Lab Website",
        description: "Buat website coding lab profesional untuk menampilkan semua project yang telah dikerjakan.",
        subject: "Final Project",
        instructions: [
          "Buat halaman Home, About, Projects, Contact",
          "Tampilkan semua project sebelumnya di gallery",
          "Implementasikan smooth scrolling navigation",
          "Tambahkan contact form yang berfungsi",
          "Deploy website ke GitHub Pages atau Netlify",
          "Pastikan website fully responsive dan accessible"
        ],
        dueDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
        status: "active",
        maxSubmissions: 1
      },

      // Stage 6: Skill Tambahan (Opsional)
      {
        title: "🌱 Bonus 6.1: Eksplorasi Framework CSS",
        description: "Rebuild salah satu project sebelumnya menggunakan Tailwind CSS atau Bootstrap.",
        subject: "CSS Framework",
        instructions: [
          "Pilih project sebelumnya untuk di-rebuild",
          "Setup Tailwind CSS atau Bootstrap di project",
          "Konversi semua custom CSS ke framework classes",
          "Bandingkan kecepatan development dengan vanilla CSS",
          "Dokumentasikan pro-cons menggunakan framework"
        ],
        dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        status: "active",
        maxSubmissions: 1
      },
      {
        title: "⚡ Bonus 6.2: Pengenalan React",
        description: "Buat aplikasi sederhana menggunakan React untuk memahami konsep component dan state.",
        subject: "React Basics",
        instructions: [
          "Setup React project dengan Create React App atau Vite",
          "Buat beberapa functional components",
          "Implementasikan useState untuk state management",
          "Gunakan props untuk komunikasi antar component",
          "Buat mini app seperti counter atau quote generator"
        ],
        dueDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
        status: "upcoming",
        maxSubmissions: 1
      }
    ];

    // Insert assignments ke database
    console.log('📝 Creating assignments...');
    const createdAssignments = [];

    for (const assignmentData of assignmentsData) {
      const assignment = await prisma.assignment.create({
        data: {
          title: assignmentData.title,
          description: assignmentData.description,
          subject: assignmentData.subject,
          instructions: JSON.stringify(assignmentData.instructions), // Store as JSON string
          dueDate: assignmentData.dueDate,
          status: assignmentData.status,
          maxSubmissions: assignmentData.maxSubmissions,
          createdBy: "admin-seed", // Default admin ID for seeded data
          allowedFileTypes: "jpg,jpeg,png,pdf,doc,docx,zip", // Default allowed types
          maxFileSize: 10485760 // 10MB
        }
      });
      createdAssignments.push(assignment);
      console.log(`✅ Created: ${assignment.title}`);
    }

    console.log(`🎉 Successfully created ${createdAssignments.length} assignments!`);

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${createdAssignments.length} assignments`,
      data: {
        total: createdAssignments.length,
        assignments: createdAssignments.map(a => ({
          id: a.id,
          title: a.title,
          subject: a.subject,
          status: a.status,
          dueDate: a.dueDate
        }))
      }
    });

  } catch (error) {
    console.error('Seed assignments error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to seed assignments',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}