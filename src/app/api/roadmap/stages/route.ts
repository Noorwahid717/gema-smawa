import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch all active roadmap stages from database
    const stages = await prisma.classroomProjectChecklist.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        order: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      stages
    });

    // Mock data kept for reference - can be removed later
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const roadmapStages_OLD = [
      {
        id: "stage-1",
        title: "🔰 Tahap 1: Dasar-dasar Web",
        goal: "Mengenal bagaimana web bekerja.",
        skills: ["HTML dasar", "CSS dasar", "JavaScript dasar"],
        overview: [
          "Apa itu web, browser, dan server",
          "Struktur file dan folder proyek",
          "Pengenalan HTML, CSS, dan JavaScript"
        ],
        materials: [
          {
            id: "stage-1-material-html",
            title: "HTML",
            items: [
              "Elemen dasar (doctype, html, head, body)",
              "Heading, paragraf, dan teks",
              "Link, gambar, dan list",
              "Tabel dan form sederhana"
            ]
          },
          {
            id: "stage-1-material-css",
            title: "CSS",
            items: [
              "Selector dan properti dasar",
              "Warna, font, dan tipografi",
              "Box model dan spacing",
              "Layout menggunakan Flexbox dan Grid dasar"
            ]
          },
          {
            id: "stage-1-material-js",
            title: "JavaScript",
            items: [
              "Variabel dan tipe data",
              "Operator dan kondisi",
              "Loop dan fungsi sederhana"
            ]
          }
        ],
        activityGroups: [
          {
            id: "stage-1-exercises",
            title: "Latihan kecil",
            items: [
              { id: "stage-1-task-1", label: "Buat halaman biodata sederhana menggunakan HTML dan CSS." },
              { id: "stage-1-task-2", label: "Tambahkan tombol yang mengubah warna background dengan JavaScript." }
            ]
          }
        ]
      },
      {
        id: "stage-2",
        title: "📄 Tahap 2: HTML Lanjutan",
        goal: "Membangun struktur halaman yang rapi dan mudah dipahami.",
        skills: ["Semantic HTML", "Form handling", "Aksesibilitas"],
        overview: [
          "Gunakan elemen semantik seperti header, nav, main, article, dan footer",
          "Bangun form dengan berbagai jenis input",
          "Pastikan aksesibilitas dasar seperti alt text dan label form"
        ],
        materials: [
          {
            id: "stage-2-material-semantic",
            title: "Semantic HTML",
            items: [
              "Header, nav, main, aside, section, article",
              "Mengelompokkan konten agar mudah dibaca",
              "Struktur halaman yang konsisten"
            ]
          },
          {
            id: "stage-2-material-form",
            title: "Form",
            items: [
              "Input text, email, number, password",
              "Textarea, radio, checkbox, select",
              "Button dan atribut form"
            ]
          },
          {
            id: "stage-2-material-accessibility",
            title: "Aksesibilitas",
            items: [
              "Penggunaan label untuk setiap input",
              "Alt text pada gambar",
              "Struktur heading yang teratur"
            ]
          }
        ],
        activityGroups: [
          {
            id: "stage-2-exercises",
            title: "Latihan kecil",
            items: [
              { id: "stage-2-task-1", label: "Susun kerangka halaman dengan elemen semantik." },
              { id: "stage-2-task-2", label: "Buat form pendaftaran online sederhana lengkap dengan label." },
              { id: "stage-2-task-3", label: "Tambahkan validasi dasar dan pesan bantuan untuk pengguna." }
            ]
          }
        ]
      },
      {
        id: "stage-3",
        title: "🎨 Tahap 3: CSS Lanjutan",
        goal: "Membuat tampilan web yang menarik dan responsif.",
        skills: ["Flexbox", "Grid", "Responsive design"],
        overview: [
          "Mengatur layout dengan Flexbox dan Grid",
          "Membuat tampilan responsif menggunakan media query",
          "Menambahkan animasi dan transisi untuk interaksi",
          "Menggunakan CSS Variables untuk konsistensi gaya"
        ],
        materials: [
          {
            id: "stage-3-material-layout",
            title: "Layout",
            items: [
              "Flexbox untuk alignment dan distribusi ruang",
              "CSS Grid untuk tata letak kompleks",
              "Menggabungkan Flexbox dan Grid"
            ]
          },
          {
            id: "stage-3-material-responsive",
            title: "Responsive Design",
            items: [
              "Menggunakan media query",
              "Mobile-first vs desktop-first",
              "Pengaturan font dan spacing adaptif"
            ]
          },
          {
            id: "stage-3-material-animation",
            title: "Animasi & Transisi",
            items: [
              "Transition untuk hover dan fokus",
              "Keyframes untuk animasi kustom",
              "Mengatur durasi dan easing"
            ]
          }
        ],
        activityGroups: [
          {
            id: "stage-3-exercises",
            title: "Latihan kecil",
            items: [
              { id: "stage-3-task-1", label: "Buat layout blog dengan header, sidebar, dan konten utama." },
              { id: "stage-3-task-2", label: "Pastikan layout tetap rapi di layar mobile dan desktop." },
              { id: "stage-3-task-3", label: "Tambahkan animasi hover pada tombol dan link penting." }
            ]
          }
        ]
      },
      {
        id: "stage-4",
        title: "⚙️ Tahap 4: JavaScript Lanjutan",
        goal: "Membuat web lebih interaktif dan menyimpan data sederhana.",
        skills: ["DOM manipulation", "Event handling", "LocalStorage"],
        overview: [
          "Mengambil dan memanipulasi elemen dengan querySelector",
          "Menangani event seperti click, input, dan submit",
          "Mengelola array dan object dasar",
          "Menyimpan data di browser menggunakan LocalStorage"
        ],
        materials: [
          {
            id: "stage-4-material-dom",
            title: "DOM & Event",
            items: [
              "Menambahkan dan menghapus class",
              "Mengubah isi elemen (innerHTML/textContent)",
              "Membuat event handler reusable"
            ]
          },
          {
            id: "stage-4-material-data",
            title: "Data",
            items: [
              "Array method dasar (push, map, filter)",
              "Object untuk menyimpan pasangan key-value",
              "Konversi data dengan JSON"
            ]
          }
        ],
        activityGroups: [
          {
            id: "stage-4-exercises",
            title: "Latihan kecil",
            items: [
              { id: "stage-4-task-1", label: "Bangun kalkulator sederhana dengan operasi tambah, kurang, kali, dan bagi." },
              { id: "stage-4-task-2", label: "Simpan nama pengguna di LocalStorage dan tampilkan saat halaman dibuka." }
            ]
          }
        ]
      },
      {
        id: "stage-5",
        title: "🚀 Tahap 5: Mini Proyek",
        goal: "Menguatkan konsep dengan proyek web sederhana namun nyata.",
        skills: ["Perencanaan proyek", "Kolaborasi", "Integrasi HTML/CSS/JS"],
        overview: [
          "Pilih satu atau beberapa proyek mini untuk kelompok",
          "Bagi tugas berdasarkan peran tim",
          "Review hasil setiap sprint kecil dan catat perbaikan"
        ],
        activityGroups: [
          {
            id: "stage-5-game",
            title: "Game Pasangkan Emoji 🎮",
            description: "Latih logika dan manipulasi DOM.",
            items: [
              { id: "stage-5-game-1", label: "Susun grid kartu emoji menggunakan HTML." },
              { id: "stage-5-game-2", label: "Styling kartu dan animasi flip dengan CSS." },
              { id: "stage-5-game-3", label: "Buat logika pencocokan kartu dengan JavaScript." }
            ]
          },
          {
            id: "stage-5-chatbot",
            title: "Chatbot Sederhana 🤖",
            description: "Buat percakapan otomatis dengan aturan sederhana.",
            items: [
              { id: "stage-5-chatbot-1", label: "Desain area percakapan dengan HTML." },
              { id: "stage-5-chatbot-2", label: "Gaya bubble chat agar nyaman dibaca." },
              { id: "stage-5-chatbot-3", label: "Tulis logika if/else untuk membalas pesan pengguna." }
            ]
          },
          {
            id: "stage-5-blog",
            title: "Blog Pribadi & Gallery Foto 📸✍️",
            description: "Gabungkan konten artikel dan visual.",
            items: [
              { id: "stage-5-blog-1", label: "Susun daftar artikel dan halaman detail untuk blog." },
              { id: "stage-5-blog-2", label: "Gunakan layout CSS agar navigasi nyaman." },
              { id: "stage-5-blog-3", label: "Tambahkan navigasi antar halaman dengan JavaScript." },
              { id: "stage-5-blog-4", label: "Buat gallery foto grid dan efek lightbox." }
            ]
          },
          {
            id: "stage-5-coding-lab",
            title: "Coding Lab Profesional 💼",
            description: "Tampilkan profil dan karya terbaik tim.",
            items: [
              { id: "stage-5-coding-lab-1", label: "Buat halaman profil, skill, proyek, dan kontak." },
              { id: "stage-5-coding-lab-2", label: "Pastikan tampilan responsif di HP dan laptop." },
              { id: "stage-5-coding-lab-3", label: "Deploy gratis ke GitHub Pages atau Netlify." }
            ]
          }
        ]
      },
      {
        id: "stage-6",
        title: "🌱 Tahap 6: Skill Tambahan (Opsional)",
        goal: "Mengeksplor teknologi penunjang untuk siswa yang cepat tangkap.",
        skills: ["Version control", "CSS framework", "React dasar"],
        overview: [
          "Kenali manfaat Git & GitHub untuk kolaborasi",
          "Eksperimen dengan framework CSS seperti Tailwind atau Bootstrap",
          "Pelajari konsep dasar React untuk komponen dan state"
        ],
        activityGroups: [
          {
            id: "stage-6-explore",
            title: "Eksplor Skill Tambahan",
            items: [
              { id: "stage-6-task-1", label: "Gunakan Git untuk mencatat perubahan proyek dan unggah ke GitHub." },
              { id: "stage-6-task-2", label: "Coba membangun halaman dengan Tailwind atau Bootstrap." },
              { id: "stage-6-task-3", label: "Pelajari dasar React: komponen, props, dan state sederhana." }
            ]
          }
        ]
      }
    ];

    /* OLD MOCK DATA - keeping for reference only
    return NextResponse.json({
      success: true,
      data: roadmapStages_OLD
    });
    */

  } catch (error) {
    console.error('Get roadmap stages error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get roadmap stages' },
      { status: 500 }
    );
  }
}