# GEMA - Generasi Muda Informatika

W## 🔧 Tech Stack

-## 🔐 Login Credentials

### Admin Login
Setelah seeding databa## 🌐 Multi-Platform Access

### 📱 Responsive Design
- **Mobile First**: Optimized untuk mobile devices
- **Tablet Support**: Layout menyesuaikan tablet
- **Desktop**: Full experience di desktop
- **Cross-Platform**: Konsisten di semua perangkat

### 🎨 User Experience
- **Joyful Student Interface**: Colorful dan engaging design untuk siswa
- **Professional Admin Interface**: Clean dan functional design untuk admin
- **Smooth Animations**: Framer Motion untuk transition yang halus
- **Intuitive Navigation**: Easy-to-use navigation dengan profile access

### 🔐 Security & Performance
- **Secure Authentication**: Multi-level authentication system
- **Session Management**: Proper session handling untuk admin dan student
- **Optimized Build**: Production-ready dengan bundle optimization
- **Database Integration**: Seamless integration dengan Prisma ORM

## 🚀 Quick Start

1. **Clone Repository**
```bash
git clone https://github.com/Noorwahid717/gema-smawa.git
cd gema-smawa
```

2. **Install Dependencies**
```bash
npm install
```

3. **Setup Database**
```bash
npx prisma generate
npx prisma db push
```

4. **Run Development Server**
```bash
npm run dev
```

5. **Access Applications**
- Landing Page: `http://localhost:3000`
- Admin Panel: `http://localhost:3000/admin/login`
- Student Dashboard: `http://localhost:3000/student/login`nakan credentials berikut:

**Super Admin:**
- Email: `admin@smawahidiyah.edu`
- Password: `admin123`

**Regular Admin:**
- Email: `gema@smawahidiyah.edu`
- Password: `admin123`

### Student Login
**Demo Student:**
- Student ID: `2024001`
- Password: `student123`

**Akses Student:**
- Student Dashboard: `/student/dashboard-simple`
- Student Login: `/student/login`
- Student Registration: `/student/register`**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: SQLite/PostgreSQL + Prisma ORM
- **Authentication**: 
  - NextAuth.js untuk Admin
  - Custom JWT untuk Student Authentication
- **Security**: bcryptjs untuk password hashing
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **File Upload**: Built-in file handling system
esmi program GEMA (Generasi Muda Informatika) SMA Wahidiyah Kediri yang memadukan **Landing Page**, **Admin Panel**, dan **Student Dashboard** yang terintegrasi penuh untuk manajemen pembelajaran digital.

## 🌟 Fitur Utama

### 🎨 Landing Page
- **Hero Section** dengan statistik real-time dari database
- **Pengumuman Terbaru** langsung dari admin panel
- **Kegiatan Mendatang** dengan informasi detail
- **Galeri Kegiatan** yang dapat dikelola admin
- **Form Pendaftaran** terintegrasi dengan admin panel
- **Responsive Design** untuk semua perangkat

### 🛠️ Admin Panel
- **Dashboard** dengan overview dan statistik
- **Profile Management** - kelola informasi personal, password, dan preferensi
- **Kelola Kontak** - lihat dan respon pesan masuk
- **Kelola Pendaftaran** - approve/reject pendaftaran siswa
- **Kelola Kegiatan** - CRUD kegiatan dan workshop
- **Kelola Galeri** - upload dan kategorisasi foto
- **Kelola Pengumuman** - buat dan publikasi pengumuman
- **Kelola Siswa** - student management dan monitoring
- **Live Chat** - real-time communication dengan siswa
- **Classroom Management** - artikel tutorial dan assignment
- **Portfolio Management** - evaluasi portfolio siswa
- **Kelola Admin** - user management dengan role-based access
- **Pengaturan Sistem** - konfigurasi aplikasi

### 👨‍🎓 Student Dashboard
- **Dashboard Interaktif** dengan progress tracking dan gamification
- **Profile Management** - kelola informasi personal, password, dan preferensi
- **Assignment System** - upload tugas dan lihat feedback
- **Portfolio Builder** - buat dan submit portfolio web
- **Classroom** - akses artikel tutorial dan materi pembelajaran
- **Roadmap Learning** - tracking progress pembelajaran dengan visual roadmap
- **Real-time Chat** - komunikasi dengan admin dan mentor
- **Progress Analytics** - statistik pembelajaran dan engagement

## � Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: SQLite + Prisma ORM
- **Authentication**: NextAuth.js dengan Credentials Provider
- **Animation**: Framer Motion
- **Icons**: Lucide React

## � Login Admin

Setelah seeding database, gunakan credentials berikut:

**Super Admin:**
- Email: `admin@smawahidiyah.edu`
- Password: `admin123`

