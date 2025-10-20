const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearAndSeedRealisticData() {
  try {
    console.log('🗑️ Clearing existing data...');

    // Clear existing data
    await prisma.announcement.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.gallery.deleteMany();

    console.log('✅ Data cleared');

    // Create realistic announcements
    console.log('📢 Creating realistic announcements...');
    await prisma.announcement.createMany({
      data: [
        {
          title: 'Pendaftaran Angkatan Baru GEMA 2025 Dibuka!',
          content: 'Assalamualaikum warahmatullahi wabarakatuh. Pendaftaran program Generasi Muda Informatika (GEMA) angkatan 2025 telah resmi dibuka. Program ini dirancang khusus untuk santri SMA Wahidiyah yang ingin mengembangkan bakat di bidang teknologi informasi. Pendaftaran ditutup tanggal 30 November 2025.',
          type: 'info'
        },
        {
          title: 'Pelatihan Dasar Programming untuk Santri Baru',
          content: 'Bagi santri baru yang tertarik dengan dunia programming, GEMA menyediakan pelatihan dasar HTML, CSS, dan JavaScript. Pelatihan akan dilaksanakan setiap hari Sabtu di Lab Komputer mulai tanggal 15 Oktober 2025. Kuota terbatas, segera daftar!',
          type: 'success'
        },
        {
          title: 'Persiapan Lomba Teknologi Tingkat Nasional',
          content: 'Tim GEMA sedang mempersiapkan diri untuk mengikuti kompetisi teknologi tingkat nasional. Kami membutuhkan santri berbakat untuk bergabung dalam tim development, UI/UX design, dan data science. Pendaftaran tim dibuka hingga 20 Oktober 2025.',
          type: 'warning'
        },
        {
          title: 'Workshop "AI untuk Santri" oleh Pakar ITB',
          content: 'GEMA bekerja sama dengan Institut Teknologi Bandung mengadakan workshop khusus Artificial Intelligence untuk santri. Workshop ini akan membahas penerapan AI dalam kehidupan sehari-hari dan etika penggunaan teknologi. Terbuka untuk semua santri GEMA.',
          type: 'info'
        },
        {
          title: 'Pengabdian Masyarakat: Digitalisasi UMKM Lokal',
          content: 'Program pengabdian masyarakat GEMA tahun ini fokus pada digitalisasi UMKM di sekitar Pondok Pesantren Kedunglo. Santri akan belajar membuat website dan aplikasi untuk membantu pengusaha lokal. Pendaftaran volunteer dibuka untuk semua angkatan.',
          type: 'success'
        }
      ]
    });

    // Create realistic activities
    console.log('📅 Creating realistic activities...');
    await prisma.activity.createMany({
      data: [
        {
          title: 'Bootcamp Full-Stack Web Development',
          description: 'Pelatihan intensif selama 3 bulan untuk menjadi full-stack developer. Materi meliputi React, Next.js, Node.js, dan database. Termasuk project-based learning dengan mentor berpengalaman.',
          date: new Date('2025-11-01'),
          location: 'Lab Komputer SMA Wahidiyah',
          capacity: 25,
          registered: 23
        },
        {
          title: 'Kompetisi Mobile App Development',
          description: 'Lomba pengembangan aplikasi mobile untuk tingkat Jawa Timur. Tema: "Teknologi untuk Pendidikan Islam". Hadiah total Rp 15.000.000,-. Tim terdiri dari 3-5 orang santri.',
          date: new Date('2025-12-15'),
          location: 'Gedung Serbaguna Pondok Pesantren',
          capacity: 50,
          registered: 42
        },
        {
          title: 'Workshop Cybersecurity Fundamentals',
          description: 'Pelatihan dasar keamanan siber untuk santri. Belajar tentang ethical hacking, password security, dan praktik keamanan digital sehari-hari. Penting untuk era digital saat ini.',
          date: new Date('2025-10-25'),
          location: 'Ruang Multimedia',
          capacity: 30,
          registered: 28
        },
        {
          title: 'Study Group Data Science & Machine Learning',
          description: 'Belajar bersama tentang data science menggunakan Python. Mulai dari statistik dasar hingga machine learning sederhana. Cocok untuk santri yang suka matematika dan ingin berkarir di bidang AI.',
          date: new Date('2025-11-10'),
          location: 'Lab Komputer Lantai 2',
          capacity: 20,
          registered: 18
        },
        {
          title: 'Hackathon "Tech for Ummah"',
          description: 'Kompetisi 24 jam untuk menciptakan solusi teknologi yang bermanfaat bagi umat Islam. Tema tahun ini: "Digital Islamic Learning Platform". Hadiah dan networking dengan perusahaan teknologi.',
          date: new Date('2025-12-01'),
          location: 'Aula Besar SMA Wahidiyah',
          capacity: 100,
          registered: 67
        },
        {
          title: 'Pelatihan UI/UX Design untuk Santri',
          description: 'Belajar mendesain interface yang user-friendly menggunakan Figma. Dari wireframing hingga prototyping. Skill yang sangat dibutuhkan di industri teknologi saat ini.',
          date: new Date('2025-11-20'),
          location: 'Lab Design & Multimedia',
          capacity: 25,
          registered: 22
        },
        {
          title: 'Seminar "Teknologi Blockchain untuk Santri"',
          description: 'Pengenalan teknologi blockchain dan cryptocurrency dari perspektif Islam. Diskusi tentang ethical tech investment dan penerapan blockchain untuk transparansi wakaf.',
          date: new Date('2025-12-08'),
          location: 'Aula Seminar',
          capacity: 80,
          registered: 73
        },
        {
          title: 'Project Pengembangan Website Masjid',
          description: 'Proyek nyata: membangun website untuk masjid-masjid di Kediri. Santri akan belajar project management, client communication, dan deployment ke production server.',
          date: new Date('2025-11-05'),
          location: 'Lab Komputer & Masjid Al-Hikmah',
          capacity: 15,
          registered: 14
        }
      ]
    });

    // Create realistic gallery
    console.log('🖼️ Creating realistic gallery...');
    await prisma.gallery.createMany({
      data: [
        {
          title: 'Pelantikan Angkatan GEMA 2025',
          description: 'Moment pelantikan santri baru GEMA di Masjid Al-Hikmah. Acara dihadiri oleh Kyai, guru, dan orang tua santri. Semangat baru untuk pengembangan teknologi di Pondok Pesantren.',
          imageUrl: 'https://picsum.photos/800/600?random=101',
          category: 'kegiatan'
        },
        {
          title: 'Workshop Coding Santri Berbakat',
          description: 'Santri GEMA fokus mengerjakan project coding di Lab Komputer. Mereka sedang mengembangkan aplikasi web untuk manajemen inventaris masjid.',
          imageUrl: 'https://picsum.photos/800/600?random=102',
          category: 'workshop'
        },
        {
          title: 'Juara Lomba Teknologi Se-Jawa Timur',
          description: 'Tim GEMA berhasil meraih juara 1 dalam kompetisi web development se-Jawa Timur. Prestasi membanggakan yang membuktikan kemampuan santri Pondok Pesantren di bidang teknologi.',
          imageUrl: 'https://picsum.photos/800/600?random=103',
          category: 'prestasi'
        },
        {
          title: 'Belajar Bersama di Taman Masjid',
          description: 'Santri GEMA melakukan diskusi teknis di taman masjid setelah sholat Isya. Mereka sedang mendiskusikan project AI untuk pengenalan huruf Arab.',
          imageUrl: 'https://picsum.photos/800/600?random=104',
          category: 'kegiatan'
        },
        {
          title: 'Kunjungan Industri ke PT Teknologi Nusantara',
          description: 'Kunjungan studi ke perusahaan teknologi terkemuka. Santri mendapat wawasan langsung tentang dunia kerja IT dan networking dengan professional.',
          imageUrl: 'https://picsum.photos/800/600?random=105',
          category: 'kegiatan'
        },
        {
          title: 'Final Project Hackathon GEMA',
          description: 'Presentasi final project hackathon 24 jam. Tim-tim santri mempresentasikan aplikasi inovatif mereka di depan juri dan tamu undangan.',
          imageUrl: 'https://picsum.photos/800/600?random=106',
          category: 'workshop'
        },
        {
          title: 'Mentoring Session dengan Alumni ITB',
          description: 'Sesi mentoring eksklusif dengan alumni Institut Teknologi Bandung. Santri mendapat bimbingan langsung tentang karir di bidang teknologi.',
          imageUrl: 'https://picsum.photos/800/600?random=107',
          category: 'kegiatan'
        },
        {
          title: 'Pengabdian Masyarakat: Digitalisasi Koperasi Santri',
          description: 'Tim GEMA membantu digitalisasi koperasi santri dengan membuat sistem manajemen online. Project ini mengintegrasikan nilai-nilai Islam dengan teknologi modern.',
          imageUrl: 'https://picsum.photos/800/600?random=108',
          category: 'pengabdian'
        }
      ]
    });

    console.log('✅ Realistic data seeded successfully!');

    // Verify the data
    const newAnnouncements = await prisma.announcement.count();
    const newActivities = await prisma.activity.count();
    const newGalleries = await prisma.gallery.count();

    console.log('\n📊 Final Counts:');
    console.log('- Announcements:', newAnnouncements);
    console.log('- Activities:', newActivities);
    console.log('- Galleries:', newGalleries);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearAndSeedRealisticData();