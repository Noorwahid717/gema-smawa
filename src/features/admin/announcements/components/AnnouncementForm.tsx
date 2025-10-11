import type { ChangeEvent, FormEvent } from 'react'
import { Loader2, Plus, Save } from 'lucide-react'

import type { AnnouncementFormData, AnnouncementTypeOption } from '../types'

interface AnnouncementFormProps {
  formData: AnnouncementFormData
  isEditing: boolean
  isSubmitting: boolean
  showForm: boolean
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  options: AnnouncementTypeOption[]
}

export function AnnouncementForm({
  formData,
  isEditing,
  isSubmitting,
  showForm,
  onChange,
  onClose,
  onSubmit,
  options,
}: AnnouncementFormProps) {
  if (!showForm) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              {isEditing ? 'Edit Pengumuman' : 'Tambah Pengumuman'}
            </h2>
            <p className="text-sm text-gray-600">Kelola informasi yang ditampilkan kepada siswa</p>
          </div>
          <button
            onClick={onClose}
            className="text-sm text-gray-600 hover:text-gray-900"
            type="button"
          >
            Tutup
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan judul pengumuman"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Konten</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={onChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Isi pengumuman"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Pengumuman</label>
              <select
                name="type"
                value={formData.type}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                id="announcement-active"
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={onChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="announcement-active" className="text-sm text-gray-700">
                Aktifkan pengumuman
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="announcement-homepage"
              type="checkbox"
              name="showOnHomepage"
              checked={formData.showOnHomepage}
              onChange={onChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="announcement-homepage" className="text-sm text-gray-700">
              Tampilkan pengumuman ini di landing page
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isEditing ? (
                <Save className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {isSubmitting ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambahkan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
