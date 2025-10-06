# 🎥 Live Classroom - Panduan Penggunaan

## ✅ Setup Selesai!

Tombol Live Classroom sudah ditambahkan di:
- ✅ **Admin Panel** (`/admin/classroom`) - Tombol "Mulai Live Class"
- ✅ **Halaman Siswa** (`/classroom`) - Tombol "🎥 Tonton Live Class"
- ✅ **Database** - Classroom data sudah di-seed

---

## 🚀 Cara Menggunakan Live Classroom

### 📋 **Untuk Admin/Guru:**

1. **Login sebagai Admin**
   - Buka: `http://localhost:3000/admin/login`
   - Email: `admin@smawahidiyah.edu`
   - Password: `admin123!@#`

2. **Akses Classroom Management**
   - Setelah login, klik menu **"Classroom"** atau buka:
   - `http://localhost:3000/admin/classroom`

3. **Mulai Live Session**
   - Klik tombol merah **"Mulai Live Class"** (animasi pulse)
   - Atau akses langsung: `http://localhost:3000/classroom/gema-classroom-1/live`

4. **Izinkan Akses Kamera & Mikrofon**
   - Browser akan meminta permission → Klik **"Allow"**
   - Video Anda akan muncul di layar

5. **Kontrol Live Session**
   - 🎤 **Toggle Mic** - Mute/unmute mikrofon
   - 📹 **Toggle Camera** - On/off kamera
   - 🖥️ **Screen Share** - Berbagi layar presentasi
   - ⏺️ **Record** - Rekam sesi (upload otomatis ke Cloudinary)
   - ⏹️ **End Session** - Akhiri kelas live

---

### 👨‍🎓 **Untuk Siswa:**

1. **Login sebagai Siswa**
   - Buka: `http://localhost:3000/student/login`
   - Gunakan akun siswa yang sudah terdaftar

2. **Akses Classroom**
   - Setelah login, buka: `http://localhost:3000/classroom`

3. **Tonton Live Class**
   - Klik tombol gradient merah-pink **"🎥 Tonton Live Class"**
   - Atau akses langsung: `http://localhost:3000/classroom/gema-classroom-1/live`

4. **Join Live Session**
   - Siswa akan otomatis connect ke stream guru
   - Video & audio guru akan muncul
   - Siswa bisa melihat dan mendengar tanpa mengirim video mereka

---

## 🎓 **Classroom yang Tersedia:**

### 1. **GEMA - Generasi Muda Informatika**
- **ID:** `gema-classroom-1`
- **URL:** `/classroom/gema-classroom-1/live`
- **Deskripsi:** Kelas ekstrakulikuler informatika SMA Wahidiyah Kediri
- **Topik:** Web Development & Programming

### 2. **GEMA Advanced - Full Stack Development**
- **ID:** `gema-advanced-1`
- **URL:** `/classroom/gema-advanced-1/live`
- **Deskripsi:** Kelas lanjutan full stack development
- **Topik:** React, Node.js, Database

---

## 🔧 **Teknologi yang Digunakan:**

### **WebRTC**
- Streaming video/audio peer-to-peer
- Low latency untuk interaksi real-time
- Menggunakan STUN server Google

### **WebSocket**
- Signaling channel untuk koordinasi
- Edge runtime untuk performa optimal
- Support multiple rooms
- State ringan disimpan di memori Edge (`room -> peers`) dengan informasi `peerId` dan `role`
- Pesan `join` akan mengirim daftar peserta yang sudah ada, `joined/left` menyiarkan jumlah peserta terkini
- Payload WebRTC (`offer`, `answer`, `ice`) dibungkus sebagai event `peer` sehingga klien cukup memfilter berdasarkan `payload.target`

### **MediaRecorder API**
- Recording sesi di browser host
- Auto-upload ke Cloudinary
- URL rekaman tersimpan di database

### **Cloudinary**
- Storage untuk rekaman video
- Secure URL generation
- Optimized delivery

---

## 🎯 **Fitur Live Classroom:**

### **Untuk Host (Guru):**
✅ Start/Stop live session  
✅ Audio control (mute/unmute)  
✅ Video control (on/off)  
✅ Screen sharing  
✅ Session recording → Cloudinary  
✅ Lihat jumlah viewers  
✅ Chat dengan siswa (optional)

### **Untuk Viewer (Siswa):**
✅ Join live session  
✅ Watch teacher's stream  
✅ Listen to audio  
✅ View screen sharing  
✅ Chat dengan guru (optional)

---

## 🚨 **Troubleshooting:**

### **Problem: Tombol Live tidak muncul**
**Solusi:**
```bash
# Restart development server
npm run dev
```

### **Problem: Camera/Mic tidak terdeteksi**
**Solusi:**
1. Check browser permissions
2. Pastikan browser support getUserMedia
3. Gunakan HTTPS untuk production

### **Problem: Video tidak muncul**
**Solusi:**
1. Reload page
2. Check network connection
3. Pastikan STUN server accessible
4. Check browser console untuk error

### **Problem: Recording gagal**
**Solusi:**
1. Check Cloudinary credentials di `.env`
2. Pastikan disk space cukup
3. Check browser support MediaRecorder API

---

## ✅ Pengujian & Kriteria Penerimaan

