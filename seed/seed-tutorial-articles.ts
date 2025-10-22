import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('✨ Seeding tutorial articles based on classroom roadmap...');

  // Tutorial articles based on roadmap projects
  const tutorialArticles = [
    // Project 1: Kartu Ucapan Interaktif
    {
      title: '🎨 Bikin Kartu Ucapan Digital yang Bikin Hati Berbunga!',
      slug: 'tutorial-kartu-ucapan-interaktif-html-css',
      excerpt: 'Yuk belajar bikin kartu ucapan digital yang cantik dengan HTML, CSS, dan JavaScript! Dijamin teman-teman bakal kagum sama kreasi kamu. 💖',
      category: 'tutorial',
      tags: '["HTML", "CSS", "JavaScript", "DOM", "Beginner Friendly"]',
      featured: true,
      readTime: 15,
      relatedProject: 'kartu-ucapan-interaktif'
    },
    {
      title: '✨ Rahasia CSS yang Bikin Website Kamu Makin Kece!',
      slug: 'css-styling-dasar-untuk-pemula',
      excerpt: 'Pssst... mau tau trik CSS yang bikin website kamu tampil beda dari yang lain? Mari kita eksplorasi dunia warna, font, dan layout yang seru!',
      category: 'tutorial',
      tags: '["CSS", "Styling", "Layout", "Design"]',
      featured: false,
      readTime: 12,
      relatedProject: 'kartu-ucapan-interaktif'
    },

    // Project 2: Galeri Foto Responsif
    {
      title: '📸 Galeri Foto Responsif: Dari Berantakan Jadi Rapi Banget!',
      slug: 'tutorial-galeri-foto-responsif-css-grid',
      excerpt: 'Capek lihat foto-foto berantakan di website? Saatnya bikin galeri foto yang rapi dan cantik di semua ukuran layar dengan CSS Grid yang ajaib! 🎭',
      category: 'tutorial',
      tags: '["CSS Grid", "Responsive Design", "Gallery", "Flexbox"]',
      featured: true,
      readTime: 18,
      relatedProject: 'galeri-foto-responsif'
    },
    {
      title: '🔍 Filter Data JavaScript: Sulap Data Jadi Mudah Dicari!',
      slug: 'javascript-filter-data-dinamis',
      excerpt: 'Bingung nyari foto di antara ribuan gambar? Tenang, dengan JavaScript filter ini kamu bisa bikin fitur pencarian yang super keren dan mudah!',
      category: 'tutorial',
      tags: '["JavaScript", "Filter", "Array Methods", "DOM Manipulation"]',
      featured: false,
      readTime: 14,
      relatedProject: 'galeri-foto-responsif'
    },

    // Project 3: Game Tebak Angka
    {
      title: '🎮 Bikin Game Tebak Angka yang Bikin Ketagihan!',
      slug: 'tutorial-game-tebak-angka-javascript',
      excerpt: 'Siapa bilang coding itu membosankan? Yuk bikin game tebak angka yang seru dan bisa bikin teman-teman main terus sampai lupa waktu! 🕹️',
      category: 'tutorial',
      tags: '["JavaScript", "Game Development", "Logic", "Event Handling"]',
      featured: true,
      readTime: 20,
      relatedProject: 'game-tebak-angka'
    },
    {
      title: '🧠 Logika Pemrograman: Cara Berpikir Seperti Komputer!',
      slug: 'dasar-logika-pemrograman-untuk-pemula',
      excerpt: 'Pengen tau gimana cara komputer "mikir"? Mari kita pelajari logika pemrograman dengan cara yang fun dan mudah dipahami!',
      category: 'tutorial',
      tags: '["Logic", "Programming Fundamentals", "Conditional", "Loops"]',
      featured: false,
      readTime: 16,
      relatedProject: 'game-tebak-angka'
    },

    // Project 4: Daftar Belanja Interaktif
    {
      title: '🛒 To-Do List yang Lebih Canggih dari Kertas Biasa!',
      slug: 'tutorial-daftar-belanja-interaktif-crud',
      excerpt: 'Masih pakai kertas buat catat belanjaan? Zaman now saatnya upgrade ke digital! Bikin daftar belanja interaktif yang anti lupa. 📝',
      category: 'tutorial',
      tags: '["CRUD", "LocalStorage", "JavaScript", "Array Management"]',
      featured: true,
      readTime: 22,
      relatedProject: 'daftar-belanja-interaktif'
    },
    {
      title: '💾 LocalStorage: Gudang Rahasia di Browser Kamu!',
      slug: 'javascript-localstorage-simpan-data-browser',
      excerpt: 'Tau gak kalau browser kamu punya gudang rahasia buat nyimpan data? Yuk eksplorasi LocalStorage dan bikin data kamu awet selamanya!',
      category: 'tutorial',
      tags: '["LocalStorage", "Data Persistence", "Browser Storage", "JavaScript"]',
      featured: false,
      readTime: 10,
      relatedProject: 'daftar-belanja-interaktif'
    },

    // Project 5: Planner Jadwal Harian
    {
      title: '🗓️ Planner Digital: Atur Hidup Biar Makin Produktif!',
      slug: 'tutorial-planner-jadwal-harian-tabel',
      excerpt: 'Hidup kacau balau tanpa jadwal? Tenang, kita bikin planner digital yang bakal bikin hari-hari kamu terorganisir dengan baik! ⏰',
      category: 'tutorial',
      tags: '["HTML Table", "Form Handling", "Time Management", "Productivity"]',
      featured: true,
      readTime: 25,
      relatedProject: 'planner-jadwal-harian'
    },
    {
      title: '⏰ Manipulasi Waktu dengan JavaScript Date Object!',
      slug: 'javascript-date-object-waktu-tanggal',
      excerpt: 'Pengen jadi master waktu seperti Doctor Strange? Belajar JavaScript Date Object dan kuasai manipulasi waktu di website kamu!',
      category: 'tutorial',
      tags: '["JavaScript", "Date Object", "Time", "Calendar"]',
      featured: false,
      readTime: 13,
      relatedProject: 'planner-jadwal-harian'
    },

    // Project 6: Playlist Musik Favorit
    {
      title: '🎵 Playlist Musik Digital: Spotify Versi Buatan Sendiri!',
      slug: 'tutorial-playlist-musik-favorit-array-objek',
      excerpt: 'Bosen dengan playlist yang itu-itu aja? Saatnya bikin playlist musik sendiri yang bisa di-customize sesuai mood kamu! 🎶',
      category: 'tutorial',
      tags: '["JavaScript", "Array of Objects", "Music Player", "Card Layout"]',
      featured: true,
      readTime: 28,
      relatedProject: 'playlist-musik-favorit'
    },
    {
      title: '🔍 Search Function: Bikin Pencarian Secepat Kilat!',
      slug: 'javascript-search-function-real-time',
      excerpt: 'Capek scroll cari lagu favorit? Yuk bikin fitur pencarian real-time yang bisa nemuin apapun dalam sekejap mata!',
      category: 'tutorial',
      tags: '["JavaScript", "Search", "Filter", "Real-time", "UX"]',
      featured: false,
      readTime: 11,
      relatedProject: 'playlist-musik-favorit'
    },

    // Project 7: Website Tips Belajar Interaktif
    {
      title: '💡 Website Tips Interaktif: Bikin Konten yang Engaging!',
      slug: 'tutorial-website-tips-belajar-accordion-modal',
      excerpt: 'Konten website yang membosankan? Nggak lagi! Bikin website tips belajar dengan accordion dan modal yang bikin pengunjung betah berlama-lama. 📚',
      category: 'tutorial',
      tags: '["Accordion", "Modal", "UX Design", "Interactive Content"]',
      featured: true,
      readTime: 30,
      relatedProject: 'website-tips-belajar-interaktif'
    },
    {
      title: '🌙 Dark Mode Toggle: Kasih Mata Istirahat yang Nyaman!',
      slug: 'css-dark-mode-toggle-theme-switcher',
      excerpt: 'Mata lelah karena layar terlalu terang? Yuk bikin toggle dark mode yang keren dan bikin pengalaman browsing jadi lebih nyaman!',
      category: 'tutorial',
      tags: '["CSS Variables", "Dark Mode", "Theme Switcher", "UX"]',
      featured: false,
      readTime: 15,
      relatedProject: 'website-tips-belajar-interaktif'
    },

    // Project 8: Aplikasi Resep Masak
    {
      title: '🍽️ Aplikasi Resep Masak: Jadi Chef Digital yang Keren!',
      slug: 'tutorial-aplikasi-resep-masak-fetch-api',
      excerpt: 'Bingung mau masak apa hari ini? Bikin aplikasi resep masak sendiri yang bisa nyari ribuan resep dari seluruh dunia! 👨‍🍳',
      category: 'tutorial',
      tags: '["Fetch API", "External API", "Recipe App", "Search Functionality"]',
      featured: true,
      readTime: 35,
      relatedProject: 'aplikasi-resep-masak'
    },
    {
      title: '🌐 Fetch API: Ambil Data dari Internet dengan Mudah!',
      slug: 'javascript-fetch-api-external-data',
      excerpt: 'Pengen website kamu bisa ngambil data dari internet? Belajar Fetch API dan rasakan serunya menghubungkan website dengan dunia luar!',
      category: 'tutorial',
      tags: '["Fetch API", "Async/Await", "HTTP Requests", "External Data"]',
      featured: false,
      readTime: 18,
      relatedProject: 'aplikasi-resep-masak'
    },

    // Project 9: Dashboard Statistik Sekolah
    {
      title: '📈 Dashboard Statistik: Data Visualization yang Wow!',
      slug: 'tutorial-dashboard-statistik-chart-library',
      excerpt: 'Angka-angka yang membosankan jadi grafik yang keren banget! Yuk bikin dashboard statistik yang bikin semua orang terpukau. 📊',
      category: 'tutorial',
      tags: '["Data Visualization", "Chart.js", "Dashboard", "Statistics"]',
      featured: true,
      readTime: 40,
      relatedProject: 'dashboard-statistik-sekolah'
    },
    {
      title: '📊 Chart.js: Sulap Data Jadi Grafik yang Menawan!',
      slug: 'chartjs-data-visualization-tutorial',
      excerpt: 'Data yang kering jadi hidup dengan Chart.js! Belajar bikin berbagai jenis grafik yang informatif dan eye-catching.',
      category: 'tutorial',
      tags: '["Chart.js", "Data Visualization", "Graphs", "Interactive Charts"]',
      featured: false,
      readTime: 22,
      relatedProject: 'dashboard-statistik-sekolah'
    },

    // Project 10: Platform Microvolunteering Sekolah
    {
      title: '🤝 Platform Volunteering: Aplikasi Web yang Mengubah Dunia!',
      slug: 'tutorial-platform-microvolunteering-fullstack',
      excerpt: 'Siap jadi developer yang bikin impact? Yuk bikin platform volunteering lengkap dengan autentikasi, chat, dan peta interaktif! 🌍',
      category: 'tutorial',
      tags: '["Full Stack", "Authentication", "Chat Feature", "Maps Integration"]',
      featured: true,
      readTime: 50,
      relatedProject: 'platform-microvolunteering-sekolah'
    },
    {
      title: '🗺️ Integrasi Peta: Bikin Website dengan Lokasi Real!',
      slug: 'javascript-maps-integration-leaflet',
      excerpt: 'Website kamu bakal makin keren dengan peta interaktif! Belajar integrasi maps dan bikin fitur lokasi yang berguna banget.',
      category: 'tutorial',
      tags: '["Maps", "Leaflet", "Geolocation", "Interactive Maps"]',
      featured: false,
      readTime: 26,
      relatedProject: 'platform-microvolunteering-sekolah'
    },

    // Bonus tutorial articles
    {
      title: '🚀 Git & GitHub: Kolaborasi Coding yang Seru Abis!',
      slug: 'git-github-kolaborasi-developer',
      excerpt: 'Pengen kerja bareng developer lain tanpa chaos? Git dan GitHub adalah sahabat terbaik programmer untuk kolaborasi yang smooth!',
      category: 'tutorial',
      tags: '["Git", "GitHub", "Version Control", "Collaboration"]',
      featured: false,
      readTime: 20,
      relatedProject: null
    },
    {
      title: '🎨 Design System: Bikin Website yang Konsisten dan Cantik!',
      slug: 'design-system-konsistensi-ui-ux',
      excerpt: 'Bosen website yang tampilannya acak-acakan? Yuk belajar bikin design system yang bikin semua halaman terlihat harmonis dan profesional!',
      category: 'tutorial',
      tags: '["Design System", "UI/UX", "Consistency", "Color Palette"]',
      featured: false,
      readTime: 17,
      relatedProject: null
    },
    {
      title: '⚡ Website Performance: Bikin Loading Secepat Flash!',
      slug: 'optimasi-performa-website-loading-cepat',
      excerpt: 'Pengunjung kabur karena website lambat? Pelajari trik-trik optimasi yang bikin website kamu loading secepat kilat!',
      category: 'tutorial',
      tags: '["Performance", "Optimization", "Loading Speed", "User Experience"]',
      featured: false,
      readTime: 19,
      relatedProject: null
    }
  ];

  // Get admin user for authorId
  const admin = await prisma.admin.findFirst();
  if (!admin) {
    throw new Error('❌ No admin found. Please create an admin first.');
  }

  console.log(`👨‍💻 Found admin: ${admin.name}`);

  // Create tutorial articles
  let successCount = 0;
  let skipCount = 0;

  for (const articleData of tutorialArticles) {
    try {
      // Check if article already exists
      const existingArticle = await prisma.article.findUnique({
        where: { slug: articleData.slug }
      });

      if (existingArticle) {
        console.log(`⏭️  Skipped (already exists): ${articleData.title}`);
        skipCount++;
        continue;
      }

      const article = await prisma.article.create({
        data: {
          title: articleData.title,
          slug: articleData.slug,
          excerpt: articleData.excerpt,
          content: `<div class="tutorial-placeholder">
            <h2>🚧 Konten sedang dalam pengembangan</h2>
            <p>Tutorial lengkap untuk "<strong>${articleData.title}</strong>" akan segera hadir!</p>
            <p>Stay tuned dan jangan lupa cek kembali ya! ✨</p>
          </div>`,
          category: articleData.category,
          tags: articleData.tags,
          author: 'Tim GEMA',
          authorId: admin.id,
          status: 'draft', // Start as draft until content is complete
          featured: articleData.featured,
          readTime: articleData.readTime,
          publishedAt: null // Will be set when published
        }
      });

      console.log(`✅ Created tutorial: ${article.title}`);
      successCount++;
    } catch (error) {
      console.log(`❌ Failed to create tutorial: ${articleData.title}`, error);
    }
  }

  console.log(`\n🎉 Tutorial articles seeding completed!`);
  console.log(`✅ Successfully created: ${successCount} articles`);
  console.log(`⏭️  Skipped (existing): ${skipCount} articles`);
  console.log(`📚 Total articles processed: ${tutorialArticles.length}`);
  
  // Show some stats
  const totalArticles = await prisma.article.count();
  const draftArticles = await prisma.article.count({ where: { status: 'draft' } });
  const publishedArticles = await prisma.article.count({ where: { status: 'published' } });
  
  console.log(`\n📊 Database stats:`);
  console.log(`   Total articles: ${totalArticles}`);
  console.log(`   Draft articles: ${draftArticles}`);
  console.log(`   Published articles: ${publishedArticles}`);
}

main()
  .catch((e) => {
    console.error('💥 Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });