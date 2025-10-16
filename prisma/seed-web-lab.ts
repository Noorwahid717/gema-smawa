import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

enum WebLabDifficulty {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

enum WebLabStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

async function seedWebLabAssignments() {
  console.log('Seeding Web Lab assignments...')

  // Get the first admin user
  const admin = await prisma.admin.findFirst()
  if (!admin) {
    console.log('No admin user found, skipping web lab seed')
    return
  }

  const assignments = [
    {
      title: 'Membuat Halaman Profil Sederhana',
      description: 'Buat halaman profil dengan HTML dan CSS dasar',
      difficulty: WebLabDifficulty.BEGINNER,
      classLevel: 'XI-A',
      instructions: `Buat halaman profil sederhana dengan informasi berikut:
- Nama lengkap
- Foto profil (gunakan placeholder)
- Deskripsi singkat
- Daftar skill/hobi

Gunakan HTML untuk struktur dan CSS untuk styling.`,
      starterHtml: `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profil Saya</title>
</head>
<body>
    <div class="profile-container">
        <h1>Profil Saya</h1>
        <!-- Tambahkan konten profil di sini -->
    </div>
</body>
</html>`,
      starterCss: `body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f5f5f5;
}

.profile-container {
    max-width: 600px;
    margin: 0 auto;
    background: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}`,
      starterJs: `// JavaScript untuk interaktivitas
console.log('Halaman profil dimuat');`,
      requirements: JSON.stringify([
        'Gunakan HTML5 semantic elements',
        'Tambahkan styling dengan CSS',
        'Layout responsive',
        'Minimal 3 section berbeda'
      ]),
      hints: JSON.stringify([
        'Gunakan div dengan class untuk styling',
        'Tambahkan padding dan margin untuk spacing',
        'Gunakan flexbox untuk layout'
      ]),
      points: 100,
      timeLimit: 60,
      status: WebLabStatus.PUBLISHED
    },
    {
      title: 'Form Kontak Interaktif',
      description: 'Buat form kontak dengan validasi JavaScript',
      difficulty: WebLabDifficulty.INTERMEDIATE,
      classLevel: 'XI-B',
      instructions: `Buat form kontak yang memiliki:
- Field nama, email, dan pesan
- Validasi input dengan JavaScript
- Pesan sukses/error
- Styling yang menarik

Form harus mencegah submit jika ada field kosong.`,
      starterHtml: `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Form Kontak</title>
</head>
<body>
    <div class="contact-container">
        <h1>Hubungi Kami</h1>
        <form id="contactForm">
            <div class="form-group">
                <label for="name">Nama:</label>
                <input type="text" id="name" name="name" required>
            </div>

            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required>
            </div>

            <div class="form-group">
                <label for="message">Pesan:</label>
                <textarea id="message" name="message" required></textarea>
            </div>

            <button type="submit">Kirim Pesan</button>
        </form>
        <div id="messageDisplay"></div>
    </div>
</body>
</html>`,
      starterCss: `.contact-container {
    max-width: 500px;
    margin: 50px auto;
    padding: 30px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 20px rgba(0,0,0,0.1);
}

.form-group {
    margin-bottom: 20px;
}

label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

input, textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
}

button {
    background: #007bff;
    color: white;
    padding: 12px 30px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
}

button:hover {
    background: #0056b3;
}`,
      starterJs: `document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Tambahkan validasi dan logika submit di sini
    console.log('Form submitted');
});`,
      requirements: JSON.stringify([
        'Validasi semua field wajib',
        'Tampilkan pesan error untuk field kosong',
        'Validasi format email',
        'Tampilkan pesan sukses setelah submit'
      ]),
      hints: JSON.stringify([
        'Gunakan event.preventDefault()',
        'Periksa input.value.length > 0',
        'Gunakan regex untuk validasi email',
        'Manipulasi DOM untuk menampilkan pesan'
      ]),
      points: 150,
      timeLimit: 90,
      status: WebLabStatus.PUBLISHED
    },
    {
      title: 'Galeri Foto dengan Modal',
      description: 'Buat galeri foto dengan popup modal menggunakan JavaScript',
      difficulty: WebLabDifficulty.ADVANCED,
      classLevel: null, // All classes
      instructions: `Buat galeri foto yang menampilkan:
- Grid foto thumbnail
- Klik foto untuk melihat versi besar di modal
- Navigasi next/previous di modal
- Animasi smooth transitions

Gunakan array JavaScript untuk data foto.`,
      starterHtml: `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galeri Foto</title>
</head>
<body>
    <div class="gallery-container">
        <h1>Galeri Foto</h1>
        <div id="gallery" class="gallery-grid">
            <!-- Foto akan ditambahkan oleh JavaScript -->
        </div>
    </div>

    <!-- Modal untuk foto besar -->
    <div id="modal" class="modal">
        <span class="close">&times;</span>
        <img class="modal-content" id="modalImage">
        <div class="caption" id="caption"></div>
        <button id="prevBtn" class="nav-btn">&lt;</button>
        <button id="nextBtn" class="nav-btn">&gt;</button>
    </div>
</body>
</html>`,
      starterCss: `.gallery-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
    margin-top: 30px;
}

.gallery-item {
    cursor: pointer;
    transition: transform 0.3s;
}

.gallery-item:hover {
    transform: scale(1.05);
}

.gallery-item img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 10px;
}

/* Modal styles */
.modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.9);
}

.modal-content {
    margin: auto;
    display: block;
    max-width: 80%;
    max-height: 80%;
}

.close {
    position: absolute;
    top: 15px;
    right: 35px;
    color: #f1f1f1;
    font-size: 40px;
    font-weight: bold;
    cursor: pointer;
}

.nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255,255,255,0.3);
    color: white;
    border: none;
    padding: 15px;
    font-size: 24px;
    cursor: pointer;
    border-radius: 50%;
}

#prevBtn { left: 20px; }
#nextBtn { right: 20px; }`,
      starterJs: `// Data foto (dalam production, ini akan dari API)
const photos = [
    { src: 'https://picsum.photos/400/300?random=1', alt: 'Foto 1' },
    { src: 'https://picsum.photos/400/300?random=2', alt: 'Foto 2' },
    { src: 'https://picsum.photos/400/300?random=3', alt: 'Foto 3' },
    { src: 'https://picsum.photos/400/300?random=4', alt: 'Foto 4' },
    { src: 'https://picsum.photos/400/300?random=5', alt: 'Foto 5' },
    { src: 'https://picsum.photos/400/300?random=6', alt: 'Foto 6' }
];

let currentIndex = 0;

// Fungsi untuk membuat galeri
function createGallery() {
    const gallery = document.getElementById('gallery');

    photos.forEach((photo, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';

        const img = document.createElement('img');
        img.src = photo.src;
        img.alt = photo.alt;
        img.onclick = () => openModal(index);

        item.appendChild(img);
        gallery.appendChild(item);
    });
}

// Fungsi untuk modal
function openModal(index) {
    currentIndex = index;
    // Implementasikan logika modal di sini
    console.log('Buka modal untuk foto:', index);
}

// Panggil fungsi saat halaman dimuat
document.addEventListener('DOMContentLoaded', createGallery);`,
      requirements: JSON.stringify([
        'Grid layout responsive',
        'Modal dengan overlay gelap',
        'Navigasi next/previous',
        'Animasi smooth transitions',
        'Keyboard navigation (arrow keys)',
        'Click outside to close'
      ]),
      hints: JSON.stringify([
        'Gunakan CSS Grid untuk layout',
        'Position: fixed untuk modal',
        'Array index untuk navigasi',
        'Event listeners untuk keyboard',
        'CSS transitions untuk animasi'
      ]),
      points: 200,
      timeLimit: 120,
      status: WebLabStatus.PUBLISHED
    }
  ]

  for (const assignment of assignments) {
    await prisma.webLabAssignment.create({
      data: {
        ...assignment,
        createdBy: admin.id
      }
    })
  }

  console.log('Web Lab assignments seeded successfully!')
}

export default seedWebLabAssignments

// Run if called directly
if (require.main === module) {
  seedWebLabAssignments()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
}