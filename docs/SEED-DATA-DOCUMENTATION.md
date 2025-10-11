# 🌱 SEED DATA DOCUMENTATION - GEMA Learning Management System

## 📋 **Overview**
Dokumentasi ini menjelaskan seed data yang telah dibuat untuk sistem pembelajaran GEMA SMA Wahidiyah Kediri, termasuk roadmap pembelajaran, assignments, dan data siswa demo.

---

## 🎯 **1. ROADMAP PEMBELAJARAN**

### **API Endpoint:** `/api/roadmap/stages`
**Method:** GET

### **Data Structure:**
Roadmap pembelajaran terdiri dari 6 tahap yang terstruktur dari dasar hingga advanced:

#### **Stage 1: 🔰 Dasar-dasar Web**
- **Goal:** Mengenal bagaimana web bekerja
- **Skills:** HTML dasar, CSS dasar, JavaScript dasar
- **Activities:** 2 latihan praktik
- **Duration:** ~2 minggu

#### **Stage 2: 📄 HTML Lanjutan**
- **Goal:** Membangun struktur halaman yang rapi dan mudah dipahami
- **Skills:** Semantic HTML, Form handling, Aksesibilitas
- **Activities:** 3 latihan praktik
- **Duration:** ~1 minggu

#### **Stage 3: 🎨 CSS Lanjutan**
- **Goal:** Membuat tampilan web yang menarik dan responsif
- **Skills:** Flexbox, Grid, Responsive design
- **Activities:** 3 latihan praktik
- **Duration:** ~2 minggu

#### **Stage 4: ⚙️ JavaScript Lanjutan**
- **Goal:** Membuat web lebih interaktif dan menyimpan data sederhana
- **Skills:** DOM manipulation, Event handling, LocalStorage
- **Activities:** 2 latihan praktik
- **Duration:** ~2 minggu

#### **Stage 5: 🚀 Mini Proyek**
- **Goal:** Menguatkan konsep dengan proyek web sederhana namun nyata
- **Skills:** Perencanaan proyek, Kolaborasi, Integrasi HTML/CSS/JS
- **Activities:** 4 pilihan proyek (Game, Chatbot, Blog, Portfolio)
- **Duration:** ~3 minggu

#### **Stage 6: 🌱 Skill Tambahan (Opsional)**
- **Goal:** Mengeksplor teknologi penunjang untuk siswa yang cepat tangkap
- **Skills:** Version control, CSS framework, React dasar
- **Activities:** 3 eksplorasi skill
- **Duration:** ~2 minggu

---

## 📚 **2. ASSIGNMENTS/TUGAS**

### **API Endpoint:** `/api/classroom/assignments`
**Method:** GET, POST

### **Seed Endpoint:** `/api/seed/assignments`
**Method:** POST
**Auth:** Required secret key

### **Total Assignments:** 14 tugas + 2 bonus

#### **📋 Assignment Categories:**

##### **🔰 Stage 1 - Web Fundamentals (3 tugas):**
1. **HTML Biodata** - Struktur HTML semantic
2. **CSS Styling** - Layout dan styling dasar
3. **JavaScript Interaktivity** - Event handling dan DOM

##### **📄 Stage 2 - HTML Advanced (2 tugas):**
4. **Semantic Website** - Multi-page dengan semantic HTML
5. **Registration Form** - Form handling dan validation

##### **🎨 Stage 3 - CSS Advanced (2 tugas):**
6. **Responsive Blog** - Flexbox dan Grid layout
7. **CSS Animations** - Transitions dan keyframes

##### **⚙️ Stage 4 - JavaScript Advanced (2 tugas):**
8. **Interactive Calculator** - DOM manipulation advanced
9. **Todo App** - LocalStorage dan state management

##### **🚀 Stage 5 - Projects (3 proyek):**
10. **Memory Game** - Game development dengan JavaScript
11. **Simple Chatbot** - Conversational interface
12. **Portfolio Website** - Full website project

##### **🌱 Stage 6 - Advanced Skills (2 bonus):**
13. **CSS Framework** - Tailwind/Bootstrap exploration
14. **React Basics** - Component-based development

### **Assignment Properties:**
```typescript
{
  id: string;
  title: string;
  description: string;
  subject: string;
  instructions: string[]; // Step-by-step instructions
  dueDate: Date;
  status: "active" | "closed" | "upcoming";
  maxSubmissions: number;
  submissionCount: number;
}
```

---

## 👥 **3. DEMO STUDENTS DATA**

### **API Endpoint:** `/api/seed/students`
**Method:** POST
**Auth:** Required secret key

