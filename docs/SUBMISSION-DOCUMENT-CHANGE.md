# 📄 Perubahan Sistem Pengumpulan Asesmen

## 📋 Ringkasan Perubahan

Sistem pengumpulan asesmen telah diubah dari metode upload file ZIP menjadi **upload dokumen (PDF, DOC, DOCX)** yang dapat langsung ditinjau oleh admin tanpa perlu download terlebih dahulu.

---

## 🔄 Perubahan Database

### 1. **Tabel `submissions`** - Tambahan Field Baru

```sql
ALTER TABLE "submissions" ADD COLUMN "documentType" TEXT;
ALTER TABLE "submissions" ADD COLUMN "previewUrl" TEXT;
```

**Field Baru:**
- `documentType` (TEXT, nullable): Jenis dokumen ('pdf', 'doc', 'docx')
- `previewUrl` (TEXT, nullable): URL untuk preview dokumen langsung

### 2. **Tabel `assignments`** - Update Default Value

```sql
ALTER TABLE "assignments" 
ALTER COLUMN "allowedFileTypes" SET DEFAULT 'pdf,doc,docx';
```

**Perubahan:**
- `allowedFileTypes` default value: `'pdf,doc,docx'` (sebelumnya nullable)
- Semua assignment existing di-update untuk hanya terima dokumen

---

## 💻 Perubahan Kode

### 1. **API Upload Submission** (`/api/tutorial/submissions`)

**File:** `src/app/api/tutorial/submissions/route.ts`

**Perubahan:**
```typescript
// SEBELUM: Menerima berbagai jenis file
const allowedTypes = [
  'application/pdf',
  'application/msword',
  'application/zip', // ❌ Dihapus
  'text/html',       // ❌ Dihapus
  'image/jpeg',      // ❌ Dihapus
  // ... dll
];

// SESUDAH: Hanya menerima dokumen
const allowedTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const allowedExtensions = ['pdf', 'doc', 'docx'];
```

**Fitur Baru:**
- Validasi ketat hanya untuk dokumen
- Auto-detect document type
- Simpan preview URL untuk akses langsung

### 2. **Student Upload UI** (`/student/assignments/[id]`)

**File:** `src/app/student/assignments/[id]/page.tsx`

**Perubahan:**
```tsx
// SEBELUM
accept=".pdf,.doc,.docx,.zip,.rar"

// SESUDAH
accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
```

**UI Updates:**
- Text: "Pilih dokumen untuk diupload" (sebelumnya: "file")
- Help text: "Format dokumen: PDF, DOC, DOCX" (sebelumnya: termasuk ZIP, RAR)
- Info tambahan: "✓ Dokumen dapat langsung ditinjau oleh admin tanpa perlu download"

### 3. **Admin Review Panel** (`/admin/asesmen`)

**File:** `src/app/admin/asesmen/page.tsx`

**Perubahan Fungsi:**
```typescript
// FUNGSI BARU: Preview dokumen langsung
const handlePreviewSubmission = async (submissionId: string) => {
  // Buka dokumen di tab baru untuk preview
  window.open(data.data.previewUrl, '_blank');
};

// FUNGSI UPDATE: Download dengan force download
const handleDownloadSubmission = async (submissionId: string) => {
  // Force download dengan createElement('a')
  const link = document.createElement('a');
  link.href = data.data.filePath;
  link.download = data.data.originalFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
```

**UI Updates:**
- **Tombol Preview** (🔵 Eye icon): Buka dokumen di tab baru
- **Tombol Download** (🟢 FileText icon): Force download file
- Layout: 2 tombol side-by-side untuk setiap submission

---

## 🎯 Manfaat Perubahan

### Untuk Siswa:
1. ✅ **Lebih Sederhana**: Hanya upload 1 file dokumen (bukan ZIP berisi banyak file)
2. ✅ **Lebih Cepat**: Tidak perlu compress/extract file
3. ✅ **Lebih Jelas**: Format dokumen standar (PDF/DOC/DOCX) yang semua orang familiar

### Untuk Admin:
1. ✅ **Preview Langsung**: Buka dokumen langsung tanpa download
2. ✅ **Review Lebih Cepat**: Tidak perlu extract ZIP, langsung baca isi dokumen
3. ✅ **Akses Mudah**: Klik preview untuk melihat isi submission
4. ✅ **Tetap Bisa Download**: Jika perlu menyimpan lokal

### Untuk Sistem:
1. ✅ **Storage Lebih Efisien**: File dokumen umumnya lebih kecil dari ZIP multi-file
2. ✅ **Cloudinary Optimization**: Cloudinary bisa optimize PDF preview
3. ✅ **Security**: Lebih aman karena tidak ada executable files dalam ZIP

---

## 🔧 Migrasi Data Existing

Migration script otomatis menangani data existing:

```sql
-- Update existing submissions
UPDATE "submissions" 
SET "documentType" = CASE 
    WHEN "mimeType" = 'application/pdf' THEN 'pdf'
    WHEN "mimeType" = 'application/msword' THEN 'doc'
    WHEN "mimeType" = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' THEN 'docx'
    ELSE NULL
END
WHERE "documentType" IS NULL;

UPDATE "submissions" 
SET "previewUrl" = "filePath"
WHERE "previewUrl" IS NULL AND "filePath" IS NOT NULL;

-- Update existing assignments
UPDATE "assignments" 
SET "allowedFileTypes" = 'pdf,doc,docx'
WHERE "allowedFileTypes" IS NULL OR "allowedFileTypes" = '';
```

**Backward Compatibility:**
- Submission lama dengan ZIP/file lain tetap tersimpan
- Preview URL di-set ke file path existing
- Tidak ada data loss

---

