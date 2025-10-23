import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateSecondTutorialArticle() {
  console.log('✨ Updating second tutorial article with full content...');

  const fullContent = `
<div class="tutorial-content max-w-4xl mx-auto">
  <!-- Hero Section -->
  <div class="tutorial-hero bg-gradient-to-r from-purple-100 to-pink-100 p-8 rounded-2xl mb-8">
    <div class="flex items-center gap-4 mb-4">
      <div class="text-6xl">✨</div>
      <div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Rahasia CSS yang Bikin Website Kamu Makin Kece!</h1>
        <p class="text-lg text-gray-600">Discover the magic behind beautiful websites! Mari kita eksplorasi dunia CSS yang penuh warna dan kreativitas! 🎨</p>
      </div>
    </div>
    
    <div class="flex flex-wrap gap-4 mt-6">
      <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">⏱️ 12 menit</span>
      <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">🟢 Pemula Plus</span>
      <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">🔗 Project: CSS Styling</span>
    </div>
  </div>

  <!-- Preview Image -->
  <div class="mb-8 text-center">
    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80" 
         alt="Creative CSS styling and web design process" 
         class="w-full max-w-2xl mx-auto rounded-lg shadow-lg">
    <p class="text-sm text-gray-500 mt-2">CSS adalah magic wand yang mengubah HTML biasa jadi website yang WOW! ✨</p>
  </div>

  <!-- Learning Objectives -->
  <div class="bg-purple-50 p-6 rounded-xl mb-8">
    <h2 class="text-2xl font-bold text-purple-800 mb-4">🎯 Yang Akan Kamu Kuasai:</h2>
    <div class="grid md:grid-cols-2 gap-4">
      <div class="flex items-start gap-3">
        <span class="text-green-500 text-xl">✅</span>
        <span>CSS Selectors yang powerful buat targeting elements</span>
      </div>
      <div class="flex items-start gap-3">
        <span class="text-green-500 text-xl">✅</span>
        <span>Color theory dan color palettes yang eye-catching</span>
      </div>
      <div class="flex items-start gap-3">
        <span class="text-green-500 text-xl">✅</span>
        <span>Typography magic untuk readable dan beautiful text</span>
      </div>
      <div class="flex items-start gap-3">
        <span class="text-green-500 text-xl">✅</span>
        <span>Layout techniques dengan Flexbox dan positioning</span>
      </div>
      <div class="flex items-start gap-3">
        <span class="text-green-500 text-xl">✅</span>
        <span>Modern CSS tricks yang bikin website jadi modern</span>
      </div>
      <div class="flex items-start gap-3">
        <span class="text-green-500 text-xl">✅</span>
        <span>Responsive design principles untuk all devices</span>
      </div>
    </div>
  </div>

  <!-- Prerequisites -->
  <div class="bg-yellow-50 p-6 rounded-xl mb-8">
    <h2 class="text-2xl font-bold text-yellow-800 mb-4">📋 Yang Perlu Kamu Siapkan:</h2>
    <ul class="space-y-2">
      <li class="flex items-center gap-3">
        <span class="text-yellow-500">🌟</span>
        <span>Pengetahuan HTML dasar (sudah paham tag dan struktur)</span>
      </li>
      <li class="flex items-center gap-3">
        <span class="text-yellow-500">🎨</span>
        <span>Mata yang siap dimanjakan dengan visual yang cantik</span>
      </li>
      <li class="flex items-center gap-3">
        <span class="text-yellow-500">💻</span>
        <span>Browser modern dengan Developer Tools</span>
      </li>
      <li class="flex items-center gap-3">
        <span class="text-yellow-500">☕</span>
        <span>Mood yang excited untuk eksplorasi dunia styling!</span>
      </li>
    </ul>
  </div>

  <!-- Main Tutorial Steps -->
  <div class="tutorial-steps space-y-12">
    <h2 class="text-3xl font-bold text-center text-gray-800 mb-8">🚀 Mari Jelajahi Dunia CSS yang Ajaib!</h2>
    
    <!-- Step 1: CSS Selectors Master -->
    <div class="step bg-white border-l-4 border-pink-400 p-6 rounded-r-xl shadow-sm">
      <div class="flex items-center gap-3 mb-4">
        <span class="bg-pink-100 text-pink-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">1</span>
        <h3 class="text-2xl font-bold text-gray-800">🎯 Step 1: Master CSS Selectors - Jadi Sniper Element!</h3>
      </div>
      
      <p class="text-gray-600 mb-4">
        CSS selectors itu kayak magic wand yang bisa "point and style" ke element manapun yang kamu mau! Mari kita pelajari cara jadi master selector! 🪄
      </p>

      <div class="bg-gray-50 p-4 rounded-lg mb-4">
        <p class="text-sm text-gray-600 mb-2">🎭 <strong>Demo HTML Structure:</strong></p>
      </div>

      <pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm mb-4"><code>&lt;!-- HTML yang akan kita style --&gt;
&lt;div class="container"&gt;
    &lt;header class="main-header"&gt;
        &lt;h1 id="site-title"&gt;CSS Magic Show! ✨&lt;/h1&gt;
        &lt;nav class="navigation"&gt;
            &lt;a href="#home" class="nav-link active"&gt;Home&lt;/a&gt;
            &lt;a href="#about" class="nav-link"&gt;About&lt;/a&gt;
            &lt;a href="#contact" class="nav-link"&gt;Contact&lt;/a&gt;
        &lt;/nav&gt;
    &lt;/header&gt;
    
    &lt;main class="content"&gt;
        &lt;section class="hero-section"&gt;
            &lt;h2&gt;Welcome to the Show!&lt;/h2&gt;
            &lt;p class="intro-text"&gt;Prepare to be amazed! 🎪&lt;/p&gt;
            &lt;button class="cta-button primary"&gt;Let's Start!&lt;/button&gt;
        &lt;/section&gt;
        
        &lt;section class="features"&gt;
            &lt;div class="feature-card"&gt;
                &lt;h3&gt;Amazing Colors&lt;/h3&gt;
                &lt;p&gt;Colors that pop!&lt;/p&gt;
            &lt;/div&gt;
            &lt;div class="feature-card"&gt;
                &lt;h3&gt;Beautiful Typography&lt;/h3&gt;
                &lt;p&gt;Text that sings!&lt;/p&gt;
            &lt;/div&gt;
        &lt;/section&gt;
    &lt;/main&gt;
&lt;/div&gt;</code></pre>

      <p class="text-gray-600 mb-4">Sekarang mari kita style dengan berbagai selector yang powerful:</p>

      <pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm"><code>/* 🎯 BASIC SELECTORS - The Foundation */

/* Element Selector - Target semua tag tertentu */
h1 {
    color: #e91e63;
    font-size: 2.5rem;
    text-align: center;
}

/* Class Selector - Target element dengan class tertentu */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

/* ID Selector - Target element unik dengan ID */
#site-title {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: bold;
}

/* 🚀 ADVANCED SELECTORS - The Power Moves */

/* Descendant Selector - Target child di dalam parent */
.navigation a {
    text-decoration: none;
    color: #555;
    padding: 10px 15px;
    border-radius: 5px;
    transition: all 0.3s ease;
}

/* Child Selector - Target direct child saja */
.features > .feature-card {
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    margin-bottom: 20px;
}

/* Pseudo-class Selectors - Target state tertentu */
.nav-link:hover {
    background: #667eea;
    color: white;
    transform: translateY(-2px);
}

.nav-link.active {
    background: #764ba2;
    color: white;
    font-weight: bold;
}

/* Attribute Selector - Target berdasarkan attribute */
button[class*="primary"] {
    background: linear-gradient(45deg, #ff6b6b, #feca57);
    color: white;
    border: none;
    padding: 15px 30px;
    border-radius: 25px;
    cursor: pointer;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
}

/* 🎪 COMBINATOR SELECTORS - The Relationship Masters */

/* Adjacent Sibling - Element yang langsung bersebelahan */
h2 + p {
    font-size: 1.2rem;
    color: #666;
    font-style: italic;
}

/* General Sibling - Semua siblings setelahnya */
.hero-section ~ section {
    margin-top: 40px;
}

/* 🌟 PSEUDO-ELEMENT SELECTORS - The Magic Touch */

/* Before dan After - Tambah content virtual */
.feature-card::before {
    content: "✨";
    font-size: 2rem;
    display: block;
    text-align: center;
    margin-bottom: 10px;
}

.cta-button::after {
    content: " →";
    transition: transform 0.3s ease;
}

.cta-button:hover::after {
    transform: translateX(5px);
}

/* First/Last Child - Target posisi tertentu */
.feature-card:first-child {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.feature-card:last-child {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
}</code></pre>

      <div class="mb-4">
        <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80" 
             alt="CSS selectors targeting demonstration" 
             class="w-full max-w-md mx-auto rounded-lg shadow-md">
        <p class="text-sm text-gray-500 mt-2 text-center">CSS selectors bekerja seperti sniper yang presisi! 🎯</p>
      </div>

      <div class="bg-pink-50 p-4 rounded-lg mt-4">
        <h4 class="font-bold text-pink-800 mb-2">🎯 Pro Tips untuk Selectors:</h4>
        <ul class="text-sm text-pink-700 space-y-1">
          <li><strong>Specificity Rules:</strong> ID (100) > Class (10) > Element (1)</li>
          <li><strong>Be Specific, Not Overspecific:</strong> .nav-link lebih baik dari div.container nav ul li a</li>
          <li><strong>Use Meaningful Names:</strong> .primary-button lebih baik dari .blue-btn</li>
          <li><strong>Combine Selectors:</strong> .card.featured untuk multi-class targeting</li>
        </ul>
      </div>
    </div>

    <!-- Step 2: Color Theory & Palettes -->
    <div class="step bg-white border-l-4 border-purple-400 p-6 rounded-r-xl shadow-sm">
      <div class="flex items-center gap-3 mb-4">
        <span class="bg-purple-100 text-purple-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">2</span>
        <h3 class="text-2xl font-bold text-gray-800">🌈 Step 2: Color Theory - Bikin Website yang Eye-Catching!</h3>
      </div>
      
      <p class="text-gray-600 mb-4">
        Warna itu bahasa universal yang bisa bikin orang langsung "feel the vibe" website kamu! Mari kita pelajari science di balik pemilihan warna yang bikin website jadi memorable! 🎨
      </p>

      <div class="bg-purple-50 p-4 rounded-lg mb-4">
        <h4 class="font-bold text-purple-800 mb-2">🎨 Color Harmony Types:</h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div class="bg-blue-100 p-2 rounded text-center">
            <div class="w-6 h-6 bg-blue-500 rounded mx-auto mb-1"></div>
            <span class="text-blue-800">Monochromatic</span>
          </div>
          <div class="bg-green-100 p-2 rounded text-center">
            <div class="flex gap-1 justify-center mb-1">
              <div class="w-3 h-6 bg-blue-500 rounded"></div>
              <div class="w-3 h-6 bg-orange-500 rounded"></div>
            </div>
            <span class="text-green-800">Complementary</span>
          </div>
          <div class="bg-yellow-100 p-2 rounded text-center">
            <div class="flex gap-1 justify-center mb-1">
              <div class="w-2 h-6 bg-red-500 rounded"></div>
              <div class="w-2 h-6 bg-yellow-500 rounded"></div>
              <div class="w-2 h-6 bg-blue-500 rounded"></div>
            </div>
            <span class="text-yellow-800">Triadic</span>
          </div>
          <div class="bg-pink-100 p-2 rounded text-center">
            <div class="flex gap-1 justify-center mb-1">
              <div class="w-2 h-6 bg-purple-500 rounded"></div>
              <div class="w-2 h-6 bg-pink-500 rounded"></div>
              <div class="w-2 h-6 bg-blue-500 rounded"></div>
            </div>
            <span class="text-pink-800">Analogous</span>
          </div>
        </div>
      </div>

      <pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm"><code>/* 🌈 COLOR FORMATS - Choose Your Fighter! */

/* HEX Colors - The Classic */
.primary-color { background: #667eea; }
.secondary-color { background: #764ba2; }

/* RGB - Red Green Blue Values */
.warm-red { background: rgb(255, 107, 107); }
.cool-blue { background: rgb(102, 126, 234); }

/* RGBA - RGB + Alpha (Transparency) */
.overlay { background: rgba(0, 0, 0, 0.7); }
.glass-effect { background: rgba(255, 255, 255, 0.1); }

/* HSL - Hue Saturation Lightness (Most Intuitive!) */
.vibrant-orange { background: hsl(25, 95%, 65%); }
.calm-green { background: hsl(120, 40%, 60%); }

/* CSS Custom Properties - The Modern Way */
:root {
    /* Primary Palette */
    --primary-hue: 235;
    --primary-sat: 65%;
    
    --primary-50: hsl(var(--primary-hue), var(--primary-sat), 95%);
    --primary-100: hsl(var(--primary-hue), var(--primary-sat), 85%);
    --primary-500: hsl(var(--primary-hue), var(--primary-sat), 55%);
    --primary-700: hsl(var(--primary-hue), var(--primary-sat), 35%);
    --primary-900: hsl(var(--primary-hue), var(--primary-sat), 15%);
    
    /* Semantic Colors */
    --success: hsl(142, 71%, 45%);
    --warning: hsl(38, 92%, 50%);
    --error: hsl(0, 84%, 60%);
    --info: hsl(217, 91%, 60%);
    
    /* Neutral Palette */
    --gray-50: hsl(210, 20%, 98%);
    --gray-100: hsl(220, 14%, 96%);
    --gray-200: hsl(220, 13%, 91%);
    --gray-300: hsl(216, 12%, 84%);
    --gray-400: hsl(218, 11%, 65%);
    --gray-500: hsl(220, 9%, 46%);
    --gray-600: hsl(215, 14%, 34%);
    --gray-700: hsl(217, 19%, 27%);
    --gray-800: hsl(215, 28%, 17%);
    --gray-900: hsl(221, 39%, 11%);
}

/* 🎨 PRACTICAL COLOR APPLICATIONS */

/* Card dengan Color Hierarchy */
.card {
    background: var(--gray-50);
    border: 1px solid var(--gray-200);
    border-radius: 12px;
    padding: 24px;
    transition: all 0.3s ease;
}

.card:hover {
    background: white;
    border-color: var(--primary-200);
    box-shadow: 0 10px 25px var(--primary-100);
    transform: translateY(-2px);
}

.card-header {
    color: var(--primary-700);
    border-bottom: 2px solid var(--primary-100);
    padding-bottom: 16px;
    margin-bottom: 16px;
}

/* Button Color Variations */
.btn {
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.btn-primary {
    background: linear-gradient(135deg, var(--primary-500), var(--primary-700));
    color: white;
    box-shadow: 0 4px 15px var(--primary-200);
}

.btn-primary:hover {
    background: linear-gradient(135deg, var(--primary-600), var(--primary-800));
    box-shadow: 0 6px 20px var(--primary-300);
    transform: translateY(-1px);
}

.btn-success {
    background: var(--success);
    color: white;
}

.btn-outline {
    background: transparent;
    color: var(--primary-600);
    border: 2px solid var(--primary-200);
}

.btn-outline:hover {
    background: var(--primary-500);
    color: white;
    border-color: var(--primary-500);
}

/* 🌟 ADVANCED COLOR TECHNIQUES */

/* Color Gradients yang Smooth */
.gradient-bg {
    background: linear-gradient(
        135deg,
        var(--primary-400) 0%,
        var(--primary-600) 50%,
        var(--primary-800) 100%
    );
}

/* Text Gradient Effect */
.gradient-text {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: bold;
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
    :root {
        --bg-primary: var(--gray-900);
        --bg-secondary: var(--gray-800);
        --text-primary: var(--gray-100);
        --text-secondary: var(--gray-300);
    }
}

/* Color dengan Accessibility Focus */
.accessible-link {
    color: var(--primary-600);
    text-decoration: underline;
    text-decoration-color: var(--primary-200);
    text-underline-offset: 2px;
}

.accessible-link:hover {
    color: var(--primary-700);
    text-decoration-color: var(--primary-500);
}

.accessible-link:focus {
    outline: 2px solid var(--primary-500);
    outline-offset: 2px;
    border-radius: 2px;
}</code></pre>

      <div class="mb-4">
        <img src="https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&q=80" 
             alt="Color theory and palette design process" 
             class="w-full max-w-md mx-auto rounded-lg shadow-md">
        <p class="text-sm text-gray-500 mt-2 text-center">Color theory in action - menciptakan harmony visual! 🌈</p>
      </div>

      <div class="bg-purple-50 p-4 rounded-lg mt-4">
        <h4 class="font-bold text-purple-800 mb-2">🎨 Color Psychology Quick Guide:</h4>
        <div class="grid md:grid-cols-2 gap-2 text-sm text-purple-700">
          <div><strong>🔴 Red:</strong> Energy, urgency, passion</div>
          <div><strong>🔵 Blue:</strong> Trust, calm, professional</div>
          <div><strong>🟢 Green:</strong> Growth, nature, success</div>
          <div><strong>🟡 Yellow:</strong> Happy, optimistic, attention</div>
          <div><strong>🟣 Purple:</strong> Luxury, creative, mystery</div>
          <div><strong>🟠 Orange:</strong> Friendly, energetic, fun</div>
        </div>
      </div>
    </div>

    <!-- Step 3: Typography Magic -->
    <div class="step bg-white border-l-4 border-green-400 p-6 rounded-r-xl shadow-sm">
      <div class="flex items-center gap-3 mb-4">
        <span class="bg-green-100 text-green-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">3</span>
        <h3 class="text-2xl font-bold text-gray-800">📝 Step 3: Typography Magic - Bikin Text yang Ngomong!</h3>
      </div>
      
      <p class="text-gray-600 mb-4">
        Typography bukan cuma soal font, tapi soal gimana caranya bikin text "berbicara" dengan readers! Mari kita pelajari seni bikin typography yang readable, beautiful, dan memorable! ✍️
      </p>

      <pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm"><code>/* 📝 FONT FUNDAMENTALS - The Typography Foundation */

/* Import Google Fonts - Free & Beautiful */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600&family=Fira+Code:wght@300;400;500&display=swap');

/* CSS Custom Properties untuk Typography */
:root {
    /* Font Families */
    --font-primary: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --font-secondary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --font-mono: 'Fira Code', 'Monaco', 'Cascadia Code', monospace;
    
    /* Font Sizes - Modular Scale */
    --text-xs: 0.75rem;      /* 12px */
    --text-sm: 0.875rem;     /* 14px */
    --text-base: 1rem;       /* 16px */
    --text-lg: 1.125rem;     /* 18px */
    --text-xl: 1.25rem;      /* 20px */
    --text-2xl: 1.5rem;      /* 24px */
    --text-3xl: 1.875rem;    /* 30px */
    --text-4xl: 2.25rem;     /* 36px */
    --text-5xl: 3rem;        /* 48px */
    --text-6xl: 4rem;        /* 64px */
    
    /* Font Weights */
    --weight-light: 300;
    --weight-normal: 400;
    --weight-medium: 500;
    --weight-semibold: 600;
    --weight-bold: 700;
    --weight-extrabold: 800;
    
    /* Line Heights */
    --leading-tight: 1.25;
    --leading-snug: 1.375;
    --leading-normal: 1.5;
    --leading-relaxed: 1.625;
    --leading-loose: 2;
    
    /* Letter Spacings */
    --tracking-tight: -0.025em;
    --tracking-normal: 0;
    --tracking-wide: 0.025em;
    --tracking-wider: 0.05em;
    --tracking-widest: 0.1em;
}

/* 🎯 TYPOGRAPHY HIERARCHY - The Content Structure */

/* Headings dengan Visual Hierarchy */
h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-primary);
    font-weight: var(--weight-bold);
    line-height: var(--leading-tight);
    color: var(--gray-900);
    margin-bottom: 0.5em;
}

h1 {
    font-size: var(--text-5xl);
    font-weight: var(--weight-extrabold);
    letter-spacing: var(--tracking-tight);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

h2 {
    font-size: var(--text-3xl);
    font-weight: var(--weight-bold);
    color: var(--gray-800);
    position: relative;
}

h2::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 50px;
    height: 3px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 2px;
}

h3 {
    font-size: var(--text-xl);
    font-weight: var(--weight-semibold);
    color: var(--gray-700);
}

/* Body Text dengan Perfect Readability */
body {
    font-family: var(--font-secondary);
    font-size: var(--text-base);
    font-weight: var(--weight-normal);
    line-height: var(--leading-relaxed);
    color: var(--gray-700);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

p {
    margin-bottom: 1.25em;
    max-width: 65ch; /* Optimal reading width */
}

/* Lead Text - First paragraph special styling */
.lead {
    font-size: var(--text-lg);
    font-weight: var(--weight-medium);
    color: var(--gray-600);
    line-height: var(--leading-relaxed);
}

/* 🎨 TYPOGRAPHY STYLES - The Creative Touches */

/* Quote Styling */
blockquote {
    position: relative;
    font-size: var(--text-lg);
    font-style: italic;
    color: var(--gray-600);
    padding: 2rem 2rem 2rem 4rem;
    margin: 2rem 0;
    background: var(--gray-50);
    border-radius: 12px;
    border-left: 4px solid var(--primary-500);
}

blockquote::before {
    content: '"';
    position: absolute;
    top: 0;
    left: 1rem;
    font-size: 4rem;
    font-weight: var(--weight-bold);
    color: var(--primary-300);
    line-height: 1;
}

/* Links dengan Character */
a {
    color: var(--primary-600);
    text-decoration: none;
    font-weight: var(--weight-medium);
    position: relative;
    transition: all 0.3s ease;
}

a::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--primary-500), var(--primary-700));
    transition: width 0.3s ease;
}

a:hover {
    color: var(--primary-700);
}

a:hover::after {
    width: 100%;
}

/* 💻 CODE TYPOGRAPHY - For the Developers */

code {
    font-family: var(--font-mono);
    font-size: 0.9em;
    background: var(--gray-100);
    color: var(--gray-800);
    padding: 0.2em 0.4em;
    border-radius: 4px;
    font-weight: var(--weight-medium);
}

pre {
    font-family: var(--font-mono);
    background: var(--gray-900);
    color: var(--gray-100);
    padding: 1.5rem;
    border-radius: 12px;
    overflow-x: auto;
    font-size: var(--text-sm);
    line-height: var(--leading-relaxed);
    margin: 1.5rem 0;
}

pre code {
    background: transparent;
    color: inherit;
    padding: 0;
    font-size: inherit;
}

/* 🎭 SPECIAL TEXT EFFECTS */

/* Highlight Text Effect */
.highlight {
    background: linear-gradient(120deg, transparent 0%, 
                #fff59d 50%, transparent 100%);
    background-size: 0% 100%;
    background-repeat: no-repeat;
    transition: background-size 0.6s ease;
}

.highlight.animate {
    background-size: 100% 100%;
}

/* Text Shadow Effects */
.text-shadow-soft {
    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.text-shadow-strong {
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.text-glow {
    text-shadow: 0 0 10px var(--primary-400),
                 0 0 20px var(--primary-400),
                 0 0 30px var(--primary-400);
}

/* 📱 RESPONSIVE TYPOGRAPHY */

/* Fluid Typography dengan clamp() */
.fluid-text {
    font-size: clamp(1rem, 4vw, 2.5rem);
}

.hero-title {
    font-size: clamp(2rem, 8vw, 5rem);
    line-height: 1.1;
}

/* Responsive Font Sizes */
@media (max-width: 768px) {
    h1 { font-size: var(--text-3xl); }
    h2 { font-size: var(--text-2xl); }
    h3 { font-size: var(--text-lg); }
    
    body { font-size: var(--text-sm); }
    .lead { font-size: var(--text-base); }
}

/* 🎯 TYPOGRAPHY UTILITIES */

.text-center { text-align: center; }
.text-right { text-align: right; }
.text-justify { text-align: justify; }

.uppercase { text-transform: uppercase; }
.lowercase { text-transform: lowercase; }
.capitalize { text-transform: capitalize; }

.truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}</code></pre>

      <div class="mb-4">
        <img src="https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&q=80" 
             alt="Typography and font design examples" 
             class="w-full max-w-md mx-auto rounded-lg shadow-md">
        <p class="text-sm text-gray-500 mt-2 text-center">Typography yang baik membuat reading experience jadi enjoyable! 📚</p>
      </div>

      <div class="bg-green-50 p-4 rounded-lg mt-4">
        <h4 class="font-bold text-green-800 mb-2">📝 Typography Best Practices:</h4>
        <ul class="text-sm text-green-700 space-y-1">
          <li><strong>Optimal Line Length:</strong> 45-75 characters (use max-width: 65ch)</li>
          <li><strong>Line Height Sweet Spot:</strong> 1.4-1.6 untuk body text</li>
          <li><strong>Font Pairing:</strong> Maksimal 2-3 font families dalam satu project</li>
          <li><strong>Contrast Ratio:</strong> Minimal 4.5:1 untuk normal text, 3:1 untuk large text</li>
          <li><strong>Hierarchy:</strong> Size, weight, color untuk create visual hierarchy</li>
        </ul>
      </div>
    </div>

    <!-- Step 4: Layout & Positioning -->
    <div class="step bg-white border-l-4 border-orange-400 p-6 rounded-r-xl shadow-sm">
      <div class="flex items-center gap-3 mb-4">
        <span class="bg-orange-100 text-orange-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">4</span>
        <h3 class="text-2xl font-bold text-gray-800">📐 Step 4: Layout Mastery - Atur Posisi kayak Tetris Master!</h3>
      </div>
      
      <p class="text-gray-600 mb-4">
        Layout adalah fondasi dari design yang baik! Mari kita pelajari cara arrange elements dengan precision dan create layouts yang responsive dan beautiful! 🎯
      </p>

      <pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm"><code>/* 📐 FLEXBOX - The Layout Superhero */

/* Container Flexbox Setup */
.flex-container {
    display: flex;
    
    /* Direction Control */
    flex-direction: row; /* row | row-reverse | column | column-reverse */
    
    /* Main Axis Alignment (horizontal untuk row) */
    justify-content: center; /* flex-start | flex-end | center | space-between | space-around | space-evenly */
    
    /* Cross Axis Alignment (vertical untuk row) */
    align-items: center; /* flex-start | flex-end | center | stretch | baseline */
    
    /* Wrap Control */
    flex-wrap: wrap; /* nowrap | wrap | wrap-reverse */
    
    /* Gap between items */
    gap: 1rem; /* Modern way to add spacing */
}

/* Flex Items Control */
.flex-item {
    /* Flex Growth, Shrink, Basis */
    flex: 1; /* flex-grow: 1, flex-shrink: 1, flex-basis: 0% */
    
    /* Or individually */
    flex-grow: 1;     /* Berapa banyak grow */
    flex-shrink: 0;   /* Berapa banyak shrink */
    flex-basis: 200px; /* Initial size */
    
    /* Individual alignment */
    align-self: flex-end; /* Override container's align-items */
}

/* 🎯 PRACTICAL FLEXBOX LAYOUTS */

/* Navigation Bar */
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.nav-logo {
    flex-shrink: 0; /* Logo tidak boleh shrink */
}

.nav-links {
    display: flex;
    gap: 2rem;
    list-style: none;
    margin: 0;
    padding: 0;
}

.nav-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
}

/* Card Grid dengan Flexbox */
.card-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    padding: 2rem;
}

.card {
    flex: 1 1 300px; /* grow, shrink, min-width */
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
}

/* Hero Section Layout */
.hero {
    display: flex;
    align-items: center;
    min-height: 80vh;
    padding: 0 2rem;
}

.hero-content {
    flex: 1;
    max-width: 500px;
}

.hero-image {
    flex: 1;
    text-align: center;
}

/* 🏗️ CSS GRID - The Layout Architect */

/* Grid Container Setup */
.grid-container {
    display: grid;
    
    /* Define columns */
    grid-template-columns: repeat(3, 1fr); /* 3 equal columns */
    /* grid-template-columns: 200px 1fr 100px; */ /* Fixed + flexible */
    /* grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); */ /* Responsive */
    
    /* Define rows */
    grid-template-rows: auto 1fr auto; /* header, content, footer */
    
    /* Gaps */
    gap: 2rem; /* row-gap and column-gap */
    grid-row-gap: 1rem;
    grid-column-gap: 2rem;
    
    /* Grid areas */
    grid-template-areas: 
        "header header header"
        "sidebar main aside"
        "footer footer footer";
}

/* Grid Items Placement */
.grid-item {
    /* Span columns/rows */
    grid-column: span 2; /* Take 2 columns */
    grid-row: span 1;    /* Take 1 row */
    
    /* Specific placement */
    grid-column: 2 / 4;  /* From line 2 to 4 */
    grid-row: 1 / 3;     /* From line 1 to 3 */
    
    /* Using areas */
    grid-area: header;
}

/* 🎨 PRACTICAL GRID LAYOUTS */

/* Website Layout */
.site-layout {
    display: grid;
    grid-template-columns: 250px 1fr;
    grid-template-rows: 60px 1fr 40px;
    grid-template-areas:
        "sidebar header"
        "sidebar main"
        "sidebar footer";
    min-height: 100vh;
}

.site-header { grid-area: header; }
.site-sidebar { grid-area: sidebar; }
.site-main { grid-area: main; }
.site-footer { grid-area: footer; }

/* Photo Gallery Grid */
.photo-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
    padding: 2rem;
}

.photo-item {
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.3s ease;
}

.photo-item:hover {
    transform: scale(1.05);
}

/* Feature Showcase Grid */
.feature-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 3rem;
    align-items: center;
}

.feature-content {
    padding: 2rem;
}

.feature-image {
    text-align: center;
}

/* 📱 RESPONSIVE LAYOUTS */

/* Mobile First Approach */
.responsive-layout {
    display: grid;
    gap: 1rem;
    padding: 1rem;
    
    /* Mobile: 1 column */
    grid-template-columns: 1fr;
}

/* Tablet: 2 columns */
@media (min-width: 768px) {
    .responsive-layout {
        grid-template-columns: repeat(2, 1fr);
        gap: 2rem;
        padding: 2rem;
    }
}

/* Desktop: 3 columns */
@media (min-width: 1024px) {
    .responsive-layout {
        grid-template-columns: repeat(3, 1fr);
        gap: 3rem;
        padding: 3rem;
    }
}

/* 🎯 POSITIONING TECHNIQUES */

/* Static (default) - Normal document flow */
.static-element {
    position: static; /* Default value */
}

/* Relative - Relative to its normal position */
.relative-element {
    position: relative;
    top: 10px;    /* Move 10px down from normal position */
    left: 20px;   /* Move 20px right from normal position */
}

/* Absolute - Relative to nearest positioned ancestor */
.absolute-element {
    position: absolute;
    top: 0;
    right: 0;
    background: var(--primary-500);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0 0 0 8px;
}

/* Fixed - Relative to viewport */
.fixed-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    z-index: 1000;
}

/* Sticky - Switch between relative and fixed */
.sticky-nav {
    position: sticky;
    top: 0;
    background: white;
    z-index: 100;
}

/* 🎨 MODERN LAYOUT UTILITIES */

/* Container with max-width */
.container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

/* Aspect Ratio Containers */
.aspect-video {
    aspect-ratio: 16 / 9;
    overflow: hidden;
    border-radius: 12px;
}

.aspect-square {
    aspect-ratio: 1 / 1;
}

/* Center anything */
.center-absolute {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.center-flex {
    display: flex;
    justify-content: center;
    align-items: center;
}

/* Full height sections */
.full-height {
    min-height: 100vh;
}

.full-height-screen {
    height: 100vh; /* Full viewport height */
}</code></pre>

      <div class="mb-4">
        <img src="https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&q=80" 
             alt="CSS layout and positioning demonstration" 
             class="w-full max-w-md mx-auto rounded-lg shadow-md">
        <p class="text-sm text-gray-500 mt-2 text-center">Layout yang rapi = user experience yang nyaman! 📐</p>
      </div>

      <div class="bg-orange-50 p-4 rounded-lg mt-4">
        <h4 class="font-bold text-orange-800 mb-2">📐 Layout Pro Tips:</h4>
        <ul class="text-sm text-orange-700 space-y-1">
          <li><strong>Flexbox vs Grid:</strong> Flexbox untuk 1D layout, Grid untuk 2D layout</li>
          <li><strong>Mobile First:</strong> Design untuk mobile, then scale up</li>
          <li><strong>Consistent Spacing:</strong> Use spacing scale (8px, 16px, 24px, 32px)</li>
          <li><strong>Z-index Management:</strong> Define z-index scale untuk avoid conflicts</li>
          <li><strong>Container Queries:</strong> Future of responsive design (coming soon!)</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Fun Facts Section -->
  <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl mt-12">
    <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">💡 CSS Fun Facts & Pro Secrets!</h2>
    
    <div class="grid md:grid-cols-2 gap-6">
      <div class="bg-white p-4 rounded-xl shadow-sm">
        <h3 class="font-bold text-blue-600 mb-2">🎨 Design Secrets:</h3>
        <ul class="text-sm space-y-1">
          <li>• Golden ratio (1.618) bikin spacing yang naturally pleasing</li>
          <li>• Rule of thirds untuk layout composition yang balanced</li>
          <li>• White space bukan "empty space" tapi "breathing space"</li>
          <li>• Visual hierarchy guide mata user kemana harus lihat dulu</li>
        </ul>
      </div>
      
      <div class="bg-white p-4 rounded-xl shadow-sm">
        <h3 class="font-bold text-purple-600 mb-2">⚡ Performance Hacks:</h3>
        <ul class="text-sm space-y-1">
          <li>• CSS animations lebih smooth daripada JavaScript animations</li>
          <li>• Transform dan opacity properties di-optimize browser</li>
          <li>• Critical CSS = CSS yang needed untuk above-the-fold content</li>
          <li>• CSS Grid 2x lebih cepat dari Flexbox untuk complex layouts</li>
        </ul>
      </div>
      
      <div class="bg-white p-4 rounded-xl shadow-sm">
        <h3 class="font-bold text-green-600 mb-2">🎯 Modern CSS Features:</h3>
        <ul class="text-sm space-y-1">
          <li>• CSS Custom Properties (variables) bisa diubah via JavaScript</li>
          <li>• clamp() function untuk truly responsive typography</li>
          <li>• aspect-ratio property untuk maintain proportions</li>
          <li>• CSS Grid subgrid untuk nested grid alignment</li>
        </ul>
      </div>
      
      <div class="bg-white p-4 rounded-xl shadow-sm">
        <h3 class="font-bold text-red-600 mb-2">🚀 Future CSS:</h3>
        <ul class="text-sm space-y-1">
          <li>• Container queries = responsive berdasarkan parent size</li>
          <li>• CSS Houdini = custom CSS properties dengan JavaScript</li>
          <li>• CSS Cascade Layers untuk better specificity control</li>
          <li>• Color functions untuk dynamic color manipulation</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- CSS Tools & Resources -->
  <div class="bg-gradient-to-r from-yellow-50 to-orange-50 p-8 rounded-2xl mt-8">
    <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">🛠️ CSS Tools & Resources yang Wajib Dicoba!</h2>
    
    <div class="grid md:grid-cols-3 gap-4">
      <div class="bg-white p-4 rounded-xl text-center">
        <div class="text-3xl mb-2">🎨</div>
        <h3 class="font-bold mb-2">Color Tools</h3>
        <p class="text-sm text-gray-600">Coolors.co, Adobe Color, Paletton untuk color palettes yang amazing!</p>
      </div>
      
      <div class="bg-white p-4 rounded-xl text-center">
        <div class="text-3xl mb-2">📝</div>
        <h3 class="font-bold mb-2">Typography</h3>
        <p class="text-sm text-gray-600">Google Fonts, Font Pair, Type Scale untuk typography yang perfect!</p>
      </div>
      
      <div class="bg-white p-4 rounded-xl text-center">
        <div class="text-3xl mb-2">📐</div>
        <h3 class="font-bold mb-2">Layout Generators</h3>
        <p class="text-sm text-gray-600">CSS Grid Generator, Flexbox Froggy, Grid Garden untuk practice!</p>
      </div>
      
      <div class="bg-white p-4 rounded-xl text-center">
        <div class="text-3xl mb-2">✨</div>
        <h3 class="font-bold mb-2">Animation</h3>
        <p class="text-sm text-gray-600">Animate.css, Hover.css, AOS untuk animations yang smooth!</p>
      </div>
      
      <div class="bg-white p-4 rounded-xl text-center">
        <div class="text-3xl mb-2">🔧</div>
        <h3 class="font-bold mb-2">Dev Tools</h3>
        <p class="text-sm text-gray-600">Chrome DevTools, CSS Lint, PurgeCSS untuk development!</p>
      </div>
      
      <div class="bg-white p-4 rounded-xl text-center">
        <div class="text-3xl mb-2">📚</div>
        <h3 class="font-bold mb-2">Learning</h3>
        <p class="text-sm text-gray-600">CSS Tricks, MDN Docs, Codepen untuk inspiration dan learning!</p>
      </div>
    </div>
  </div>

  <!-- Next Steps Section -->
  <div class="bg-gradient-to-r from-pink-50 to-purple-50 p-8 rounded-2xl mt-8">
    <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">🎊 Selamat! Kamu Udah Jadi CSS Wizard!</h2>
    
    <div class="text-center mb-6">
      <p class="text-lg text-gray-600">
        Dengan knowledge CSS yang baru kamu pelajari, sekarang saatnya create something amazing! ✨
      </p>
    </div>
    
    <div class="grid md:grid-cols-3 gap-4">
      <div class="bg-white p-4 rounded-xl text-center">
        <div class="text-3xl mb-2">🎨</div>
        <h3 class="font-bold mb-2">Practice Time!</h3>
        <p class="text-sm text-gray-600">Buat design system sendiri dengan color palette dan typography yang consistent!</p>
      </div>
      
      <div class="bg-white p-4 rounded-xl text-center">
        <div class="text-3xl mb-2">🔗</div>
        <h3 class="font-bold mb-2">Combine Skills!</h3>
        <p class="text-sm text-gray-600">Gabungkan dengan HTML dari tutorial sebelumnya untuk create beautiful pages!</p>
      </div>
      
      <div class="bg-white p-4 rounded-xl text-center">
        <div class="text-3xl mb-2">📚</div>
        <h3 class="font-bold mb-2">Next Level!</h3>
        <p class="text-sm text-gray-600">Ready untuk tutorial selanjutnya: "Galeri Foto Responsif dengan CSS Grid"!</p>
      </div>
    </div>
    
    <div class="text-center mt-6">
      <div class="inline-flex gap-4">
        <button class="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-full transition-colors">
          📸 Tutorial Selanjutnya
        </button>
        <button class="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-full transition-colors">
          🎯 Back to Roadmap
        </button>
      </div>
    </div>
  </div>

  <!-- CSS Challenge -->
  <div class="text-center mt-12">
    <h3 class="text-xl font-bold text-gray-800 mb-4">🎯 Challenge: Recreate This Design!</h3>
    <img src="https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?w=800&q=80" 
         alt="CSS design challenge - modern website layout" 
         class="w-full max-w-2xl mx-auto rounded-lg shadow-lg">
    <p class="text-sm text-gray-500 mt-4">
      Challenge: Buat recreation dari design ini dengan CSS skills yang baru kamu pelajari! 🚀<br>
      Post hasil kamu dan tag <strong>#GEMACSSChallenge</strong>! 💪
    </p>
  </div>
</div>
  `;

  try {
    // Update artikel kedua dengan konten lengkap
    const updatedArticle = await prisma.article.update({
      where: {
        slug: 'css-styling-dasar-untuk-pemula'
      },
      data: {
        content: fullContent,
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
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

updateSecondTutorialArticle()
  .catch((e) => {
    console.error('💥 Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });