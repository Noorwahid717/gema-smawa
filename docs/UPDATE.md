 Perubahan Terakhir

  - Menambahkan flag showOnHomepage pada Activity, Announcement, dan Gallery, berikut migrasi prisma/
    migrations/20250207120000_add_homepage_flags. Endpoint /api/public kini memprioritaskan item yang diberi flag; admin API
    juga menerima flag tersebut (dengan fallback ALTER TABLE … IF NOT EXISTS).
  - Form admin (kegiatan, pengumuman, galeri) sekarang punya opsi “Tampilkan di landing page” dan menampilkan badge “Landing
    Page” pada kartu yang disorot.
  - Memindahkan seluruh skrip shell ke scripts/ serta utilitas test manual ke tests/manual/, memperbarui dokumentasi
    referensinya.

  Hal yang Masih Perlu Ditangani

  1. Jalankan migrasi dan regenerasi Prisma di lingkungan Anda:
     npx prisma migrate dev --name add_homepage_flags (atau npx prisma db push) diikuti npx prisma generate, lalu restart
     server. Tanpa ini, API masih melempar “Gagal menyimpan galeri” karena Prisma client lama.
  2. Admin login /admin/login masih menghasilkan HTTP 500 selama e2e dijalankan; perlu penelusuran dan perbaikan sebelum tes
     Playwright dilanjutkan.
  3. Playwright npm run test:e2e belum sukses dijalankan; lakukan setelah langkah di atas.

  Setelah tiga poin tersebut beres, rerun lint/build/test untuk memastikan semua fitur baru stabil.
