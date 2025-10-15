import Image from 'next/image'
import { Edit, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'

import type { GalleryCategoryOption, GalleryItem } from '../types'

interface GalleryGridProps {
  items: GalleryItem[]
  isLoading: boolean
  onEdit: (item: GalleryItem) => void
  onDelete: (id: string) => void
  options: GalleryCategoryOption[]
}

export function GalleryGrid({ items, isLoading, onEdit, onDelete, options }: GalleryGridProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  const openModal = (index: number) => {
    setSelectedImageIndex(index)
  }

  const closeModal = () => {
    setSelectedImageIndex(null)
  }

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImageIndex === null) return

    const newIndex = direction === 'prev'
      ? (selectedImageIndex - 1 + items.length) % items.length
      : (selectedImageIndex + 1) % items.length

    setSelectedImageIndex(newIndex)
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (selectedImageIndex === null) return

    switch (event.key) {
      case 'Escape':
        closeModal()
        break
      case 'ArrowLeft':
        navigateImage('prev')
        break
      case 'ArrowRight':
        navigateImage('next')
        break
    }
  }

  useEffect(() => {
    if (selectedImageIndex !== null) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [selectedImageIndex])

  const categoryMap = options.reduce<Record<string, string>>((acc, option) => {
    acc[option.value] = option.label
    return acc
  }, {})

  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Belum ada dokumentasi galeri. Tambahkan dokumentasi kegiatan terbaru!
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map(item => (
        <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="relative h-48 w-full">
            <Image
              src={item.imageUrl || '/gema.svg'}
              alt={item.title}
              fill
              className="object-cover cursor-pointer hover:opacity-90 transition-opacity"
              unoptimized
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onClick={() => openModal(items.indexOf(item))}
            />
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-700">
                {categoryMap[item.category] ?? item.category}
              </span>
            </div>
            {item.description && (
              <p className="text-sm text-gray-600">{item.description}</p>
            )}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{new Date(item.createdAt).toLocaleDateString('id-ID')}</span>
              <div className="flex items-center gap-2">
                {!item.isActive && (
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-gray-200 text-gray-700">
                    Disembunyikan
                  </span>
                )}
                {item.showOnHomepage && (
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800">
                    Landing Page
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => onEdit(item)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                type="button"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800"
                type="button"
              >
                <Trash2 className="w-4 h-4" />
                Hapus
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {/* Image Modal */}
      {selectedImageIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
          <div className="relative max-w-4xl max-h-screen p-4">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 z-10 p-2 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation buttons */}
            {items.length > 1 && (
              <>
                <button
                  onClick={() => navigateImage('prev')}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 text-white hover:text-gray-300 transition-colors"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={() => navigateImage('next')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-white hover:text-gray-300 transition-colors"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Image */}
            <div className="relative">
              <Image
                src={items[selectedImageIndex].imageUrl || '/gema.svg'}
                alt={items[selectedImageIndex].title}
                width={800}
                height={600}
                className="max-w-full max-h-screen object-contain"
                unoptimized
              />
            </div>

            {/* Image info */}
            <div className="mt-4 text-white">
              <h3 className="text-xl font-semibold">{items[selectedImageIndex].title}</h3>
              {items[selectedImageIndex].description && (
                <p className="text-gray-300 mt-2">{items[selectedImageIndex].description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                <span>Kategori: {categoryMap[items[selectedImageIndex].category] ?? items[selectedImageIndex].category}</span>
                <span>{new Date(items[selectedImageIndex].createdAt).toLocaleDateString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
