# 🚀 GEMA Landing Page - Deployment Guide
## SMA Wahidiyah Kediri - Pondok Pesantren Kedunglo

## Quick Deploy ke Vercel

### Method 1: One-Click Deploy (Tercepat)

Klik tombol di bawah untuk deploy langsung ke Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/username/gema-sma-wahidiyah)

### Method 2: Deploy Manual dengan CLI

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login ke Vercel:**
```bash
vercel login
```

3. **Deploy dari root project:**
```bash
# Deploy preview
vercel

# Deploy production
vercel --prod
```

### Method 3: GitHub Integration (Recommended)

1. **Push ke GitHub:**
```bash
git init
git add .
git commit -m "Initial commit: GEMA SMA Wahidiyah landing page"
git branch -M main
git remote add origin https://github.com/username/gema-sma-wahidiyah.git
git push -u origin main
```

2. **Setup Vercel:**
   - Kunjungi [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import dari GitHub
   - Select repository
   - Vercel auto-detect Next.js settings
   - Click "Deploy"

3. **Auto-deployment:**
   - Setiap push ke `main` branch = auto deploy production
   - Pull request = auto deploy preview

## 📋 Pre-Deployment Checklist

- [x] ✅ Next.js project structure
- [x] ✅ Build berhasil tanpa error (`npm run build`)
- [x] ✅ SEO metadata configured
- [x] ✅ Responsive design tested
- [x] ✅ Environment variables configured
- [x] ✅ `vercel.json` configuration
- [x] ✅ `robots.txt` and `sitemap.xml`
- [x] ✅ Performance optimized

## ⚙️ Environment Variables

Tambahkan di Vercel Dashboard > Settings > Environment Variables:

```
NEXT_PUBLIC_SITE_URL=https://gema-sma-wahidiyah.vercel.app
NEXT_PUBLIC_CONTACT_EMAIL=smaswahidiyah@gmail.com
NEXT_PUBLIC_CONTACT_ADDRESS="Jl. KH. Wahid Hasyim, Ponpes Kedunglo, Kediri"
NEXT_PUBLIC_REGISTRATION_URL=https://spmbkedunglo.com
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/smawahidiyah_official
NEXT_PUBLIC_LINKTREE_URL=https://linktr.ee/smawahidiyah
NEXT_PUBLIC_SCHOOL_NAME="SMA Wahidiyah Kediri"
NEXT_PUBLIC_PESANTREN_NAME="Pondok Pesantren Kedunglo"
```

## 🔗 Custom Domain Setup

1. **Di Vercel Dashboard:**
   - Go to project Settings
   - Click "Domains" 
   - Add your domain (e.g., `gema.smawahidiyah.sch.id`)

2. **Update DNS records:**
   ```
   Type: CNAME
   Name: @ (or www)
   Value: cname.vercel-dns.com
   ```

3. **Update metadata base URL:**
   Edit `src/app/layout.tsx`:
   ```tsx
   metadataBase: new URL('https://gema.smawahidiyah.sch.id')
   ```

## 🎯 Post-Deployment Tasks

### 1. Verify Deployment
- [ ] Check website loads correctly
- [ ] Test all sections (Hero, About, Activities, etc.)
- [ ] Verify responsive design on mobile
- [ ] Test CTA buttons

### 2. SEO Setup
- [ ] Submit to Google Search Console
- [ ] Submit sitemap: `https://your-domain.com/sitemap.xml`
- [ ] Verify meta tags with [metatags.io](https://metatags.io)
- [ ] Test PageSpeed with [Google PageSpeed](https://pagespeed.web.dev)

### 3. Analytics (Optional)
- [ ] Add Google Analytics
- [ ] Setup Vercel Analytics
- [ ] Monitor Core Web Vitals

## 🔧 Troubleshooting

### Build Errors
```bash
# Clear cache dan rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variables Not Working
- Prefix harus `NEXT_PUBLIC_` untuk client-side variables
- Restart development server setelah menambah env vars
- Check Vercel dashboard untuk production env vars

### Domain Issues
- Wait 24-48 hours for DNS propagation
- Check DNS with `dig your-domain.com`
- Verify CNAME points to `cname.vercel-dns.com`

## 📊 Performance Optimization

Sudah termasuk dalam project:
- ✅ Static generation 
- ✅ Image optimization
- ✅ Font optimization (Google Fonts)
- ✅ CSS minification
- ✅ JavaScript bundling
- ✅ Gzip compression

## 🎉 Success!

Setelah deployment berhasil, landing page GEMA akan tersedia di:
- **Vercel URL:** `https://gema-sma-wahidiyah-xxxxxx.vercel.app`
- **Custom Domain:** `https://gema.smawahidiyah.sch.id` (jika dikonfigurasi)

Website siap menerima pendaftar baru untuk SMA Wahidiyah Kediri dan program GEMA! 🚀

### 📱 Integrasi dengan Sistem Sekolah

Landing page ini dapat diintegrasikan dengan:
- **SPMB Kedunglo** untuk pendaftaran online
- **Instagram @smawahidiyah_official** untuk update kegiatan
- **Linktree** untuk kumpulan link penting
- **Website sekolah** sebagai portal utama informasi
