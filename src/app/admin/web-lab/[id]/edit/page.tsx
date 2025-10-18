'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { WebLabAssignment, WebLabDifficulty, WebLabStatus } from '@prisma/client'
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline'

interface WebLabAssignmentData extends WebLabAssignment {
  admin: {
    name: string
  }
}

export default function EditWebLabPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const assignmentId = params.id as string

  const [assignment, setAssignment] = useState<WebLabAssignmentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'Unsaved' | 'Saving...' | 'Saved'>('Saved')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!assignment) return;
    const { name, value } = e.target;
    setAssignment({ ...assignment, [name]: value });
    setSaveStatus('Unsaved');
  };

  useEffect(() => {
    if (saveStatus === 'Unsaved') {
      const handler = setTimeout(() => {
        handleSubmit(new Event('submit') as unknown as React.FormEvent<HTMLFormElement>);
      }, 2000);

      return () => {
        clearTimeout(handler);
      };
    }
  }, [assignment, saveStatus]);

  const fetchAssignment = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/web-lab/${assignmentId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch assignment')
      }

      const data = await response.json()
      if (data.success) {
        setAssignment(data.data)
      } else {
        throw new Error(data.error || 'Failed to fetch assignment')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [assignmentId])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!assignment) return

    try {
      setSaving(true)
      setSaveStatus('Saving...');
      const formData = new FormData(e.currentTarget)

      const updateData = {
        title: formData.get('title'),
        description: formData.get('description'),
        difficulty: formData.get('difficulty'),
        points: parseInt(formData.get('points') as string) || 10,
        classLevel: formData.get('classLevel') || null,
        template: formData.get('template') || null,
        requirements: formData.get('requirements') ? JSON.parse(formData.get('requirements') as string) : [],
        status: formData.get('status')
      }

      const response = await fetch(`/api/admin/web-lab/${assignmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setSaveStatus('Saved');
        } else {
          setError(result.error || 'Failed to update assignment')
          setSaveStatus('Unsaved');
        }
      } else {
        setError('Failed to update assignment')
        setSaveStatus('Unsaved');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update assignment')
      setSaveStatus('Unsaved');
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAssignment()
    }
  }, [status, fetchAssignment])

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

  if (error && !assignment) {
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
            <h1 className="text-3xl font-bold text-gray-900">Edit Web Lab Assignment</h1>
            <p className="mt-2 text-gray-600">Update the web lab assignment details and settings.</p>
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
                  defaultValue={assignment.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Create a Personal Coding Lab Website"
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
                  defaultValue={assignment.description || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Describe what students need to build..."
                />
              </div>

              {/* Difficulty and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty *
                  </label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    required
                    defaultValue={assignment.difficulty}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value={WebLabDifficulty.BEGINNER}>Beginner</option>
                    <option value={WebLabDifficulty.INTERMEDIATE}>Intermediate</option>
                    <option value={WebLabDifficulty.ADVANCED}>Advanced</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    id="status"
                    name="status"
                    required
                    defaultValue={assignment.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value={WebLabStatus.DRAFT}>Draft</option>
                    <option value={WebLabStatus.PUBLISHED}>Published</option>
                    <option value={WebLabStatus.ARCHIVED}>Archived</option>
                  </select>
                </div>
              </div>

              {/* Template */}
              <div>
                <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-2">
                  Template
                </label>
                <select
                  id="template"
                  name="template"
                  defaultValue={assignment.template || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">None</option>
                  <option value="html-dasar">HTML Dasar</option>
                  <option value="landing-sederhana">Landing Sederhana</option>
                  <option value="todo-js">To-do JS</option>
                </select>
              </div>

              {/* Points and Class Level */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-2">
                    Points
                  </label>
                  <input
                    type="number"
                    id="points"
                    name="points"
                    min="0"
                    defaultValue={assignment.points}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="classLevel" className="block text-sm font-medium text-gray-700 mb-2">
                    Class Level
                  </label>
                  <input
                    type="text"
                    id="classLevel"
                    name="classLevel"
                    defaultValue={assignment.classLevel || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., X-A, XI-B, XII-C"
                  />
                </div>
              </div>

              {/* Requirements */}
              <div>
                <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
                  Requirements (JSON Array)
                </label>
                <textarea
                  id="requirements"
                  name="requirements"
                  rows={6}
                  defaultValue={JSON.stringify(assignment.requirements, null, 2)}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                  placeholder='["Create an HTML structure", "Add CSS styling", "Make it responsive"]'
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter requirements as a JSON array of strings
                </p>
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
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{saveStatus}</span>
                <button
                  type="submit"
                  disabled={saving || saveStatus === 'Saving...'}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  <CheckIcon className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}