**Regular Admin:**
- Email: `gema@smawahidiyah.edu`
- Password: `admin123`

## 🎯 Fitur Unggulan

### 🔄 Sinkronisasi Real-time
- **Statistik Hero Section**: Menampilkan jumlah pendaftar, kegiatan aktif, dll dari database
- **Pengumuman**: Langsung dari admin panel, hanya yang dipublikasi yang tampil
- **Kegiatan**: Kegiatan aktif dari admin panel ditampilkan di landing page
- **Galeri**: Foto yang diupload admin langsung muncul di landing page

### 📝 Assignment & Portfolio System
- **Assignment Upload**: Siswa dapat upload tugas dalam berbagai format
- **Portfolio Builder**: Drag & drop interface untuk membuat portfolio web
- **Real-time Preview**: Live preview untuk portfolio development
- **Automated Evaluation**: Sistem penilaian dengan rubrik yang dapat dikustomisasi
- **Feedback System**: Rating dan komentar untuk artikel tutorial

### 💬 Communication System
- **Live Chat**: Real-time communication antara siswa dan admin
- **Multi-Chat Sessions**: Admin dapat handle multiple chat sessions
- **Chat History**: Penyimpanan riwayat percakapan
- **Notification System**: Real-time notifications untuk chat dan updates

### 📊 Analytics & Gamification
- **Progress Tracking**: Visual roadmap pembelajaran dengan progress indicators
- **Engagement Score**: Sistem scoring berdasarkan aktivitas siswa
- **Learning Streak**: Tracking konsistensi belajar siswa
- **Interactive Dashboard**: Dashboard yang engaging dengan animasi dan statistik

### 👤 Profile Management System
- **Admin Profile**: Complete profile management dengan password security
- **Student Profile**: Personal information, preferences, dan password management
- **Role-based Access**: Different interfaces berdasarkan user role
- **Security Features**: Password hashing, validation, dan session management

## � Responsive Design

- **Mobile First**: Optimized untuk mobile devices
- **Tablet Support**: Layout menyesuaikan tablet
- **Desktop**: Full experience di desktop
- **Admin Panel**: Responsive admin interface

## � Project Structure

```
gema-smawa/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/              # Admin Panel Pages
│   │   │   ├── profile/        # Admin Profile Management
│   │   │   ├── dashboard/      # Admin Dashboard
│   │   │   ├── chat/           # Live Chat Management
│   │   │   └── ...
│   │   ├── student/            # Student Pages
│   │   │   ├── profile/        # Student Profile Management
│   │   │   ├── dashboard-simple/ # Student Dashboard
│   │   │   ├── portfolio/      # Portfolio Builder
│   │   │   └── ...
│   │   ├── classroom/          # Learning Management
│   │   ├── api/                # API Routes
│   │   └── ...
│   ├── components/             # Reusable Components
│   │   ├── admin/              # Admin Components
│   │   ├── portfolio/          # Portfolio Components
│   │   ├── feedback/           # Feedback System
│   │   └── ...
│   ├── lib/                    # Utilities & Configurations
│   └── types/                  # TypeScript Definitions
├── prisma/                     # Database Schema & Seeds
└── public/                     # Static Assets
```

## 🏆 Features Completed

### ✅ Core System
- [x] **Landing Page** dengan integrasi database
- [x] **Admin Authentication** dengan NextAuth
- [x] **Student Authentication** dengan custom JWT
- [x] **Profile Management** untuk Admin dan Student
- [x] **Responsive Design** di semua platform

### ✅ Learning Management
- [x] **Assignment System** dengan file upload
- [x] **Portfolio Builder** dengan live preview
- [x] **Tutorial Articles** dengan feedback system
- [x] **Progress Tracking** dengan visual roadmap
- [x] **Evaluation System** dengan rubrik customizable

### ✅ Communication
- [x] **Live Chat System** real-time
- [x] **Multi-Chat Management** untuk admin
- [x] **Notification System** dengan SSE
- [x] **Feedback & Rating** untuk konten

### ✅ Analytics & Gamification
- [x] **Interactive Dashboard** dengan statistik
- [x] **Engagement Scoring** system
- [x] **Learning Streak** tracking
- [x] **Progress Visualization** dengan animasi

## �📞 Contact & Support

- **Email**: smaswahidiyah@gmail.com
- **Website**: https://spmbkedunglo.com
- **Instagram**: [@smawahidiyah_official](https://instagram.com/smawahidiyah_official)
- **Developer**: Noorwahid717

---

🎉 **GEMA Platform: Complete Learning Management System dengan Admin Panel dan Student Dashboard yang terintegrasi penuh!**

💡 **Ready untuk deployment dan penggunaan production di SMA Wahidiyah Kediri**
