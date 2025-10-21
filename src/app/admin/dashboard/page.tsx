"use client";

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import {
  MessageSquare,
  UserPlus,
  Calendar,
  Settings,
  BarChart3,
  Bell,
  TrendingUp,
  Eye,
  BookOpen,
  Clock,
  Activity,
  GraduationCap,
  FileText
} from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Skeleton } from '@/components/ui/Skeleton'

interface DashboardStats {
  totalContacts: number
  totalRegistrations: number
  pendingRegistrations: number
  totalActivities: number
  unreadContacts: number
  totalStudents: number
  totalCodingLabSubmissions: number
  totalAssignments: number
  contactsChange: number
  registrationsChange: number
  contactsThisWeek: number
  registrationsThisWeek: number
  recentActivities: number
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<DashboardStats>({
    totalContacts: 0,
    totalRegistrations: 0,
    pendingRegistrations: 0,
    totalActivities: 0,
    unreadContacts: 0,
    totalStudents: 0,
    totalCodingLabSubmissions: 0,
    totalAssignments: 0,
    contactsChange: 0,
    registrationsChange: 0,
    contactsThisWeek: 0,
    registrationsThisWeek: 0,
    recentActivities: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const statsCards = [
    {
      title: 'Total Kontak',
      value: stats.totalContacts,
      icon: MessageSquare,
      color: 'bg-blue-500',
      change: stats.contactsChange > 0 ? `+${stats.contactsChange.toFixed(1)}%` : 
             stats.contactsChange < 0 ? `${stats.contactsChange.toFixed(1)}%` : '0%',
      changeType: stats.contactsChange >= 0 ? 'increase' : 'decrease'
    },
    {
      title: 'Total Pendaftaran',
      value: stats.totalRegistrations,
      icon: UserPlus,
      color: 'bg-green-500',
      change: stats.registrationsChange > 0 ? `+${stats.registrationsChange.toFixed(1)}%` : 
             stats.registrationsChange < 0 ? `${stats.registrationsChange.toFixed(1)}%` : '0%',
      changeType: stats.registrationsChange >= 0 ? 'increase' : 'decrease'
    },
    {
      title: 'Pending Registrasi',
      value: stats.pendingRegistrations,
      icon: Clock,
      color: 'bg-yellow-500',
      change: 'Perlu Review',
      changeType: stats.pendingRegistrations > 5 ? 'warning' : 'neutral'
    },
    {
      title: 'Total Siswa',
      value: stats.totalStudents,
      icon: GraduationCap,
      color: 'bg-purple-500',
      change: 'Aktif',
      changeType: 'neutral'
    },
    {
      title: 'Total Aktivitas',
      value: stats.totalActivities,
      icon: Activity,
      color: 'bg-indigo-500',
      change: `${stats.recentActivities} Minggu Ini`,
      changeType: 'neutral'
    },
    {
      title: 'Coding Lab Submissions',
      value: stats.totalCodingLabSubmissions,
      icon: FileText,
      color: 'bg-teal-500',
      change: 'Terkumpul',
      changeType: 'neutral'
    },
    {
      title: 'Total Assignments',
      value: stats.totalAssignments,
      icon: BookOpen,
      color: 'bg-orange-500',
      change: 'Tersedia',
      changeType: 'neutral'
    },
    {
      title: 'Pesan Belum Dibaca',
      value: stats.unreadContacts,
      icon: Bell,
      color: stats.unreadContacts > 0 ? 'bg-red-500' : 'bg-green-500',
      change: stats.unreadContacts > 0 ? 'Perlu Tindakan' : 'Semua Terbaca',
      changeType: stats.unreadContacts > 0 ? 'warning' : 'success'
    }
  ]

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Admin</h1>
          <p className="text-gray-600">
            Selamat datang, {session?.user?.name}! Berikut ringkasan aktivitas GEMA SMA Wahidiyah.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoading
            ? Array.from({ length: statsCards.length }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="interactive-card bg-white rounded-lg shadow-md p-6 border border-gray-200 focus:outline-none"
                aria-hidden="true"
              >
                <div className="flex items-center justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    <Skeleton variant="text" className="w-24 h-4" />
                    <Skeleton variant="text" className="w-16 h-8" />
                    <Skeleton variant="text" className="w-20 h-4" />
                  </div>
                  <div className="w-12 h-12 rounded-xl skeleton-block skeleton-animate" />
                </div>
              </div>
            ))
            : statsCards.map((card, index) => (
              <div
                key={index}
                className="interactive-card data-section is-ready bg-white rounded-lg shadow-md p-6 border border-gray-200 focus:outline-none"
                tabIndex={0}
                aria-label={`${card.title} bernilai ${card.value.toLocaleString('id-ID')}`}
              >
                <div className="flex items-center justify-between gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {card.value.toLocaleString('id-ID')}
                    </p>
                    <p
                      className={`status-badge text-sm mt-1 ${
                        card.changeType === 'increase' ? 'text-green-600' :
                        card.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                      }`}
                      data-status={card.changeType === 'increase' ? 'completed' : undefined}
                    >
                      {card.change}
                    </p>
                  </div>
                  <div className={`${card.color} p-3 rounded-lg shadow-sm`}> 
                    <card.icon className="interactive-icon w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Activities */}
          <div className="interactive-card data-section is-ready bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Aktivitas Terbaru</h2>
              <Bell className="interactive-icon w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Pendaftaran baru dari Ahmad Rizki</p>
                  <p className="text-xs text-gray-500">2 jam yang lalu</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Kegiatan Workshop Web Development</p>
                  <p className="text-xs text-gray-500">1 hari yang lalu</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Pesan kontak dari orang tua siswa</p>
                  <p className="text-xs text-gray-500">3 hari yang lalu</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="interactive-card data-section is-ready bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Aksi Cepat</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <a
                href="/admin/registrations"
                className="interactive-card flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors focus:outline-none"
              >
                <UserPlus className="interactive-icon w-8 h-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-blue-900">Kelola Pendaftaran</span>
              </a>
              <a
                href="/admin/contacts"
                className="interactive-card flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors focus:outline-none"
              >
                <MessageSquare className="interactive-icon w-8 h-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-green-900">Lihat Pesan</span>
              </a>
              <a
                href="/admin/tutorial"
                className="interactive-card flex flex-col items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors focus:outline-none"
              >
                <BookOpen className="interactive-icon w-8 h-8 text-indigo-600 mb-2" />
                <span className="text-sm font-medium text-indigo-900">Tutorial</span>
              </a>
              <a
                href="/admin/activities"
                className="interactive-card flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors focus:outline-none"
              >
                <Calendar className="interactive-icon w-8 h-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-purple-900">Kelola Kegiatan</span>
              </a>
              <a
                href="/admin/settings"
                className="interactive-card flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none"
              >
                <Settings className="interactive-icon w-8 h-8 text-gray-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Pengaturan</span>
              </a>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Registration Chart */}
          <div className="interactive-card data-section is-ready bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Grafik Pendaftaran</h2>
              <BarChart3 className="interactive-icon w-5 h-5 text-gray-400" />
            </div>
            <div className="h-64 flex items-center justify-center text-gray-500">
              {/* Placeholder for chart */}
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>Grafik akan ditampilkan di sini</p>
              </div>
            </div>
          </div>

          {/* Analytics */}
          <div className="interactive-card data-section is-ready bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Analisis Website</h2>
              <Eye className="interactive-icon w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pengunjung Hari Ini</span>
                <span className="text-lg font-semibold text-gray-900">1,234</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Halaman Dilihat</span>
                <span className="text-lg font-semibold text-gray-900">5,678</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Waktu Rata-rata</span>
                <span className="text-lg font-semibold text-gray-900">3:24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tingkat Konversi</span>
                <span className="text-lg font-semibold text-green-600">12.5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
