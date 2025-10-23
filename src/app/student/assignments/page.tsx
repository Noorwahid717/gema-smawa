"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { studentAuth } from '@/lib/student-auth'
import { BookOpen } from 'lucide-react'
import StudentLayout from '@/components/student/StudentLayout'
import Breadcrumb from '@/components/ui/Breadcrumb'

interface Assignment {
  id: string
  title: string
  description?: string
  dueDate?: string
  subject?: string
}

export default function AssignmentsIndexPage() {
  const router = useRouter()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const session = studentAuth.getSession()
    if (!session) {
      // redirect to login and back to assignments after auth
      router.push('/student/login?redirectTo=' + encodeURIComponent('/student/assignments'))
      return
    }

    fetchAssignments()
  }, [router])

  const fetchAssignments = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/tutorial/assignments')
      if (!res.ok) {
        throw new Error('Gagal memuat daftar tugas')
      }
      const data = await res.json()
      // expect data.data to be an array; fall back gracefully
      setAssignments(Array.isArray(data.data) ? data.data : [])
    } catch (err) {
      console.error('Error fetching assignments', err)
      setError((err as Error).message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat daftar tugas...</p>
          </div>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Breadcrumb items={[{ label: 'Daftar Tugas' }]} />
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Daftar Tugas</h1>
          <p className="text-gray-600 mt-1">Kelola dan kerjakan tugas-tugas yang diberikan</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-lg">{error}</div>
        )}

        {assignments.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
            <BookOpen className="w-10 h-10 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">Belum ada tugas</h2>
            <p className="text-gray-600 mt-2">Saat ini tidak ada tugas yang tersedia untukmu.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {assignments.map((a) => (
              <Link
                key={a.id}
                href={`/student/assignments/${a.id}`}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{a.title}</h3>
                    {a.subject && <p className="text-sm text-gray-500">{a.subject}</p>}
                    {a.description && <p className="mt-2 text-sm text-gray-600 line-clamp-2">{a.description}</p>}
                  </div>
                  {a.dueDate && (
                    <div className="text-sm text-gray-500">
                      Tenggat: {new Date(a.dueDate).toLocaleDateString('id-ID')}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  )
}
