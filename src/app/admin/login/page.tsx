"use client";

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import Toast from '@/components/Toast'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({ show: false, message: '', type: 'info' })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess(false)
    setLoadingMessage('Memverifikasi kredensial...')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      console.log('Login result:', result)

      if (result?.error) {
        setError('Email atau password salah. Pastikan kredensial admin benar.')
        setToast({
          show: true,
          message: 'Login gagal! Periksa email dan password Anda.',
          type: 'error'
        })
        setIsLoading(false)
        setLoadingMessage('')
      } else if (result?.ok) {
        // Login successful - show success and redirect
        console.log('Login successful, redirecting...')
        setSuccess(true)
        setLoadingMessage('Login berhasil! Mengalihkan ke dashboard...')
        setToast({
          show: true,
          message: '🎉 Login berhasil! Selamat datang Admin!',
          type: 'success'
        })
        
        // Wait a moment then redirect with multiple fallbacks
        setTimeout(() => {
          setLoadingMessage('Memuat dashboard admin...')
          
          // Try Next.js router first
          router.push('/admin/dashboard')
          
          // Fallback: force redirect after delay
          setTimeout(() => {
            window.location.href = '/admin/dashboard'
          }, 2000)
        }, 1500)
      } else {
        setError('Login gagal. Silakan periksa koneksi dan coba lagi.')
        setToast({
          show: true,
          message: 'Koneksi bermasalah. Silakan coba lagi.',
          type: 'warning'
        })
        setIsLoading(false)
        setLoadingMessage('')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Terjadi kesalahan sistem. Silakan coba lagi atau hubungi administrator.')
      setToast({
        show: true,
        message: 'Terjadi kesalahan sistem. Hubungi administrator jika masalah berlanjut.',
        type: 'error'
      })
      setIsLoading(false)
      setLoadingMessage('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-green-400 flex items-center justify-center p-4">
      {/* Toast Notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        duration={4000}
      />

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-green-300 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center mb-4 p-2 shadow-lg">
            <Image
              src="/gema.svg"
              alt="GEMA - Generasi Muda Informatika Logo"
              width={60}
              height={60}
              className="w-14 h-14"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-white/80">GEMA - SMA Wahidiyah Kediri</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Masuk Admin</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              ✅ Login berhasil! Mengalihkan ke dashboard...
            </div>
          )}

          {isLoading && loadingMessage && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
              {loadingMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Admin
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@smawahidiyah.edu"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-green-500 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              {isLoading && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              )}
              {success ? 'Berhasil! Mengalihkan...' : isLoading ? 'Memproses...' : '🔐 Masuk Admin'}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Hanya admin yang memiliki akses ke panel ini
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-white/80 hover:text-white text-sm font-medium transition-colors"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}
