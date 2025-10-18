'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { WebLabSubmission, WebLabSubmissionStatus } from '@prisma/client'
import { ArrowLeftIcon, EyeIcon, CodeBracketIcon } from '@heroicons/react/24/outline'

interface SubmissionWithDetails extends WebLabSubmission {
  student: {
    fullName: string
    studentId: string
    class: string
  }
  assignment: {
    title: string
    description: string
    points: number
    requirements: string[]
  }
  evaluation?: {
    score: number
    feedback: string
    checklist?: { [key: string]: unknown }
  }
}

export default function AdminWebLabSubmissionPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const assignmentId = params.id as string
  const submissionId = params.submissionId as string

  const [submission, setSubmission] = useState<SubmissionWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [score, setScore] = useState<number>(0)
  const [feedback, setFeedback] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview')
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false)

  const generatePreviewHtml = useCallback(() => {
    if (!submission) return ''

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Web Lab Submission Preview</title>
        <style>
          ${submission.css || ''}
        </style>
      </head>
      <body>
        ${submission.html || ''}
        <script>
          ${submission.js || ''}
        </script>
      </body>
    </html>`
  }, [submission])

  const fetchSubmission = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/web-lab/${assignmentId}/submission/${submissionId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch submission')
      }

      const data = await response.json()
      const sub = data.data
      setSubmission(sub)
      setScore(sub.evaluation?.score || 0)
      setFeedback(sub.evaluation?.feedback || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [assignmentId, submissionId])

  const handleSaveEvaluation = async () => {
    if (!submission) return

    try {
      setSaving(true)
      const response = await fetch('/api/admin/web-lab/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: submission.id,
          score: score,
          feedback: feedback
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save evaluation')
      }

      const data = await response.json()
      setSubmission(prev => prev ? { ...prev, evaluation: data.data, status: WebLabSubmissionStatus.GRADED } : null)
      alert('Evaluation saved successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save evaluation')
    } finally {
      setSaving(false)
    }
  }

  // Handle escape key for fullscreen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPreviewFullscreen) {
        setIsPreviewFullscreen(false)
      }
    }

    if (isPreviewFullscreen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isPreviewFullscreen])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSubmission()
    }
  }, [status, fetchSubmission])

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

  if (!submission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Submission Not Found</h2>
          <p className="text-gray-600 mb-4">The submission you&apos;re looking for doesn&apos;t exist.</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{submission.assignment.title}</h1>
                <p className="mt-1 text-gray-600">Submitted by {submission.student.fullName}</p>
                <p className="text-sm text-gray-500">
                  {submission.student.studentId} - {submission.student.class}
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  submission.status === WebLabSubmissionStatus.SUBMITTED
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {submission.status === WebLabSubmissionStatus.SUBMITTED ? 'Pending Review' : 'Graded'}
                </span>
                <p className="mt-1 text-sm text-gray-500">
                  Submitted {new Date(submission.submittedAt || submission.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Submission Preview/Code */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="border-b border-gray-200">
                <nav className="flex">
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 ${
                      activeTab === 'preview'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <EyeIcon className="w-4 h-4 mr-2 inline" />
                    Preview
                  </button>
                  <button
                    onClick={() => setActiveTab('code')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 ${
                      activeTab === 'code'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <CodeBracketIcon className="w-4 h-4 mr-2 inline" />
                    Code
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'preview' ? (
                  <div className="space-y-4">
                    {/* Preview Controls */}
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">Live Preview</h3>
                      <button
                        onClick={() => setIsPreviewFullscreen(!isPreviewFullscreen)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <EyeIcon className="w-4 h-4 mr-2" />
                        {isPreviewFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                      </button>
                    </div>

                    {/* Preview Container */}
                    <div className={`border rounded-lg bg-white overflow-hidden transition-all duration-300 ${
                      isPreviewFullscreen ? 'fixed inset-4 z-50 bg-white' : 'h-96'
                    }`}>
                      <iframe
                        srcDoc={generatePreviewHtml()}
                        className="w-full h-full border-0"
                        title="Submission Preview"
                        sandbox="allow-scripts allow-same-origin"
                      />
                      {isPreviewFullscreen && (
                        <button
                          onClick={() => setIsPreviewFullscreen(false)}
                          className="absolute top-4 right-4 bg-gray-800 text-white px-3 py-2 rounded-md text-sm hover:bg-gray-700"
                        >
                          Close
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">HTML</h3>
                      <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto">
                        <code>{submission.html}</code>
                      </pre>
                    </div>
                    {submission.css && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-2">CSS</h3>
                        <pre className="bg-gray-900 text-blue-400 p-4 rounded text-sm overflow-x-auto">
                          <code>{submission.css}</code>
                        </pre>
                      </div>
                    )}
                    {submission.js && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-2">JavaScript</h3>
                        <pre className="bg-gray-900 text-yellow-400 p-4 rounded text-sm overflow-x-auto">
                          <code>{submission.js}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Evaluation Panel */}
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Evaluation</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score (out of {submission.assignment.points})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={submission.assignment.points}
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback
                  </label>
                  <textarea
                    rows={6}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide constructive feedback for the student..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <button
                  onClick={handleSaveEvaluation}
                  disabled={saving}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Evaluation'}
                </button>
              </div>
            </div>

            {submission.evaluation && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Previous Evaluation</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Score:</span> {submission.evaluation.score}/{submission.assignment.points}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Feedback:</span>
                  </p>
                  <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded">
                    {submission.evaluation.feedback}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}