export interface WebLabTemplate {
  id: string
  name: string
  description: string
  category: 'basic' | 'intermediate' | 'advanced'
  html: string
  css: string
  js: string
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
}

export const WEB_LAB_TEMPLATES: WebLabTemplate[] = [
  {
    id: 'html-basic',
    name: 'HTML Dasar',
    description: 'Template sederhana untuk mempelajari struktur HTML dasar',
    category: 'basic',
    difficulty: 'BEGINNER',
    html: `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Halaman HTML Dasar</title>
</head>
<body>
    <header>
        <h1>Selamat Datang di Web Lab</h1>
        <nav>
            <ul>
                <li><a href="#home">Beranda</a></li>
                <li><a href="#about">Tentang</a></li>
                <li><a href="#contact">Kontak</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <section id="home">
            <h2>Beranda</h2>
            <p>Ini adalah halaman web sederhana menggunakan HTML.</p>
            <button onclick="showAlert()">Klik Saya!</button>
        </section>

        <section id="about">
            <h2>Tentang</h2>
            <p>Pelajari cara membuat website dengan HTML, CSS, dan JavaScript.</p>
        </section>

        <section id="contact">
            <h2>Kontak</h2>
            <p>Hubungi kami untuk informasi lebih lanjut.</p>
        </section>
    </main>

    <footer>
        <p>&copy; 2025 SMA Wahidiyah Kediri</p>
    </footer>

    <script src="script.js"></script>
</body>
</html>`,
    css: `/* Reset dan Base Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    background: #f5f5f5;
}

header {
    background: #3498db;
    color: white;
    padding: 2rem 0;
    text-align: center;
}

h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
}

nav ul {
    list-style: none;
    display: flex;
    justify-content: center;
    gap: 2rem;
}

nav a {
    color: white;
    text-decoration: none;
    font-weight: 500;
}

main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

section {
    margin-bottom: 3rem;
    padding: 2rem;
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

h2 {
    color: #2c3e50;
    margin-bottom: 1rem;
    font-size: 1.8rem;
}

button {
    background: #3498db;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    transition: background 0.3s;
}

button:hover {
    background: #2980b9;
}

footer {
    background: #2c3e50;
    color: white;
    text-align: center;
    padding: 2rem 0;
    margin-top: 3rem;
}`,
    js: `// JavaScript Dasar
function showAlert() {
    alert('Halo! Anda berhasil mengklik tombol!');
    console.log('Tombol diklik pada:', new Date().toLocaleString());
}`
  },
  {
    id: 'portfolio-basic',
    name: 'Portfolio Sederhana',
    description: 'Template portfolio untuk pemula dengan navigasi dan konten dasar',
    category: 'basic',
    difficulty: 'BEGINNER',
    html: `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portfolio Sederhana</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header class="header">
        <nav class="nav">
            <div class="nav-container">
                <h1 class="nav-title">Portfolio</h1>
                <ul class="nav-menu">
                    <li><a href="#home">Beranda</a></li>
                    <li><a href="#about">Tentang</a></li>
                    <li><a href="#skills">Keahlian</a></li>
                    <li><a href="#contact">Kontak</a></li>
                </ul>
            </div>
        </nav>
    </header>

    <main>
        <section id="home" class="hero">
            <div class="hero-container">
                <h1 class="hero-title">Halo, Saya [Nama Anda]</h1>
                <p class="hero-subtitle">Pelajar SMA Wahidiyah Kediri</p>
                <p class="hero-description">Saya adalah siswa yang antusias belajar web development.</p>
                <a href="#contact" class="btn btn-primary">Hubungi Saya</a>
            </div>
        </section>

        <section id="about" class="about">
            <div class="container">
                <h2>Tentang Saya</h2>
                <div class="about-content">
                    <div class="about-text">
                        <p>Saya adalah siswa SMA Wahidiyah Kediri yang tertarik dengan dunia teknologi.</p>
                    </div>
                    <div class="about-image">
                        <div class="placeholder-image">Foto Profil</div>
                    </div>
                </div>
            </div>
        </section>

        <section id="skills" class="skills">
            <div class="container">
                <h2>Keahlian Saya</h2>
                <div class="skills-grid">
                    <div class="skill-card">
                        <h3>HTML</h3>
                        <p>Struktur web</p>
                    </div>
                    <div class="skill-card">
                        <h3>CSS</h3>
                        <p>Styling web</p>
                    </div>
                    <div class="skill-card">
                        <h3>JS</h3>
                        <p>Interaktivitas</p>
                    </div>
                </div>
            </div>
        </section>

        <section id="contact" class="contact">
            <div class="container">
                <h2>Hubungi Saya</h2>
                <p>Email: nama@smawahidiyah.sch.id</p>
            </div>
        </section>
    </main>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2025 Portfolio Sederhana - SMA Wahidiyah</p>
        </div>
    </footer>

    <script src="script.js"></script>
</body>
</html>`,
    css: `/* Reset dan Base Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    background: #f8f9fa;
}

/* Navigation */
.header {
    background: #fff;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 1000;
}

.nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 70px;
}

.nav-title {
    color: #2c3e50;
    font-size: 1.5rem;
    font-weight: bold;
}

.nav-menu {
    display: flex;
    list-style: none;
    gap: 30px;
}

.nav-menu a {
    text-decoration: none;
    color: #333;
    font-weight: 500;
    transition: color 0.3s;
}

.nav-menu a:hover {
    color: #3498db;
}

/* Hero Section */
.hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 120px 0 80px;
    text-align: center;
    margin-top: 70px;
}

.hero-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 20px;
}

.hero-title {
    font-size: 3rem;
    margin-bottom: 10px;
    font-weight: bold;
}

.hero-subtitle {
    font-size: 1.2rem;
    margin-bottom: 20px;
    opacity: 0.9;
}

.hero-description {
    font-size: 1.1rem;
    margin-bottom: 30px;
    opacity: 0.8;
}

/* Buttons */
.btn {
    display: inline-block;
    padding: 12px 30px;
    text-decoration: none;
    border-radius: 5px;
    font-weight: 500;
    transition: all 0.3s;
    cursor: pointer;
    border: none;
}

.btn-primary {
    background: #3498db;
    color: white;
}

.btn-primary:hover {
    background: #2980b9;
    transform: translateY(-2px);
}

/* Sections */
section {
    padding: 80px 0;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

section h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 50px;
    color: #2c3e50;
}

/* About Section */
.about-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 50px;
    align-items: center;
}

.about-text p {
    margin-bottom: 20px;
    font-size: 1.1rem;
    line-height: 1.8;
}

.placeholder-image {
    background: #ecf0f1;
    border: 2px dashed #bdc3c7;
    border-radius: 10px;
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #7f8c8d;
    font-weight: 500;
}

/* Skills Section */
.skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
}

.skill-card {
    background: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    text-align: center;
    transition: transform 0.3s;
}

.skill-card:hover {
    transform: translateY(-5px);
}

.skill-card h3 {
    color: #2c3e50;
    margin-bottom: 10px;
    font-size: 1.3rem;
}

/* Contact Section */
.contact {
    text-align: center;
    background: white;
    padding: 40px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

/* Footer */
.footer {
    background: #2c3e50;
    color: white;
    text-align: center;
    padding: 30px 0;
}

.footer p {
    opacity: 0.8;
}

/* Responsive */
@media (max-width: 768px) {
    .nav-menu {
        display: none;
    }

    .hero-title {
        font-size: 2rem;
    }

    .about-content {
        grid-template-columns: 1fr;
        text-align: center;
    }

    .skills-grid {
        grid-template-columns: 1fr;
    }
}`,
    js: `// JavaScript untuk Portfolio
document.addEventListener('DOMContentLoaded', function() {
    console.log('Portfolio Sederhana - SMA Wahidiyah');

    // Smooth scrolling untuk navigasi
    const navLinks = document.querySelectorAll('.nav-menu a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Animasi fade-in saat scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
});`
  },
  {
    id: 'gallery-modal',
    name: 'Galeri Foto dengan Modal',
    description: 'Template galeri foto interaktif dengan modal popup untuk pemula menengah',
    category: 'intermediate',
    difficulty: 'ADVANCED',
    html: `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galeri Foto Interaktif</title>
</head>
<body>
    <div class="gallery-container">
        <header class="gallery-header">
            <h1>Galeri Foto SMA Wahidiyah</h1>
            <p>Klik foto untuk melihat versi besar</p>
        </header>

        <div id="gallery" class="gallery-grid">
            <!-- Foto akan ditambahkan oleh JavaScript -->
        </div>
    </div>

    <!-- Modal untuk foto besar -->
    <div id="modal" class="modal">
        <span class="close" id="closeModal">&times;</span>
        <img class="modal-content" id="modalImage" alt="Foto besar">
        <div class="caption" id="caption"></div>
        <button id="prevBtn" class="nav-btn">&lt;</button>
        <button id="nextBtn" class="nav-btn">&gt;</button>
    </div>

    <script src="script.js"></script>
</body>
</html>`,
    css: `/* Reset dan Base Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    background: #f8f9fa;
}

/* Gallery Container */
.gallery-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.gallery-header {
    text-align: center;
    margin-bottom: 40px;
    padding: 40px 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 15px;
}

.gallery-header h1 {
    font-size: 2.5rem;
    margin-bottom: 10px;
}

.gallery-header p {
    font-size: 1.1rem;
    opacity: 0.9;
}

/* Gallery Grid */
.gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
}

.gallery-item {
    position: relative;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.gallery-item:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 25px rgba(0,0,0,0.2);
}

.gallery-item img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    display: block;
}

/* Modal Styles */
.modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.9);
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.modal-content {
    margin: auto;
    display: block;
    max-width: 80%;
    max-height: 80%;
    border-radius: 10px;
    box-shadow: 0 0 50px rgba(0,0,0,0.5);
    animation: zoomIn 0.3s ease;
}

@keyframes zoomIn {
    from { transform: scale(0.8); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}

.close {
    position: absolute;
    top: 15px;
    right: 35px;
    color: #f1f1f1;
    font-size: 40px;
    font-weight: bold;
    cursor: pointer;
    transition: color 0.3s;
}

.close:hover {
    color: #bbb;
}

.caption {
    margin: 20px auto;
    width: 80%;
    text-align: center;
    color: #ccc;
    font-size: 18px;
    padding: 10px;
    background: rgba(0,0,0,0.5);
    border-radius: 5px;
}

.nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255,255,255,0.3);
    color: white;
    border: none;
    padding: 15px 20px;
    font-size: 24px;
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.3s;
}

.nav-btn:hover {
    background: rgba(255,255,255,0.5);
    transform: translateY(-50%) scale(1.1);
}

#prevBtn {
    left: 20px;
}

#nextBtn {
    right: 20px;
}

/* Loading placeholder */
.loading {
    background: #ecf0f1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #7f8c8d;
    font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
    .gallery-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 15px;
    }

    .gallery-header h1 {
        font-size: 2rem;
    }

    .modal-content {
        max-width: 90%;
        max-height: 70%;
    }

    .nav-btn {
        padding: 12px 16px;
        font-size: 20px;
    }

    #prevBtn {
        left: 10px;
    }

    #nextBtn {
        right: 10px;
    }
}

@media (max-width: 480px) {
    .gallery-grid {
        grid-template-columns: 1fr;
    }

    .nav-btn {
        display: none; /* Hide navigation buttons on very small screens */
    }
}`,
    js: `// Galeri Foto Interaktif - SMA Wahidiyah
document.addEventListener('DOMContentLoaded', function() {
    console.log('Galeri Foto Interaktif - SMA Wahidiyah');

    // Data foto (dalam production, ini akan dari API/database)
    const photos = [
        {
            src: 'https://picsum.photos/400/300?random=1',
            alt: 'Foto 1 - SMA Wahidiyah',
            caption: 'Kegiatan Belajar Mengajar'
        },
        {
            src: 'https://picsum.photos/400/300?random=2',
            alt: 'Foto 2 - SMA Wahidiyah',
            caption: 'Praktikum Laboratorium'
        },
        {
            src: 'https://picsum.photos/400/300?random=3',
            alt: 'Foto 3 - SMA Wahidiyah',
            caption: 'Kegiatan Ekstrakurikuler'
        },
        {
            src: 'https://picsum.photos/400/300?random=4',
            alt: 'Foto 4 - SMA Wahidiyah',
            caption: 'Acara Sekolah'
        },
        {
            src: 'https://picsum.photos/400/300?random=5',
            alt: 'Foto 5 - SMA Wahidiyah',
            caption: 'Sarana dan Prasarana'
        },
        {
            src: 'https://picsum.photos/400/300?random=6',
            alt: 'Foto 6 - SMA Wahidiyah',
            caption: 'Kegiatan Sosial'
        }
    ];

    let currentIndex = 0;
    const gallery = document.getElementById('gallery');
    const modal = document.getElementById('modal');
    const modalImage = document.getElementById('modalImage');
    const caption = document.getElementById('caption');
    const closeModal = document.getElementById('closeModal');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    // Fungsi untuk membuat galeri
    function createGallery() {
        photos.forEach((photo, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';

            const img = document.createElement('img');
            img.src = photo.src;
            img.alt = photo.alt;
            img.loading = 'lazy'; // Lazy loading untuk performa

            // Tambahkan loading state
            img.onload = function() {
                item.classList.remove('loading');
            };

            img.onerror = function() {
                item.innerHTML = '<div class="loading">Gagal memuat gambar</div>';
            };

            // Event listener untuk membuka modal
            item.addEventListener('click', () => openModal(index));

            item.appendChild(img);
            gallery.appendChild(item);
        });
    }

    // Fungsi untuk membuka modal
    function openModal(index) {
        currentIndex = index;
        const photo = photos[currentIndex];

        modalImage.src = photo.src;
        modalImage.alt = photo.alt;
        caption.textContent = photo.caption;

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling

        // Update navigation buttons
        updateNavigationButtons();
    }

    // Fungsi untuk menutup modal
    function closeModalFunc() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    }

    // Fungsi untuk navigasi
    function navigatePhoto(direction) {
        currentIndex += direction;

        if (currentIndex < 0) {
            currentIndex = photos.length - 1;
        } else if (currentIndex >= photos.length) {
            currentIndex = 0;
        }

        const photo = photos[currentIndex];
        modalImage.src = photo.src;
        modalImage.alt = photo.alt;
        caption.textContent = photo.caption;

        updateNavigationButtons();
    }

    // Fungsi untuk update tombol navigasi
    function updateNavigationButtons() {
        // Bisa ditambahkan logika untuk disable tombol jika hanya 1 foto
        // Untuk sekarang, tombol selalu aktif karena ada banyak foto
    }

    // Event listeners
    closeModal.addEventListener('click', closeModalFunc);
    prevBtn.addEventListener('click', () => navigatePhoto(-1));
    nextBtn.addEventListener('click', () => navigatePhoto(1));

    // Klik di luar modal untuk menutup
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModalFunc();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (modal.style.display === 'block') {
            switch(e.key) {
                case 'Escape':
                    closeModalFunc();
                    break;
                case 'ArrowLeft':
                    navigatePhoto(-1);
                    break;
                case 'ArrowRight':
                    navigatePhoto(1);
                    break;
            }
        }
    });

    // Touch/swipe support untuk mobile
    let touchStartX = 0;
    let touchEndX = 0;

    modal.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    });

    modal.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const swipeDistance = touchStartX - touchEndX;

        if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0) {
                // Swipe left - next photo
                navigatePhoto(1);
            } else {
                // Swipe right - previous photo
                navigatePhoto(-1);
            }
        }
    }

    // Initialize gallery
    createGallery();

    // Log untuk debugging
    console.log(\`Galeri dengan \${photos.length} foto berhasil dimuat\`);
});`
  }
];

export default WEB_LAB_TEMPLATES;
