import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const roadmapData = [
  {
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
    reflectionPrompt: "Bagaimana perasaan Anda setelah membuat halaman web pertama? Apa tantangan terbesar yang dihadapi?",
    order: 1,
    isActive: true
  },
  {
    title: "2. HTML Lanjutan",
    slug: "html-lanjutan",
    goal: "Membuat struktur halaman web yang rapi dengan Semantic HTML dan form kompleks",
    skills: [
      "Semantic HTML",
      "Form Lanjutan",
      "Aksesibilitas",
      "HTML5 Elements",
      "Web Standards"
    ],
    basicTargets: [
      {
        title: "🏗️ Pelajari Semantic HTML",
        description: "Memahami penggunaan header, nav, main, footer, article, section",
        completed: false
      },
      {
        title: "📝 Pelajari Form Kompleks",
        description: "Menguasai berbagai input: textarea, radio, checkbox, select, button",
        completed: false
      },
      {
        title: "♿ Pelajari Aksesibilitas Dasar",
        description: "Implementasi alt text, label form, dan prinsip web accessible",
        completed: false
      }
    ],
    advancedTargets: [
      {
        title: "📋 Latihan: Form Pendaftaran",
        description: "Buat form pendaftaran online sederhana dengan validasi HTML5",
        completed: false
      },
      {
        title: "🎯 Implementasi ARIA Labels",
        description: "Tambahkan ARIA labels untuk aksesibilitas yang lebih baik",
        completed: false
      }
    ],
    reflectionPrompt: "Mengapa struktur HTML yang semantik penting untuk web development?",
    order: 2,
    isActive: true
  },
  {
    title: "3. CSS Lanjutan",
    slug: "css-lanjutan",
    goal: "Membuat tampilan web yang menarik dan responsif dengan CSS modern",
    skills: [
      "Flexbox",
      "CSS Grid",
      "Responsive Design",
      "CSS Animations",
      "CSS Variables"
    ],
    basicTargets: [
      {
        title: "📐 Kuasai Flexbox & Grid",
        description: "Memahami dan menggunakan Flexbox dan CSS Grid untuk layout",
        completed: false
      },
      {
        title: "📱 Pelajari Responsive Design",
        description: "Implementasi media query dan mobile-first approach",
        completed: false
      },
      {
        title: "✨ Buat Animasi CSS",
        description: "Menguasai transitions, animations, dan transform",
        completed: false
      },
      {
        title: "🔧 Gunakan CSS Variables",
        description: "Implementasi CSS custom properties untuk maintainability",
        completed: false
      }
    ],
    advancedTargets: [
      {
        title: "📰 Latihan: Layout Blog",
        description: "Buat layout blog dengan header, sidebar, dan konten utama",
        completed: false
      },
      {
        title: "🎭 Latihan: Animasi Hover",
        description: "Tambahkan animasi hover yang menarik pada tombol dan elemen",
        completed: false
      },
      {
        title: "🎨 Buat Dark/Light Theme",
        description: "Implementasi theme switcher menggunakan CSS variables",
        completed: false
      }
    ],
    reflectionPrompt: "Bagaimana CSS Grid dan Flexbox mengubah cara Anda membuat layout? Mana yang lebih mudah digunakan?",
    order: 3,
    isActive: true
  },
  {
    title: "4. JavaScript Lanjutan",
    slug: "javascript-lanjutan",
    goal: "Membuat web yang interaktif dengan DOM manipulation dan event handling",
    skills: [
      "DOM Manipulation",
      "Event Handling",
      "Array & Object",
      "LocalStorage",
      "Async Programming"
    ],
    basicTargets: [
      {
        title: "🎯 Kuasai DOM Manipulation",
        description: "Menguasai querySelector, innerHTML, dan createElement",
        completed: false
      },
      {
        title: "⚡ Pelajari Event Handling",
        description: "Implementasi event listener untuk click, input, submit, mouseover",
        completed: false
      },
      {
        title: "📊 Pahami Array & Object",
        description: "Menguasai manipulasi array dan object dalam JavaScript",
        completed: false
      },
      {
        title: "💾 Gunakan LocalStorage",
        description: "Implementasi penyimpanan data di browser dengan localStorage",
        completed: false
      }
    ],
    advancedTargets: [
      {
        title: "🧮 Latihan: Kalkulator Sederhana",
        description: "Buat kalkulator dengan operasi dasar menggunakan JavaScript",
        completed: false
      },
      {
        title: "👋 Latihan: Simpan Nama User",
        description: "Simpan nama pengguna di LocalStorage dan tampilkan saat buka halaman",
        completed: false
      },
      {
        title: "🎮 Buat Mini Game",
        description: "Implementasi logika sederhana seperti tebak angka atau rock-paper-scissors",
        completed: false
      }
    ],
    reflectionPrompt: "Apa perbedaan yang Anda rasakan ketika membuat web statis vs web interaktif?",
    order: 4,
    isActive: true
  },
  {
    title: "5. Mini Proyek - Aplikasi Interaktif",
    slug: "mini-proyek-aplikasi",
    goal: "Mengintegrasikan HTML, CSS, dan JavaScript dalam proyek nyata yang fungsional",
    skills: [
      "Project Planning",
      "Full Stack Integration",
      "Game Development",
      "UI/UX Design",
      "Problem Solving"
    ],
    basicTargets: [
      {
        title: "🎮 Proyek 1: Game Pasangkan Emoji",
        description: "Buat game memory dengan HTML grid, CSS animasi flip, JS logika pasangkan kartu",
        completed: false
      },
      {
        title: "🤖 Proyek 2: Chatbot Sederhana",
        description: "Buat chatbot dengan HTML kotak chat, CSS bubble, JS if/else logic",
        completed: false
      },
      {
        title: "📝 Proyek 3: Blog Pribadi",
        description: "Buat blog dengan daftar artikel, layout rapi, navigasi antar halaman",
        completed: false
      },
      {
        title: "📸 Proyek 4: Gallery Foto",
        description: "Buat gallery dengan grid gambar dan lightbox (klik gambar → tampil besar)",
        completed: false
      }
    ],
    advancedTargets: [
      {
        title: "💼 Proyek 5: Coding Lab Profesional",
        description: "Buat coding lab berisi: profil, skill, proyek, kontak (responsif)",
        completed: false
      },
      {
        title: "🚀 Deploy ke GitHub Pages/Netlify",
        description: "Deploy coding lab secara gratis ke internet",
        completed: false
      },
      {
        title: "🎯 Optimasi Performance",
        description: "Implementasi lazy loading, minifikasi, dan optimasi gambar",
        completed: false
      }
    ],
    reflectionPrompt: "Proyek mana yang paling menantang? Apa yang Anda pelajari dari proses debugging?",
    order: 5,
    isActive: true
  },
  {
    title: "6. Skill Tambahan (Advanced)",
    slug: "skill-tambahan-advanced",
    goal: "Menguasai tools modern dan framework untuk development profesional",
    skills: [
      "Git & GitHub",
      "CSS Framework",
      "JavaScript Framework",
      "Build Tools",
      "Deployment"
    ],
    basicTargets: [
      {
        title: "📚 Pelajari Git & GitHub",
        description: "Menguasai version control dan publish proyek ke GitHub",
        completed: false
      },
      {
        title: "🎨 Eksplorasi CSS Framework",
        description: "Belajar Tailwind CSS atau Bootstrap untuk development yang lebih cepat",
        completed: false
      },
      {
        title: "🔧 Modern Development Tools",
        description: "Mengenal package managers, build tools, dan workflow modern",
        completed: false
      }
    ],
    advancedTargets: [
      {
        title: "⚛️ Pengenalan React",
        description: "Dasar-dasar React untuk tingkat lanjut (opsional)",
        completed: false
      },
      {
        title: "🌟 Proyek Coding Lab Advanced",
        description: "Rebuild coding lab menggunakan framework modern",
        completed: false
      },
      {
        title: "🚀 CI/CD Pipeline",
        description: "Setup automated deployment dengan GitHub Actions",
        completed: false
      },
      {
        title: "📱 Progressive Web App (PWA)",
        description: "Konversi salah satu proyek menjadi PWA",
        completed: false
      }
    ],
    reflectionPrompt: "Bagaimana framework dan tools modern mengubah workflow development Anda?",
    order: 6,
    isActive: true
  }
];

export async function POST(request: NextRequest) {
  try {
    // Security check - only allow seeding in development or with secret key
    const { searchParams } = new URL(request.url)
    const secretKey = searchParams.get('secret')
    
    if (secretKey !== process.env.NEXTAUTH_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🚀 Seeding Classroom Roadmap: Web Development SMA...')

    // Clear existing classroom project checklists
    await prisma.classroomProjectChecklist.deleteMany({})
    console.log('🧹 Cleared existing classroom project checklists')

    // Create new project checklists
    const createdProjects = []
    for (const project of roadmapData) {
      const createdProject = await prisma.classroomProjectChecklist.create({
        data: project
      })
      createdProjects.push(createdProject)
      console.log(`✅ Created: ${project.title}`)
    }

    console.log('✅ Classroom Roadmap berhasil di-seed!')

    return NextResponse.json({ 
      message: 'Classroom Roadmap seeded successfully!',
      summary: {
        totalProjects: createdProjects.length,
        projects: createdProjects.map(p => ({
          title: p.title,
          slug: p.slug,
          order: p.order
        }))
      }
    })

  } catch (error) {
    console.error('❌ Error seeding classroom roadmap:', error)
    return NextResponse.json({ 
      error: 'Failed to seed classroom roadmap',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}