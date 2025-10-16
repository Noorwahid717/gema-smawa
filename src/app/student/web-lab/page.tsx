'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { studentAuth } from '@/lib/student-auth'
import { WebLabAssignment, WebLabSubmissionStatus, WebLabDifficulty } from '@prisma/client'

interface AssignmentWithSubmission extends WebLabAssignment {
  submissions: Array<{
    id: string
    status: WebLabSubmissionStatus
    score?: number | null
    submittedAt?: string | null
  }>
  _count: {
    submissions: number
  }
}

export default function StudentWebLabPage() {
  const router = useRouter()
  const [assignments, setAssignments] = useState<AssignmentWithSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true)
      const session = studentAuth.getSession()
      if (!session) {
        router.push('/student/login')
        return
      }

      const response = await fetch(`/api/student/web-lab?studentId=${session.studentId}`)
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
  }, [router])

  useEffect(() => {
    const session = studentAuth.getSession()
    if (!session) {
      router.push('/student/login')
      return
    }

    fetchAssignments()
  }, [router, fetchAssignments])

  const getStatusBadge = (assignment: AssignmentWithSubmission) => {
    const submission = assignment.submissions[0]

    if (!submission) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
          Not Started
        </span>
      )
    }

    const colors = {
      [WebLabSubmissionStatus.DRAFT]: 'bg-yellow-100 text-yellow-800',
      [WebLabSubmissionStatus.SUBMITTED]: 'bg-blue-100 text-blue-800',
      [WebLabSubmissionStatus.GRADED]: 'bg-green-100 text-green-800',
      [WebLabSubmissionStatus.RETURNED]: 'bg-orange-100 text-orange-800'
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[submission.status]}`}>
        {submission.status}
        {submission.score !== null && ` (${submission.score}pts)`}
      </span>
    )
  }

  const getDifficultyBadge = (difficulty: WebLabDifficulty) => {
    const colors = {
      [WebLabDifficulty.BEGINNER]: 'bg-blue-100 text-blue-800',
      [WebLabDifficulty.INTERMEDIATE]: 'bg-orange-100 text-orange-800',
      [WebLabDifficulty.ADVANCED]: 'bg-red-100 text-red-800'
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[difficulty]}`}>
        {difficulty}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Web Lab</h1>
          <p className="mt-2 text-sm text-gray-700">
            Practice your HTML, CSS, and JavaScript skills with interactive coding assignments.
          </p>
        </div>
      </div>

      {/* Assignments Grid */}
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
                  {assignment.title}
                </h3>
                {getDifficultyBadge(assignment.difficulty)}
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {assignment.description}
              </p>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getStatusBadge(assignment)}
                </div>
                <span className="text-sm font-medium text-indigo-600">
                  {assignment.points} pts
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>Class: {assignment.classLevel || 'All'}</span>
                <span>{assignment._count.submissions} submissions</span>
              </div>

              <button
                onClick={() => router.push(`/student/web-lab/${assignment.id}`)}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                {assignment.submissions[0] ? 'Continue Assignment' : 'Start Assignment'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {assignments.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments available</h3>
          <p className="mt-1 text-sm text-gray-500">
            Check back later for new web programming assignments.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}
    </div>
  )
}