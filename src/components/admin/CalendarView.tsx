'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar, MapPin, Users } from 'lucide-react'

interface Activity {
  id: string
  title: string
  description?: string
  date: string
  location?: string
  capacity?: number
  registered: number
  isActive: boolean
  showOnHomepage: boolean
  createdAt: string
}

interface CalendarViewProps {
  activities: Activity[]
  onEdit: (activity: Activity) => void
  onDelete: (id: string) => void
}

export default function CalendarView({ activities, onEdit, onDelete }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getActivitiesForDate = (date: Date) => {
    return activities.filter(activity => {
      const activityDate = new Date(activity.date)
      return activityDate.toDateString() === date.toDateString()
    })
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const days = getDaysInMonth(currentDate)
  const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Calendar Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Kalender Kegiatan</h2>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
          >
            Hari Ini
          </button>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h3 className="text-xl font-semibold text-gray-900">
            {formatMonthYear(currentDate)}
          </h3>

          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            if (!date) {
              return <div key={index} className="p-2"></div>
            }

            const dayActivities = getActivitiesForDate(date)
            const isToday = date.toDateString() === new Date().toDateString()
            const isPast = date < new Date() && !isToday

            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border border-gray-200 rounded-md ${
                  isToday ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                } ${isPast ? 'bg-gray-50' : ''}`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isToday ? 'text-blue-600' : isPast ? 'text-gray-400' : 'text-gray-900'
                }`}>
                  {date.getDate()}
                </div>

                <div className="space-y-1">
                  {dayActivities.slice(0, 3).map(activity => (
                    <div
                      key={activity.id}
                      className={`text-xs p-1 rounded cursor-pointer ${
                        activity.isActive
                          ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      onClick={() => onEdit(activity)}
                      title={`${activity.title} - ${activity.location || 'Lokasi belum ditentukan'}`}
                    >
                      <div className="font-medium truncate">{activity.title}</div>
                      {activity.location && (
                        <div className="flex items-center text-xs opacity-75">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span className="truncate">{activity.location}</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {dayActivities.length > 3 && (
                    <div className="text-xs text-gray-500 px-1">
                      +{dayActivities.length - 3} lagi
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Activities List View (Alternative) */}
      <div className="p-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Daftar Kegiatan Bulan Ini</h3>

        {activities.filter(activity => {
          const activityDate = new Date(activity.date)
          return activityDate.getMonth() === currentDate.getMonth() &&
                 activityDate.getFullYear() === currentDate.getFullYear()
        }).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Tidak ada kegiatan di bulan ini
          </div>
        ) : (
          <div className="space-y-3">
            {activities
              .filter(activity => {
                const activityDate = new Date(activity.date)
                return activityDate.getMonth() === currentDate.getMonth() &&
                       activityDate.getFullYear() === currentDate.getFullYear()
              })
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map(activity => (
                <div key={activity.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900">{activity.title}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          activity.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {activity.isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                        {activity.showOnHomepage && (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            Landing Page
                          </span>
                        )}
                      </div>

                      {activity.description && (
                        <p className="text-gray-600 text-sm mb-2">{activity.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(activity.date).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>

                        {activity.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {activity.location}
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {activity.registered}/{activity.capacity || '∞'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => onEdit(activity)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(activity.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}