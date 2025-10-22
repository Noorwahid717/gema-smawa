# GEMA - Generasi Muda Informatika

GEMA (Generasi Muda Informatika) adalah platform pembelajaran terpadu yang dikembangkan untuk SMA Wahidiyah Kediri. Proyek ini menggabungkan landing page publik, panel admin, dan dashboard siswa ke dalam satu aplikasi Next.js sehingga seluruh aktivitas pembelajaran dapat dikelola secara terpusat.

## 🔧 Tech Stack
- **Framework**: Next.js 15 (App Router) & React 19
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Prisma ORM dengan dukungan SQLite/PostgreSQL
- **Authentication**: NextAuth.js untuk admin + JWT kustom untuk siswa
- **Utilities**: Framer Motion, Lucide Icons, dan Playwright untuk E2E testing

## 🚀 Memulai Proyek
1. **Clone Repository**
   ```bash
   git clone https://github.com/Noorwahid717/gema-smawa.git
   cd gema-smawa
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment**
   - Salin `.env.example` menjadi `.env`
   - Lengkapi seluruh variabel yang dibutuhkan (database URL, auth secret, dsb.)
   - Jalankan `./scripts/verify-env.sh` untuk memastikan konfigurasi sudah lengkap

4. **Persiapan Database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Seed Data**
   Seluruh skrip seed kini berada di folder `seed/`.
   - Seed default: `npm run db:seed` → mengeksekusi `tsx seed/seed.ts`
   - Tutorial articles: `npm run db:seed-tutorials`
   - Classroom & assignments: `npm run db:seed-classroom`
   - Skrip tambahan dapat dijalankan dengan `npx tsx seed/<nama-file>.ts`

6. **Jalankan Development Server**
   ```bash
   npm run dev
   ```

7. **Akses Aplikasi**
   - Landing Page: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin/login
   - Student Dashboard: http://localhost:3000/student/login

## 🧭 Alur Penggunaan Aplikasi
1. **Calon pengguna membuka landing page** untuk membaca profil sekolah, program unggulan, agenda kegiatan, dan testimoni. CTA seperti "Daftar Sekarang" atau "Masuk" mengarahkan pengunjung ke langkah berikutnya.
2. **Siswa baru mendaftar atau mengisi formulir minat** (sesuai kampanye yang sedang berjalan). Data pendaftaran otomatis tercatat di database untuk ditinjau admin.
3. **Admin melakukan login** memakai kredensial yang terdaftar, kemudian meninjau data pendaftar, memvalidasi akun siswa, dan menyiapkan struktur kelas (kelas, mata pelajaran, jadwal, dan guru pengampu).
4. **Admin mengelola konten dan aktivitas** dengan membuat pengumuman, materi, tugas, serta artikel tutorial. Seluruh konten ini akan tampil di dashboard siswa maupun landing page publik (untuk konten yang bersifat umum).
5. **Siswa menerima akun yang sudah divalidasi**, login melalui halaman student dashboard, kemudian melengkapi profil, bergabung ke kelas, mengunduh materi, dan mengerjakan tugas yang dijadwalkan.
6. **Interaksi pembelajaran berlangsung** melalui fitur chat, progress tracker, dan update status tugas. Admin maupun guru dapat memantau perkembangan siswa dan memberikan feedback secara langsung dari panel admin.

## 🧪 Kualitas Kode & Testing
Pastikan pipeline kualitas berjalan berurutan:
1. `npm run lint`
2. `npm run test:e2e`
3. `npm run build`

Playwright membutuhkan browser binaries; jalankan `npx playwright install` bila belum tersedia.

## 🔐 Kredensial Demo
**Super Admin**
- Email: `admin@smawahidiyah.edu`
- Password: `admin123`

**Regular Admin**
- Email: `gema@smawahidiyah.edu`
- Password: `admin123`

**Demo Student**
- Student ID: `2024001`
- Password: `student123`

## 🗂️ Struktur Proyek Singkat
```
├── seed/                 # Seluruh skrip seeding TypeScript & helper JS
├── prisma/               # Schema, migrasi, dan utilitas pembaruan data
├── src/app/              # Next.js App Router pages & route handlers
├── src/components/       # Komponen UI bersama
├── src/features/         # Modul domain dan logika fitur
├── tests/                # Playwright E2E tests & fixtures
├── scripts/              # Shell utilities (seed helper, verifikasi env, dst.)
└── public/               # Asset statis
```

## 🌟 Fitur Utama (Pembaruan Terakhir)
Pembaruan struktur proyek dan dokumentasi terbaru menegaskan kembali fokus aplikasi pada pengalaman belajar end-to-end. Berikut ringkasan fitur yang sudah dapat dicoba di lingkungan lokal setelah menjalankan skrip seed terkini:

### Landing Page Dinamis Berbasis Data
- Menarik statistik siswa, agenda, dan konten promosi langsung dari database sehingga informasi publik selalu mutakhir.
- Animasi Framer Motion dan dukungan Tailwind CSS 4 memastikan tampilan responsif yang konsisten di berbagai perangkat.

### Panel Admin Terpadu
- Admin dapat memverifikasi pendaftar, mengatur kelas, membuat pengumuman, serta menerbitkan artikel tutorial terbaru yang kini dikelola lewat folder `seed/` terpusat.
- Integrasi NextAuth.js menjamin autentikasi berlapis sebelum admin mengakses manajemen konten, tugas, dan galeri.

### Dashboard Siswa Interaktif
- Siswa memantau roadmap pembelajaran, mengunduh materi, serta mengumpulkan tugas dengan notifikasi status real-time.
- Fitur chat internal dan progress tracker membantu guru memberikan umpan balik langsung berdasarkan data hasil seeding terbaru.

### Automasi Data & Kualitas
- Seluruh skrip pengisian data (default, tutorial, maupun classroom) kini berada di `seed/`, memudahkan orkestrasi data uji dan demo.
- Pipeline kualitas (lint → Playwright tests → build) terdokumentasi jelas agar tim dapat menjaga standar kode dan siap CI/CD.

## 📄 Lisensi
Proyek ini ditujukan untuk kebutuhan internal SMA Wahidiyah Kediri. Hubungi maintainer untuk detail penggunaan lebih lanjut.
