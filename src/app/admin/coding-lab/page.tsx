'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Code, Clock, Plus, Edit, Trash2, Eye, BookOpen } from 'lucide-react'

interface CodingLab {
  id: string
  title: string
  description: string
  difficulty: string
  language: string
  points: number
  duration: number
  isActive: boolean
  exercisesCount: number
  exercises: Array<{
    id: string
    title: string
    difficulty: string
    points: number
    isActive: boolean
  }>
  createdAt: string
}

export default function AdminCodingLabPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [labs, setLabs] = useState<CodingLab[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    } else if (status === 'authenticated') {
      fetchLabs()
    }
  }, [status, router])

  const fetchLabs = async () => {
    try {
      const response = await fetch('/api/coding-lab')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setLabs(result.data || [])
        } else {
          console.error('API returned error:', result.error)
        }
      } else {
        console.error('Failed to fetch labs:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching labs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateLab = async (formData: FormData) => {
    try {
      const data = {
        title: formData.get('title'),
        description: formData.get('description'),
        difficulty: formData.get('difficulty'),
        language: formData.get('language'),
        points: parseInt(formData.get('points') as string) || 100,
        duration: parseInt(formData.get('duration') as string) || 60,
        isActive: formData.get('isActive') === 'on'
      }

      const response = await fetch('/api/coding-lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setShowCreateForm(false)
          fetchLabs()
        } else {
          console.error('Failed to create lab:', result.error)
        }
      } else {
        console.error('Failed to create lab:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error creating lab:', error)
    }
  }

  const handleDeleteLab = async (labId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus lab ini?')) return

    try {
      const response = await fetch(`/api/coding-lab/${labId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          fetchLabs()
        } else {
          console.error('Failed to delete lab:', result.error)
        }
      } else {
        console.error('Failed to delete lab:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error deleting lab:', error)
    }
  }

  const handleToggleActive = async (labId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/coding-lab/${labId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          fetchLabs()
        } else {
          console.error('Failed to update lab:', result.error)
        }
      } else {
        console.error('Failed to update lab:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error updating lab:', error)
    }
  }

  if (status === 'loading' || loading) {
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
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Code className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Coding Lab</h1>
              <p className="text-lg text-gray-600 mt-1">
                Kelola latihan coding interaktif untuk siswa
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Buat Lab Baru
          </button>
        </div>

        {/* Labs Grid */}
        {labs.length === 0 ? (
          <div className="text-center py-12">
            <Code className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada Coding Lab</h3>
            <p className="text-gray-600 mb-6">Mulai buat lab coding pertama untuk siswa</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Buat Lab Pertama
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {labs.map((lab) => (
              <div key={lab.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{lab.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{lab.description}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    lab.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {lab.isActive ? 'Aktif' : 'Non-aktif'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Code className="w-4 h-4" />
                    <span>{lab.language}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{lab.duration} menit</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen className="w-4 h-4" />
                    <span>{lab.exercisesCount} soal</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    lab.difficulty === 'BEGINNER' ? 'bg-green-100 text-green-800' :
                    lab.difficulty === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {lab.difficulty === 'BEGINNER' ? 'Pemula' :
                     lab.difficulty === 'INTERMEDIATE' ? 'Menengah' : 'Lanjutan'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleActive(lab.id, lab.isActive)}
                      className={`p-2 transition-colors ${
                        lab.isActive
                          ? 'text-green-600 hover:text-green-700'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title={lab.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => router.push(`/admin/coding-lab/${lab.id}/edit`)}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteLab(lab.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Lab Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Buat Coding Lab Baru</h3>
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target as HTMLFormElement)
                handleCreateLab(formData)
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                    <input
                      name="title"
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Contoh: Basic Algorithms"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                    <textarea
                      name="description"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Jelaskan tentang lab ini..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bahasa</label>
                      <select
                        name="language"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="JavaScript">JavaScript</option>
                        <option value="Python">Python</option>
                        <option value="Java">Java</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tingkat</label>
                      <select
                        name="difficulty"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="BEGINNER">Pemula</option>
                        <option value="INTERMEDIATE">Menengah</option>
                        <option value="ADVANCED">Lanjutan</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Poin</label>
                      <input
                        name="points"
                        type="number"
                        defaultValue={100}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Durasi (menit)</label>
                      <input
                        name="duration"
                        type="number"
                        defaultValue={60}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <input
                      name="isActive"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Aktifkan lab ini</label>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Buat Lab
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}