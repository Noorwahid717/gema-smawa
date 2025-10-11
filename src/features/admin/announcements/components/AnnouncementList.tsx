import { Calendar, Edit, Trash2 } from 'lucide-react'

import type { Announcement, AnnouncementTypeOption } from '../types'

interface AnnouncementListProps {
  announcements: Announcement[]
  isLoading: boolean
  onEdit: (announcement: Announcement) => void
  onDelete: (id: string) => void
  options: AnnouncementTypeOption[]
  formatDate: (value: string) => string
}

export function AnnouncementList({
  announcements,
  isLoading,
  onEdit,
  onDelete,
  options,
  formatDate,
}: AnnouncementListProps) {
  const typeMap = options.reduce<Record<string, AnnouncementTypeOption>>((acc, option) => {
    acc[option.value] = option
    return acc
  }, {})

  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>
  }

  if (announcements.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Belum ada pengumuman. Tambahkan pengumuman pertama Anda!
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {announcements.map(announcement => {
        const meta = typeMap[announcement.type]

        return (
          <div key={announcement.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${meta?.badgeClass ?? 'bg-gray-100 text-gray-700'}`}>
                    {meta?.label ?? announcement.type}
                  </span>
                  {!announcement.isActive && (
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-gray-200 text-gray-700">
                      Nonaktif
                    </span>
                  )}
                  {announcement.showOnHomepage && (
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800">
                      Landing Page
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                <p className="text-gray-600 whitespace-pre-line">{announcement.content}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  Dipublikasikan pada {formatDate(announcement.publishDate || announcement.createdAt)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(announcement)}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                  type="button"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => onDelete(announcement.id)}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800"
                  type="button"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
