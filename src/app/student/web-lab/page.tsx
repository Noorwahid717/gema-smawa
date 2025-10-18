'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { studentAuth } from '@/lib/student-auth'
import StudentLayout from '@/components/student/StudentLayout'
import Breadcrumb from '@/components/ui/Breadcrumb'
import {
  Code,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  BookOpen,
  Target,
  Calendar,
  Award,
  TrendingUp
} from 'lucide-react'

interface Assignment {
  id: string
  title: string
  description: string
  difficulty: string
  classLevel: string | null
  instructions: string
  starterHtml?: string
  starterCss?: string
  starterJs?: string
  template?: string
  requirements?: string[]
  hints?: string[]
  points: number
  timeLimit?: number
  status: string
  createdBy: string
  createdAt: string
  updatedAt: string
  submissions?: Array<{
    id: string
    status: string
    submittedAt: string
    grade?: number
    feedback?: string
  }>
  _count?: {
    submissions: number
  }
}

export default function StudentWebLabPage() {
  const router = useRouter()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAssignments = useCallback(async (studentId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/student/web-lab?studentId=${studentId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch assignments')
      }

      const data = await response.json()
      setAssignments(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const session = studentAuth.getSession()
        if (!session) {
          router.push('/student/login')
          return
        }

        fetchAssignments(session.studentId)
      } catch (error) {
        console.error('Auth error:', error)
        router.push('/student/login')
      }
    }

    checkAuthAndLoadData()
  }, [router, fetchAssignments])

  const getStatusBadge = (assignment: Assignment) => {
    const submission = assignment.submissions?.[0]

    if (!submission) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <Play className="w-3 h-3 mr-1" />
          Belum Dimulai
        </span>
      )
    }

    const statusConfig = {
      submitted: {
        color: 'bg-blue-100 text-blue-800',
        icon: Clock,
        text: 'Dikirim'
      },
      graded: {
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        text: 'Dinilai'
      },
      late: {
        color: 'bg-orange-100 text-orange-800',
        icon: AlertCircle,
        text: 'Terlambat'
      }
    }

    const config = statusConfig[submission.status as keyof typeof statusConfig] || statusConfig.submitted
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
        {submission.grade !== undefined && ` (${submission.grade}pts)`}
      </span>
    )
  }

  const getDifficultyFromTitle = (title: string) => {
    if (title.toLowerCase().includes('portfolio') || title.toLowerCase().includes('sederhana')) {
      return { level: 'Pemula', color: 'bg-green-100 text-green-800' }
    }
    if (title.toLowerCase().includes('form') || title.toLowerCase().includes('interaktif')) {
      return { level: 'Menengah', color: 'bg-yellow-100 text-yellow-800' }
    }
    if (title.toLowerCase().includes('gallery') || title.toLowerCase().includes('advanced')) {
      return { level: 'Lanjutan', color: 'bg-red-100 text-red-800' }
    }
    return { level: 'Menengah', color: 'bg-yellow-100 text-yellow-800' }
  }

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/student/dashboard-simple' },
    { label: 'Web Lab', href: '/student/web-lab' }
  ]

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat tugas Web Lab...</p>
          </div>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <Code className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Web Lab</h1>
              <p className="text-gray-600 mt-1">
                Latihan koding HTML, CSS, dan JavaScript dengan tugas interaktif
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Tugas</p>
                  <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Selesai</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {assignments.filter(a => a.submissions?.[0]?.status === 'graded').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Dalam Proses</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {assignments.filter(a => a.submissions?.[0]?.status === 'submitted').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Terlambat</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {assignments.filter(a => !a.submissions?.[0]).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assignments Grid */}
        {assignments.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {assignments.map((assignment) => {
              const difficulty = getDifficultyFromTitle(assignment.title)
              const hasSubmission = assignment.submissions?.[0]

              return (
                <div
                  key={assignment.id}
                  className={`bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                    !hasSubmission ? 'border-red-200 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {assignment.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${difficulty.color}`}>
                            <Target className="w-3 h-3 mr-1" />
                            {difficulty.level}
                          </span>
                          {getStatusBadge(assignment)}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {assignment.description}
                    </p>

                    {/* Requirements Preview */}
                    {assignment.requirements && Array.isArray(assignment.requirements) && assignment.requirements.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-500 mb-2">
                          Persyaratan ({assignment.requirements.length}):
                        </p>
                        <ul className="space-y-1">
                          {assignment.requirements.slice(0, 2).map((req, i) => (
                            <li key={i} className="text-xs text-gray-600 flex items-start">
                              <span className="text-green-500 mr-2 mt-1">•</span>
                              <span className="line-clamp-2">{req}</span>
                            </li>
                          ))}
                          {assignment.requirements.length > 2 && (
                            <li className="text-xs text-gray-500 italic">
                              +{assignment.requirements.length - 2} persyaratan lainnya...
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() => router.push(`/student/web-lab/${assignment.id}`)}
                      className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                        hasSubmission
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {hasSubmission ? (
                        <>
                          <TrendingUp className="w-4 h-4" />
                          Lanjutkan Tugas
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Mulai Tugas
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <Code className="w-full h-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada tugas Web Lab</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Tugas-tugas Web Lab akan muncul di sini setelah guru membuatnya.
              Silakan kembali lagi nanti.
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-8 rounded-xl bg-red-50 border border-red-200 p-6">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Terjadi Kesalahan</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  )
}