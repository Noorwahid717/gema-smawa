import { expect, test } from '@playwright/test';

const adminCredentials = {
  super: {
    email: 'admin@smawahidiyah.edu',
    password: 'admin123',
  },
  regular: {
    email: 'gema@smawahidiyah.edu',
    password: 'admin123',
  },
} as const;

const studentCredentials = {
  id: '2024001',
  password: 'student123',
} as const;

const runId = `E2E-${Date.now()}`;
const announcementTitle = `Pengumuman Penting ${runId}`;
const activityTitle = `Kegiatan Kreatif ${runId}`;
const galleryTitle = `Galeri Inspirasi ${runId}`;
const registrationApplicant = {
  name: `Calon Siswa ${runId}`,
  email: `calon${runId}@example.com`,
  phone: '081234567890',
};
const chatMessages = {
  student: `Halo Admin, ini pesan otomatis ${runId}`,
  admin: `Halo! Pesan diterima ${runId}`,
};

async function loginAsAdmin(page: import('@playwright/test').Page, credentials = adminCredentials.super) {
  await page.goto('/admin/login');
  await expect(page.getByRole('heading', { name: 'Masuk Admin' })).toBeVisible();
  await page.getByLabel('Email Admin').fill(credentials.email);
  await page.getByLabel('Password').fill(credentials.password);
  await page.getByRole('button', { name: /Masuk Admin/ }).click();
  await page.waitForURL('**/admin/dashboard', { timeout: 60_000 });
  await expect(page).toHaveURL(/\/admin\/dashboard/);
  await expect(page.getByRole('heading', { name: 'Dashboard Admin' })).toBeVisible();
}

async function logoutAdmin(page: import('@playwright/test').Page) {
  await page.getByTitle('Keluar').click();
  await page.waitForURL('**/admin/login', { timeout: 30_000 });
  await expect(page).toHaveURL(/\/admin\/login/);
}

async function loginAsStudent(page: import('@playwright/test').Page) {
  await page.goto('/student/login');
  await expect(page.getByRole('heading', { name: 'Masuk Siswa' })).toBeVisible();
  await page.getByLabel('NIS / Student ID').fill(studentCredentials.id);
  await page.getByLabel('Password').fill(studentCredentials.password);
  await page.getByRole('button', { name: /Masuk Siswa/ }).click();
  await page.waitForURL('**/student/dashboard-simple', { timeout: 60_000 });
  await expect(page).toHaveURL(/\/student\/dashboard-simple/);
  await expect(page.getByText('Selamat Datang')).toBeVisible();
}

async function logoutStudent(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Logout' }).click();
  await page.waitForURL('**/student/login', { timeout: 30_000 });
  await expect(page).toHaveURL(/\/student\/login/);
}

test.describe.configure({ mode: 'serial' });