## 📝 Dokumentasi API

### POST `/api/tutorial/submissions`

**Request:**
```typescript
FormData {
  file: File (PDF/DOC/DOCX only, max 10MB)
  studentName: string
  studentId: string
  assignmentId: string
}
```

**Response:**
```typescript
{
  success: true,
  message: 'File uploaded successfully',
  submission: {
    id: string,
    studentName: string,
    studentId: string,
    assignmentTitle: string,
    fileName: string,
    originalFileName: string,
    filePath: string,
    fileSize: number,
    documentType: 'pdf' | 'doc' | 'docx',
    previewUrl: string,
    submittedAt: string (ISO),
    status: 'submitted' | 'late',
    isLate: boolean
  }
}
```

**Error Responses:**
```typescript
// File type not allowed
{
  error: 'File type not allowed. Only PDF, DOC, and DOCX files are accepted for assignment submissions.',
  status: 400
}

// File too large
{
  error: 'File size too large. Maximum 10MB allowed.',
  status: 400
}

// Already submitted
{
  error: 'You have already submitted for this assignment',
  status: 400
}

// Assignment closed
{
  error: 'Assignment is closed for submissions',
  status: 400
}
```

### GET `/api/tutorial/submissions/[id]`

**Response:**
```typescript
{
  success: true,
  data: {
    id: string,
    fileName: string,
    originalFileName: string,
    filePath: string, // Direct download URL
    previewUrl: string, // Preview URL (same as filePath for documents)
    documentType: 'pdf' | 'doc' | 'docx',
    fileSize: number,
    mimeType: string,
    submittedAt: string,
    status: string,
    isLate: boolean,
    grade: number | null,
    feedback: string | null,
    downloadUrl: string, // Alias for filePath
    studentName: string,
    studentEmail: string,
    assignmentTitle: string,
    assignmentSubject: string
  }
}
```

---

## 🧪 Testing Checklist

### Student Flow:
- [x] Upload PDF file → Success
- [x] Upload DOC file → Success
- [x] Upload DOCX file → Success
- [ ] Upload ZIP file → Rejected dengan error message
- [ ] Upload file > 10MB → Rejected dengan error message
- [ ] Upload duplicate → Rejected dengan error message
- [ ] Late submission → Marked as 'late'

### Admin Flow:
- [ ] Click Preview button → Open document in new tab
- [ ] Click Download button → Force download file
- [ ] Preview PDF → Can view inline in browser
- [ ] Preview DOC → Browser opens/downloads
- [ ] Preview DOCX → Browser opens/downloads
- [ ] View submission list → Shows document type

### Database:
- [x] New submissions → documentType & previewUrl saved
- [x] Existing submissions → Migrated with documentType
- [x] Existing assignments → allowedFileTypes updated
- [x] No data loss → All old submissions accessible

---

## 🚀 Deployment Steps

1. **Backup Database** (PENTING!)
```bash
# Backup production database sebelum migration
pg_dump $DATABASE_URL > backup_before_doc_migration.sql
```

2. **Run Migration**
```bash
cd /home/noah/project/gema-smawa
npx prisma migrate deploy
npx prisma generate
```

3. **Test in Staging** (jika ada)
- Upload test documents
- Test preview functionality
- Test download functionality

4. **Deploy to Production**
```bash
npm run build
# Deploy via Vercel/platform
```

5. **Verify Post-Deployment**
- Check existing submissions still accessible
- Test new submission flow
- Test admin preview/download

---

## 📌 Notes & Limitations

### Current Limitations:
1. **DOC/DOCX Preview**: Browser mungkin auto-download instead of preview inline (berbeda dengan PDF yang bisa inline preview)
2. **File Size**: Masih 10MB limit (sama seperti sebelumnya)
3. **Single File**: Hanya 1 dokumen per submission (tidak bisa multiple files)

### Future Enhancements:
1. **Document Converter**: Convert DOC/DOCX to PDF untuk consistent inline preview
2. **Thumbnail Generator**: Generate thumbnail untuk quick preview
3. **Version Control**: Allow update submission dengan versioning
4. **Batch Download**: Admin dapat download multiple submissions sekaligus
5. **Plagiarism Check**: Integrate plagiarism detection untuk dokumen
6. **Online Editor**: Allow edit dokumen directly di browser (Google Docs style)

---

## 🐛 Known Issues & Solutions

### Issue 1: TypeScript Error - documentType not in type
**Error:**
```
Object literal may only specify known properties, 
and 'documentType' does not exist in type
```

**Solution:**
```bash
npx prisma generate
# Restart TypeScript server (VS Code: Cmd/Ctrl + Shift + P → Restart TS Server)
```

### Issue 2: Preview not working for DOC files
**Cause:** Browser tidak support inline preview untuk DOC

**Workaround:** Browser akan auto-download file, user bisa buka dengan aplikasi

**Permanent Fix (TODO):**
```typescript
// Convert DOC to PDF on upload for consistent preview
import { convertDocToPdf } from '@/lib/document-converter';

if (documentType === 'doc' || documentType === 'docx') {
  const pdfBuffer = await convertDocToPdf(buffer);
  // Upload PDF version untuk preview
}
```

---

## 📞 Support

Jika ada masalah setelah deployment:

1. **Check Migration Status**
```bash
npx prisma migrate status
```

2. **Rollback Migration** (jika ada masalah)
```bash
# Restore dari backup
psql $DATABASE_URL < backup_before_doc_migration.sql
```

3. **Check Logs**
```bash
# Vercel
vercel logs

# Local
npm run dev
```

---

**Date:** 23 Oktober 2025  
**Version:** 1.0  
**Migration:** `20251023164149_update_submission_for_documents`  
**Status:** ✅ Deployed
