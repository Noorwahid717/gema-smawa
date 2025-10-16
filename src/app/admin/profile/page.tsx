'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import {
  User,
  Mail,
  Shield,
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  Lock,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Settings,
  Crown,
  Key
} from 'lucide-react'

interface AdminProfile {
  id: string
  email: string
  name: string
  role: string
  createdAt: string
  updatedAt: string
}

export default function AdminProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('personal')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    systemAlerts: true,
    userRegistrationAlerts: true,
    weeklyReports: true,
    theme: 'light',
    language: 'id'
  })

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!session?.user?.email) {
          setLoading(false)
          return
        }

        const response = await fetch(`/api/admin/profile?email=${session.user.email}`)
        const result = await response.json()

        if (result.success && result.data) {
          setProfile(result.data)
          setFormData({
            name: result.data.name || '',
            email: result.data.email || ''
          })
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      loadProfile()
    }
  }, [session])

  const handleUpdateProfile = async () => {
    setSaving(true)
    setMessage(null)

    try {
      if (!session?.user?.email) throw new Error('No session found')

      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: session.user.email,
          name: formData.name
        })
      })

      const result = await response.json()

      if (result.success) {
        setProfile(prev => prev ? { ...prev, ...formData } : null)
        setEditing(false)
        setMessage({ type: 'success', text: 'Profile berhasil diperbarui! ✨' })
      } else {
        throw new Error(result.error || 'Failed to update profile')
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Gagal memperbarui profile' 
      })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Password baru tidak cocok!' })
      return
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password minimal 8 karakter!' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      if (!session?.user?.email) throw new Error('No session found')

      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: session.user.email,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      const result = await response.json()

      if (result.success) {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setMessage({ type: 'success', text: 'Password berhasil diubah! 🔐' })
      } else {
        throw new Error(result.error || 'Failed to change password')
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Gagal mengubah password' 
      })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdatePreferences = async () => {
    setSaving(true)
    setMessage(null)

    try {
      if (!session?.user?.email) throw new Error('No session found')

      const response = await fetch('/api/admin/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: session.user.email,
          preferences
        })
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: 'Preferensi berhasil disimpan! ⚙️' })
      } else {
        throw new Error(result.error || 'Failed to update preferences')
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Gagal menyimpan preferensi' 
      })
    } finally {
      setSaving(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 'ADMIN':
        return <Shield className="w-5 h-5 text-blue-500" />
      default:
        return <User className="w-5 h-5 text-gray-500" />
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Crown className="w-3 h-3" />
            Super Admin
          </span>
        )
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Shield className="w-3 h-3" />
            Admin
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <User className="w-3 h-3" />
            User
          </span>
        )
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat profile...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!profile) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Profile tidak ditemukan</p>
            <Link href="/admin/dashboard" className="text-blue-600 hover:underline mt-2 block">
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/dashboard"
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Profile Admin</h1>
                <p className="text-sm text-gray-600">Kelola informasi akun administrator</p>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              {message.text}
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  <button 
                    title="Upload foto profile"
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{profile.name}</h3>
                <div className="mt-2">
                  {getRoleBadge(profile.role)}
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{profile.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  {getRoleIcon(profile.role)}
                  <span>{profile.role === 'SUPER_ADMIN' ? 'Super Administrator' : 'Administrator'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Bergabung {new Date(profile.createdAt).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tab Navigation */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
                <nav className="-mb-px flex">
                  <button
                    onClick={() => setActiveTab('personal')}
                    className={`py-4 px-6 text-sm font-medium border-b-2 transition-all ${
                      activeTab === 'personal'
                        ? 'border-blue-500 text-blue-600 bg-white shadow-sm'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-white/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Informasi Personal
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('security')}
                    className={`py-4 px-6 text-sm font-medium border-b-2 transition-all ${
                      activeTab === 'security'
                        ? 'border-blue-500 text-blue-600 bg-white shadow-sm'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-white/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Keamanan
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('preferences')}
                    className={`py-4 px-6 text-sm font-medium border-b-2 transition-all ${
                      activeTab === 'preferences'
                        ? 'border-blue-500 text-blue-600 bg-white shadow-sm'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-white/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Preferensi
                    </div>
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {/* Personal Information Tab */}
                {activeTab === 'personal' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Informasi Personal</h3>
                        <p className="text-sm text-gray-600">Kelola informasi akun administrator</p>
                      </div>
                      {!editing ? (
                        <button
                          onClick={() => setEditing(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditing(false)
                              setFormData({
                                name: profile.name || '',
                                email: profile.email || ''
                              })
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            Batal
                          </button>
                          <button
                            onClick={handleUpdateProfile}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            <Save className="w-4 h-4" />
                            {saving ? 'Menyimpan...' : 'Simpan'}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="admin-full-name"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Nama Lengkap
                        </label>
                        {editing ? (
                          <input
                            id="admin-full-name"
                            name="name"
                            aria-label="Nama Lengkap"
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Masukkan nama lengkap"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        ) : (
                          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profile.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profile.email}</p>
                        <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role
                        </label>
                        <div className="bg-gray-50 px-3 py-2 rounded-lg">
                          {getRoleBadge(profile.role)}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bergabung Sejak
                        </label>
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                          {new Date(profile.createdAt).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Keamanan Akun</h3>
                      <p className="text-sm text-gray-600">Ubah password dan kelola keamanan akun administrator</p>
                    </div>

                    <div className="max-w-md space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password Saat Ini
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                            placeholder="Masukkan password saat ini"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password Baru
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                            placeholder="Masukkan password baru (min. 8 karakter)"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showNewPassword ? (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Konfirmasi Password Baru
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Konfirmasi password baru"
                        />
                      </div>

                      <button
                        onClick={handleUpdatePassword}
                        disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Key className="w-4 h-4" />
                        {saving ? 'Mengubah Password...' : 'Ubah Password'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Preferensi</h3>
                      <p className="text-sm text-gray-600">Atur notifikasi dan preferensi sistem admin</p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-4">Notifikasi System</h4>
                        <div className="space-y-3">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={preferences.emailNotifications}
                              onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Notifikasi email umum</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={preferences.systemAlerts}
                              onChange={(e) => setPreferences({ ...preferences, systemAlerts: e.target.checked })}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Alert sistem dan keamanan</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={preferences.userRegistrationAlerts}
                              onChange={(e) => setPreferences({ ...preferences, userRegistrationAlerts: e.target.checked })}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Notifikasi pendaftaran user baru</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={preferences.weeklyReports}
                              onChange={(e) => setPreferences({ ...preferences, weeklyReports: e.target.checked })}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Laporan mingguan sistem</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-4">Tampilan</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Theme
                            </label>
                            <select
                              value={preferences.theme}
                              onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                              title="Pilih theme tampilan"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="light">Light</option>
                              <option value="dark">Dark</option>
                              <option value="auto">Auto (Sistem)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Bahasa
                            </label>
                            <select
                              value={preferences.language}
                              onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                              title="Pilih bahasa interface"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="id">Bahasa Indonesia</option>
                              <option value="en">English</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleUpdatePreferences}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        {saving ? 'Menyimpan...' : 'Simpan Preferensi'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}