'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { WebLabAssignment, WebLabSubmission, WebLabSubmissionStatus } from '@prisma/client'
import { ArrowLeftIcon, EyeIcon, PencilIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline'

interface SubmissionWithStudent extends WebLabSubmission {
  student: {
    fullName: string
    studentId: string
    class: string
  }
  evaluation?: {
    score: number
    feedback: string
  }
}

interface AssignmentWithSubmissions extends WebLabAssignment {
  admin: {
    name: string
  }
  submissions: SubmissionWithStudent[]
  _count: {
    submissions: number
  }
}

export default function AdminWebLabDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const assignmentId = params.id as string

  const [assignment, setAssignment] = useState<AssignmentWithSubmissions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAssignment = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/web-lab/${assignmentId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch assignment')
      }

      const data = await response.json()
      setAssignment(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [assignmentId])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAssignment()
    }
  }, [status, fetchAssignment])

  const getStatusBadge = (status: WebLabSubmissionStatus) => {
    const statusConfig = {
      [WebLabSubmissionStatus.SUBMITTED]: {
        color: 'bg-yellow-100 text-yellow-800',
        label: 'Submitted',
        icon: ClockIcon
      },
      [WebLabSubmissionStatus.GRADED]: {
        color: 'bg-green-100 text-green-800',
        label: 'Graded',
        icon: CheckCircleIcon
      },
      [WebLabSubmissionStatus.DRAFT]: {
        color: 'bg-gray-100 text-gray-800',
        label: 'Draft',
        icon: ClockIcon
      },
      [WebLabSubmissionStatus.RETURNED]: {
        color: 'bg-orange-100 text-orange-800',
        label: 'Returned',
        icon: ClockIcon
      }
    }

    const config = statusConfig[status]
    if (!config) return null

    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    )
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Assignment Not Found</h2>
          <p className="text-gray-600 mb-4">The assignment you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => router.push('/admin/web-lab')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Web Lab
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
              <p className="mt-2 text-gray-600">{assignment.description}</p>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Difficulty</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      assignment.difficulty === 'BEGINNER' ? 'bg-green-100 text-green-800' :
                      assignment.difficulty === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {assignment.difficulty}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Points</dt>
                  <dd className="mt-1 text-sm text-gray-900">{assignment.points}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Class Level</dt>
                  <dd className="mt-1 text-sm text-gray-900">{assignment.classLevel || 'All Classes'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Total Submissions</dt>
                  <dd className="mt-1 text-sm text-gray-900">{assignment._count.submissions}</dd>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/admin/web-lab/${assignment.id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Student Submissions</h2>
          <p className="mt-1 text-sm text-gray-600">
            Review and grade student submissions for this assignment.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignment.submissions.map((submission) => (
                <tr key={submission.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {submission.student.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {submission.student.studentId} - {submission.student.class}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(submission.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(submission.submittedAt || submission.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {submission.evaluation ? `${submission.evaluation.score}/${assignment.points}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/web-lab/${assignment.id}/submission/${submission.id}`}
                      className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      {submission.status === WebLabSubmissionStatus.SUBMITTED ? 'Grade' : 'View'}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {assignment.submissions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No submissions yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}