test('Admin can authenticate and manage platform content', async ({ page }) => {
  test.skip(test.info().project.name !== 'chromium-desktop', 'Full E2E flows run on desktop configuration only.');

  await page.goto('/admin/login');
  await expect(page.getByRole('heading', { name: 'Masuk Admin' })).toBeVisible();

  // Invalid credential validation
  await page.getByLabel('Email Admin').fill(adminCredentials.super.email);
  await page.getByLabel('Password').fill('wrong-password');
  await page.getByRole('button', { name: /Masuk Admin/ }).click();
  await expect(page.getByText('Email atau password salah')).toBeVisible();

  // Successful login as super admin
  await page.getByLabel('Password').fill(adminCredentials.super.password);
  await page.getByRole('button', { name: /Masuk Admin/ }).click();
  await page.waitForURL('**/admin/dashboard', { timeout: 60_000 });
  await expect(page).toHaveURL(/\/admin\/dashboard/);
  await expect(page.getByRole('heading', { name: 'Dashboard Admin' })).toBeVisible();
  await expect(page.getByText('Total Pendaftaran')).toBeVisible();

  // Update admin profile information
  await page.goto('/admin/profile');
  await expect(page.getByRole('heading', { name: 'Profile Admin' })).toBeVisible({ timeout: 20_000 });
  await page.getByRole('button', { name: 'Edit' }).click();
  const adminNameInput = page.locator('#admin-full-name');
  await expect(adminNameInput).toBeVisible({ timeout: 10_000 });
  await adminNameInput.fill(`Administrator ${runId}`);
  await page.getByRole('button', { name: 'Simpan' }).click();
  await expect(page.getByText('Profile berhasil diperbarui', { exact: false })).toBeVisible();

  // Create announcement
  await page.goto('/admin/announcements');
  await expect(page.getByRole('heading', { name: 'Pengumuman' })).toBeVisible();
  await page.getByRole('button', { name: 'Tambah Pengumuman' }).click();
  await page.getByLabel('Judul').fill(announcementTitle);
  await page.getByLabel('Konten').fill(`Konten pengumuman otomatis ${runId}.`);
  await page.getByLabel('Jenis Pengumuman').selectOption('success');
  const activeToggle = page.getByLabel('Aktifkan pengumuman');
  if (!(await activeToggle.isChecked())) {
    await activeToggle.check();
  }
  await page.getByRole('button', { name: /Tambahkan|Simpan Perubahan/ }).click();
  await expect(page.getByText('Pengumuman baru berhasil ditambahkan', { exact: false })).toBeVisible();
  await expect(page.getByText(announcementTitle)).toBeVisible();

  // Create activity
  await page.goto('/admin/activities');
  await expect(page.getByRole('heading', { name: 'Kelola Kegiatan' })).toBeVisible();
  await page.getByRole('button', { name: 'Tambah Kegiatan' }).click();
  await page.getByLabel('Judul Kegiatan').fill(activityTitle);
  await page.getByLabel('Deskripsi').fill('Workshop kolaborasi siswa dan mentor.');
  const futureDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const dateInput = futureDate.toISOString().slice(0, 16);
  await page.getByLabel('Tanggal & Waktu').fill(dateInput);
  await page.getByLabel('Lokasi').fill('Lab Komputer GEMA');
  await page.getByLabel('Kapasitas Peserta').fill('50');
  await page.getByLabel('Status').selectOption('true');
  await page.getByRole('button', { name: /Simpan/i }).click();
  await expect(page.getByText(activityTitle)).toBeVisible();

  // Create gallery item
  await page.goto('/admin/gallery');
  await expect(page.getByRole('heading', { name: 'Galeri Kegiatan' })).toBeVisible();
  await page.getByRole('button', { name: 'Tambah Dokumentasi' }).click();
  await page.getByLabel('Judul').fill(galleryTitle);
  await page.getByLabel('Deskripsi').fill('Dokumentasi visual kegiatan inspiratif.');
  await page.getByLabel('URL Gambar').fill(`https://picsum.photos/seed/${runId}/800/600`);
  await page.getByLabel('Kategori').selectOption('event');
  const galleryToggle = page.getByLabel('Tampilkan di galeri publik');
  if (!(await galleryToggle.isChecked())) {
    await galleryToggle.check();
  }
  await page.getByRole('button', { name: /Tambahkan|Simpan Perubahan/ }).click();
  await expect(page.getByText('Dokumentasi baru berhasil ditambahkan', { exact: false })).toBeVisible();
  await expect(page.getByText(galleryTitle)).toBeVisible();

  // Logout and verify session termination
  await logoutAdmin(page);
  await page.goto('/admin/dashboard');
  await expect(page).toHaveURL(/\/admin\/login/);

  // Login as regular admin to validate role access
  await loginAsAdmin(page, adminCredentials.regular);
  await expect(page.getByRole('heading', { name: 'Dashboard Admin' })).toBeVisible();
  await logoutAdmin(page);
});

