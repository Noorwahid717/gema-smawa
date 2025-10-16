'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { WebLabAssignment, WebLabDifficulty, WebLabStatus } from '@prisma/client'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline'

interface AssignmentWithStats extends WebLabAssignment {
  admin: {
    name: string
    email: string
  }
  _count: {
    submissions: number
  }
}

export default function AdminWebLabPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [assignments, setAssignments] = useState<AssignmentWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<WebLabStatus | 'ALL'>('ALL')
  const [filterDifficulty, setFilterDifficulty] = useState<WebLabDifficulty | 'ALL'>('ALL')

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterStatus !== 'ALL') params.set('status', filterStatus)
      if (filterDifficulty !== 'ALL') params.set('difficulty', filterDifficulty)

      const response = await fetch(`/api/admin/web-lab?${params.toString()}`)
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
  }, [filterStatus, filterDifficulty])

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user) {
      router.push('/admin/login')
      return
    }
    fetchAssignments()
  }, [session, status, router, fetchAssignments])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return

    try {
      const response = await fetch(`/api/admin/web-lab/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete assignment')
      }

      setAssignments(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete assignment')
    }
  }

  const getStatusBadge = (status: WebLabStatus) => {
    const colors = {
      [WebLabStatus.DRAFT]: 'bg-gray-100 text-gray-800',
      [WebLabStatus.PUBLISHED]: 'bg-green-100 text-green-800',
      [WebLabStatus.ARCHIVED]: 'bg-yellow-100 text-yellow-800'
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>
        {status}
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

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Web Lab Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage HTML/CSS/JavaScript programming assignments for students.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/admin/web-lab/new"
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            New Assignment
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-8 flex gap-4">
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as WebLabStatus | 'ALL')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="ALL">All Status</option>
            <option value={WebLabStatus.DRAFT}>Draft</option>
            <option value={WebLabStatus.PUBLISHED}>Published</option>
            <option value={WebLabStatus.ARCHIVED}>Archived</option>
          </select>
        </div>

        <div>
          <label htmlFor="difficulty-filter" className="block text-sm font-medium text-gray-700">
            Difficulty
          </label>
          <select
            id="difficulty-filter"
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value as WebLabDifficulty | 'ALL')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="ALL">All Levels</option>
            <option value={WebLabDifficulty.BEGINNER}>Beginner</option>
            <option value={WebLabDifficulty.INTERMEDIATE}>Intermediate</option>
            <option value={WebLabDifficulty.ADVANCED}>Advanced</option>
          </select>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Assignment
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Difficulty
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Class
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Submissions
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {assignments.map((assignment) => (
                    <tr key={assignment.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="flex items-center">
                          <div>
                            <div className="font-medium text-gray-900">{assignment.title}</div>
                            <div className="text-gray-500">{assignment.points} points</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {getDifficultyBadge(assignment.difficulty)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {assignment.classLevel || 'All Classes'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {getStatusBadge(assignment.status)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {assignment._count.submissions}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/web-lab/${assignment.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <EyeIcon className="h-5 w-5" aria-hidden="true" />
                          </Link>
                          <Link
                            href={`/admin/web-lab/${assignment.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <PencilIcon className="h-5 w-5" aria-hidden="true" />
                          </Link>
                          <button
                            onClick={() => handleDelete(assignment.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-5 w-5" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {assignments.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No assignments found.</p>
          <Link
            href="/admin/web-lab/new"
            className="mt-4 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Create your first assignment
          </Link>
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