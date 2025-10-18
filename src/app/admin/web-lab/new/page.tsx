'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { WebLabDifficulty, WebLabStatus } from '@prisma/client'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import AdminLayout from '@/components/admin/AdminLayout'
import { WEB_LAB_TEMPLATES } from '@/data/webLabTemplates'

export default function NewWebLabPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      setSaving(true)
      setError(null)

      const formData = new FormData(e.currentTarget)

      const assignmentData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        difficulty: formData.get('difficulty') as WebLabDifficulty,
        classLevel: formData.get('classLevel') as string || null,
        instructions: formData.get('instructions') as string,
        starterHtml: formData.get('starterHtml') as string,
        starterCss: formData.get('starterCss') as string,
        starterJs: formData.get('starterJs') as string,
        requirements: formData.get('requirements') ? JSON.parse(formData.get('requirements') as string) : [],
        hints: formData.get('hints') ? JSON.parse(formData.get('hints') as string) : [],
        points: parseInt(formData.get('points') as string) || 100,
        timeLimit: parseInt(formData.get('timeLimit') as string) || 60,
        status: formData.get('status') as WebLabStatus,
        template: formData.get('template') as string || null,
      }

      const response = await fetch('/api/admin/web-lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentData)
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          router.push('/admin/web-lab')
        } else {
          setError(result.error || 'Failed to create assignment')
        }
      } else {
        setError('Failed to create assignment')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create assignment')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading') {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!session?.user) {
    return null
  }

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
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
            <h1 className="text-3xl font-bold text-gray-900">Create New Web Lab Assignment</h1>
            <p className="mt-2 text-gray-600">Create a new HTML/CSS/JavaScript programming assignment for students.</p>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Membuat Halaman Profil Sederhana"
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
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Brief description of the assignment..."
                />
              </div>

              {/* Instructions */}
              <div>
                <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions *
                </label>
                <textarea
                  id="instructions"
                  name="instructions"
                  rows={6}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Detailed instructions for students..."
                />
              </div>

              {/* Difficulty, Status, Class Level */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty *
                  </label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    required
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
                    defaultValue={WebLabStatus.DRAFT}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value={WebLabStatus.DRAFT}>Draft</option>
                    <option value={WebLabStatus.PUBLISHED}>Published</option>
                    <option value={WebLabStatus.ARCHIVED}>Archived</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="classLevel" className="block text-sm font-medium text-gray-700 mb-2">
                    Class Level
                  </label>
                  <input
                    type="text"
                    id="classLevel"
                    name="classLevel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., XI-A"
                  />
                </div>
              </div>

              {/* Points and Time Limit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-2">
                    Points
                  </label>
                  <input
                    type="number"
                    id="points"
                    name="points"
                    defaultValue={100}
                    min={0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 mb-2">
                    Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    id="timeLimit"
                    name="timeLimit"
                    defaultValue={60}
                    min={1}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Template Selection */}
              <div>
                <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-2">
                  Template
                </label>
                <select
                  id="template"
                  name="template"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">No template (custom starter code)</option>
                  {WEB_LAB_TEMPLATES.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} - {template.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Starter Code */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Starter Code</h3>

                <div>
                  <label htmlFor="starterHtml" className="block text-sm font-medium text-gray-700 mb-2">
                    HTML Starter Code
                  </label>
                  <textarea
                    id="starterHtml"
                    name="starterHtml"
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="<html>...</html>"
                  />
                </div>

                <div>
                  <label htmlFor="starterCss" className="block text-sm font-medium text-gray-700 mb-2">
                    CSS Starter Code
                  </label>
                  <textarea
                    id="starterCss"
                    name="starterCss"
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="body { ... }"
                  />
                </div>

                <div>
                  <label htmlFor="starterJs" className="block text-sm font-medium text-gray-700 mb-2">
                    JavaScript Starter Code
                  </label>
                  <textarea
                    id="starterJs"
                    name="starterJs"
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="console.log('Hello World!');"
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
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder='["Requirement 1", "Requirement 2", "Requirement 3"]'
                />
                <p className="mt-1 text-sm text-gray-500">Enter as JSON array of strings</p>
              </div>

              {/* Hints */}
              <div>
                <label htmlFor="hints" className="block text-sm font-medium text-gray-700 mb-2">
                  Hints (JSON Array)
                </label>
                <textarea
                  id="hints"
                  name="hints"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder='["Hint 1", "Hint 2", "Hint 3"]'
                />
                <p className="mt-1 text-sm text-gray-500">Enter as JSON array of strings</p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-red-800 text-sm">{error}</div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Creating...' : 'Create Assignment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}