test('Landing page shows live data and captures registration', async ({ page }) => {
  test.skip(test.info().project.name !== 'chromium-desktop', 'Landing verification runs on desktop configuration only.');

  await page.goto('/');
  await expect(page.getByText('Generasi Muda')).toBeVisible();
  await expect(page.getByText('Anggota Aktif')).toBeVisible();
  await expect(page.getByText('Proyek Aktif')).toBeVisible();
  await expect(page.getByText('Workshop Selesai')).toBeVisible();
  await expect(page.getByText('Prestasi')).toBeVisible();

  // Announcements and activities created by admin should appear
  await expect(page.getByRole('heading', { name: 'Pengumuman Terbaru' })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(announcementTitle)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Kegiatan Mendatang' })).toBeVisible();
  await expect(page.getByText(activityTitle)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Galeri Kegiatan' })).toBeVisible();
  await expect(page.getByText(galleryTitle)).toBeVisible();

  // Submit student registration form
  await page.getByText('Daftar Bergabung').scrollIntoViewIfNeeded();
  await page.getByLabel('Nama Lengkap').fill(registrationApplicant.name);
  await page.getByLabel('Email').fill(registrationApplicant.email);
  await page.getByLabel('No. Handphone').fill(registrationApplicant.phone);
  await page.getByLabel('Asal Sekolah').fill('SMA Negeri 1 Kediri');
  await page.getByLabel('Kelas').fill('XII IPA');
  await page.getByLabel('Minat Teknologi').selectOption('Web Development');
  await page.getByLabel('Tingkat Pengalaman').selectOption('Beginner');
  await page.getByLabel('Ceritakan pengalaman atau harapan kamu').fill('Sangat antusias bergabung di komunitas GEMA.');
  await page.getByRole('button', { name: 'Kirim Pendaftaran' }).click();
  await expect(page.getByText('Pendaftaran berhasil dikirim', { exact: false })).toBeVisible();

  // Floating chat availability
  await page.getByTitle('Chat dengan Admin GEMA').click();
  await expect(page.getByText('Admin GEMA')).toBeVisible();
  await page.getByTitle('Tutup chat').click();
});

test('Admin can review and approve new registrations', async ({ page }) => {
  test.skip(test.info().project.name !== 'chromium-desktop', 'Desktop-only administrative workflow.');

  await loginAsAdmin(page, adminCredentials.super);
  await page.goto('/admin/registrations');
  await expect(page.getByRole('heading', { name: 'Pendaftaran' })).toBeVisible();
  const registrationRow = page.locator('tr', { hasText: registrationApplicant.name });
  await expect(registrationRow).toBeVisible({ timeout: 60_000 });
  await expect(registrationRow.getByText('Menunggu')).toBeVisible();
  await registrationRow.getByRole('button', { name: 'Setujui' }).click();
  await expect(registrationRow.getByText('Disetujui')).toBeVisible({ timeout: 30_000 });
  await logoutAdmin(page);
});

test('Student can manage dashboard workflows end-to-end', async ({ page }) => {
  test.skip(test.info().project.name !== 'chromium-desktop', 'Desktop-only student workflow.');

  await page.goto('/student/login');
  await expect(page.getByRole('heading', { name: 'Masuk Siswa' })).toBeVisible();

  // Invalid login path
  await page.getByLabel('NIS / Student ID').fill(studentCredentials.id);
  await page.getByLabel('Password').fill('invalid');
  await page.getByRole('button', { name: /Masuk Siswa/ }).click();
  await expect(page.getByText('Login gagal', { exact: false })).toBeVisible();

  // Successful login
  await page.getByLabel('Password').fill(studentCredentials.password);
  await page.getByRole('button', { name: /Masuk Siswa/ }).click();
  await page.waitForURL('**/student/dashboard-simple', { timeout: 60_000 });
  await expect(page.getByText('Selamat Datang', { exact: false })).toBeVisible();

  // Verify analytics cards
  await expect(page.getByText('Hari Streak', { exact: false })).toBeVisible();
  await expect(page.getByText('Selesai', { exact: false })).toBeVisible();
  await expect(page.getByText('Engagement score', { exact: false })).toBeVisible();

  // Navigate to profile and update information
  await page.getByRole('link', { name: 'Profile' }).click();
  await expect(page.getByRole('heading', { name: 'Profile Siswa' })).toBeVisible({ timeout: 20_000 });
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByLabel('Nomor Telepon').fill('081298765432');
  await page.getByLabel('Alamat').fill('Pondok Pesantren Kedunglo, Kediri');
  await page.getByRole('button', { name: 'Simpan' }).click();
  await expect(page.getByText('Profil berhasil diperbarui', { exact: false })).toBeVisible();

  // Return to dashboard for assignments
  await page.goto('/student/dashboard-simple');
  await page.getByRole('button', { name: 'Assignments' }).click();
  const assignmentCard = page.locator('a', { hasText: /Mulai|Lihat/ }).first();
  await expect(assignmentCard).toBeVisible({ timeout: 60_000 });
  const assignmentUrl = await assignmentCard.getAttribute('href');
  if (!assignmentUrl) {
    test.fail(true, 'Tidak ditemukan assignment untuk diuji.');
  }
  await assignmentCard.click();
  await page.waitForURL(`**${assignmentUrl}`);
  await expect(page.getByRole('heading', { name: 'Upload File Tugas' })).toBeVisible({ timeout: 20_000 });
  await page.setInputFiles('#file-upload', 'tests/fixtures/sample-assignment.pdf');
  await page.getByRole('button', { name: 'Upload' }).click();
  await expect(page.getByText('File berhasil diupload', { exact: false })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('Riwayat Submission')).toBeVisible();

  // Portfolio builder with live preview
  await page.goto('/student/portfolio');
  await expect(page.getByRole('heading', { name: 'Metadata Portfolio' })).toBeVisible({ timeout: 20_000 });
  await page.getByLabel('HTML').fill(`<h1 data-testid="portfolio-heading">${runId}</h1>`);
  await page.getByLabel('CSS').fill('body { font-family: sans-serif; background: #f8fafc; } h1 { color: #2563eb; }');
  await page.getByLabel('JavaScript').fill("document.body.dataset.preview = 'loaded';");
  await page.getByRole('button', { name: 'Pratinjau' }).click();
  const previewFrame = page.frameLocator('iframe[title="Pratinjau portfolio siswa"]');
  await expect(previewFrame.getByText(runId)).toBeVisible();

  // Classroom access
  await page.goto('/classroom');
  await expect(page.getByRole('heading', { name: /Classroom/i })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('Roadmap Belajar', { exact: false })).toBeVisible();

  // Logout & session validation
  await page.goto('/student/dashboard-simple');
  await logoutStudent(page);
  await page.goto('/student/dashboard-simple');
  await expect(page).toHaveURL(/\/student\/login/);
});

test('Admin and student can communicate via live chat', async ({ browser }) => {
  test.skip(test.info().project.name !== 'chromium-desktop', 'Chat synchronization validated on desktop run only.');

  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  await loginAsAdmin(adminPage, adminCredentials.super);
  await adminPage.goto('/admin/chat');
  await expect(adminPage.getByRole('heading', { name: 'Live Chat' })).toBeVisible();
  await expect(adminPage.getByText('Online', { exact: false })).toBeVisible({ timeout: 30_000 });

  const studentContext = await browser.newContext();
  const studentPage = await studentContext.newPage();
  await loginAsStudent(studentPage);
  await studentPage.goto('/');
  await studentPage.getByTitle('Chat dengan Admin GEMA').click();
  await studentPage.getByPlaceholder('Nama Anda').fill('Demo Student');
  await studentPage.getByPlaceholder('Email (opsional)').fill('demo.student@example.com');
  await studentPage.getByRole('button', { name: 'Mulai Chat' }).click();
  await expect(studentPage.getByPlaceholder('Ketik pesan...')).toBeVisible();

  await studentPage.getByPlaceholder('Ketik pesan...').fill(chatMessages.student);
  await studentPage.getByTitle('Kirim pesan').click();
  await expect(studentPage.getByText(chatMessages.student)).toBeVisible({ timeout: 30_000 });
  await expect(adminPage.getByText(chatMessages.student)).toBeVisible({ timeout: 30_000 });

  await adminPage.getByPlaceholder('Ketik balasan untuk pengunjung...').fill(chatMessages.admin);
  await adminPage.getByRole('button', { name: 'Kirim' }).click();
  await expect(adminPage.getByText(chatMessages.admin)).toBeVisible({ timeout: 30_000 });
  await expect(studentPage.getByText(chatMessages.admin)).toBeVisible({ timeout: 30_000 });

  await adminContext.close();
  await studentContext.close();
});

test.describe('Responsive layout smoke tests', () => {
  test('Landing page renders key sections on tablet view', async ({ page }) => {
    test.skip(test.info().project.name !== 'chromium-tablet');
    await page.goto('/');
    await expect(page.getByText('Generasi Muda', { exact: false })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Kegiatan Mendatang' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tentang GEMA' })).toBeVisible();
  });

  test('Landing page navigation collapses correctly on mobile', async ({ page }) => {
    test.skip(test.info().project.name !== 'chromium-mobile');
    await page.goto('/');
    const learnMoreLink = page.getByRole('link', { name: 'Pelajari Lebih Lanjut' });
    await expect(learnMoreLink).toBeVisible();
    await learnMoreLink.click();
    await expect(page.getByRole('heading', { name: 'Tentang GEMA' })).toBeVisible();
  });
});
