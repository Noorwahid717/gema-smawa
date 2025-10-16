'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Code, Clock, AlertCircle, CheckCircle } from 'lucide-react'

export default function AdminCodingLabPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Code className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Coding Lab</h1>
          </div>
          <p className="text-lg text-gray-600">
            Sistem latihan coding interaktif untuk siswa
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                🚧 Dalam Pengembangan
              </h3>
              <p className="text-blue-800 mb-4">
                Sistem Coding Lab saat ini masih dalam tahap pengembangan. Fitur ini akan segera hadir dengan:
              </p>
              <ul className="text-blue-700 space-y-1">
                <li>• Latihan coding interaktif dengan berbagai bahasa pemrograman</li>
                <li>• Sistem penilaian otomatis untuk setiap submission</li>
                <li>• Progress tracking dan analytics siswa</li>
                <li>• Manajemen soal dan test cases</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Yang Sudah Selesai</h3>
            </div>
            <ul className="text-gray-600 space-y-2">
              <li>✅ Interface student untuk latihan coding</li>
              <li>✅ Code editor dengan syntax highlighting</li>
              <li>✅ Sistem test case dan validasi</li>
              <li>✅ Mock data untuk demonstrasi</li>
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Dalam Pengembangan</h3>
            </div>
            <ul className="text-gray-600 space-y-2">
              <li>🔄 Sistem submission dan penyimpanan</li>
              <li>🔄 API backend untuk coding exercises</li>
              <li>🔄 Dashboard admin untuk manajemen</li>
              <li>🔄 Analytics dan reporting</li>
            </ul>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Langkah Selanjutnya</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium text-gray-900">Database Schema</p>
                <p className="text-gray-600">Membuat tabel untuk coding exercises, test cases, dan submissions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium text-gray-900">API Development</p>
                <p className="text-gray-600">Membangun REST API untuk manajemen coding exercises</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium text-gray-900">Admin Interface</p>
                <p className="text-gray-600">Membuat interface admin untuk mengelola coding exercises</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                4
              </div>
              <div>
                <p className="font-medium text-gray-900">Testing & Deployment</p>
                <p className="text-gray-600">Testing menyeluruh dan deployment fitur lengkap</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}