### **Total Students:** 10 siswa demo

#### **📊 Student Distribution:**
- **X MIPA 1:** 2 siswa
- **X MIPA 2:** 2 siswa  
- **XI IPA 1:** 2 siswa
- **XI IPA 2:** 2 siswa
- **XII IPA 1:** 2 siswa

#### **🔐 Login Credentials:**
**Password untuk semua siswa:** `password123`

**Email Pattern:** `[nama]@student.smawahidiyah.sch.id`

### **Sample Students:**
1. **Ahmad Fauzi** (SW2024001) - X MIPA 1
2. **Siti Nurhaliza** (SW2024002) - X MIPA 1
3. **Budi Santoso** (SW2024003) - X MIPA 2
4. **Dewi Sartika** (SW2024004) - X MIPA 2
5. **Rizky Pratama** (SW2024005) - XI IPA 1
6. **Maya Putri** (SW2024006) - XI IPA 1
7. **Andi Wijaya** (SW2024007) - XI IPA 2
8. **Fatimah Zahra** (SW2024008) - XI IPA 2
9. **Muhammad Ikbal** (SW2024009) - XII IPA 1
10. **Nuraini Fitri** (SW2024010) - XII IPA 1

---

## 🚀 **4. SEEDING INSTRUCTIONS**

### **Prerequisites:**
- Database connection ready
- Environment variable `SEED_SECRET=gema-seed-2024` set
- Server running at localhost:3000

### **Seeding Commands:**

#### **1. Seed Assignments:**
```bash
curl -X POST http://localhost:3000/api/seed/assignments \
  -H "Content-Type: application/json" \
  -d '{"secret":"gema-seed-2024"}'
```

#### **2. Seed Students:**
```bash
curl -X POST http://localhost:3000/api/seed/students \
  -H "Content-Type: application/json" \
  -d '{"secret":"gema-seed-2024"}'
```

#### **3. Verify Roadmap Data:**
```bash
curl http://localhost:3000/api/roadmap/stages
```

#### **4. Verify Assignments:**
```bash
curl http://localhost:3000/api/classroom/assignments
```

---

## 📱 **5. STUDENT DASHBOARD FEATURES**

### **Available Features:**
1. **📋 Assignments Tab:**
   - View all assignments with status
   - Upload submissions
   - Track progress

2. **🎯 Roadmap Tab:**
   - Interactive learning roadmap
   - Progress tracking per stage
   - Checklist items for each activity
   - Reflection notes
   - LocalStorage progress saving

### **Student Login:**
- **URL:** `/student/login`
- **Test Account:** `ahmad.fauzi@student.smawahidiyah.sch.id`
- **Password:** `password123`

---

## 🎯 **6. LEARNING FLOW**

### **Recommended Learning Path:**
1. **Enrollment** → Student registers and gets account
2. **Stage Assessment** → Determine starting level
3. **Progressive Learning** → Follow roadmap stages sequentially
4. **Assignment Completion** → Complete assignments per stage
5. **Portfolio Building** → Collect all projects
6. **Final Assessment** → Complete final portfolio project

### **Progress Tracking:**
- **Roadmap Progress:** Saved in localStorage per student
- **Assignment Submissions:** Stored in database
- **Portfolio Collection:** Links to completed projects

---

## 🔧 **7. TECHNICAL NOTES**

### **Database Models Used:**
- `Assignment` - Tugas dan project assignments
- `Student` - Data siswa dan authentication
- `Submission` - File submissions dari siswa
- Roadmap data served from static API

### **API Integrations:**
- NextAuth.js untuk student authentication
- Prisma ORM untuk database operations
- LocalStorage untuk roadmap progress
- File upload handling untuk submissions

### **Security Features:**
- Bcrypt password hashing
- Session-based authentication
- Protected API routes
- File type validation untuk uploads

---

## 🎉 **SUCCESS INDICATORS**

### **✅ Seeding Completed Successfully When:**
- 14 assignments created with proper instructions
- 10 demo students with verified accounts
- Roadmap API returning 6 stages with activities
- Student dashboard showing both tabs functional
- Assignment upload system working
- Progress tracking operational

### **🧪 Testing Checklist:**
- [ ] Students can login successfully
- [ ] Assignments visible in dashboard
- [ ] Roadmap interactive and saves progress
- [ ] File upload works for assignments
- [ ] Progress bars update correctly
- [ ] LocalStorage persistence working
- [ ] All API endpoints responding correctly

---

**🏫 SMA Wahidiyah Kediri - GEMA Learning Management System**
**📅 Generated: September 26, 2025**