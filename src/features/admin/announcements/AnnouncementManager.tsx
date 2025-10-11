"use client"

import type { ChangeEvent, FormEvent } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useToast } from '@/components/feedback/toast'

import { AnnouncementForm } from './components/AnnouncementForm'
import { AnnouncementList } from './components/AnnouncementList'
import type { Announcement, AnnouncementFormData, AnnouncementType, AnnouncementTypeOption } from './types'

const DEFAULT_FORM: AnnouncementFormData = {
  title: '',
  content: '',
  type: 'info',
  isActive: true,
  showOnHomepage: false,
}

const TYPE_OPTIONS: AnnouncementTypeOption[] = [
  { value: 'info', label: 'Informasi', badgeClass: 'bg-blue-100 text-blue-800' },
  { value: 'warning', label: 'Peringatan', badgeClass: 'bg-yellow-100 text-yellow-800' },
  { value: 'success', label: 'Sukses', badgeClass: 'bg-green-100 text-green-800' },
  { value: 'error', label: 'Error', badgeClass: 'bg-red-100 text-red-800' },
]

export function AnnouncementManager() {
  const { addToast } = useToast()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [formData, setFormData] = useState<AnnouncementFormData>(DEFAULT_FORM)

  const typeOptions = useMemo(() => TYPE_OPTIONS, [])

  const resetForm = useCallback(() => {
    setFormData(DEFAULT_FORM)
    setEditingAnnouncement(null)
    setIsFormVisible(false)
  }, [])

  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/announcements')
      if (!response.ok) {
        throw new Error('Gagal mengambil data pengumuman')
      }

      const data = (await response.json()) as Announcement[]
      setAnnouncements(data)
    } catch (error) {
      console.error(error)
      addToast({
        type: 'error',
        title: 'Gagal Memuat',
        message: 'Tidak dapat memuat data pengumuman. Silakan coba lagi.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    fetchAnnouncements()
  }, [fetchAnnouncements])

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, type, value } = event.target
      const nextValue = type === 'checkbox' ? (event.target as HTMLInputElement).checked : value

      setFormData(prev => ({
        ...prev,
        [name]: nextValue,
      }))
    },
    [],
  )

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setIsSubmitting(true)

      try {
        const response = await fetch('/api/admin/announcements', {
          method: editingAnnouncement ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            editingAnnouncement ? { id: editingAnnouncement.id, ...formData } : formData,
          ),
        })

        if (!response.ok) {
          throw new Error('Gagal menyimpan pengumuman')
        }

        addToast({
          type: 'success',
          title: 'Berhasil',
          message: editingAnnouncement ? 'Pengumuman berhasil diperbarui.' : 'Pengumuman baru berhasil ditambahkan.',
        })

        await fetchAnnouncements()
        resetForm()
      } catch (error) {
        console.error(error)
        addToast({
          type: 'error',
          title: 'Gagal Menyimpan',
          message: 'Tidak dapat menyimpan pengumuman. Silakan coba lagi.',
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [addToast, editingAnnouncement, fetchAnnouncements, formData, resetForm],
  )

  const handleEdit = useCallback((announcement: Announcement) => {
    setEditingAnnouncement(announcement)
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      isActive: announcement.isActive,
      showOnHomepage: announcement.showOnHomepage,
    })
    setIsFormVisible(true)
  }, [])

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) {
        return
      }

      try {
        const response = await fetch(`/api/admin/announcements?id=${id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Gagal menghapus pengumuman')
        }

        addToast({
          type: 'success',
          title: 'Pengumuman Dihapus',
          message: 'Pengumuman berhasil dihapus.',
        })

        await fetchAnnouncements()
      } catch (error) {
        console.error(error)
        addToast({
          type: 'error',
          title: 'Gagal Menghapus',
          message: 'Tidak dapat menghapus pengumuman. Silakan coba lagi.',
        })
      }
    },
    [addToast, fetchAnnouncements],
  )

  const formatDate = useCallback((value: string) => {
    return new Date(value).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengumuman</h1>
          <p className="text-gray-600">Kelola pengumuman terbaru untuk siswa dan orang tua</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchAnnouncements}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            type="button"
          >
            Muat Ulang
          </button>
          <button
            onClick={() => {
              setIsFormVisible(true)
              setEditingAnnouncement(null)
              setFormData(DEFAULT_FORM)
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            type="button"
          >
            Tambah Pengumuman
          </button>
        </div>
      </div>

      <AnnouncementForm
        formData={formData}
        isEditing={Boolean(editingAnnouncement)}
        isSubmitting={isSubmitting}
        onChange={handleChange}
        onClose={resetForm}
        onSubmit={handleSubmit}
        options={typeOptions}
        showForm={isFormVisible}
      />

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Daftar Pengumuman</h2>
            <p className="text-sm text-gray-500">Total {announcements.length} pengumuman</p>
          </div>

          <AnnouncementList
            announcements={announcements}
            formatDate={formatDate}
            isLoading={isLoading}
            onDelete={handleDelete}
            onEdit={handleEdit}
            options={typeOptions}
          />
        </div>
      </div>
    </div>
  )
}

export { TYPE_OPTIONS }
export type { AnnouncementType }
