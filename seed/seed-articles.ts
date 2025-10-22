import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding sample articles...');

  // Sample articles data
  const articles = [
    {
      title: 'Pengenalan HTML5 dan Semantic Elements',
      slug: 'pengenalan-html5-semantic-elements',
      excerpt: 'Pelajari dasar-dasar HTML5 dan penggunaan semantic elements untuk struktur web yang lebih baik.',
      content: `<h2>Apa itu HTML5?</h2>
<p>HTML5 adalah versi terbaru dari HyperText Markup Language yang digunakan untuk membuat struktur dan konten halaman web. HTML5 memperkenalkan banyak fitur baru yang membuatnya lebih semantik, aksesibel, dan mudah digunakan.</p>

<h3>Semantic Elements Baru di HTML5</h3>
<ul>
<li><strong>&lt;header&gt;</strong> - Untuk bagian kepala dokumen atau section</li>
<li><strong>&lt;nav&gt;</strong> - Untuk navigasi</li>
<li><strong>&lt;main&gt;</strong> - Untuk konten utama</li>
<li><strong>&lt;article&gt;</strong> - Untuk konten artikel yang berdiri sendiri</li>
<li><strong>&lt;section&gt;</strong> - Untuk bagian atau seksi dalam dokumen</li>
<li><strong>&lt;aside&gt;</strong> - Untuk konten sampingan</li>
<li><strong>&lt;footer&gt;</strong> - Untuk bagian footer</li>
</ul>

<h3>Contoh Penggunaan</h3>
<pre><code>&lt;!DOCTYPE html&gt;
&lt;html lang="id"&gt;
&lt;head&gt;
    &lt;meta charset="UTF-8"&gt;
    &lt;title&gt;Contoh HTML5&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;header&gt;
        &lt;h1&gt;Website GEMA&lt;/h1&gt;
        &lt;nav&gt;
            &lt;a href="#home"&gt;Home&lt;/a&gt;
            &lt;a href="#about"&gt;About&lt;/a&gt;
        &lt;/nav&gt;
    &lt;/header&gt;
    
    &lt;main&gt;
        &lt;article&gt;
            &lt;h2&gt;Tutorial HTML5&lt;/h2&gt;
            &lt;p&gt;Konten artikel...&lt;/p&gt;
        &lt;/article&gt;
    &lt;/main&gt;
    
    &lt;footer&gt;
        &lt;p&gt;&copy; 2024 GEMA SMA Wahidiyah&lt;/p&gt;
    &lt;/footer&gt;
&lt;/body&gt;
&lt;/html&gt;</code></pre>

<p>Dengan menggunakan semantic elements, kode HTML menjadi lebih bermakna dan mudah dipahami oleh browser dan search engine.</p>`,
      category: 'tutorial',
      tags: '["HTML5", "Web Development", "Frontend", "Semantic"]',
      author: 'Admin GEMA',
      status: 'published',
      featured: true,
      readTime: 5,
      publishedAt: new Date('2024-12-20')
    },
    {
      title: 'CSS Grid Layout: Panduan Lengkap',
      slug: 'css-grid-layout-panduan-lengkap',
      excerpt: 'Menguasai CSS Grid untuk membuat layout web yang responsif dan fleksibel.',
      content: `<h2>Pengenalan CSS Grid</h2>
<p>CSS Grid adalah sistem layout dua dimensi yang memungkinkan kita mengatur elemen dalam baris dan kolom secara bersamaan. Grid memberikan kontrol penuh atas layout dengan cara yang lebih intuitif dibandingkan metode layout tradisional.</p>

<h3>Konsep Dasar</h3>
<ul>
<li><strong>Grid Container</strong> - Parent element yang menerapkan display: grid</li>
<li><strong>Grid Items</strong> - Child elements dalam grid container</li>
<li><strong>Grid Lines</strong> - Garis pembatas yang membentuk grid</li>
<li><strong>Grid Tracks</strong> - Ruang antara dua grid lines</li>
</ul>

<h3>Properti Dasar Grid</h3>
<pre><code>.container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto;
  gap: 20px;
}

.item {
  grid-column: span 2;
  grid-row: 1 / 3;
}</code></pre>

<h3>Responsive Grid</h3>
<pre><code>.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}</code></pre>

<p>CSS Grid sangat powerful untuk membuat layout yang kompleks dengan kode yang lebih bersih dan maintainable.</p>`,
      category: 'tutorial',
      tags: '["CSS", "Grid", "Layout", "Responsive"]',
      author: 'Admin GEMA',
      status: 'published',
      featured: false,
      readTime: 8,
      publishedAt: new Date('2024-12-19')
    },
    {
      title: 'JavaScript ES6+: Fitur Modern yang Wajib Diketahui',
      slug: 'javascript-es6-fitur-modern',
      excerpt: 'Eksplorasi fitur-fitur terbaru JavaScript ES6+ yang akan meningkatkan produktivitas coding.',
      content: `<h2>JavaScript Modern dengan ES6+</h2>
<p>ECMAScript 2015 (ES6) dan versi selanjutnya memperkenalkan banyak fitur baru yang membuat JavaScript lebih powerful dan mudah digunakan. Mari kita bahas fitur-fitur penting yang harus dikuasai.</p>

<h3>1. Arrow Functions</h3>
<pre><code>// Traditional function
function add(a, b) {
  return a + b;
}

// Arrow function
const add = (a, b) => a + b;

// Arrow function dengan block
const multiply = (a, b) => {
  const result = a * b;
  return result;
};</code></pre>

<h3>2. Destructuring Assignment</h3>
<pre><code>// Array destructuring
const [first, second, ...rest] = [1, 2, 3, 4, 5];

// Object destructuring
const { name, age, city = 'Jakarta' } = person;

// Function parameter destructuring
const greet = ({ name, age }) => {
  console.log(\`Hello \${name}, you are \${age} years old\`);
};</code></pre>

<h3>3. Template Literals</h3>
<pre><code>const name = 'GEMA';
const year = 2024;

const message = \`Welcome to \${name} 
in year \${year}!\`;

// Multi-line strings
const html = \`
  &lt;div class="card"&gt;
    &lt;h2&gt;\${name}&lt;/h2&gt;
    &lt;p&gt;Year: \${year}&lt;/p&gt;
  &lt;/div&gt;
\`;</code></pre>

<h3>4. Async/Await</h3>
<pre><code>// Promise-based approach
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Using the function
const data = await fetchData();</code></pre>

<p>Fitur-fitur ES6+ ini membuat kode JavaScript lebih concise, readable, dan maintainable. Pastikan untuk mempraktikkan setiap fitur ini dalam project kalian!</p>`,
      category: 'tutorial',
      tags: '["JavaScript", "ES6", "Modern JS", "Programming"]',
      author: 'Admin GEMA',
      status: 'published',
      featured: true,
      readTime: 12,
      publishedAt: new Date('2024-12-18')
    },
    {
      title: 'Tren Teknologi 2024: AI dan Machine Learning',
      slug: 'tren-teknologi-2024-ai-machine-learning',
      excerpt: 'Perkembangan terkini dalam dunia AI dan Machine Learning yang akan mengubah industri teknologi.',
      content: `<h2>Revolusi AI di Tahun 2024</h2>
<p>Tahun 2024 menandai era baru dalam perkembangan Artificial Intelligence dan Machine Learning. Teknologi ini tidak hanya mengubah cara kerja industri tech, tetapi juga membuka peluang karir yang menarik bagi generasi muda.</p>

<h3>Tren Utama AI 2024</h3>
<ul>
<li><strong>Generative AI</strong> - ChatGPT, DALL-E, dan tools sejenis</li>
<li><strong>Edge AI</strong> - AI yang berjalan di device lokal</li>
<li><strong>Multimodal AI</strong> - AI yang memahami teks, gambar, dan suara</li>
<li><strong>AI Ethics</strong> - Fokus pada penggunaan AI yang bertanggung jawab</li>
</ul>

<h3>Peluang Karir di Bidang AI</h3>
<ul>
<li>Data Scientist</li>
<li>Machine Learning Engineer</li>
<li>AI Research Scientist</li>
<li>AI Product Manager</li>
<li>AI Ethics Specialist</li>
</ul>

<h3>Tools dan Framework Populer</h3>
<ul>
<li><strong>Python Libraries:</strong> TensorFlow, PyTorch, Scikit-learn</li>
<li><strong>Cloud Platforms:</strong> Google AI Platform, AWS SageMaker, Azure ML</li>
<li><strong>Development Tools:</strong> Jupyter Notebook, Google Colab</li>
</ul>

<h3>Tips untuk Memulai Belajar AI</h3>
<ol>
<li>Kuasai dasar-dasar Python dan matematika</li>
<li>Pelajari statistik dan probability</li>
<li>Praktik dengan dataset real-world</li>
<li>Ikuti course online dan bootcamp</li>
<li>Join komunitas AI/ML</li>
</ol>

<p>Masa depan teknologi sangat cerah dengan AI. Mulai belajar dari sekarang dan jadilah bagian dari revolusi teknologi ini!</p>`,
      category: 'technology',
      tags: '["AI", "Machine Learning", "Technology Trends", "Career"]',
      author: 'Admin GEMA',
      status: 'published',
      featured: false,
      readTime: 10,
      publishedAt: new Date('2024-12-17')
    },
    {
      title: 'Web Development Roadmap 2024',
      slug: 'web-development-roadmap-2024',
      excerpt: 'Panduan lengkap untuk menjadi web developer profesional di tahun 2024.',
      content: `<h2>Roadmap Menjadi Web Developer 2024</h2>
<p>Web development terus berkembang dengan pesat. Berikut adalah roadmap lengkap untuk menjadi web developer profesional yang siap menghadapi tantangan industri modern.</p>

<h3>1. Frontend Development</h3>
<h4>Dasar-dasar (Foundation)</h4>
<ul>
<li><strong>HTML5</strong> - Struktur dan semantic elements</li>
<li><strong>CSS3</strong> - Styling, Flexbox, Grid, Animations</li>
<li><strong>JavaScript</strong> - ES6+, DOM Manipulation, Async/Await</li>
<li><strong>Responsive Design</strong> - Mobile-first approach</li>
</ul>

<h4>Tools dan Preprocessing</h4>
<ul>
<li><strong>CSS Preprocessors:</strong> Sass, PostCSS</li>
<li><strong>Build Tools:</strong> Vite, Webpack, Parcel</li>
<li><strong>Package Managers:</strong> npm, yarn, pnpm</li>
</ul>

<h4>Framework/Library</h4>
<ul>
<li><strong>React.js</strong> - Hooks, Context API, Redux</li>
<li><strong>Next.js</strong> - SSR, SSG, API Routes</li>
<li><strong>Vue.js</strong> atau <strong>Angular</strong> (alternatif)</li>
</ul>

<h3>2. Backend Development</h3>
<h4>Server-side Languages</h4>
<ul>
<li><strong>Node.js</strong> - Express.js, Fastify</li>
<li><strong>Python</strong> - Django, FastAPI</li>
<li><strong>PHP</strong> - Laravel (optional)</li>
</ul>

<h4>Database</h4>
<ul>
<li><strong>SQL:</strong> PostgreSQL, MySQL</li>
<li><strong>NoSQL:</strong> MongoDB, Redis</li>
<li><strong>ORM/ODM:</strong> Prisma, Mongoose</li>
</ul>

<h3>3. DevOps dan Deployment</h3>
<ul>
<li><strong>Version Control:</strong> Git, GitHub</li>
<li><strong>Cloud Platforms:</strong> Vercel, Netlify, AWS</li>
<li><strong>Containerization:</strong> Docker (advanced)</li>
<li><strong>CI/CD:</strong> GitHub Actions</li>
</ul>

<h3>4. Soft Skills</h3>
<ul>
<li>Problem-solving</li>
<li>Communication</li>
<li>Time management</li>
<li>Continuous learning</li>
</ul>

<h3>Timeline Belajar (6-12 bulan)</h3>
<ul>
<li><strong>Bulan 1-2:</strong> HTML, CSS, JavaScript dasar</li>
<li><strong>Bulan 3-4:</strong> JavaScript advanced, React.js</li>
<li><strong>Bulan 5-6:</strong> Backend dengan Node.js/Express</li>
<li><strong>Bulan 7-8:</strong> Database dan API integration</li>
<li><strong>Bulan 9-10:</strong> Full-stack project, deployment</li>
<li><strong>Bulan 11-12:</strong> Portfolio, job preparation</li>
</ul>

<p>Ingat, konsistensi adalah kunci. Practice coding setiap hari dan build project untuk portfolio!</p>`,
      category: 'programming',
      tags: '["Web Development", "Roadmap", "Career Guide", "Programming"]',
      author: 'Admin GEMA',
      status: 'published',
      featured: true,
      readTime: 15,
      publishedAt: new Date('2024-12-16')
    },
    {
      title: 'Update: GitHub Copilot dan AI-Powered Coding',
      slug: 'github-copilot-ai-powered-coding',
      excerpt: 'Bagaimana AI mengubah cara developer coding dan tips menggunakan GitHub Copilot secara efektif.',
      content: `<h2>Era Baru: AI-Powered Coding</h2>
<p>GitHub Copilot dan tools AI coding lainnya telah mengubah paradigma programming. Developer kini dapat coding lebih cepat dan efisien dengan bantuan AI assistant.</p>

<h3>Apa itu GitHub Copilot?</h3>
<p>GitHub Copilot adalah AI pair programmer yang dikembangkan oleh GitHub dan OpenAI. Tool ini dapat:</p>
<ul>
<li>Generate code dari komentar natural language</li>
<li>Autocomplete functions dan entire code blocks</li>
<li>Suggest best practices dan optimizations</li>
<li>Help dengan debugging dan testing</li>
</ul>

<h3>Best Practices Menggunakan AI Coding Tools</h3>

<h4>1. Write Clear Comments</h4>
<pre><code>// Function to validate email format and check if domain exists
function validateEmail(email) {
  // AI akan generate kode berdasarkan comment ini
}</code></pre>

<h4>2. Review Generated Code</h4>
<ul>
<li>Selalu review kode yang di-generate AI</li>
<li>Pastikan logic dan security sesuai requirements</li>
<li>Test thoroughly sebelum production</li>
</ul>

<h4>3. Use for Learning</h4>
<ul>
<li>Pelajari pattern dan best practices dari suggestions</li>
<li>Gunakan untuk explore new libraries/frameworks</li>
<li>Ask AI to explain complex code snippets</li>
</ul>

<h3>Alternative AI Coding Tools</h3>
<ul>
<li><strong>Tabnine</strong> - AI code completion</li>
<li><strong>Codeium</strong> - Free AI coding assistant</li>
<li><strong>Amazon CodeWhisperer</strong> - AWS integrated</li>
<li><strong>Cursor</strong> - AI-powered code editor</li>
</ul>

<h3>Tips untuk Developer Muda</h3>
<ol>
<li><strong>Learn fundamentals first</strong> - AI tools membantu, tapi pemahaman dasar tetap penting</li>
<li><strong>Don't rely 100% on AI</strong> - Develop problem-solving skills</li>
<li><strong>Use AI for productivity</strong> - Focus pada logic dan architecture</li>
<li><strong>Stay updated</strong> - AI tools berkembang sangat cepat</li>
</ol>

<h3>Future of AI in Programming</h3>
<p>AI akan semakin terintegrasi dalam development workflow:</p>
<ul>
<li>Automated testing dan debugging</li>
<li>Code review dan security scanning</li>
<li>Documentation generation</li>
<li>Performance optimization</li>
</ul>

<p>Embrace AI tools, tapi jangan lupa untuk terus mengasah fundamental programming skills!</p>`,
      category: 'news',
      tags: '["AI", "GitHub Copilot", "Programming Tools", "Developer News"]',
      author: 'Admin GEMA',
      status: 'published',
      featured: false,
      readTime: 8,
      publishedAt: new Date('2024-12-15')
    }
  ];

  // Get admin user for authorId
  const admin = await prisma.admin.findFirst();
  if (!admin) {
    throw new Error('No admin found. Please create an admin first.');
  }

  // Create articles
  for (const articleData of articles) {
    try {
      const article = await prisma.article.create({
        data: {
          ...articleData,
          authorId: admin.id
        }
      });
      console.log(`✅ Created article: ${article.title}`);
    } catch (error) {
      console.log(`❌ Failed to create article: ${articleData.title}`, error);
    }
  }

  console.log('🎉 Sample articles seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });