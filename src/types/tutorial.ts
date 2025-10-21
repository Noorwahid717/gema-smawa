export type AssignmentStatus = 'active' | 'closed' | 'upcoming'

export interface TutorialAssignmentResponse {
  id: string
  title: string
  description: string
  subject: string
  dueDate: string
  status: AssignmentStatus
  maxSubmissions: number
  submissionCount?: number
  instructions?: string[]
  createdAt?: string
}

export interface TutorialSubmissionResponse {
  id: string
  assignmentId: string
  studentId: string
  fileName: string
  submittedAt: string
  status?: string
  isLate?: boolean
  grade?: number | null
  feedback?: string | null
  filePath?: string
  fileUrl?: string
  originalFileName?: string
  studentName?: string
  studentEmail?: string
  assignmentTitle?: string
  assignmentSubject?: string
  reviewedAt?: string | null
}

export interface TutorialAssignmentWithSubmissions extends TutorialAssignmentResponse {
  submissions: TutorialSubmissionResponse[]
}

export interface TutorialProjectChecklistItem {
  id: string
  title: string
  slug: string
  goal: string
  skills: string[]
  basicTargets: string[]
  advancedTargets: string[]
  reflectionPrompt?: string | null
  order: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}
