'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { studentAuth } from '@/lib/student-auth'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  Upload,
  File,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  BookOpen,
  User,
  LogOut,
  GraduationCap
} from 'lucide-react'

interface Assignment {
  id: string
  title: string
  description: string
  subject: string
  dueDate: string
  status: string
  maxSubmissions: number
  instructions?: string[]
}

interface Submission {
  id: string
  fileName: string
  filePath: string
  submittedAt: string
  status?: string
  grade?: number
  feedback?: string
}

export default function StudentAssignmentDetail() {
  const router = useRouter()
  const params = useParams()
  const assignmentId = params.id as string

  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const studentSession = studentAuth.getSession()
    
    if (!studentSession) {
      router.push('/student/login?redirectTo=' + encodeURIComponent(`/student/assignments/${assignmentId}`))
      return
    }

    fetchAssignmentDetails()
  }, [router, assignmentId])

  const fetchAssignmentDetails = async () => {
    const studentSession = studentAuth.getSession()
    if (!studentSession) {
      router.push('/student/login')
      return
    }

    try {
      setLoading(true)
      
      // Fetch assignment details
      const assignmentResponse = await fetch(`/api/classroom/assignments/${assignmentId}`)
      if (assignmentResponse.ok) {
        const assignmentData = await assignmentResponse.json()
        setAssignment(assignmentData.data)
      }

      // Fetch student submissions for this assignment
      const submissionsResponse = await fetch(`/api/classroom/submissions?assignmentId=${assignmentId}&studentId=${studentSession.studentId}`)
      if (submissionsResponse.ok) {
        const submissionsData = await submissionsResponse.json()
        setSubmissions(submissionsData.data || [])
      }
    } catch (error) {
      console.error('Error fetching assignment details:', error)
      setError('Gagal memuat detail tugas')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File terlalu besar. Maksimal 10MB.')
        return
      }
      
      setSelectedFile(file)
      setError('')
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile || !assignment) return

    const studentSession = studentAuth.getSession()
    if (!studentSession) {
      router.push('/student/login')
      return
    }

    try {
      setUploading(true)
      setError('')
      setMessage('')

      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('assignmentId', assignment.id)
      formData.append('studentId', studentSession.studentId)

      const response = await fetch('/api/classroom/submissions', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (response.ok) {
        setMessage('File berhasil diupload!')
        setSelectedFile(null)
        
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement
        if (fileInput) fileInput.value = ''
        
        // Refresh submissions
        fetchAssignmentDetails()
      } else {
        setError(result.error || 'Gagal mengupload file')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError('Terjadi kesalahan saat mengupload file')
    } finally {
      setUploading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'graded': return 'text-green-600 bg-green-50'
      case 'submitted': return 'text-blue-600 bg-blue-50'
      case 'late': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const isOverdue = assignment && new Date(assignment.dueDate) < new Date()
  const hasSubmissions = submissions.length > 0

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const studentSession = studentAuth.getSession()
  
  if (!studentSession || !assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tugas Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-4">Tugas yang Anda cari tidak dapat ditemukan.</p>
          <button
            onClick={() => router.push('/student/dashboard-simple')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/student/dashboard')}
                className="mr-4 p-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg mr-4">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Upload Tugas</h1>
                <p className="text-sm text-gray-600">GEMA - SMA Wahidiyah Kediri</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{studentSession.fullName}</p>
                <p className="text-xs text-gray-600">
                  {studentSession.studentId} • {studentSession.class}
                </p>
              </div>
              <button
                onClick={() => {
                  studentAuth.clearSession()
                  router.push('/')
                }}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Assignment Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{assignment.title}</h2>
              <p className="text-gray-600 mb-4">{assignment.description}</p>
              
              <div className="flex items-center text-sm text-gray-500 space-x-6">
                <span className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  {assignment.subject}
                </span>
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Deadline: {formatDate(assignment.dueDate)}
                </span>
                <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  isOverdue ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'
                }`}>
                  {isOverdue ? (
                    <>
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Terlambat
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3 mr-1" />
                      Masih Waktu
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {assignment.instructions && assignment.instructions.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Instruksi:</h3>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                {assignment.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload File Tugas</h3>
          
          {message && (
            <div className="mb-4 p-4 bg-green-50 text-green-800 rounded-lg flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="mb-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-700 font-medium">
                  Pilih file untuk diupload
                </span>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.zip,.rar"
                />
              </label>
              <p className="text-gray-500 text-sm mt-1">
                Atau drag & drop file di sini
              </p>
            </div>
            <p className="text-xs text-gray-400">
              Maksimal 10MB. Format: PDF, DOC, DOCX, ZIP, RAR
            </p>
          </div>

          {selectedFile && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <File className="w-5 h-5 text-gray-500 mr-2" />
                  <div>
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleFileUpload}
                  disabled={uploading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Mengupload...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Submissions History */}
        {hasSubmissions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Submission</h3>
            
            <div className="space-y-4">
              {submissions.map((submission, index) => (
                <div key={submission.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <File className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{submission.fileName}</p>
                        <p className="text-sm text-gray-500">
                          Diupload: {formatDate(submission.submittedAt)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {submission.grade && (
                        <span className="text-sm font-medium text-green-600">
                          Nilai: {submission.grade}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                        {submission.status === 'graded' ? 'Dinilai' : 
                         submission.status === 'submitted' ? 'Terkirim' : 
                         submission.status}
                      </span>
                    </div>
                  </div>
                  
                  {submission.feedback && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-1">Feedback:</p>
                      <p className="text-sm text-gray-600">{submission.feedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}