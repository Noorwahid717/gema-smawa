'use client'

import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'

interface CodingLabTask {
  id: string
  title: string
  description: string
  classLevel: string
  tags: string[]
  instructions?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface CodingLabSubmission {
  id: string
  title: string
  summary?: string
  classLevel: string
  tags: string[]
  status: string
  submittedAt?: string
  student: {
    id: string
    name: string
    email: string
  }
  task?: {
    id: string
    title: string
    description: string
  }
  lastVersion?: {
    id: string
    html?: string
    css?: string
    js?: string
    artifactType: string
  }
  evaluations?: Array<{
    id: string
    overallScore: number
    overallNote?: string
    status: string
    createdAt: string
    rubricScores: Array<{
      criterion: string
      score: number
      maxScore: number
      comment?: string
    }>
  }>
}

export default function AdminCodingLabPage() {
  const [activeTab, setActiveTab] = useState<'tasks' | 'submissions'>('tasks')
  const [tasks, setTasks] = useState<CodingLabTask[]>([])
  const [submissions, setSubmissions] = useState<CodingLabSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTask, setEditingTask] = useState<CodingLabTask | null>(null)
  const [previewSubmission, setPreviewSubmission] = useState<CodingLabSubmission | null>(null)
  const [gradingSubmission, setGradingSubmission] = useState<CodingLabSubmission | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classLevel: 'X',
    tags: '',
    instructions: '',
    isActive: true
  })

  // Grading form state
  const [gradingData, setGradingData] = useState({
    status: 'GRADED',
    overallNote: '',
    rubricScores: [
      { criterion: 'HTML_STRUCTURE', score: 0, maxScore: 25, comment: '' },
      { criterion: 'CSS_RESPONSIVE', score: 0, maxScore: 25, comment: '' },
      { criterion: 'JS_INTERACTIVITY', score: 0, maxScore: 25, comment: '' },
      { criterion: 'CODE_QUALITY', score: 0, maxScore: 15, comment: '' },
      { criterion: 'CREATIVITY_BRIEF', score: 0, maxScore: 10, comment: '' }
    ]
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      if (activeTab === 'tasks') {
        const tasksResponse = await fetch('/api/coding-lab/tasks')
        if (!tasksResponse.ok) throw new Error('Failed to load tasks')
        const tasksResult = await tasksResponse.json()
        setTasks(tasksResult.data || [])
      } else if (activeTab === 'submissions') {
        const response = await fetch('/api/coding-lab/submissions/admin')
        if (!response.ok) throw new Error('Failed to load submissions')
        const result = await response.json()
        setSubmissions(result.data || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const method = editingTask ? 'PUT' : 'POST'
      const url = editingTask
        ? `/api/coding-lab/tasks/${editingTask.id}`
        : '/api/coding-lab/tasks'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save task')
      }

      await loadData()
      resetForm()
      setShowCreateForm(false)
      setEditingTask(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task')
    }
  }

  const handleEdit = (task: CodingLabTask) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description,
      classLevel: task.classLevel,
      tags: task.tags.join(', '),
      instructions: task.instructions || '',
      isActive: task.isActive
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const response = await fetch(`/api/coding-lab/tasks/${taskId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete task')
      }

      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task')
    }
  }

  const handlePreview = (submission: CodingLabSubmission) => {
    setPreviewSubmission(submission)
  }

  const handleGrade = (submission: CodingLabSubmission) => {
    setGradingSubmission(submission)
    // Initialize grading data with existing evaluation if available
    if (submission.evaluations && submission.evaluations.length > 0) {
      const latestEval = submission.evaluations[0]
      setGradingData({
        status: latestEval.status,
        overallNote: latestEval.overallNote || '',
        rubricScores: latestEval.rubricScores.map(score => ({
          criterion: score.criterion,
          score: score.score,
          maxScore: score.maxScore,
          comment: score.comment || ''
        }))
      })
    }
  }

  const submitGrade = async () => {
    if (!gradingSubmission) return

    try {
      const response = await fetch(`/api/coding-lab/submissions/${gradingSubmission.id}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gradingData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit grade')
      }

      await loadData()
      setGradingSubmission(null)
      setGradingData({
        status: 'GRADED',
        overallNote: '',
        rubricScores: [
          { criterion: 'HTML_STRUCTURE', score: 0, maxScore: 25, comment: '' },
          { criterion: 'CSS_RESPONSIVE', score: 0, maxScore: 25, comment: '' },
          { criterion: 'JS_INTERACTIVITY', score: 0, maxScore: 25, comment: '' },
          { criterion: 'CODE_QUALITY', score: 0, maxScore: 15, comment: '' },
          { criterion: 'CREATIVITY_BRIEF', score: 0, maxScore: 10, comment: '' }
        ]
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit grade')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      classLevel: 'X',
      tags: '',
      instructions: '',
      isActive: true
    })
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Memuat data coding lab...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-600">Error: {error}</p>
        <button
          onClick={loadData}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-gray-900">Admin Coding Lab</h1>
          <p className="text-sm text-gray-600 mt-1">
            Kelola coding lab tasks dan tinjau pengumpulan siswa.
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tasks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Manage Tasks ({tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'submissions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Review Submissions ({submissions.length})
            </button>
          </nav>
        </div>

        {activeTab === 'tasks' && (
          <section className="space-y-6">
            {/* Create/Edit Task Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Coding Lab Tasks</h2>
              <button
                onClick={() => {
                  setEditingTask(null)
                  resetForm()
                  setShowCreateForm(!showCreateForm)
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {showCreateForm ? 'Cancel' : '+ New Task'}
              </button>
            </div>

            {/* Create/Edit Form */}
            {showCreateForm && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Class Level *
                      </label>
                      <select
                        value={formData.classLevel}
                        onChange={(e) => setFormData({...formData, classLevel: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="X">Kelas X</option>
                        <option value="XI">Kelas XI</option>
                        <option value="XII">Kelas XII</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      placeholder="algoritma, python, struktur-data"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instructions
                    </label>
                    <textarea
                      value={formData.instructions}
                      onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                      rows={4}
                      placeholder="Detailed instructions for students..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                      Active (visible to students)
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      {editingTask ? 'Update Task' : 'Create Task'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false)
                        setEditingTask(null)
                        resetForm()
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tasks List */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="border-b border-gray-200 px-4 py-3">
                <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                  Coding Lab Tasks ({tasks.length} total)
                </h2>
              </div>

              <div className="divide-y divide-gray-200">
                {tasks.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No coding lab tasks found. Create your first task!
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              task.classLevel === 'X' ? 'bg-green-100 text-green-800' :
                              task.classLevel === 'XI' ? 'bg-blue-100 text-blue-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              Kelas {task.classLevel}
                            </span>
                            {!task.isActive && (
                              <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                                Inactive
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-2">{task.description}</p>
                          {task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {task.tags.map((tag, index) => (
                                <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          {task.instructions && (
                            <p className="text-sm text-gray-500 italic">
                              {task.instructions.length > 100
                                ? `${task.instructions.substring(0, 100)}...`
                                : task.instructions
                              }
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(task)}
                            className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'submissions' && (
          <section className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="border-b border-gray-200 px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                Student Submissions ({submissions.length} total)
              </h2>
            </div>

            <div className="p-4">
              <div className="space-y-2">
                {submissions.slice(0, 10).map((submission) => (
                  <div key={submission.id} className="border p-4 rounded hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{submission.title}</h3>
                        <p className="text-sm text-gray-600">
                          Student: {submission.student?.name || 'Unknown'} ({submission.student?.email || 'No email'})
                        </p>
                        <p className="text-sm text-gray-600">Class: {submission.classLevel}</p>
                        <p className="text-sm text-gray-600">
                          Submitted: {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : 'Not submitted'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        submission.status === 'GRADED' ? 'bg-green-100 text-green-800' :
                        submission.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                        submission.status === 'RETURNED' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {submission.status}
                      </span>
                    </div>
                    {submission.tags && submission.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {submission.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Preview and Grade buttons */}
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handlePreview(submission)}
                        className="flex-1 px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => handleGrade(submission)}
                        className="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Grade
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Submission Preview Modal */}
        {previewSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6">
              <h3 className="text-lg font-semibold mb-4">
                Preview Submission: {previewSubmission.title}
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-800">Student Info</h4>
                  <p className="text-sm text-gray-600">
                    Name: {previewSubmission.student.name}<br />
                    Email: {previewSubmission.student.email}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800">Task Info</h4>
                  <p className="text-sm text-gray-600">
                    Title: {previewSubmission.task?.title}<br />
                    Description: {previewSubmission.task?.description}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800">Submission Details</h4>
                  <p className="text-sm text-gray-600">
                    Status: {previewSubmission.status}<br />
                    Submitted At: {new Date(previewSubmission.submittedAt || '').toLocaleString()}<br />
                    Tags: {previewSubmission.tags.join(', ')}
                  </p>
                </div>

                {previewSubmission.lastVersion && (
                  <div>
                    <h4 className="font-medium text-gray-800">Code Preview</h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h5 className="font-semibold text-gray-700">HTML</h5>
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                        {previewSubmission.lastVersion.html}
                      </pre>

                      <h5 className="font-semibold text-gray-700 mt-4">CSS</h5>
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                        {previewSubmission.lastVersion.css}
                      </pre>

                      <h5 className="font-semibold text-gray-700 mt-4">JavaScript</h5>
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                        {previewSubmission.lastVersion.js}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setPreviewSubmission(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Grading Interface Modal */}
        {gradingSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6">
              <h3 className="text-lg font-semibold mb-4">
                Grade Submission: {gradingSubmission.title}
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-800">Student Info</h4>
                  <p className="text-sm text-gray-600">
                    Name: {gradingSubmission.student.name}<br />
                    Email: {gradingSubmission.student.email}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800">Task Info</h4>
                  <p className="text-sm text-gray-600">
                    Title: {gradingSubmission.task?.title}<br />
                    Description: {gradingSubmission.task?.description}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800">Submission Details</h4>
                  <p className="text-sm text-gray-600">
                    Status: {gradingSubmission.status}<br />
                    Submitted At: {new Date(gradingSubmission.submittedAt || '').toLocaleString()}<br />
                    Tags: {gradingSubmission.tags.join(', ')}
                  </p>
                </div>

                {gradingSubmission.lastVersion && (
                  <div>
                    <h4 className="font-medium text-gray-800">Code Preview</h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h5 className="font-semibold text-gray-700">HTML</h5>
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                        {gradingSubmission.lastVersion.html}
                      </pre>

                      <h5 className="font-semibold text-gray-700 mt-4">CSS</h5>
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                        {gradingSubmission.lastVersion.css}
                      </pre>

                      <h5 className="font-semibold text-gray-700 mt-4">JavaScript</h5>
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                        {gradingSubmission.lastVersion.js}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Grading Form */}
                <div className="mt-4 p-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-2">Grading</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status *
                      </label>
                      <select
                        value={gradingData.status}
                        onChange={(e) => setGradingData({...gradingData, status: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="GRADED">Graded</option>
                        <option value="RETURNED">Returned for Revision</option>
                        <option value="SUBMITTED">Submitted</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Overall Note
                      </label>
                      <input
                        type="text"
                        value={gradingData.overallNote}
                        onChange={(e) => setGradingData({...gradingData, overallNote: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">Rubric Scores</h5>
                      {gradingData.rubricScores.map((score, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-md mb-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700">{score.criterion}</span>
                            <span className="text-sm text-gray-500">/{score.maxScore}</span>
                          </div>
                          <input
                            type="number"
                            value={score.score}
                            onChange={(e) => {
                              const newScore = Math.min(Math.max(Number(e.target.value), 0), score.maxScore)
                              setGradingData((prev) => {
                                const newRubricScores = [...prev.rubricScores]
                                newRubricScores[index].score = newScore
                                return {...prev, rubricScores: newRubricScores}
                              })
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min={0}
                            max={score.maxScore}
                          />
                          <textarea
                            value={score.comment}
                            onChange={(e) => {
                              setGradingData((prev) => {
                                const newRubricScores = [...prev.rubricScores]
                                newRubricScores[index].comment = e.target.value
                                return {...prev, rubricScores: newRubricScores}
                              })
                            }}
                            placeholder="Comment..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setGradingSubmission(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={submitGrade}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Submit Grade
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
