import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateFirstTutorialArticle() {
  console.log('🎨 Updating first tutorial article with full content...');

  const fullContent = `
<div class="tutorial-content max-w-4xl mx-auto">
  <!-- Hero Section -->
  <div class="tutorial-hero bg-gradient-to-r from-pink-100 to-purple-100 p-8 rounded-2xl mb-8">
    <div class="flex items-center gap-4 mb-4">
      <div class="text-6xl">🎨</div>
      <div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Bikin Kartu Ucapan Digital yang Bikin Hati Berbunga!</h1>
        <p class="text-lg text-gray-600">Siap-siap bikin teman-teman kamu terpukau dengan kartu ucapan digital yang super keren! 💖</p>
      </div>
    </div>
    
    <div class="flex flex-wrap gap-4 mt-6">
      <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">⏱️ 15 menit</span>
      <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">🟢 Pemula Banget</span>
      <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">🔗 Project: Kartu Ucapan</span>
    </div>
  </div>

  <!-- Preview Image -->
  <div class="mb-8 text-center">
    <img src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80" 
         alt="Beautiful digital greeting card preview" 
         class="w-full max-w-2xl mx-auto rounded-lg shadow-lg">
    <p class="text-sm text-gray-500 mt-2">Preview hasil akhir: Kartu ucapan digital yang cantik! ✨</p>
  </div>

  <!-- Learning Objectives -->
  <div class="bg-blue-50 p-6 rounded-xl mb-8">
    <h2 class="text-2xl font-bold text-blue-800 mb-4">🎯 Yang Akan Kamu Pelajari:</h2>
    <div class="grid md:grid-cols-2 gap-4">
      <div class="flex items-start gap-3">
        <span class="text-green-500 text-xl">✅</span>
        <span>Membuat struktur HTML yang rapi dan semantik</span>
      </div>
      <div class="flex items-start gap-3">
        <span class="text-green-500 text-xl">✅</span>
        <span>Styling dengan CSS yang responsive dan cantik</span>
      </div>
      <div class="flex items-start gap-3">
        <span class="text-green-500 text-xl">✅</span>
        <span>Menambahkan interaktivitas dengan JavaScript</span>
      </div>
      <div class="flex items-start gap-3">
        <span class="text-green-500 text-xl">✅</span>
        <span>Bikin animasi sederhana yang eye-catching</span>
      </div>
    </div>
  </div>

  <!-- Prerequisites -->
  <div class="bg-yellow-50 p-6 rounded-xl mb-8">
    <h2 class="text-2xl font-bold text-yellow-800 mb-4">📋 Yang Perlu Kamu Siapkan:</h2>
    <ul class="space-y-2">
      <li class="flex items-center gap-3">
        <span class="text-yellow-500">📝</span>
        <span>Text editor kesayangan (VS Code recommended banget!)</span>
      </li>
      <li class="flex items-center gap-3">
        <span class="text-yellow-500">🌐</span>
        <span>Browser modern (Chrome, Firefox, atau Safari)</span>
      </li>
      <li class="flex items-center gap-3">
        <span class="text-yellow-500">☕</span>
        <span>Secangkir teh atau kopi biar makin fokus</span>
      </li>
      <li class="flex items-center gap-3">
        <span class="text-yellow-500">🔥</span>
        <span>Semangat belajar yang membara!</span>
      </li>
    </ul>
  </div>

  <!-- Main Tutorial Steps -->
  <div class="tutorial-steps space-y-12">
    <h2 class="text-3xl font-bold text-center text-gray-800 mb-8">🚀 Mari Kita Mulai Petualangan Coding!</h2>
    
    <!-- Step 1: HTML Structure -->
    <div class="step bg-white border-l-4 border-pink-400 p-6 rounded-r-xl shadow-sm">
      <div class="flex items-center gap-3 mb-4">
        <span class="bg-pink-100 text-pink-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">1</span>
        <h3 class="text-2xl font-bold text-gray-800">📝 Step 1: Bikin Struktur HTML yang Kece!</h3>
      </div>
      
      <p class="text-gray-600 mb-4">
        Pertama-tama, kita bikin kerangka kartu ucapan kita. Anggap aja ini kayak bikin blueprint rumah sebelum mulai bangun! 🏗️
      </p>

      <div class="bg-gray-50 p-4 rounded-lg mb-4">
        <p class="text-sm text-gray-600 mb-2">📁 Buat file baru: <code class="bg-gray-200 px-2 py-1 rounded">greeting-card.html</code></p>
      </div>

      <pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm"><code>&lt;!DOCTYPE html&gt;
&lt;html lang="id"&gt;
&lt;head&gt;
    &lt;meta charset="UTF-8"&gt;
    &lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;
    &lt;title&gt;Kartu Ucapan Digital Kece! 🎨&lt;/title&gt;
    &lt;link rel="stylesheet" href="style.css"&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;div class="container"&gt;
        &lt;div class="greeting-card" id="greetingCard"&gt;
            &lt;div class="card-header"&gt;
                &lt;h1&gt;🎉 Selamat Ulang Tahun! 🎉&lt;/h1&gt;
            &lt;/div&gt;
            
            &lt;div class="card-body"&gt;
                &lt;div class="message-area"&gt;
                    &lt;p id="mainMessage"&gt;
                        Semoga hari spesial kamu dipenuhi dengan kebahagiaan, 
                        tawa, dan momen-momen indah yang tak terlupakan! ✨
                    &lt;/p&gt;
                &lt;/div&gt;
                
                &lt;div class="decorations"&gt;
                    &lt;span class="emoji"&gt;🎂&lt;/span&gt;
                    &lt;span class="emoji"&gt;🎈&lt;/span&gt;
                    &lt;span class="emoji"&gt;🎁&lt;/span&gt;
                &lt;/div&gt;
            &lt;/div&gt;
            
            &lt;div class="card-footer"&gt;
                &lt;p&gt;Dengan cinta, &lt;span id="senderName"&gt;Sahabat Terbaik&lt;/span&gt; 💖&lt;/p&gt;
            &lt;/div&gt;
        &lt;/div&gt;
        
        &lt;div class="controls"&gt;
            &lt;button id="changeThemeBtn"&gt;🎨 Ganti Tema&lt;/button&gt;
            &lt;button id="changeMessageBtn"&gt;💌 Ganti Pesan&lt;/button&gt;
        &lt;/div&gt;
    &lt;/div&gt;
    
    &lt;script src="script.js"&gt;&lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;</code></pre>

      <div class="bg-blue-50 p-4 rounded-lg mt-4">
        <h4 class="font-bold text-blue-800 mb-2">🤔 Penjelasan Kode:</h4>
        <ul class="text-sm text-blue-700 space-y-1">
          <li><strong>container:</strong> Wadah utama yang mengatur tata letak</li>
          <li><strong>greeting-card:</strong> Kartu ucapan utama kita</li>
          <li><strong>card-header/body/footer:</strong> Bagian-bagian kartu yang terstruktur</li>
          <li><strong>controls:</strong> Tombol-tombol untuk interaksi</li>
        </ul>
      </div>
    </div>

    <!-- Step 2: CSS Styling -->
    <div class="step bg-white border-l-4 border-purple-400 p-6 rounded-r-xl shadow-sm">
      <div class="flex items-center gap-3 mb-4">
        <span class="bg-purple-100 text-purple-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">2</span>
        <h3 class="text-2xl font-bold text-gray-800">🎨 Step 2: Bikin Styling yang Bikin Mata Berbinar!</h3>
      </div>
      
      <p class="text-gray-600 mb-4">
        Sekarang saatnya bikin kartu kita jadi cantik! Bayangin kita lagi nge-dress up kartu kita dengan outfit terbaik! 👗✨
      </p>

      <div class="bg-gray-50 p-4 rounded-lg mb-4">
        <p class="text-sm text-gray-600 mb-2">📁 Buat file baru: <code class="bg-gray-200 px-2 py-1 rounded">style.css</code></p>
      </div>

      <pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm"><code>/* Reset dan base styling */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Poppins', 'Comic Neue', cursive;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.container {
    text-align: center;
    max-width: 500px;
    width: 100%;
}

/* Styling kartu utama */
.greeting-card {
    background: linear-gradient(145deg, #ffffff, #f0f0f0);
    border-radius: 20px;
    padding: 30px;
    box-shadow: 
        0 20px 40px rgba(0,0,0,0.1),
        0 15px 25px rgba(0,0,0,0.1);
    transform: perspective(1000px) rotateX(5deg);
    transition: all 0.3s ease;
    margin-bottom: 30px;
    position: relative;
    overflow: hidden;
}

.greeting-card:hover {
    transform: perspective(1000px) rotateX(0deg) translateY(-10px);
    box-shadow: 
        0 30px 60px rgba(0,0,0,0.15),
        0 20px 35px rgba(0,0,0,0.1);
}

/* Dekorasi background */
.greeting-card::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,182,193,0.1) 0%, transparent 70%);
    animation: rotate 20s linear infinite;
    pointer-events: none;
}

@keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

/* Header styling */
.card-header h1 {
    color: #e91e63;
    font-size: 2.2rem;
    margin-bottom: 20px;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
    animation: bounce 2s ease-in-out infinite alternate;
}

@keyframes bounce {
    from { transform: translateY(0px); }
    to { transform: translateY(-5px); }
}

/* Body content */
.card-body {
    margin: 25px 0;
}

.message-area {
    background: rgba(255,255,255,0.8);
    padding: 20px;
    border-radius: 15px;
    margin-bottom: 20px;
    border: 2px solid rgba(233,30,99,0.2);
}

#mainMessage {
    color: #555;
    font-size: 1.1rem;
    line-height: 1.6;
    font-weight: 400;
}

/* Dekorasi emoji */
.decorations {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin: 20px 0;
}

.emoji {
    font-size: 2.5rem;
    animation: float 3s ease-in-out infinite;
    cursor: pointer;
    transition: transform 0.3s ease;
}

.emoji:nth-child(1) { animation-delay: 0s; }
.emoji:nth-child(2) { animation-delay: 1s; }
.emoji:nth-child(3) { animation-delay: 2s; }

.emoji:hover {
    transform: scale(1.3) rotate(15deg);
}

@keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
}

/* Footer */
.card-footer {
    color: #777;
    font-style: italic;
    font-size: 1rem;
}

#senderName {
    color: #e91e63;
    font-weight: bold;
}

/* Controls */
.controls {
    display: flex;
    gap: 15px;
    justify-content: center;
    flex-wrap: wrap;
}

button {
    background: linear-gradient(145deg, #e91e63, #ad1457);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 25px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(233,30,99,0.3);
    font-weight: 600;
}

button:hover {
    background: linear-gradient(145deg, #ad1457, #880e4f);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(233,30,99,0.4);
}

button:active {
    transform: translateY(0);
}

/* Tema alternatif */
.theme-ocean .greeting-card {
    background: linear-gradient(145deg, #e3f2fd, #bbdefb);
}

.theme-ocean .card-header h1 {
    color: #1976d2;
}

.theme-ocean button {
    background: linear-gradient(145deg, #1976d2, #1565c0);
}

.theme-forest .greeting-card {
    background: linear-gradient(145deg, #e8f5e8, #c8e6c9);
}

.theme-forest .card-header h1 {
    color: #388e3c;
}

.theme-forest button {
    background: linear-gradient(145deg, #388e3c, #2e7d32);
}

/* Responsive design */
@media (max-width: 600px) {
    .greeting-card {
        padding: 20px;
        margin: 10px;
    }
    
    .card-header h1 {
        font-size: 1.8rem;
    }
    
    .controls {
        flex-direction: column;
        align-items: center;
    }
    
    button {
        width: 100%;
        max-width: 250px;
    }
}</code></pre>

      <div class="mb-4">
        <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80" 
             alt="CSS styling process illustration" 
             class="w-full max-w-md mx-auto rounded-lg shadow-md">
        <p class="text-sm text-gray-500 mt-2 text-center">Proses styling: dari polos jadi keren! 🎨</p>
      </div>

      <div class="bg-purple-50 p-4 rounded-lg mt-4">
        <h4 class="font-bold text-purple-800 mb-2">✨ Fitur Keren yang Kita Tambahkan:</h4>
        <ul class="text-sm text-purple-700 space-y-1">
          <li><strong>Gradient Background:</strong> Warna latar yang smooth dan elegan</li>
          <li><strong>Hover Effects:</strong> Kartu "naik" saat di-hover</li>
          <li><strong>Animations:</strong> Emoji yang mengambang dan judul yang bouncing</li>
          <li><strong>Responsive Design:</strong> Tampil cantik di semua ukuran layar</li>
        </ul>
      </div>
    </div>

    <!-- Step 3: JavaScript Interactivity -->
    <div class="step bg-white border-l-4 border-green-400 p-6 rounded-r-xl shadow-sm">
      <div class="flex items-center gap-3 mb-4">
        <span class="bg-green-100 text-green-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">3</span>
        <h3 class="text-2xl font-bold text-gray-800">⚡ Step 3: Bikin Interaksi yang Bikin Kaget!</h3>
      </div>
      
      <p class="text-gray-600 mb-4">
        Nah, sekarang kita kasih "nyawa" ke kartu kita! JavaScript akan bikin kartu kita bisa berinteraksi kayak robot pintar! 🤖
      </p>

      <div class="bg-gray-50 p-4 rounded-lg mb-4">
        <p class="text-sm text-gray-600 mb-2">📁 Buat file baru: <code class="bg-gray-200 px-2 py-1 rounded">script.js</code></p>
      </div>

      <pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm"><code>// 🎯 Data pesan dan tema yang bisa dipilih
const messages = [
    "Semoga hari spesial kamu dipenuhi dengan kebahagiaan, tawa, dan momen-momen indah yang tak terlupakan! ✨",
    "Selamat ulang tahun! Semoga tahun ini membawa lebih banyak petualangan seru dan mimpi yang jadi kenyataan! 🌟",
    "Happy birthday! Kamu makin dewasa, makin keren, dan makin amazing setiap tahunnya! 🎊",
    "Ulang tahun adalah waktu untuk merayakan betapa spesialnya kamu! Have an awesome day! 🎉",
    "Semoga di tahun baru ini kamu selalu dikelilingi orang-orang terkasih dan kebahagiaan! 💕"
];

const themes = ['default', 'theme-ocean', 'theme-forest'];
let currentThemeIndex = 0;
let currentMessageIndex = 0;

// 🎨 Fungsi untuk mengganti tema
function changeTheme() {
    const card = document.getElementById('greetingCard');
    const body = document.body;
    
    // Remove semua tema yang ada
    themes.forEach(theme => {
        body.classList.remove(theme);
    });
    
    // Pindah ke tema berikutnya
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    
    // Apply tema baru (kecuali default)
    if (themes[currentThemeIndex] !== 'default') {
        body.classList.add(themes[currentThemeIndex]);
    }
    
    // Efek transisi yang smooth
    card.style.transform = 'scale(0.95)';
    setTimeout(() => {
        card.style.transform = 'scale(1)';
    }, 150);
    
    // Tampilkan notifikasi tema
    const themeNames = {
        'default': 'Pink Classic 💖',
        'theme-ocean': 'Ocean Blue 🌊', 
        'theme-forest': 'Forest Green 🌲'
    };
    
    showNotification(\`Tema berubah ke: \${themeNames[themes[currentThemeIndex]]}\`);
}

// 💌 Fungsi untuk mengganti pesan
function changeMessage() {
    const messageElement = document.getElementById('mainMessage');
    
    // Efek fade out
    messageElement.style.opacity = '0';
    messageElement.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        // Ganti ke pesan berikutnya
        currentMessageIndex = (currentMessageIndex + 1) % messages.length;
        messageElement.textContent = messages[currentMessageIndex];
        
        // Efek fade in
        messageElement.style.opacity = '1';
        messageElement.style.transform = 'translateY(0)';
    }, 300);
    
    showNotification('Pesan berhasil diganti! 💌');
}

// 🔔 Fungsi untuk menampilkan notifikasi
function showNotification(message) {
    // Buat elemen notifikasi
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = \`
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(145deg, #4caf50, #45a049);
        color: white;
        padding: 12px 20px;
        border-radius: 25px;
        box-shadow: 0 4px 15px rgba(76,175,80,0.3);
        z-index: 1000;
        font-weight: 600;
        transform: translateX(300px);
        transition: all 0.3s ease;
    \`;
    
    document.body.appendChild(notification);
    
    // Animasi masuk
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Hapus notifikasi setelah 3 detik
    setTimeout(() => {
        notification.style.transform = 'translateX(300px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 🎪 Fungsi untuk efek klik pada emoji
function addEmojiClickEffects() {
    const emojis = document.querySelectorAll('.emoji');
    
    emojis.forEach(emoji => {
        emoji.addEventListener('click', function() {
            // Efek "explode" sederhana
            const originalSize = this.style.fontSize || '2.5rem';
            
            this.style.transform = 'scale(1.5) rotate(360deg)';
            this.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                this.style.transform = 'scale(1) rotate(0deg)';
            }, 500);
            
            // Buat partikel mini (opsional)
            createParticles(this);
        });
    });
}

// ✨ Fungsi untuk membuat efek partikel sederhana
function createParticles(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.textContent = '✨';
        particle.style.cssText = \`
            position: fixed;
            left: \${centerX}px;
            top: \${centerY}px;
            font-size: 1rem;
            pointer-events: none;
            z-index: 1000;
            animation: particleFloat 1s ease-out forwards;
        \`;
        
        // Random direction untuk setiap partikel
        const angle = (i / 5) * Math.PI * 2;
        const distance = 50;
        const endX = centerX + Math.cos(angle) * distance;
        const endY = centerY + Math.sin(angle) * distance;
        
        particle.style.transform = \`translate(\${endX - centerX}px, \${endY - centerY}px)\`;
        
        document.body.appendChild(particle);
        
        // Hapus partikel setelah animasi selesai
        setTimeout(() => {
            if (document.body.contains(particle)) {
                document.body.removeChild(particle);
            }
        }, 1000);
    }
}

// 🚀 Event listeners untuk tombol
document.addEventListener('DOMContentLoaded', function() {
    // Tombol ganti tema
    document.getElementById('changeThemeBtn').addEventListener('click', changeTheme);
    
    // Tombol ganti pesan
    document.getElementById('changeMessageBtn').addEventListener('click', changeMessage);
    
    // Efek klik emoji
    addEmojiClickEffects();
    
    // Welcome message
    setTimeout(() => {
        showNotification('Selamat datang! Coba klik tombol-tombol di bawah! 🎉');
    }, 1000);
});

// 🎨 CSS untuk animasi partikel
const style = document.createElement('style');
style.textContent = \`
    @keyframes particleFloat {
        0% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
        }
        100% {
            opacity: 0;
            transform: translate(var(--x, 0), var(--y, 0)) scale(0);
        }
    }
\`;
document.head.appendChild(style);</code></pre>

      <div class="mb-4">
        <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80" 
             alt="JavaScript interactivity illustration" 
             class="w-full max-w-md mx-auto rounded-lg shadow-md">
        <p class="text-sm text-gray-500 mt-2 text-center">JavaScript membuat website jadi hidup dan interaktif! ⚡</p>
      </div>

      <div class="bg-green-50 p-4 rounded-lg mt-4">
        <h4 class="font-bold text-green-800 mb-2">🎪 Fitur Interaktif yang Kita Buat:</h4>
        <ul class="text-sm text-green-700 space-y-1">
          <li><strong>Theme Switcher:</strong> Ganti warna kartu dengan 3 tema berbeda</li>
          <li><strong>Message Rotator:</strong> 5 pesan ucapan yang berbeda-beda</li>
          <li><strong>Emoji Effects:</strong> Klik emoji untuk efek animasi keren</li>
          <li><strong>Notifications:</strong> Popup notifikasi yang smooth</li>
          <li><strong>Particle Effects:</strong> Efek partikel sederhana saat klik emoji</li>
        </ul>
      </div>
    </div>

    <!-- Step 4: Testing & Final Touches -->
    <div class="step bg-white border-l-4 border-orange-400 p-6 rounded-r-xl shadow-sm">
      <div class="flex items-center gap-3 mb-4">
        <span class="bg-orange-100 text-orange-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">4</span>
        <h3 class="text-2xl font-bold text-gray-800">🧪 Step 4: Testing & Finishing Touches!</h3>
      </div>
      
      <p class="text-gray-600 mb-4">
        Sekarang saatnya test semua fitur kita dan pastikan semuanya berjalan dengan sempurna! 🕵️‍♀️
      </p>

      <div class="bg-orange-50 p-4 rounded-lg">
        <h4 class="font-bold text-orange-800 mb-3">✅ Checklist Testing:</h4>
        <div class="grid md:grid-cols-2 gap-4 text-sm">
          <div class="space-y-2">
            <label class="flex items-center gap-2">
              <input type="checkbox" class="rounded"> 
              <span>Kartu tampil dengan benar</span>
            </label>
            <label class="flex items-center gap-2">
              <input type="checkbox" class="rounded"> 
              <span>Tombol ganti tema berfungsi</span>
            </label>
            <label class="flex items-center gap-2">
              <input type="checkbox" class="rounded"> 
              <span>Tombol ganti pesan berfungsi</span>
            </label>
            <label class="flex items-center gap-2">
              <input type="checkbox" class="rounded"> 
              <span>Emoji bisa diklik dengan efek</span>
            </label>
          </div>
          <div class="space-y-2">
            <label class="flex items-center gap-2">
              <input type="checkbox" class="rounded"> 
              <span>Responsive di mobile</span>
            </label>
            <label class="flex items-center gap-2">
              <input type="checkbox" class="rounded"> 
              <span>Animasi berjalan smooth</span>
            </label>
            <label class="flex items-center gap-2">
              <input type="checkbox" class="rounded"> 
              <span>Notifikasi muncul dengan benar</span>
            </label>
            <label class="flex items-center gap-2">
              <input type="checkbox" class="rounded"> 
              <span>Tidak ada error di console</span>
            </label>
          </div>
        </div>
      </div>

      <div class="mt-6">
        <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80" 
             alt="Testing and debugging process" 
             class="w-full max-w-md mx-auto rounded-lg shadow-md">
        <p class="text-sm text-gray-500 mt-2 text-center">Testing adalah bagian penting dalam development! 🧪</p>
      </div>
    </div>
  </div>

  <!-- Fun Facts Section -->
  <div class="bg-gradient-to-r from-yellow-50 to-orange-50 p-8 rounded-2xl mt-12">
    <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">💡 Fun Facts & Tips Keren!</h2>
    
    <div class="grid md:grid-cols-2 gap-6">
      <div class="bg-white p-4 rounded-xl shadow-sm">
        <h3 class="font-bold text-purple-600 mb-2">🎨 Design Tips:</h3>
        <ul class="text-sm space-y-1">
          <li>• Gunakan maksimal 3 warna utama agar tidak "norak"</li>
          <li>• Border-radius 15px+ bikin tampilan lebih modern</li>
          <li>• Box-shadow dengan opacity rendah terlihat lebih natural</li>
        </ul>
      </div>
      
      <div class="bg-white p-4 rounded-xl shadow-sm">
        <h3 class="font-bold text-blue-600 mb-2">⚡ JavaScript Pro Tips:</h3>
        <ul class="text-sm space-y-1">
          <li>• Selalu pakai 'const' untuk data yang tidak berubah</li>
          <li>• setTimeout() bikin animasi lebih smooth</li>
          <li>• Event delegation lebih efisien untuk banyak element</li>
        </ul>
      </div>
      
      <div class="bg-white p-4 rounded-xl shadow-sm">
        <h3 class="font-bold text-green-600 mb-2">📱 Responsive Magic:</h3>
        <ul class="text-sm space-y-1">
          <li>• Mobile-first approach lebih mudah</li>
          <li>• Flexbox untuk layout, Grid untuk structure</li>
          <li>• Test di Chrome DevTools device emulator</li>
        </ul>
      </div>
      
      <div class="bg-white p-4 rounded-xl shadow-sm">
        <h3 class="font-bold text-red-600 mb-2">🚀 Performance Hacks:</h3>
        <ul class="text-sm space-y-1">
          <li>• CSS animations lebih cepat dari JavaScript</li>
          <li>• Compress gambar dengan TinyPNG</li>
          <li>• Minify CSS/JS untuk production</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Next Steps Section -->
  <div class="bg-gradient-to-r from-pink-50 to-purple-50 p-8 rounded-2xl mt-8">
    <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">🎊 Selamat! Apa Selanjutnya?</h2>
    
    <div class="text-center mb-6">
      <p class="text-lg text-gray-600">
        Kamu udah berhasil bikin kartu ucapan digital yang keren banget! 🎉
      </p>
    </div>
    
    <div class="grid md:grid-cols-3 gap-4">
      <div class="bg-white p-4 rounded-xl text-center">
        <div class="text-3xl mb-2">🎨</div>
        <h3 class="font-bold mb-2">Customize More!</h3>
        <p class="text-sm text-gray-600">Tambah tema, warna, atau efek animasi yang lebih keren lagi!</p>
      </div>
      
      <div class="bg-white p-4 rounded-xl text-center">
        <div class="text-3xl mb-2">📤</div>
        <h3 class="font-bold mb-2">Share Project!</h3>
        <p class="text-sm text-gray-600">Upload ke GitHub atau bagikan ke teman-teman biar pada kagum!</p>
      </div>
      
      <div class="bg-white p-4 rounded-xl text-center">
        <div class="text-3xl mb-2">📚</div>
        <h3 class="font-bold mb-2">Next Tutorial!</h3>
        <p class="text-sm text-gray-600">Lanjut ke tutorial selanjutnya: "Galeri Foto Responsif"!</p>
      </div>
    </div>
    
    <div class="text-center mt-6">
      <div class="inline-flex gap-4">
        <button class="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-full transition-colors">
          📸 Tutorial Selanjutnya
        </button>
        <button class="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-full transition-colors">
          🎯 Back to Roadmap
        </button>
      </div>
    </div>
  </div>

  <!-- Final Demo -->
  <div class="text-center mt-12">
    <h3 class="text-xl font-bold text-gray-800 mb-4">🎬 Hasil Akhir Kamu Akan Seperti Ini:</h3>
    <img src="https://images.unsplash.com/photo-1586473219010-2ffc57b0d282?w=800&q=80" 
         alt="Final result preview of the greeting card" 
         class="w-full max-w-2xl mx-auto rounded-lg shadow-lg">
    <p class="text-sm text-gray-500 mt-4">
      Kartu ucapan digital yang interaktif dan cantik! ✨<br>
      Siap bikin teman-teman kamu terpukau! 🤩
    </p>
  </div>
</div>
  `;

  try {
    // Update artikel pertama dengan konten lengkap
    const updatedArticle = await prisma.article.update({
      where: {
        slug: 'tutorial-kartu-ucapan-interaktif-html-css'
      },
      data: {
        content: fullContent,
        imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80',
        status: 'published', // Change to published since content is now complete
        publishedAt: new Date()
      }
    });

    console.log(`✅ Successfully updated article: ${updatedArticle.title}`);
    console.log(`🔗 Slug: ${updatedArticle.slug}`);
    console.log(`📖 Content length: ${fullContent.length} characters`);
    console.log(`📅 Published at: ${updatedArticle.publishedAt}`);
    
    // Show article stats
    const totalArticles = await prisma.article.count();
    const publishedArticles = await prisma.article.count({ where: { status: 'published' } });
    const draftArticles = await prisma.article.count({ where: { status: 'draft' } });
    
    console.log(`\n📊 Article Statistics:`);
    console.log(`   Total: ${totalArticles}`);
    console.log(`   Published: ${publishedArticles}`);
    console.log(`   Draft: ${draftArticles}`);

  } catch (error) {
    console.error('❌ Error updating article:', error);
  }
}

updateFirstTutorialArticle()
  .catch((e) => {
    console.error('💥 Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });