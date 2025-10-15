'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { studentAuth } from '@/lib/student-auth'
import JSZip from 'jszip'
import {
  PortfolioArtifactType,
  PortfolioRubricCriterion,
  PortfolioSubmissionStatus
} from '@prisma/client'
import {
  buildSandboxedPreview,
  PORTFOLIO_FILE_SIZE_LIMIT,
  PORTFOLIO_MAX_EDITOR_SIZE
} from '@/lib/portfolio'
import { PreviewFrame } from '@/components/portfolio/PreviewFrame'
import { StatusBadge } from '@/components/portfolio/StatusBadge'
import { RubricTable } from '@/components/portfolio/RubricTable'

// ...existing types and constants copied from portfolio page...

interface PortfolioTask {
  id: string
  title: string
  description: string
  classLevel: string
  instructions?: string | null
  tags: string[]
}

interface RubricScoreRow {
  id: string
  criterion: PortfolioRubricCriterion
  score: number
  maxScore: number
  comment?: string | null
}

interface PortfolioEvaluation {
  id: string
  overallScore: number
  overallNote?: string | null
  status: PortfolioSubmissionStatus
  createdAt: string
  rubricScores: RubricScoreRow[]
}

interface PortfolioSubmission {
  id: string
  taskId: string
  title: string
  summary?: string | null
  classLevel: string
  tags: string[]
  status: PortfolioSubmissionStatus
  draft: {
    html?: string | null
    css?: string | null
    js?: string | null
    artifactType: PortfolioArtifactType
    archivePath?: string | null
    archiveSize?: number | null
    metadata?: string | null
  }
  submittedAt?: string | null
  returnedAt?: string | null
  evaluation: PortfolioEvaluation | null
}

interface ApiResponse<T> {
  success?: boolean
  data?: T
  error?: string
}

const DEFAULT_HTML = `<!-- Mulai tulis struktur halaman kamu di sini -->\n<section class="hero">\n  <h1>Halo, saya...</h1>\n</section>`

const DEFAULT_CSS = `/* Mulai styling kamu di sini */
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
  background: #f5f5f5;
}

.hero {
  text-align: center;
  padding: 50px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.hero h1 {
  color: #333;
  font-size: 2.5em;
  margin: 0;
}`

function toTagsString(tags: string[]): string {
  return tags.join(', ')
}

function parseTagInput(value: string): string[] {
  return value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
}

function clampTextLength(value: string, label: string) {
  if (value.length > PORTFOLIO_MAX_EDITOR_SIZE) {
    throw new Error(`${label} melebihi ${PORTFOLIO_MAX_EDITOR_SIZE} karakter`)
  }
}

export default function CodingLabPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<PortfolioTask | null>(null)
  const [submission, setSubmission] = useState<PortfolioSubmission | null>(null)

  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [classLevel, setClassLevel] = useState('')
  const [tagsInput, setTagsInput] = useState('')

  const [html, setHtml] = useState(DEFAULT_HTML)
  const [css, setCss] = useState(DEFAULT_CSS)
  const [js, setJs] = useState('')

  const [mode, setMode] = useState<'editor' | 'upload'>('editor')
  const [previewDoc, setPreviewDoc] = useState('')

  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)

  const canSubmit = useMemo(() => {
    if (!submission) return true

    return (
      submission.status === PortfolioSubmissionStatus.DRAFT ||
      submission.status === PortfolioSubmissionStatus.RETURNED
    )
  }, [submission])

  // Check authentication
  useEffect(() => {
    const session = studentAuth.getSession()
    if (!session) {
      console.log('No student session found, redirecting to login')
      const currentUrl = window.location.pathname + window.location.search
      window.location.href = `/student/login?redirect=${encodeURIComponent(currentUrl)}`
      return
    }
    console.log('Student session found for coding lab:', session.studentId)
  }, [])

  const hydrateEditorFromSubmission = useCallback((data: PortfolioSubmission) => {
    setTitle(data.title)
    setSummary(data.summary ?? '')
    setClassLevel(data.classLevel)
    setTagsInput(toTagsString(data.tags))
    if (data.draft.artifactType === PortfolioArtifactType.UPLOAD) {
      setMode('upload')
    } else {
      setMode('editor')
    }
    setHtml(data.draft.html ?? DEFAULT_HTML)
    setCss(data.draft.css ?? '')
    setJs(data.draft.js ?? '')
  }, [])

  const fetchSubmission = useCallback(
    async (taskId: string) => {
      try {
        const response = await fetch(`/api/portfolio/submissions?taskId=${encodeURIComponent(taskId)}`)
        if (!response.ok) {
          setSubmission(null)
          return
        }
        const payload: ApiResponse<PortfolioSubmission[]> = await response.json()
        const record = payload.data && Array.isArray(payload.data) ? payload.data[0] : null
        if (record) {
          setSubmission(record)
          hydrateEditorFromSubmission(record)
          if (record.draft.html || record.draft.css || record.draft.js) {
            setPreviewDoc(
              buildSandboxedPreview({
                html: record.draft.html,
                css: record.draft.css,
                js: record.draft.js
              })
            )
          }
        } else {
          setSubmission(null)
          const studentSession = studentAuth.getSession()
          setTitle(`${studentSession?.fullName ?? 'Coding Lab Project'}`)
          setSummary('')
          setTagsInput('')
          setHtml(DEFAULT_HTML)
          setCss(DEFAULT_CSS)
          setJs('')
          setPreviewDoc('')
          setMode('editor')
        }
      } catch (err) {
        console.error(err)
      }
    }, [hydrateEditorFromSubmission]
  )

  useEffect(() => {
    const studentSession = studentAuth.getSession()
    if (!studentSession) {
      const currentUrl = window.location.pathname + window.location.search
      router.push(`/student/login?redirect=${encodeURIComponent(currentUrl)}`)
      return
    }

    setClassLevel(studentSession.class || '')

    async function fetchData() {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (studentSession?.class) {
          params.set('classLevel', studentSession.class)
        }
        const tasksResponse = await fetch(`/api/portfolio/tasks?${params.toString()}`)
        if (tasksResponse.ok) {
          const taskPayload: ApiResponse<PortfolioTask[]> = await tasksResponse.json()
          const fetchedTasks = Array.isArray(taskPayload.data) ? taskPayload.data : []
          const firstTask = fetchedTasks[0] ?? null
          setSelectedTask(firstTask)
          if (firstTask) {
            await fetchSubmission(firstTask.id)
          }
        } else {
          setError('Gagal memuat data tugas coding lab')
        }
      } catch (err) {
        console.error(err)
        setError('Terjadi kesalahan saat mengambil data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router, fetchSubmission])

  // Live preview update when HTML, CSS, or JS changes
  useEffect(() => {
    if (mode === 'editor') {
      const preview = buildSandboxedPreview({ html, css, js })
      setPreviewDoc(preview)
    }
  }, [html, css, js, mode])

  // persistDraft, handlePreview, handleSubmit, handleUploadZip et cetera: copy logic from portfolio page

  async function persistDraft(options: { silent?: boolean } = {}) {
    if (!selectedTask) {
      setError('Tugas coding lab tidak ditemukan')
      return null
    }

    const tags = parseTagInput(tagsInput)

    try {
      if (!options.silent) {
        setSaving(true)
        setMessage(null)
        setError(null)
      }

      clampTextLength(html, 'HTML')
      clampTextLength(css, 'CSS')
      clampTextLength(js, 'JavaScript')

      const response = await fetch('/api/portfolio/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          taskId: selectedTask.id,
          title,
          summary,
          classLevel,
          tags,
          html,
          css,
          js,
          artifactType: mode === 'upload' ? PortfolioArtifactType.UPLOAD : PortfolioArtifactType.EDITOR
        })
      })

      if (!response.ok) {
        const payload = await response.json()
        throw new Error(payload.error || 'Gagal menyimpan draft')
      }

      const payload: ApiResponse<{
        id: string
        status: PortfolioSubmissionStatus
        title: string
        summary?: string
        classLevel: string
        tags: string[]
        draft: PortfolioSubmission['draft']
      }> = await response.json()

      if (payload.data) {
        const updated: PortfolioSubmission = submission
          ? {
              ...submission,
              ...payload.data,
              tags: payload.data.tags,
              draft: payload.data.draft
            }
          : {
              id: payload.data.id,
              taskId: selectedTask.id,
              title: payload.data.title,
              summary: payload.data.summary,
              classLevel: payload.data.classLevel,
              tags: payload.data.tags,
              status: payload.data.status,
              draft: payload.data.draft,
              submittedAt: null,
              returnedAt: null,
              evaluation: null
            }
        setSubmission(updated)
        setMode(updated.draft.artifactType === PortfolioArtifactType.UPLOAD ? 'upload' : 'editor')
        if (!options.silent) {
          setMessage('Draft berhasil disimpan')
        }
        return updated
      }

      return submission
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan draft'
      setError(message)
      return null
    } finally {
      if (!options.silent) {
        setSaving(false)
      }
    }
  }

  async function handlePreview() {
    setPreviewDoc(
      buildSandboxedPreview({
        html,
        css,
        js
      })
    )
  }

  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    setMessage(null)
    setError(null)

    try {
      const ensured = submission ?? (await persistDraft({ silent: true }))
      if (!ensured) {
        throw new Error('Draft belum tersimpan')
      }

      const response = await fetch(`/api/portfolio/submissions/${ensured.id}/submit`, {
        method: 'POST'
      })

      if (!response.ok) {
        const payload = await response.json()
        throw new Error(payload.error || 'Gagal mengirim pengumpulan')
      }

      await fetchSubmission(ensured.taskId)
      setMessage('Karya berhasil dikirim untuk dinilai')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim pengumpulan')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUploadZip(file: File) {
    const ensured = submission ?? (await persistDraft({ silent: true }))
    if (!ensured) {
      setError('Simpan draft terlebih dahulu sebelum mengunggah ZIP')
      return
    }

    setUploading(true)
    setMessage(null)
    setError(null)

    try {
      if (file.size > PORTFOLIO_FILE_SIZE_LIMIT) {
        throw new Error('Ukuran arsip melebihi 10MB')
      }

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/portfolio/submissions/${ensured.id}/upload`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const payload = await response.json()
        throw new Error(payload.error || 'Gagal mengunggah arsip')
      }

      const payload: ApiResponse<{ draft: PortfolioSubmission['draft'] }> = await response.json()

      if (payload.data) {
        const draft = payload.data.draft
        setMode('upload')
        setHtml(draft.html ?? '')
        setCss(draft.css ?? '')
        setJs(draft.js ?? '')
        setSubmission(prev =>
          prev
            ? {
                ...prev,
                draft,
                status: prev.status
              }
            : prev
        )
        setPreviewDoc(
          buildSandboxedPreview({ html: draft.html, css: draft.css, js: draft.js })
        )
        setMessage('Arsip berhasil diunggah dan siap dipreview')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengunggah arsip')
    } finally {
      setUploading(false)
    }
  }

  async function handleZipInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    await handleUploadZip(file)
    event.target.value = ''
  }

  async function handleLocalZipPreview(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > PORTFOLIO_FILE_SIZE_LIMIT) {
      setError('Ukuran arsip melebihi 10MB')
      event.target.value = ''
      return
    }

    setError(null)
    try {
      const zip = await JSZip.loadAsync(file)
      const htmlEntry = zip.file(/index\.html$/i)[0]
      if (!htmlEntry) {
        throw new Error('Arsip tidak memiliki index.html')
      }
      const htmlContent = await htmlEntry.async('string')
      const cssContent = (await Promise.all(zip.file(/\.css$/i).map(entry => entry.async('string')))).join('\n')
      const jsContent = (await Promise.all(zip.file(/\.js$/i).map(entry => entry.async('string')))).join('\n')

      setHtml(htmlContent)
      setCss(cssContent)
      setJs(jsContent)
      setPreviewDoc(buildSandboxedPreview({ html: htmlContent, css: cssContent, js: jsContent }))
      setMode('upload')
      setMessage('Pratinjau arsip lokal berhasil dibuat. Jangan lupa tekan Simpan Draft.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membaca arsip lokal')
    } finally {
      event.target.value = ''
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600" role="status">
          Memuat ruang coding lab...
        </p>
      </div>
    )
  }

  if (!selectedTask) {
    return (
      <div className="max-w-3xl mx-auto py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Tugas coding lab belum tersedia</h1>
        <p className="text-gray-600">Hubungi guru untuk mendapatkan akses ke tugas Coding Lab.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        {/* Navigation Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link 
            href="/student/dashboard-simple"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Kembali ke Dashboard
          </Link>
          <Link
            href="/student/profile"
            className="text-gray-600 hover:text-blue-600 text-sm font-medium px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
          >
            👤 Profile
          </Link>
        </div>
        
        <header className="mb-8">
          <p className="text-sm text-blue-600 font-semibold mb-2">Tugas Coding Lab</p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{selectedTask.title}</h1>
            {submission && <StatusBadge status={submission.status} />}
          </div>
          <p className="mt-3 text-gray-700 max-w-3xl">{selectedTask.description}</p>
          {selectedTask.instructions && (
            <div className="mt-4 p-4 rounded-lg bg-white border border-blue-100">
              <h2 className="text-sm font-semibold text-blue-700 uppercase tracking-wide">
                Instruksi utama
              </h2>
              <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">
                {selectedTask.instructions}
              </p>
            </div>
          )}
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section aria-labelledby="codinglab-form" className="space-y-6">
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <h2 id="codinglab-form" className="text-lg font-semibold text-gray-900">
                Metadata Project
              </h2>
              <div className="mt-4 space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Judul</span>
                  <input
                    type="text"
                    value={title}
                    onChange={event => setTitle(event.target.value)}
                    maxLength={160}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-describedby="title-help"
                  />
                  <span id="title-help" className="text-xs text-gray-500">
                    Gunakan judul yang mendeskripsikan project kamu.
                  </span>
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Ringkasan singkat</span>
                  <textarea
                    value={summary}
                    onChange={event => setSummary(event.target.value)}
                    maxLength={600}
                    rows={3}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-describedby="summary-help"
                  />
                  <span id="summary-help" className="text-xs text-gray-500">
                    Ceritakan highlight project kamu (maks. 600 karakter).
                  </span>
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">Kelas</span>
                    <input
                      type="text"
                      value={classLevel}
                      onChange={event => setClassLevel(event.target.value)}
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">Tag (pisahkan dengan koma)</span>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={event => setTagsInput(event.target.value)}
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Editor & Upload</h2>
                  <p className="text-sm text-gray-600">
                    Gunakan panel editor atau unggah arsip ZIP statis dengan index.html sebagai entry point.
                  </p>
                </div>
                <div className="flex items-center gap-2" role="group" aria-label="Mode input coding lab">
                  <button
                    type="button"
                    onClick={() => setMode('editor')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md border ${
                      mode === 'editor'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    Editor Langsung
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('upload')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md border ${
                      mode === 'upload'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    Unggah ZIP
                  </button>
                </div>
              </div>

              {mode === 'editor' ? (
                <div className="grid gap-4 lg:grid-cols-3">
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">HTML</span>
                    <textarea
                      value={html}
                      onChange={event => setHtml(event.target.value)}
                      rows={14}
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">CSS</span>
                    <textarea
                      value={css}
                      onChange={event => setCss(event.target.value)}
                      rows={14}
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">JavaScript</span>
                    <textarea
                      value={js}
                      onChange={event => setJs(event.target.value)}
                      rows={14}
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">Unggah ZIP</span>
                    <input
                      type="file"
                      accept=".zip"
                      onChange={handleZipInputChange}
                      className="mt-1 block w-full text-sm text-gray-700"
                    />
                    <span className="text-xs text-gray-500">
                      Maksimal 10MB. File hanya boleh berisi asset statis (HTML, CSS, JS, gambar, font).
                    </span>
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">Preview arsip lokal (opsional)</span>
                    <input
                      type="file"
                      accept=".zip"
                      onChange={handleLocalZipPreview}
                      className="mt-1 block w-full text-sm text-gray-700"
                    />
                    <span className="text-xs text-gray-500">
                      Gunakan untuk melihat isi arsip tanpa mengunggah ke server.
                    </span>
                  </label>
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => persistDraft()}
                  disabled={saving || uploading}
                  className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:opacity-60"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Draft'}
                </button>
                <button
                  type="button"
                  onClick={handlePreview}
                  className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                >
                  Pratinjau
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit || submitting || uploading}
                  className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:opacity-60"
                >
                  {submitting ? 'Mengirim...' : 'Kirim untuk Dinilai'}
                </button>
              </div>
              {message && <p className="text-sm text-emerald-700" role="status">{message}</p>}
              {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Pratinjau</h2>
                <span className="text-xs text-gray-500">Sandbox iframe</span>
              </div>
              <div className="h-96">
                {previewDoc ? (
                  <PreviewFrame documentString={previewDoc} />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-500">
                    Tekan tombol Pratinjau untuk melihat hasil karya kamu.
                  </div>
                )}
              </div>
            </div>

            {submission?.evaluation && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                  Hasil Penilaian
                  <StatusBadge status={submission.evaluation.status} />
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Skor akhir: <span className="font-semibold">{submission.evaluation.overallScore} / 100</span>
                </p>
                {submission.evaluation.overallNote && (
                  <p className="mt-2 text-sm text-gray-700 bg-amber-50 border border-amber-200 rounded-md p-3">
                    {submission.evaluation.overallNote}
                  </p>
                )}
                <div className="mt-4">
                  <RubricTable scores={submission.evaluation.rubricScores} />
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900">Status Pengumpulan</h2>
              <dl className="mt-4 space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <dt>Status saat ini</dt>
                  <dd className="font-medium">
                    {submission ? <StatusBadge status={submission.status} /> : 'Belum ada'}
                  </dd>
                </div>
                {submission?.submittedAt && (
                  <div className="flex justify-between">
                    <dt>Tanggal kirim</dt>
                    <dd>{new Date(submission.submittedAt).toLocaleString('id-ID')}</dd>
                  </div>
                )}
                {submission?.returnedAt && (
                  <div className="flex justify-between">
                    <dt>Dikembalikan pada</dt>
                    <dd>{new Date(submission.returnedAt).toLocaleString('id-ID')}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt>Mode kerja</dt>
                  <dd className="font-medium">
                    {mode === 'editor' ? 'Editor langsung' : 'Unggah ZIP statis'}
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
