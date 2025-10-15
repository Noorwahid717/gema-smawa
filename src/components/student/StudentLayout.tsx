'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  BookOpen,
  Upload,
  Calendar,
  User,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  FileText,
  Target
} from 'lucide-react'
import Image from 'next/image'
import { studentAuth } from '@/lib/student-auth'

interface StudentLayoutProps {
  children: React.ReactNode
}

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  active: boolean
  badge?: number
  teacherOnly?: boolean
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [student, setStudent] = useState<{
    id: string
    studentId: string
    fullName: string
    class: string
    email: string
  } | null>(null)
  const [activeActivities, setActiveActivities] = useState(0)

  // Check authentication
  useEffect(() => {
    const session = studentAuth.getSession()
    if (!session) {
      window.location.href = '/student/login'
      return
    }
    setStudent(session)
  }, [])

  // Check for active activities (for Live Classroom)
  useEffect(() => {
    const checkActiveActivities = async () => {
      try {
        const response = await fetch('/api/activities/active')
        if (response.ok) {
          const data = await response.json()
          setActiveActivities(data.count || 0)
        }
      } catch (error) {
        console.error('Error checking active activities:', error)
      }
    }

    checkActiveActivities()
  }, [])

  const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/student/dashboard-simple', icon: Home, active: false },
    { name: 'Assignments', href: '/student/assignments', icon: BookOpen, active: false },
    { name: 'Portfolio', href: '/student/portfolio', icon: Upload, active: false },
    { name: 'Learning Path', href: '/student/learning-path', icon: Target, active: false },
  ]

  // Live Classroom feature removed; no runtime injection

  // Mark active menu item
  navigation.forEach(item => {
    item.active = pathname.startsWith(item.href)
  })

  const handleLogout = () => {
    studentAuth.clearSession()
    window.location.href = '/student/login'
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          {navigation.slice(0, 4).map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-200 ${
                item.active
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-5 h-5 mb-1 ${
                item.active ? 'text-blue-600' : 'text-gray-400'
              }`} />
              <span className="text-xs font-medium truncate">{item.name}</span>
              {item.badge && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white bg-white"
              onClick={() => setSidebarOpen(false)}
              title="Tutup menu"
            >
              <X className="h-6 w-6 text-gray-600" />
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
              <span className="ml-2 text-xl font-bold text-gray-900">GEMA Student</span>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-3 text-base font-medium rounded-lg transition-all duration-200 ${
                    item.active
                      ? 'bg-blue-50 border-r-4 border-blue-500 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:shadow-sm'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`mr-3 h-6 w-6 transition-colors ${
                    item.active ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
                  }`} />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center justify-between w-full">
              <div className="ml-3">
                <p className="text-base font-medium text-gray-700">{student.fullName}</p>
                <p className="text-sm text-gray-500">{student.class} • {student.studentId}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                title="Keluar"
              >
                <LogOut className="w-5 h-5" />
              </button>
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
                  GEMA Student
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
                <Link
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
                </Link>
              ))}
            </nav>
          </div>
          <div className={`flex-shrink-0 flex border-t border-gray-200 p-4 transition-all duration-300 ${
            sidebarCollapsed ? 'justify-center' : ''
          }`}>
            {!sidebarCollapsed ? (
              <div className="flex items-center w-full">
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-700">{student.fullName}</p>
                  <p className="text-xs text-gray-500">{student.class}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-3 text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                  title="Keluar"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogout}
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
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                className="h-10 w-10 inline-flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
                onClick={() => setSidebarOpen(true)}
                title="Buka menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>

            {/* Desktop title */}
            <div className="hidden md:block">
              <h1 className="text-lg font-semibold text-gray-900">
                Student Dashboard
              </h1>
            </div>

            {/* User info */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-700">{student.fullName}</p>
                <p className="text-xs text-gray-500">{student.class}</p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 pb-16 md:pb-0">
          {children}
        </main>
      </div>
    </div>
  )
}