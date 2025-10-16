'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { CodingDifficulty } from '@prisma/client'
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline'

interface CodingLab {
  id: string
  title: string
  description: string
  difficulty: CodingDifficulty
  language: string
  points: number
  duration: number
  isActive: boolean
}

export default function EditCodingLabPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const labId = params.id as string

  const [lab, setLab] = useState<CodingLab | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLab = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/coding-lab/${labId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch coding lab')
      }

      const data = await response.json()
      if (data.success) {
        setLab(data.data)
      } else {
        throw new Error(data.error || 'Failed to fetch lab')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [labId])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!lab) return

    try {
      setSaving(true)
      const formData = new FormData(e.currentTarget)

      const updateData = {
        title: formData.get('title'),
        description: formData.get('description'),
        difficulty: formData.get('difficulty'),
        language: formData.get('language'),
        points: parseInt(formData.get('points') as string) || 100,
        duration: parseInt(formData.get('duration') as string) || 60,
        isActive: formData.get('isActive') === 'on'
      }

      const response = await fetch(`/api/coding-lab/${labId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          router.push('/admin/coding-lab')
        } else {
          setError(result.error || 'Failed to update lab')
        }
      } else {
        setError('Failed to update lab')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lab')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      fetchLab()
    }
  }, [status, fetchLab])

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  if (error && !lab) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!lab) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lab Not Found</h2>
          <p className="text-gray-600 mb-4">The coding lab you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => router.push('/admin/coding-lab')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Coding Lab
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <h1 className="text-3xl font-bold text-gray-900">Edit Coding Lab</h1>
            <p className="mt-2 text-gray-600">Update the coding lab details and settings.</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  defaultValue={lab.title}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Basic Algorithms"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  defaultValue={lab.description || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe what students will learn in this lab..."
                />
              </div>

              {/* Difficulty and Language */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty *
                  </label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    required
                    defaultValue={lab.difficulty}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={CodingDifficulty.BEGINNER}>Beginner</option>
                    <option value={CodingDifficulty.INTERMEDIATE}>Intermediate</option>
                    <option value={CodingDifficulty.ADVANCED}>Advanced</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                    Programming Language *
                  </label>
                  <select
                    id="language"
                    name="language"
                    required
                    defaultValue={lab.language}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="JavaScript">JavaScript</option>
                    <option value="Python">Python</option>
                    <option value="Java">Java</option>
                    <option value="C++">C++</option>
                    <option value="C#">C#</option>
                  </select>
                </div>
              </div>

              {/* Points and Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-2">
                    Total Points
                  </label>
                  <input
                    type="number"
                    id="points"
                    name="points"
                    min="0"
                    defaultValue={lab.points}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    min="1"
                    defaultValue={lab.duration}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  defaultChecked={lab.isActive}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Activate this coding lab (students can access it)
                </label>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                <CheckIcon className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}