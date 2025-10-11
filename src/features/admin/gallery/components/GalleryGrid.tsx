import Image from 'next/image'
import { Edit, Trash2 } from 'lucide-react'

import type { GalleryCategoryOption, GalleryItem } from '../types'

interface GalleryGridProps {
  items: GalleryItem[]
  isLoading: boolean
  onEdit: (item: GalleryItem) => void
  onDelete: (id: string) => void
  options: GalleryCategoryOption[]
}

export function GalleryGrid({ items, isLoading, onEdit, onDelete, options }: GalleryGridProps) {
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
              className="object-cover"
              unoptimized
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
    </div>
  )
}