1. **Jalankan pengembangan lokal**
   - `npm install` (sekali jika belum).
   - `npm run dev` dan pastikan server berjalan di `http://localhost:3000`.
   - Perhatikan terminal, setiap koneksi WebSocket akan mencetak log `[WS]`.
2. **Verifikasi handshake WebSocket**
   - Buka `http://localhost:3000/admin/login` dan mulai sesi live di `/classroom/<ID>/live`.
   - Di DevTools tab *Network → WS* pastikan request `ws://localhost:3000/api/ws` menerima status `101 Switching Protocols`.
   - Di console browser harus muncul pesan `Terhubung ke server signaling...` tanpa error.
3. **Uji koneksi siswa & relay sinyal**
   - Di tab/inkognito lain login sebagai siswa lalu join halaman live yang sama.
   - Pastikan jumlah penonton bertambah dan stream host muncul pada sisi siswa.
   - Periksa Network WS bahwa pesan `offer`, `answer`, dan `ice` saling bertukar.
4. **Simulasi auto-reconnect**
   - Saat kedua sisi terhubung, hentikan server (`Ctrl+C`) atau aktifkan *Offline* di DevTools untuk beberapa detik.
   - UI akan menampilkan pesan `Koneksi signaling terputus...` dan mencoba kembali dengan jeda bertambah.
   - Hidupkan kembali koneksi/server dan pastikan status berubah menjadi `Terhubung` tanpa perlu refresh.
5. **Heartbeat & kestabilan**
   - Biarkan koneksi terbuka >1 menit; server akan mengirim `ping` dan klien merespons `pong` (cek tab WS → Frames).
   - Pastikan koneksi tidak ditutup selama heartbeat diterima.
6. **Produksi**
   - Deploy ke Vercel lalu ulangi langkah 2–5 menggunakan `https://` (klien otomatis memakai `wss://`).
   - Pastikan tidak ada dependency `ws` pada server dan route `app/api/ws/route.ts` berjalan di Edge (cek log Vercel).

Kriteria dianggap terpenuhi ketika seluruh langkah di atas sukses tanpa error pada konsol browser maupun terminal server.

---

## 📊 **Environment Variables:**

File `.env` sudah dikonfigurasi dengan:

```env
# Live Classroom - WebRTC Configuration
# Format harus JSON array TANPA kutip tunggal pembungkus
# ✅ Contoh benar: ["stun:stun.l.google.com:19302","stun:stun1.l.google.com:19302"]
# ❌ Contoh salah: ' ["stun:stun.l.google.com:19302"] '
NEXT_PUBLIC_STUN_URLS=["stun:stun.l.google.com:19302","stun:stun1.l.google.com:19302","stun:stun2.l.google.com:19302"]
NEXT_PUBLIC_TURN_URL=
NEXT_PUBLIC_TURN_USERNAME=
NEXT_PUBLIC_TURN_PASSWORD=

# Cloudinary (untuk recording)
CLOUDINARY_CLOUD_NAME=ekioswa
CLOUDINARY_API_KEY=394934877538616
CLOUDINARY_API_SECRET=ikvjoynzSO843HMtpkWs1GR100E
```

Untuk memverifikasi format JSON, jalankan perintah berikut sebelum deploy:

```bash
echo $NEXT_PUBLIC_STUN_URLS | jq empty
```

Jika perintah di atas menampilkan error, periksa kembali format variabel dan pastikan tidak ada kutip tambahan di awal/akhir string.

---

## 🎬 **Quick Start Guide:**

### **Test dalam 3 Langkah:**

**Tab 1 (Guru):**
```
1. http://localhost:3000/admin/login
2. Login as admin
3. Click "Mulai Live Class"
```

**Tab 2 (Siswa):**
```
1. http://localhost:3000/student/login
2. Login as student
3. Click "🎥 Tonton Live Class"
```

**Tab 3 (Siswa Lain):**
```
1. Open incognito/private window
2. http://localhost:3000/student/login
3. Login as different student
4. Click "🎥 Tonton Live Class"
```

---

## 📌 **Catatan Penting:**

### **Development Mode:**
⚠️ State disimpan in-memory  
⚠️ Restart server = hilang semua session  
⚠️ Cocok untuk testing lokal

### **Production Mode:**
✅ Gunakan Redis/Upstash untuk persistent state  
✅ Setup TURN server untuk jaringan dengan firewall  
✅ Enable HTTPS untuk getUserMedia  
✅ Monitor resource usage untuk recording

### **Recording:**
⚠️ Dilakukan di browser host  
⚠️ Butuh disk space & bandwidth  
⚠️ Auto-upload ke Cloudinary setelah stop  
⚠️ Rekaman tersimpan di `LiveSession.recordingUrl`

---

## 🎉 **Live Classroom GEMA SMA Wahidiyah Siap Digunakan!**

**Development Server Running at:**
- 🌐 Local: `http://localhost:3000`
- 📡 Network: `http://10.174.198.42:3000`

**Access Points:**
- 👨‍🏫 Admin Live: `/classroom/gema-classroom-1/live`
- 👨‍🎓 Student View: `/classroom` → Click "🎥 Tonton Live Class"

---

## 📚 **Resources:**

- [WebRTC Documentation](https://webrtc.org/)
- [Cloudinary Upload Guide](https://cloudinary.com/documentation)
- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [Next.js Edge Runtime](https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes)

---

**🎓 Happy Teaching & Learning with GEMA Live Classroom! 🚀**
