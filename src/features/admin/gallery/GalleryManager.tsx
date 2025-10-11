"use client"

import type { ChangeEvent, FormEvent } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useToast } from '@/components/feedback/toast'

import { GalleryForm } from './components/GalleryForm'
import { GalleryGrid } from './components/GalleryGrid'
import type { GalleryCategoryOption, GalleryFormData, GalleryItem } from './types'

const DEFAULT_FORM: GalleryFormData = {
  title: '',
  description: '',
  imageUrl: '',
  category: 'general',
  isActive: true,
  showOnHomepage: false,
}

const CATEGORY_OPTIONS: GalleryCategoryOption[] = [
  { value: 'general', label: 'Umum' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'event', label: 'Event' },
  { value: 'competition', label: 'Kompetisi' },
  { value: 'project', label: 'Proyek' },
]

export function GalleryManager() {
  const { addToast } = useToast()
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null)
  const [formData, setFormData] = useState<GalleryFormData>(DEFAULT_FORM)

  const categoryOptions = useMemo(() => CATEGORY_OPTIONS, [])

  const resetForm = useCallback(() => {
    setFormData(DEFAULT_FORM)
    setEditingItem(null)
    setIsFormVisible(false)
  }, [])

  const fetchGallery = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/gallery')
      if (!response.ok) {
        throw new Error('Gagal memuat data galeri')
      }

      const data = (await response.json()) as GalleryItem[]
      setGallery(data)
    } catch (error) {
      console.error(error)
      addToast({
        type: 'error',
        title: 'Gagal Memuat',
        message: 'Tidak dapat memuat galeri. Silakan coba lagi.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    fetchGallery()
  }, [fetchGallery])

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
        const response = await fetch('/api/admin/gallery', {
          method: editingItem ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingItem ? { id: editingItem.id, ...formData } : formData),
        })

        if (!response.ok) {
          throw new Error('Gagal menyimpan galeri')
        }

        addToast({
          type: 'success',
          title: 'Berhasil',
          message: editingItem ? 'Galeri berhasil diperbarui.' : 'Dokumentasi baru berhasil ditambahkan.',
        })

        await fetchGallery()
        resetForm()
      } catch (error) {
        console.error(error)
        addToast({
          type: 'error',
          title: 'Gagal Menyimpan',
          message: 'Tidak dapat menyimpan galeri. Silakan coba lagi.',
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [addToast, editingItem, fetchGallery, formData, resetForm],
  )

  const handleEdit = useCallback((item: GalleryItem) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      description: item.description ?? '',
      imageUrl: item.imageUrl,
      category: item.category,
      isActive: item.isActive,
      showOnHomepage: item.showOnHomepage,
    })
    setIsFormVisible(true)
  }, [])

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Apakah Anda yakin ingin menghapus dokumentasi ini?')) {
        return
      }

      try {
        const response = await fetch(`/api/admin/gallery?id=${id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Gagal menghapus galeri')
        }

        addToast({
          type: 'success',
          title: 'Dokumentasi Dihapus',
          message: 'Dokumentasi galeri berhasil dihapus.',
        })

        await fetchGallery()
      } catch (error) {
        console.error(error)
        addToast({
          type: 'error',
          title: 'Gagal Menghapus',
          message: 'Tidak dapat menghapus dokumentasi. Silakan coba lagi.',
        })
      }
    },
    [addToast, fetchGallery],
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Galeri Kegiatan</h1>
          <p className="text-gray-600">Kelola dokumentasi foto kegiatan komunitas GEMA</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchGallery}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            type="button"
          >
            Muat Ulang
          </button>
          <button
            onClick={() => {
              setIsFormVisible(true)
              setEditingItem(null)
              setFormData(DEFAULT_FORM)
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            type="button"
          >
            Tambah Dokumentasi
          </button>
        </div>
      </div>

      <GalleryForm
        formData={formData}
        isEditing={Boolean(editingItem)}
        isSubmitting={isSubmitting}
        onChange={handleChange}
        onClose={resetForm}
        onSubmit={handleSubmit}
        options={categoryOptions}
        showForm={isFormVisible}
      />

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Daftar Dokumentasi</h2>
            <p className="text-sm text-gray-500">Total {gallery.length} dokumentasi</p>
          </div>

          <GalleryGrid
            items={gallery}
            isLoading={isLoading}
            onDelete={handleDelete}
            onEdit={handleEdit}
            options={categoryOptions}
          />
        </div>
      </div>
    </div>
  )
}

export { CATEGORY_OPTIONS }
