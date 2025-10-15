"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { studentAuth } from '@/lib/student-auth'
import { ArrowLeft, BookOpen } from 'lucide-react'

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
      const res = await fetch('/api/classroom/assignments')
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat daftar tugas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/student/dashboard-simple')}
              className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
              aria-label="Kembali ke dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Daftar Tugas</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-lg">{error}</div>
        )}

        {assignments.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
            <BookOpen className="w-10 h-10 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">Belum ada tugas</h2>
            <p className="text-gray-600 mt-2">Saat ini tidak ada tugas yang tersedia untukmu.</p>
            <div className="mt-4">
              <Link href="/student/dashboard-simple" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Kembali ke Dashboard
              </Link>
            </div>
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
      </main>
    </div>
  )
}
