import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateThirdTutorialArticle() {
  console.log('✨ Updating third tutorial article with full content...');

  const fullContent = `<div class="tutorial-content max-w-4xl mx-auto">
  <div class="tutorial-hero bg-gradient-to-r from-sky-100 to-indigo-100 p-8 rounded-2xl mb-8">
    <div class="flex items-center gap-4 mb-4">
      <div class="text-6xl">📸</div>
      <div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Galeri Foto Responsif yang Bikin Mata Terpukau!</h1>
        <p class="text-gray-600">Bangun galeri foto modern dengan Grid responsif, lazy loading, dan efek lightbox!</p>
      </div>
    </div>
  </div>

  <div class="bg-sky-50 p-6 rounded-xl mb-8">
    <h2 class="text-2xl font-bold text-sky-800 mb-4">🎯 Yang Akan Kamu Kuasai</h2>
    <ul class="grid md:grid-cols-2 gap-3 text-gray-700 list-disc pl-5">
      <li>Membuat layout galeri responsif dengan CSS Grid</li>
      <li>Mengoptimalkan gambar dengan srcset dan lazy loading</li>
      <li>Menambahkan hover effect dan lightbox sederhana</li>
      <li>Membuat Masonry-look tanpa library berat</li>
    </ul>
  </div>

  <div class="space-y-8">
    <section class="p-6 border rounded-xl">
      <h3 class="text-xl font-semibold mb-3">1) Struktur HTML Dasar</h3>
      <p class="text-gray-600 mb-3">Mulai dengan wadah galeri dan item-item gambar.</p>
      <pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto"><code>&lt;section class="gallery"&gt;
  &lt;figure class="card"&gt;
    &lt;img src="images/small-1.jpg" 
         srcset="images/small-1.jpg 480w, images/medium-1.jpg 800w"
         loading="lazy" alt="Pemandangan 1" /&gt;
  &lt;/figure&gt;
&lt;/section&gt;</code></pre>
    </section>

    <section class="p-6 border rounded-xl">
      <h3 class="text-xl font-semibold mb-3">2) CSS Grid Responsif</h3>
      <p class="text-gray-600 mb-3">Gunakan Grid untuk membuat kolom fleksibel.</p>
      <pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto"><code>.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  padding: 12px;
}
.card {
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0,0,0,.08);
}
.card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .4s ease;
}
.card:hover img {
  transform: scale(1.06);
}</code></pre>
    </section>

    <section class="p-6 border rounded-xl">
      <h3 class="text-xl font-semibold mb-3">3) Lightbox Sederhana</h3>
      <p class="text-gray-600 mb-3">Buka gambar dalam overlay ketika diklik.</p>
      <pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto"><code>&lt;div id="lightbox" class="hidden fixed inset-0 bg-black/80"&gt;
  &lt;img id="lightbox-img" class="max-w-4xl max-h-[90vh]" /&gt;
&lt;/div&gt;

&lt;script&gt;
const box = document.getElementById('lightbox');
const img = document.getElementById('lightbox-img');
document.querySelectorAll('.gallery img').forEach(el =&gt; {
  el.addEventListener('click', () =&gt; {
    img.src = el.src;
    box.classList.remove('hidden');
  });
});
&lt;/script&gt;</code></pre>
    </section>
  </div>

  <div class="bg-indigo-50 p-6 rounded-xl mt-8">
    <h3 class="text-xl font-semibold text-indigo-800 mb-2">💡 Tips Pro</h3>
    <ul class="space-y-2 text-gray-700 list-disc pl-5">
      <li>Selalu kompres gambar untuk loading kilat</li>
      <li>Pakai rasio konsisten agar grid rapi</li>
      <li>Tambahkan caption untuk aksesibilitas</li>
      <li>Gunakan CDN gambar saat demo</li>
    </ul>
  </div>

  <div class="text-center mt-10">
    <button class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg">
      Coba Bangun Galerimu Sekarang 🚀
    </button>
    <p class="text-gray-500 mt-2">Tunjukkan momen terbaikmu dengan tampilan yang kece!</p>
  </div>
</div>`;

  try {
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

    const total = await prisma.article.count();
    const published = await prisma.article.count({ where: { status: 'published' } });
    const drafts = await prisma.article.count({ where: { status: 'draft' } });

    console.log('\\n📊 Article Statistics:');
    console.log(`   Total: ${total}`);
    console.log(`   Published: ${published}`);
    console.log(`   Draft: ${drafts}`);
  } catch (error) {
    console.error('❌ Error updating article:', error);
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