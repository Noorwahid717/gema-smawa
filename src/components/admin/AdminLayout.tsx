"use client";

import { signOut, useSession } from 'next-auth/react'
import { useState } from 'react'
import { 
  Menu,
  X,
  Home,
  Users,
  MessageSquare,
  UserPlus,
  Calendar,
  Settings,
  LogOut,
  Image as ImageIcon,
  Megaphone,
  GraduationCap,
  LayoutTemplate,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import Image from 'next/image'
import NotificationPanel from './NotificationPanel'
import { ToastProvider } from '@/components/feedback/toast'
import AdminChatPanel from './AdminChatPanel'

interface AdminLayoutProps {
  children: React.ReactNode
}

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  active: boolean
  badge?: number
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Authentication guard for admin routes
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated' || !session) {
    // Redirect to admin login
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login'
    }
    return null
  }

  // Check if user is admin
  if (session.user.userType !== 'admin') {
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login'
    }
    return null
  }

  const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home, active: false },
    { name: 'Chat', href: '/admin/chat', icon: MessageSquare, active: false },
    { name: 'Kontak', href: '/admin/contacts', icon: MessageSquare, active: false },
    { name: 'Pendaftaran', href: '/admin/registrations', icon: UserPlus, active: false },
    { name: 'Kegiatan', href: '/admin/activities', icon: Calendar, active: false },
    { name: 'Galeri', href: '/admin/gallery', icon: ImageIcon, active: false },
  { name: 'Coding Lab', href: '/admin/coding-lab', icon: LayoutTemplate, active: false },
    { name: 'Pengumuman', href: '/admin/announcements', icon: Megaphone, active: false },
    { name: 'Siswa', href: '/admin/students', icon: GraduationCap, active: false },
    { name: 'Admin', href: '/admin/users', icon: Users, active: false },
    { name: 'Pengaturan', href: '/admin/settings', icon: Settings, active: false },
  ]

  // Mark active menu item based on current path
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
  navigation.forEach(item => {
    item.active = currentPath.startsWith(item.href)
  })

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/admin/login' })
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
              title="Tutup menu"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <Image
                src="/gema.svg"
                alt="GEMA Logo"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <span className="ml-2 text-xl font-bold text-gray-900">GEMA Admin</span>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  <item.icon className="mr-4 h-6 w-6" />
                  {item.name}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center justify-between w-full">
              <div className="ml-3">
                <p className="text-base font-medium text-gray-700">{session?.user?.name}</p>
                <div className="flex items-center gap-4 mt-1">
                  <a
                    href="/admin/profile"
                    className="text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center"
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Profile
                  </a>
                  <button
                    onClick={handleSignOut}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Keluar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'md:w-16' : 'md:w-64'
      }`}>
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white shadow-lg">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className={`flex items-center flex-shrink-0 px-4 transition-all duration-300 ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}>
              <Image
                src="/gema.svg"
                alt="GEMA Logo"
                width={sidebarCollapsed ? 32 : 40}
                height={sidebarCollapsed ? 32 : 40}
                className={`transition-all duration-300 ${
                  sidebarCollapsed ? 'h-8 w-auto' : 'h-10 w-auto'
                }`}
              />
              {!sidebarCollapsed && (
                <span className="ml-2 text-xl font-bold text-gray-900 transition-opacity duration-300">
                  GEMA Admin
                </span>
              )}
            </div>
            
            {/* Collapse/Expand Button */}
            <div className="px-4 mt-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={`w-full flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 ${
                  sidebarCollapsed ? 'justify-center' : 'justify-end'
                }`}
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-5 h-5" />
                ) : (
                  <ChevronLeft className="w-5 h-5" />
                )}
              </button>
            </div>
            
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 relative ${
                    item.active
                      ? 'bg-blue-50 border-r-4 border-blue-500 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:shadow-sm hover:scale-105'
                  } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                  title={sidebarCollapsed ? item.name : ''}
                >
                  <item.icon className={`h-5 w-5 transition-all duration-200 ${
                    item.active 
                      ? 'text-blue-600' 
                      : 'text-gray-400 group-hover:text-blue-600 group-hover:scale-110'
                  } ${sidebarCollapsed ? '' : 'mr-3'}`} />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 transition-opacity duration-200">{item.name}</span>
                      {item.badge && (
                        <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full animate-pulse">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  
                  {/* Active indicator for collapsed state */}
                  {sidebarCollapsed && item.active && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r"></div>
                  )}
                </a>
              ))}
            </nav>
          </div>
          <div className={`flex-shrink-0 flex border-t border-gray-200 p-4 transition-all duration-300 ${
            sidebarCollapsed ? 'justify-center' : ''
          }`}>
            {!sidebarCollapsed ? (
              <div className="flex items-center w-full">
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-700">{session?.user?.name}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="ml-3 text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                  title="Keluar"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignOut}
                className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                title="Keluar"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`md:pl-64 flex flex-col flex-1 transition-all duration-300 ${
        sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'
      }`}>
        {/* Top header bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                className="h-10 w-10 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                onClick={() => setSidebarOpen(true)}
                title="Buka menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
            
            {/* Desktop title - hidden on mobile */}
            <div className="hidden md:block">
              <h1 className="text-lg font-semibold text-gray-900">
                Admin Dashboard
              </h1>
            </div>
            
            {/* Right side - Notification and user info */}
            <div className="flex items-center gap-4">
              <NotificationPanel />
              <AdminChatPanel />
              
              {/* User info - desktop only */}
              <div className="hidden md:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">{session?.user?.name}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <div className="flex items-center gap-1">
                  <a
                    href="/admin/profile"
                    className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Profile"
                  >
                    <Settings className="w-5 h-5" />
                  </a>
                  <button
                    onClick={handleSignOut}
                    className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Keluar"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
    </ToastProvider>
  )
}