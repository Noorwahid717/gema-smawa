'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { studentAuth } from '@/lib/student-auth'
import { WebLabAssignment, WebLabSubmission, WebLabSubmissionStatus } from '@prisma/client'
import { WEB_LAB_TEMPLATES } from '@/data/webLabTemplates'
import StudentLayout from '@/components/student/StudentLayout'
import Breadcrumb from '@/components/ui/Breadcrumb'
import CodeMirrorEditor from '@/components/CodeMirrorEditor'

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
    </html>`
    setPreviewDoc(previewHtml)
  }, [html, css, js])

  // Load assignment and submission data
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const session = studentAuth.getSession()
        if (!session) {
          router.push('/student/login')
          return
        }

        // Fetch assignment details
        const assignmentResponse = await fetch(`/api/student/web-lab?studentId=${session.studentId}`)
        if (!assignmentResponse.ok) {
          throw new Error('Failed to fetch assignments')
        }

        const assignmentData = await assignmentResponse.json()
        const currentAssignment = assignmentData.data?.find((a: WebLabAssignment) => a.id === assignmentId)

        if (!currentAssignment) {
          throw new Error('Assignment not found')
        }

        setAssignment(currentAssignment)

        // Load template if available
        const templateData = WEB_LAB_TEMPLATES.find(t => t.id === currentAssignment.template)
        if (templateData) {
          setHtml(templateData.html)
          setCss(templateData.css)
          setJs(templateData.js)
        }

        // Fetch submission
        const submissionResponse = await fetch(`/api/student/web-lab/submissions?studentId=${session.studentId}&assignmentId=${assignmentId}`)
        if (submissionResponse.ok) {
          const submissionData = await submissionResponse.json()
          if (submissionData.success && submissionData.data) {
            setSubmission(submissionData.data)
            // Load saved code if exists
            if (submissionData.data.html) setHtml(submissionData.data.html)
            if (submissionData.data.css) setCss(submissionData.data.css)
            if (submissionData.data.js) setJs(submissionData.data.js)
          }
        }

        setLoading(false)
      } catch (error) {
        console.error('Error fetching assignment:', error)
        setError(error instanceof Error ? error.message : 'Failed to load assignment')
        setLoading(false)
      }
    }

    fetchAssignment()
  }, [assignmentId, router])

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

      const result = await response.json()
      setSubmission(result.data)
      setMessage('Draft berhasil disimpan!')
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error saving draft:', error)
      setError(error instanceof Error ? error.message : 'Failed to save draft')
    } finally {
      setSaving(false)
    }
  }

  const submitAssignment = async () => {
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

      const result = await response.json()
      setSubmission(result.data)
      setMessage('Tugas berhasil dikumpulkan!')
      setTimeout(() => setMessage(null), 5000)
    } catch (error) {
      console.error('Error submitting assignment:', error)
      setError(error instanceof Error ? error.message : 'Failed to submit assignment')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat tugas...</p>
          </div>
        </div>
      </StudentLayout>
    )
  }

  if (!assignment) {
    return (
      <StudentLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Tugas tidak ditemukan.</p>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <Breadcrumb items={[
          { label: 'Dashboard', href: '/student/dashboard-simple' },
          { label: 'Web Lab', href: '/student/web-lab' },
          { label: assignment.title }
        ]} />
      </div>

      {/* Assignment Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
              <p className="text-gray-600 mt-1">{assignment.description}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {assignment.difficulty}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {assignment.classLevel}
                </span>
                <span className="text-sm text-gray-500">
                  {assignment.points} poin • {assignment.timeLimit} menit
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={saveDraft}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Menyimpan...' : 'Simpan Draft'}
              </button>
              <button
                onClick={submitAssignment}
                disabled={submitting || submission?.status === WebLabSubmissionStatus.SUBMITTED}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Mengumpulkan...' : submission?.status === WebLabSubmissionStatus.SUBMITTED ? 'Sudah Dikumpulkan' : 'Kumpulkan Tugas'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Instructions and Requirements Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Instructions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Instruksi</h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{assignment.instructions}</p>
              </div>
            </div>

            {/* Requirements */}
            {assignment.requirements && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Persyaratan</h3>
                <ul className="space-y-2">
                  {(() => {
                    try {
                      const requirements = JSON.parse(assignment.requirements as string)
                      return requirements.map((req: unknown, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-700">{String(req)}</span>
                        </li>
                      ))
                    } catch {
                      return <li className="text-gray-700">Unable to parse requirements</li>
                    }
                  })()}
                </ul>
              </div>
            )}

            {/* If no requirements, show hints in the right column */}
            {!assignment.requirements && assignment.hints && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Petunjuk</h3>
                <div className="space-y-3">
                  {(() => {
                    try {
                      const hints = JSON.parse(assignment.hints as string)
                      return hints.map((hint: unknown, index: number) => (
                        <div key={index} className="bg-blue-50 border border-blue-200 rounded-md p-3">
                          <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-blue-800 text-sm">{String(hint)}</span>
                          </div>
                        </div>
                      ))
                    } catch {
                      return <div className="text-gray-700">Unable to parse hints</div>
                    }
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* Code Editor Row */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" style={{ height: '500px' }}>
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex">
                {[
                  { id: 'html' as TabType, label: 'HTML', color: 'text-orange-600' },
                  { id: 'css' as TabType, label: 'CSS', color: 'text-blue-600' },
                  { id: 'js' as TabType, label: 'JavaScript', color: 'text-yellow-600' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? `border-blue-500 ${tab.color}`
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Editor Content */}
            <div className="h-full">
              {activeTab === 'html' && (
                <CodeMirrorEditor
                  value={html}
                  onChange={setHtml}
                  language="html"
                />
              )}
              {activeTab === 'css' && (
                <CodeMirrorEditor
                  value={css}
                  onChange={setCss}
                  language="css"
                />
              )}
              {activeTab === 'js' && (
                <CodeMirrorEditor
                  value={js}
                  onChange={setJs}
                  language="javascript"
                />
              )}
            </div>
          </div>

          {/* Preview Row */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" style={{ height: '400px' }}>
            <div className="border-b border-gray-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">Live Preview</h3>
                <button
                  onClick={() => setIsPreviewFullscreen(true)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Full Screen
                </button>
              </div>
            </div>
            <div className="h-full p-4">
              <iframe
                srcDoc={previewDoc}
                className="w-full h-full border border-gray-300 rounded-md"
                title="Web Lab Preview"
                sandbox="allow-scripts"
              />
            </div>
          </div>

          {/* Hints Section (if requirements exist) */}
          {assignment.requirements && assignment.hints && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Petunjuk</h3>
              <div className="space-y-3">
                {(() => {
                  try {
                    const hints = JSON.parse(assignment.hints as string)
                    return hints.map((hint: unknown, index: number) => (
                      <div key={index} className="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-blue-800 text-sm">{String(hint)}</span>
                        </div>
                      </div>
                    ))
                  } catch {
                    return <div className="text-gray-700">Unable to parse hints</div>
                  }
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success/Error Messages */}
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
    </StudentLayout>
  )
}