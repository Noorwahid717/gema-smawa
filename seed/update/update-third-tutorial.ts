import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateThirdTutorialArticle() {
  console.log('✨ Updating third tutorial article with full content...');

  const fullContent = `
<div class="tutorial-content max-w-4xl mx-auto">
  <!-- Hero Section -->
  <div class="tutorial-hero bg-gradient-to-r from-sky-100 to-indigo-100 p-8 rounded-2xl mb-8">
    <div class="flex items-center gap-4 mb-4">
      <div class="text-6xl">📸</div>
      <div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Galeri Foto Responsif yang Bikin Mata Terpukau!</h1>
        <p class="text-gray-600">Bangun galeri foto modern dengan Grid responsif, lazy loading, dan efek lightbox — cocok untuk portfolio, event sekolah, atau project ekskul!</p>
      </div>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
      <img class="rounded-xl object-cover w-full h-28" src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&q=80" alt="Sample 1">
      <img class="rounded-xl object-cover w-full h-28" src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80" alt="Sample 2">
      <img class="rounded-xl object-cover w-full h-28" src="https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&q=80" alt="Sample 3">
      <img class="rounded-xl object-cover w-full h-28" src="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80" alt="Sample 4">
    </div>
  </div>

  <!-- Learning Objectives -->
  <div class="bg-sky-50 p-6 rounded-xl mb-8">
    <h2 class="text-2xl font-bold text-sky-800 mb-4">🎯 Yang Akan Kamu Kuasai</h2>
    <ul class="grid md:grid-cols-2 gap-3 text-gray-700 list-disc pl-5">
      <li>Membuat layout galeri responsif dengan CSS Grid</li>
      <li>Mengoptimalkan gambar dengan <code>&lt;picture&gt;</code>, <code>srcset</code>, dan lazy loading</li>
      <li>Menambahkan hover effect & lightbox sederhana dengan JavaScript</li>
      <li>Membuat Masonry-look tanpa library berat</li>
    </ul>
  </div>

  <!-- Step by Step -->
  <div class="space-y-8">
    <section class="p-6 border rounded-xl">
      <h3 class="text-xl font-semibold mb-3">1) Struktur HTML Dasar</h3>
      <p class="text-gray-600 mb-3">Mulai dengan wadah galeri dan item-item gambar.</p>
      <pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto"><code>&lt;section class="gallery"&gt;
  &lt;figure class="card"&gt;
    &lt;img src="images/small-1.jpg" 
         srcset="images/small-1.jpg 480w, images/medium-1.jpg 800w, images/large-1.jpg 1200w"
         sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
         loading="lazy" alt="Pemandangan 1" /&gt;
  &lt;/figure&gt;
  &lt;!-- Ulangi untuk item lain --&gt;
&lt;/section&gt;</code></pre>
    </section>

    <section class="p-6 border rounded-xl">
      <h3 class="text-xl font-semibold mb-3">2) CSS Grid Responsif</h3>
      <p class="text-gray-600 mb-3">Gunakan Grid untuk membuat kolom fleksibel yang menyesuaikan lebar layar.</p>
      <pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto"><code>.gallery {
  --gap: 12px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--gap);
  padding: var(--gap);
}
.card {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0,0,0,.08);
}
.card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .4s ease, filter .4s ease;
}
.card:hover img {
  transform: scale(1.06);
  filter: brightness(1.05) saturate(1.1);
}</code></pre>
    </section>

    <section class="p-6 border rounded-xl">
      <h3 class="text-xl font-semibold mb-3">3) Versi Masonry-look (tanpa library)</h3>
      <p class="text-gray-600 mb-3">Trik mudah: biarkan tinggi gambar bervariasi dan atur <code>grid-auto-rows</code> + <code>grid-row: span N</code> via CSS utility atau inline style.</p>
      <pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto"><code>.gallery.masonry {
  grid-auto-rows: 8px; /* unit row kecil */
  grid-auto-flow: dense;
}
.masonry .card { 
  /* Contoh: tetapkan span via style atau class */
}
/* Hitung span dengan JavaScript kecil (opsional) */</code></pre>
    </section>

    <section class="p-6 border rounded-xl">
      <h3 class="text-xl font-semibold mb-3">4) Lightbox Sederhana (Vanilla JS)</h3>
      <p class="text-gray-600 mb-3">Buka gambar dalam overlay ketika diklik — ringan dan mudah.</p>
      <pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto"><code>&lt;div id="lightbox" class="hidden fixed inset-0 bg-black/80 items-center justify-center"&gt;
  &lt;img id="lightbox-img" class="max-w-4xl max-h-[90vh] rounded-xl" /&gt;
&lt;/div&gt;

&lt;script&gt;
const box = document.getElementById('lightbox');
const img = document.getElementById('lightbox-img');
document.querySelectorAll('.gallery .card img').forEach(el =&gt; {
  el.addEventListener('click', () =&gt; {
    img.src = el.currentSrc || el.src;
    box.classList.remove('hidden');
    box.classList.add('flex');
  });
});
box.addEventListener('click', () =&gt; {
  box.classList.add('hidden');
  box.classList.remove('flex');
});
&lt;/script&gt;</code></pre>
    </section>

    <section class="p-6 border rounded-xl">
      <h3 class="text-xl font-semibold mb-3">5) Optimasi Gambar: <code>&lt;picture&gt;</code>, <code>srcset</code>, dan Lazy</h3>
      <p class="text-gray-600 mb-3">Gunakan ukuran berbeda untuk layar berbeda; aktifkan <code>loading="lazy"</code> agar hemat data.</p>
      <pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto"><code>&lt;picture&gt;
  &lt;source type="image/avif" srcset="images/1-480.avif 480w, images/1-800.avif 800w, images/1-1200.avif 1200w"&gt;
  &lt;source type="image/webp" srcset="images/1-480.webp 480w, images/1-800.webp 800w, images/1-1200.webp 1200w"&gt;
  &lt;img src="images/1-800.jpg" 
       srcset="images/1-480.jpg 480w, images/1-800.jpg 800w, images/1-1200.jpg 1200w"
       sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
       loading="lazy" alt="Contoh gambar optimal" /&gt;
&lt;/picture&gt;</code></pre>
    </section>
  </div>

  <!-- Callout Tips -->
  <div class="bg-indigo-50 p-6 rounded-xl mt-8">
    <h3 class="text-xl font-semibold text-indigo-800 mb-2">💡 Tips Pro</h3>
    <ul class="space-y-2 text-gray-700 list-disc pl-5">
      <li>Selalu kompres gambar (AVIF/WebP) untuk loading kilat.</li>
      <li>Pakai rasio konsisten (mis. 4:3 atau 1:1) agar grid rapi; untuk Masonry, izinkan variasi tinggi.</li>
      <li>Tambahkan caption dengan &lt;figcaption&gt; bila perlu (aksesibilitas 👍).</li>
      <li>Gunakan CDN gambar (Unsplash, Cloudinary) saat demo cepat.</li>
    </ul>
  </div>

  <!-- CTA -->
  <div class="text-center mt-10">
    <a href="#"
       class="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg transition">
      Coba Bangun Galerimu Sekarang 🚀
    </a>
    <p class="text-gray-500 mt-2">Tunjukkan momen terbaikmu dengan tampilan yang kece dan responsif!</p>
  </div>
</div>
`;

  try {
    // Update existing article by slug (ensure the slug already exists in DB)
    const updatedArticle = await prisma.article.update({
      where: { slug: 'tutorial-galeri-foto-responsif-css-grid' },
      data: {
        title: '📸 Galeri Foto Responsif yang Bikin Mata Terpukau!',
        content: fullContent,
        imageUrl: 'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=1200&q=80',
        status: 'published',
        publishedAt: new Date()
      }
    });

    console.log(`✅ Successfully updated article: ${updatedArticle.title}`);
    console.log(`🔗 Slug: ${updatedArticle.slug}`);
    console.log(`📖 Content length: ${fullContent.length} characters`);
    console.log(`📅 Published at: ${updatedArticle.publishedAt}`);

    // Stats
    const total = await prisma.article.count();
    const published = await prisma.article.count({ where: { status: 'published' } });
    const drafts = await prisma.article.count({ where: { status: 'draft' } });

    console.log('\\n📊 Article Statistics:');
    console.log(`   Total: ${total}`);
    console.log(`   Published: ${published}`);
    console.log(`   Draft: ${drafts}`);
  } catch (error) {
    console.error('❌ Error updating article:', error);
    console.log('ℹ️ Pastikan record dengan slug "tutorial-galeri-foto-responsif-css-grid" sudah ada. Jika belum, buat artikel draft-nya lebih dulu.');
  }
}

updateThirdTutorialArticle()
  .catch((e) => {
    console.error('💥 Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
