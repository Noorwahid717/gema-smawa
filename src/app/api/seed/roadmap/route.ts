import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ROADMAP_STAGES_DATA = [
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
    order: 1,
    activityGroups: [
      {
        id: "stage-1-exercises",
        title: "Latihan kecil",
        description: "",
        order: 1,
        items: [
          { id: "stage-1-task-1", label: "Buat halaman biodata sederhana menggunakan HTML dan CSS.", order: 1 },
          { id: "stage-1-task-2", label: "Tambahkan tombol yang mengubah warna background dengan JavaScript.", order: 2 }
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
    order: 2,
    activityGroups: [
      {
        id: "stage-2-exercises",
        title: "Latihan kecil",
        description: "",
        order: 1,
        items: [
          { id: "stage-2-task-1", label: "Susun kerangka halaman dengan elemen semantik.", order: 1 },
          { id: "stage-2-task-2", label: "Buat form pendaftaran online sederhana lengkap dengan label.", order: 2 },
          { id: "stage-2-task-3", label: "Tambahkan validasi dasar dan pesan bantuan untuk pengguna.", order: 3 }
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
    order: 3,
    activityGroups: [
      {
        id: "stage-3-exercises",
        title: "Latihan kecil",
        description: "",
        order: 1,
        items: [
          { id: "stage-3-task-1", label: "Buat layout blog dengan header, sidebar, dan konten utama.", order: 1 },
          { id: "stage-3-task-2", label: "Pastikan layout tetap rapi di layar mobile dan desktop.", order: 2 },
          { id: "stage-3-task-3", label: "Tambahkan animasi hover pada tombol dan link penting.", order: 3 }
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
    order: 4,
    activityGroups: [
      {
        id: "stage-4-exercises",
        title: "Latihan kecil",
        description: "",
        order: 1,
        items: [
          { id: "stage-4-task-1", label: "Bangun kalkulator sederhana dengan operasi tambah, kurang, kali, dan bagi.", order: 1 },
          { id: "stage-4-task-2", label: "Simpan nama pengguna di LocalStorage dan tampilkan saat halaman dibuka.", order: 2 }
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
    materials: [],
    order: 5,
    activityGroups: [
      {
        id: "stage-5-game",
        title: "Game Pasangkan Emoji 🎮",
        description: "Latih logika dan manipulasi DOM.",
        order: 1,
        items: [
          { id: "stage-5-game-1", label: "Susun grid kartu emoji menggunakan HTML.", order: 1 },
          { id: "stage-5-game-2", label: "Styling kartu dan animasi flip dengan CSS.", order: 2 },
          { id: "stage-5-game-3", label: "Buat logika pencocokan kartu dengan JavaScript.", order: 3 }
        ]
      },
      {
        id: "stage-5-chatbot",
        title: "Chatbot Sederhana 🤖",
        description: "Buat percakapan otomatis dengan aturan sederhana.",
        order: 2,
        items: [
          { id: "stage-5-chatbot-1", label: "Desain area percakapan dengan HTML.", order: 1 },
          { id: "stage-5-chatbot-2", label: "Gaya bubble chat agar nyaman dibaca.", order: 2 },
          { id: "stage-5-chatbot-3", label: "Tulis logika if/else untuk membalas pesan pengguna.", order: 3 }
        ]
      },
      {
        id: "stage-5-blog",
        title: "Blog Pribadi & Gallery Foto 📸✍️",
        description: "Gabungkan konten artikel dan visual.",
        order: 3,
        items: [
          { id: "stage-5-blog-1", label: "Susun daftar artikel dan halaman detail untuk blog.", order: 1 },
          { id: "stage-5-blog-2", label: "Gunakan layout CSS agar navigasi nyaman.", order: 2 },
          { id: "stage-5-blog-3", label: "Tambahkan navigasi antar halaman dengan JavaScript.", order: 3 },
          { id: "stage-5-blog-4", label: "Buat gallery foto grid dan efek lightbox.", order: 4 }
        ]
      },
      {
        id: "stage-5-coding-lab",
        title: "Coding Lab Profesional 💼",
        description: "Tampilkan profil dan karya terbaik tim.",
        order: 4,
        items: [
          { id: "stage-5-coding-lab-1", label: "Buat halaman profil, skill, proyek, dan kontak.", order: 1 },
          { id: "stage-5-coding-lab-2", label: "Pastikan tampilan responsif di HP dan laptop.", order: 2 },
          { id: "stage-5-coding-lab-3", label: "Deploy gratis ke GitHub Pages atau Netlify.", order: 3 }
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
    materials: [],
    order: 6,
    activityGroups: [
      {
        id: "stage-6-explore",
        title: "Eksplor Skill Tambahan",
        description: "",
        order: 1,
        items: [
          { id: "stage-6-task-1", label: "Gunakan Git untuk mencatat perubahan proyek dan unggah ke GitHub.", order: 1 },
          { id: "stage-6-task-2", label: "Coba membangun halaman dengan Tailwind atau Bootstrap.", order: 2 },
          { id: "stage-6-task-3", label: "Pelajari dasar React: komponen, props, dan state sederhana.", order: 3 }
        ]
      }
    ]
  }
];

export async function POST(request: Request) {
  try {
    const { secret } = await request.json();
    
    // Simple security check
    if (secret !== process.env.SEED_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if data already exists
    const existingStages = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM roadmap_stages
    `;
    
    if (Array.isArray(existingStages) && existingStages[0] && (existingStages[0] as { count: number }).count > 0) {
      return NextResponse.json({
        success: true,
        message: 'Roadmap stages already exist',
        count: (existingStages[0] as { count: number }).count
      });
    }

    // Execute the migration first
    await prisma.$executeRawUnsafe(`
      -- Create RoadmapStage table
      CREATE TABLE IF NOT EXISTS "roadmap_stages" (
          "id" TEXT NOT NULL,
          "title" TEXT NOT NULL,
          "goal" TEXT NOT NULL,
          "skills" JSONB NOT NULL,
          "overview" JSONB NOT NULL,
          "materials" JSONB,
          "orderIndex" INTEGER NOT NULL DEFAULT 0,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "roadmap_stages_pkey" PRIMARY KEY ("id")
      );

      -- Create RoadmapActivityGroup table
      CREATE TABLE IF NOT EXISTS "roadmap_activity_groups" (
          "id" TEXT NOT NULL,
          "stageId" TEXT NOT NULL,
          "title" TEXT NOT NULL,
          "description" TEXT,
          "orderIndex" INTEGER NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "roadmap_activity_groups_pkey" PRIMARY KEY ("id")
      );

      -- Create RoadmapChecklistItem table
      CREATE TABLE IF NOT EXISTS "roadmap_checklist_items" (
          "id" TEXT NOT NULL,
          "groupId" TEXT NOT NULL,
          "label" TEXT NOT NULL,
          "orderIndex" INTEGER NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "roadmap_checklist_items_pkey" PRIMARY KEY ("id")
      );

      -- Create RoadmapStudentProgress table
      CREATE TABLE IF NOT EXISTS "roadmap_student_progress" (
          "id" TEXT NOT NULL,
          "studentId" TEXT NOT NULL,
          "stageId" TEXT NOT NULL,
          "itemId" TEXT NOT NULL,
          "isCompleted" BOOLEAN NOT NULL DEFAULT false,
          "completedAt" TIMESTAMP(3),
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "roadmap_student_progress_pkey" PRIMARY KEY ("id")
      );

      -- Create RoadmapStudentReflection table
      CREATE TABLE IF NOT EXISTS "roadmap_student_reflections" (
          "id" TEXT NOT NULL,
          "studentId" TEXT NOT NULL,
          "stageId" TEXT NOT NULL,
          "reflection" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "roadmap_student_reflections_pkey" PRIMARY KEY ("id")
      );
    `);

    // Add foreign key constraints and indexes if they don't exist
    try {
      await prisma.$executeRawUnsafe(`
        -- Add foreign key constraints (if not exists)
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'roadmap_activity_groups_stageId_fkey') THEN
            ALTER TABLE "roadmap_activity_groups" ADD CONSTRAINT "roadmap_activity_groups_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "roadmap_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'roadmap_checklist_items_groupId_fkey') THEN
            ALTER TABLE "roadmap_checklist_items" ADD CONSTRAINT "roadmap_checklist_items_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "roadmap_activity_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'roadmap_student_progress_studentId_fkey') THEN
            ALTER TABLE "roadmap_student_progress" ADD CONSTRAINT "roadmap_student_progress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'roadmap_student_progress_stageId_fkey') THEN
            ALTER TABLE "roadmap_student_progress" ADD CONSTRAINT "roadmap_student_progress_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "roadmap_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'roadmap_student_progress_itemId_fkey') THEN
            ALTER TABLE "roadmap_student_progress" ADD CONSTRAINT "roadmap_student_progress_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "roadmap_checklist_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'roadmap_student_reflections_studentId_fkey') THEN
            ALTER TABLE "roadmap_student_reflections" ADD CONSTRAINT "roadmap_student_reflections_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'roadmap_student_reflections_stageId_fkey') THEN
            ALTER TABLE "roadmap_student_reflections" ADD CONSTRAINT "roadmap_student_reflections_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "roadmap_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
        END
        $$;
      `);
    } catch (constraintError) {
      console.log('Constraint creation warning (may already exist):', constraintError);
    }

    // Add indexes
    try {
      await prisma.$executeRawUnsafe(`
        -- Add indexes (if not exists)
        CREATE INDEX IF NOT EXISTS "roadmap_activity_groups_stageId_idx" ON "roadmap_activity_groups"("stageId");
        CREATE INDEX IF NOT EXISTS "roadmap_checklist_items_groupId_idx" ON "roadmap_checklist_items"("groupId");
        CREATE INDEX IF NOT EXISTS "roadmap_student_progress_studentId_idx" ON "roadmap_student_progress"("studentId");
        CREATE INDEX IF NOT EXISTS "roadmap_student_progress_stageId_idx" ON "roadmap_student_progress"("stageId");
        CREATE INDEX IF NOT EXISTS "roadmap_student_reflections_studentId_idx" ON "roadmap_student_reflections"("studentId");
        CREATE INDEX IF NOT EXISTS "roadmap_student_reflections_stageId_idx" ON "roadmap_student_reflections"("stageId");

        -- Add unique constraints (if not exists)
        CREATE UNIQUE INDEX IF NOT EXISTS "roadmap_student_progress_studentId_itemId_key" ON "roadmap_student_progress"("studentId", "itemId");
        CREATE UNIQUE INDEX IF NOT EXISTS "roadmap_student_reflections_studentId_stageId_key" ON "roadmap_student_reflections"("studentId", "stageId");
      `);
    } catch (indexError) {
      console.log('Index creation warning (may already exist):', indexError);
    }

    let totalInserted = 0;

    // Insert stages, groups, and items
    for (const stageData of ROADMAP_STAGES_DATA) {
      // Insert stage
      await prisma.$executeRawUnsafe(`
        INSERT INTO roadmap_stages (id, title, goal, skills, overview, materials, "orderIndex", "isActive", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `, stageData.id, stageData.title, stageData.goal, JSON.stringify(stageData.skills), JSON.stringify(stageData.overview), JSON.stringify(stageData.materials), stageData.order, true);
      
      totalInserted++;

      // Insert activity groups and items
      for (const group of stageData.activityGroups) {
        await prisma.$executeRawUnsafe(`
          INSERT INTO roadmap_activity_groups (id, "stageId", title, description, "orderIndex", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
          ON CONFLICT (id) DO NOTHING
        `, group.id, stageData.id, group.title, group.description || '', group.order);

        // Insert items
        for (const item of group.items) {
          await prisma.$executeRawUnsafe(`
            INSERT INTO roadmap_checklist_items (id, "groupId", label, "orderIndex", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, NOW(), NOW())
            ON CONFLICT (id) DO NOTHING
          `, item.id, group.id, item.label, item.order);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded roadmap data`,
      stages: totalInserted,
      groups: ROADMAP_STAGES_DATA.reduce((sum, stage) => sum + stage.activityGroups.length, 0),
      items: ROADMAP_STAGES_DATA.reduce((sum, stage) => 
        sum + stage.activityGroups.reduce((groupSum, group) => groupSum + group.items.length, 0), 0
      )
    });

  } catch (error) {
    console.error('Seed roadmap error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed roadmap data' },
      { status: 500 }
    );
  }
}