'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { studentAuth } from '@/lib/student-auth'
import { WebLabAssignment, WebLabSubmission, WebLabSubmissionStatus } from '@prisma/client'
import { WebLabTemplate, WEB_LAB_TEMPLATES } from '@/data/webLabTemplates'
import StudentLayout from '@/components/student/StudentLayout'

type TabType = 'html' | 'css' | 'js' | 'preview'

export default function WebLabAssignmentPage() {
  const router = useRouter()
  const params = useParams()
  const assignmentId = params.id as string

  const [assignment, setAssignment] = useState<WebLabAssignment | null>(null)
  const [submission, setSubmission] = useState<WebLabSubmission | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  // Code states
  const [html, setHtml] = useState('')
  const [css, setCss] = useState('')
  const [js, setJs] = useState('')
  const [previewDoc, setPreviewDoc] = useState('')

  // Tab states
  const [activeTab, setActiveTab] = useState<TabType>('html')
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false)
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)

  const updatePreview = useCallback(() => {
    const previewHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Web Lab Preview</title>
        <style>
          ${css}
        </style>
      </head>
      <body>
        ${html}
        <script>
          ${js}
        </script>
      </body>
      </html>
    `
    setPreviewDoc(previewHtml)
  }, [html, css, js])

  const fetchAssignment = useCallback(async () => {
    try {
      setLoading(true)

      const session = studentAuth.getSession()
      if (!session) {
        router.push('/student/login')
        return
      }

      // Fetch assignment details by ID
      const assignmentResponse = await fetch(`/api/student/web-lab/${assignmentId}?studentId=${session.studentId}`)
      if (!assignmentResponse.ok) {
        throw new Error('Assignment not found')
      }

      const assignmentData = await assignmentResponse.json()
      const currentAssignment = assignmentData.data

      if (!currentAssignment) {
        throw new Error('Assignment not found')
      }

      setAssignment(currentAssignment)

      // Check if there's a submission
      const userSubmission = currentAssignment.submissions?.[0]

      // Load template from file if assignment has template field
      let initialHtml = currentAssignment.starterHtml || ''
      let initialCss = currentAssignment.starterCss || ''
      let initialJs = currentAssignment.starterJs || ''

      if (currentAssignment.template) {
        const templateData = WEB_LAB_TEMPLATES.find(t => t.id === currentAssignment.template)
        if (templateData) {
          initialHtml = templateData.html
          initialCss = templateData.css
          initialJs = templateData.js
        }
      }

      if (userSubmission) {
        setSubmission(userSubmission)
        setHtml(userSubmission.html || initialHtml)
        setCss(userSubmission.css || initialCss)
        setJs(userSubmission.js || initialJs)
      } else {
        // Initialize with starter code or template
        setHtml(initialHtml)
        setCss(initialCss)
        setJs(initialJs)
      }

      updatePreview()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [assignmentId, updatePreview, router])

  useEffect(() => {
    const session = studentAuth.getSession()
    if (!session) {
      router.push('/student/login')
      return
    }

    fetchAssignment()
  }, [assignmentId, router, fetchAssignment])

  useEffect(() => {
    updatePreview()
  }, [updatePreview])

  // Handle escape key for full screen preview
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPreviewFullscreen) {
        setIsPreviewFullscreen(false)
      }
    }

    if (isPreviewFullscreen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isPreviewFullscreen])

  const saveDraft = async () => {
    try {
      setSaving(true)
      setError(null)

      const session = studentAuth.getSession()
      if (!session) {
        router.push('/student/login')
        return
      }

      const response = await fetch('/api/student/web-lab/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: session.studentId,
          assignmentId,
          html,
          css,
          js,
          status: WebLabSubmissionStatus.DRAFT
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save draft')
      }

      const data = await response.json()
      setSubmission(data.data)
      setMessage('Draft saved successfully!')
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save draft')
    } finally {
      setSaving(false)
    }
  }

  const submitAssignment = async () => {
    if (!confirm('Are you sure you want to submit this assignment? You won\'t be able to make changes after submission.')) {
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const session = studentAuth.getSession()
      if (!session) {
        router.push('/student/login')
        return
      }

      const response = await fetch('/api/student/web-lab/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: session.studentId,
          assignmentId,
          html,
          css,
          js,
          status: WebLabSubmissionStatus.SUBMITTED
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit assignment')
      }

      const data = await response.json()
      setSubmission(data.data)
      setMessage('Assignment submitted successfully!')
      setTimeout(() => setMessage(null), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit assignment')
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit = submission?.status === WebLabSubmissionStatus.DRAFT ||
                   submission?.status === WebLabSubmissionStatus.RETURNED ||
                   !submission

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </StudentLayout>
    )
  }

  if (!assignment) {
    return (
      <StudentLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Assignment not found.</p>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header with Assignment Details */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => router.push('/student/dashboard-simple')}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Kembali ke Dashboard
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={saveDraft}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        Simpan Draft
                      </>
                    )}
                  </button>
                  {canSubmit && (
                    <button
                      onClick={submitAssignment}
                      disabled={submitting}
                      className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {submitting ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Kirim Tugas
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Assignment Details at Top */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">{assignment.title}</h1>
                    
                    {/* Description Accordion */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
                      <button
                        onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">Deskripsi Tugas</h2>
                          <p className="text-sm text-gray-500 mt-1">
                            {descriptionExpanded ? 'Klik untuk menyembunyikan' : 'Klik untuk melihat detail lengkap'}
                          </p>
                        </div>
                        <svg 
                          className={`w-5 h-5 text-gray-500 transition-transform ${descriptionExpanded ? 'rotate-180' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {descriptionExpanded && (
                        <div className="px-4 pb-4 border-t border-gray-100">
                          <div className="pt-3">
                            <div className="prose prose-sm max-w-none">
                              <div dangerouslySetInnerHTML={{ __html: assignment.instructions.replace(/\n/g, '<br>') }} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3">Detail Tugas</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tingkat Kesulitan:</span>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full border-2 shadow-md ${
                            assignment.difficulty === 'BEGINNER' ? 'bg-green-100 text-green-800 border-green-600 shadow-green-200' :
                            assignment.difficulty === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-800 border-yellow-600 shadow-yellow-200' :
                            'bg-red-100 text-red-800 border-red-600 shadow-red-200'
                          }`}>
                            {assignment.difficulty}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Poin:</span>
                          <span className="font-medium">{assignment.points}</span>
                        </div>
                        {assignment.timeLimit && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Batas Waktu:</span>
                            <span>{assignment.timeLimit} menit</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            submission?.status === 'GRADED' ? 'bg-green-100 text-green-800' :
                            submission?.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                            submission?.status === 'RETURNED' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {submission?.status || 'Belum Dimulai'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Requirements */}
                    {assignment.requirements && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-3">Persyaratan</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                          {(() => {
                            try {
                              const requirements = Array.isArray(assignment.requirements)
                                ? assignment.requirements
                                : typeof assignment.requirements === 'string'
                                ? JSON.parse(assignment.requirements)
                                : []
                              return requirements.map((req: unknown, index: number) => (
                                <li key={index}>{String(req)}</li>
                              ))
                            } catch {
                              return <li>Unable to parse requirements</li>
                            }
                          })()}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Editor and Preview Side by Side */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Code Editor */}
            <div className="bg-white rounded-lg shadow">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex">
                  {[
                    { id: 'html' as TabType, label: 'HTML', color: 'text-orange-600' },
                    { id: 'css' as TabType, label: 'CSS', color: 'text-blue-600' },
                    { id: 'js' as TabType, label: 'JavaScript', color: 'text-yellow-600' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-3 px-6 border-b-3 font-semibold text-sm transition-all duration-200 ${
                        activeTab === tab.id
                          ? `border-current ${tab.color} bg-blue-50 shadow-sm`
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-4">
                {activeTab === 'html' && (
                  <textarea
                    value={html}
                    onChange={(e) => setHtml(e.target.value)}
                    placeholder="Tulis kode HTML Anda di sini..."
                    className="w-full h-96 font-mono text-sm border-0 focus:ring-0 resize-none p-6"
                    style={{ minHeight: '500px' }}
                  />
                )}

                {activeTab === 'css' && (
                  <textarea
                    value={css}
                    onChange={(e) => setCss(e.target.value)}
                    placeholder="Tulis kode CSS Anda di sini..."
                    className="w-full h-96 font-mono text-sm border-0 focus:ring-0 resize-none p-6"
                    style={{ minHeight: '500px' }}
                  />
                )}

                {activeTab === 'js' && (
                  <textarea
                    value={js}
                    onChange={(e) => setJs(e.target.value)}
                    placeholder="Tulis kode JavaScript Anda di sini..."
                    className="w-full h-96 font-mono text-sm border-0 focus:ring-0 resize-none p-6"
                    style={{ minHeight: '500px' }}
                  />
                )}
              </div>
            </div>

            {/* Live Preview */}
            <div className="bg-white rounded-lg shadow">
              <div className="border-b border-gray-200 px-4 py-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Preview Langsung
                  </h3>
                  <button
                    onClick={() => setIsPreviewFullscreen(true)}
                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    title="Full Screen Preview"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 3l-6 6m0 0V4m0 5h5M3 21l6-6m0 0v5m0-5H4" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="border rounded-lg overflow-hidden bg-white">
                  <iframe
                    srcDoc={previewDoc}
                    className="w-full h-96 border-0"
                    title="Web Lab Preview"
                    sandbox="allow-scripts"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submission Status (if exists) */}
          {submission && assignment && (
            <div className="mt-8 bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Status Pengiriman</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <span className="font-medium">Status:</span>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    submission.status === 'GRADED' ? 'bg-green-100 text-green-800' :
                    submission.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                    submission.status === 'RETURNED' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {submission.status}
                  </span>
                </div>

                {submission.submittedAt && (
                  <div>
                    <span className="font-medium">Dikirim:</span>
                    <span className="ml-2">{new Date(submission.submittedAt).toLocaleString('id-ID')}</span>
                  </div>
                )}

                {submission.score !== null && (
                  <div>
                    <span className="font-medium">Nilai:</span>
                    <span className="ml-2 font-bold text-lg text-indigo-600">{submission.score}/{assignment.points}</span>
                  </div>
                )}
              </div>

              {submission.feedback && (
                <div className="mt-4">
                  <span className="font-medium">Feedback:</span>
                  <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
                    {submission.feedback}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Messages */}
        {message && (
          <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg">
            {message}
          </div>
        )}

        {error && (
          <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
            {error}
          </div>
        )}

        {/* Full Screen Preview Modal */}
        {isPreviewFullscreen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
            <div className="relative w-full h-full max-w-7xl max-h-full bg-white rounded-lg shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Preview Langsung - Full Screen
                </h3>
                <button
                  onClick={() => setIsPreviewFullscreen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
                  title="Exit Full Screen"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Full Screen Preview */}
              <div className="flex-1 p-4 h-full">
                <iframe
                  srcDoc={previewDoc}
                  className="w-full h-full border-0 rounded-lg"
                  title="Web Lab Preview - Full Screen"
                  sandbox="allow-scripts"
                  style={{ minHeight: 'calc(100vh - 200px)' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  )
}