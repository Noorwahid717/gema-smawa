"use client";

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import StudentLayout from '@/components/student/StudentLayout'
import {
  Code,
  Play,
  CheckCircle,
  Clock,
  Trophy,
  BookOpen,
  Target,
  TrendingUp,
  XCircle
} from 'lucide-react'
import Link from 'next/link'

interface Lab {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  language: string
  points: number
  duration: number
  exercises: number
  completedExercises: number
  isCompleted: boolean
  progress: number
}

interface StudentProgress {
  totalLabs: number
  completedLabs: number
  totalExercises: number
  completedExercises: number
  totalPoints: number
  earnedPoints: number
  currentStreak: number
  averageScore: number
}

interface RecentSubmission {
  id: string
  labTitle: string
  exerciseTitle: string
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected'
  score?: number
  feedback?: string
}

export default function StudentCodingLab() {
  const { status } = useSession()
  const [labs, setLabs] = useState<Lab[]>([])
  const [progress, setProgress] = useState<StudentProgress | null>(null)
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCodingLabData()
  }, [])

  const fetchCodingLabData = async () => {
    try {
      // Mock data for now - in real implementation, this would be API calls
      const mockLabs: Lab[] = [
        {
          id: '1',
          title: 'Basic Algorithms',
          description: 'Learn fundamental programming concepts and basic algorithms.',
          difficulty: 'beginner',
          language: 'JavaScript',
          points: 100,
          duration: 60,
          exercises: 5,
          completedExercises: 3,
          isCompleted: false,
          progress: 60
        },
        {
          id: '2',
          title: 'Data Structures',
          description: 'Master arrays, linked lists, stacks, and queues.',
          difficulty: 'intermediate',
          language: 'Python',
          points: 150,
          duration: 90,
          exercises: 8,
          completedExercises: 8,
          isCompleted: true,
          progress: 100
        },
        {
          id: '3',
          title: 'Advanced Algorithms',
          description: 'Explore sorting, searching, and graph algorithms.',
          difficulty: 'advanced',
          language: 'Java',
          points: 200,
          duration: 120,
          exercises: 10,
          completedExercises: 2,
          isCompleted: false,
          progress: 20
        }
      ]

      const mockProgress: StudentProgress = {
        totalLabs: 3,
        completedLabs: 1,
        totalExercises: 23,
        completedExercises: 13,
        totalPoints: 450,
        earnedPoints: 285,
        currentStreak: 5,
        averageScore: 87
      }

      const mockSubmissions: RecentSubmission[] = [
        {
          id: '1',
          labTitle: 'Basic Algorithms',
          exerciseTitle: 'Sum Array Elements',
          submittedAt: '2024-01-15T10:30:00Z',
          status: 'approved',
          score: 95,
          feedback: 'Excellent solution! Code is clean and efficient.'
        },
        {
          id: '2',
          labTitle: 'Data Structures',
          exerciseTitle: 'Stack Implementation',
          submittedAt: '2024-01-14T14:20:00Z',
          status: 'pending'
        },
        {
          id: '3',
          labTitle: 'Basic Algorithms',
          exerciseTitle: 'Find Maximum',
          submittedAt: '2024-01-13T09:15:00Z',
          status: 'approved',
          score: 88,
          feedback: 'Good work! Consider edge cases.'
        }
      ]

      setLabs(mockLabs)
      setProgress(mockProgress)
      setRecentSubmissions(mockSubmissions)
    } catch (error) {
      console.error('Error fetching coding lab data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <StudentLayout loading={true}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Coding Lab</h1>
            <p className="text-gray-600 mt-1">Practice coding with interactive exercises</p>
          </div>

          {/* Progress Overview */}
          {progress && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center">
                <Target className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Labs Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {progress.completedLabs}/{progress.totalLabs}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center">
                <Code className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Exercises Done</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {progress.completedExercises}/{progress.totalExercises}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center">
                <Trophy className="w-8 h-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Points Earned</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {progress.earnedPoints}/{progress.totalPoints}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Streak</p>
                  <p className="text-2xl font-bold text-gray-900">{progress.currentStreak} days</p>
                </div>
              </div>
            </div>
          </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Labs */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Available Labs</h2>
                <p className="text-gray-600 mt-1">Choose a lab to start practicing</p>
              </div>

              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading labs...</p>
                </div>
              ) : labs.length === 0 ? (
                <div className="p-8 text-center">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No labs available</h3>
                  <p className="text-gray-600">Check back later for new coding labs.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200" data-testid="labs-section">
                  {labs.map((lab) => (
                    <div key={lab.id} className="p-6 hover:bg-gray-50 transition-colors" data-testid="lab-card">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{lab.title}</h3>
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(lab.difficulty)}`}>
                              {lab.difficulty}
                            </span>
                            {lab.isCompleted && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Completed
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-3">{lab.description}</p>

                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                            <span className="flex items-center">
                              <Code className="w-4 h-4 mr-1" />
                              {lab.language}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {lab.duration} min
                            </span>
                            <span className="flex items-center">
                              <Trophy className="w-4 h-4 mr-1" />
                              {lab.points} points
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex-1 mr-4">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-600">Progress</span>
                                <span className="font-medium">
                                  {lab.completedExercises}/{lab.exercises} exercises
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    lab.progress === 100 ? 'bg-green-600' :
                                    lab.progress >= 60 ? 'bg-blue-600' :
                                    lab.progress >= 30 ? 'bg-yellow-600' : 'bg-red-600'
                                  }`}
                                  style={{ width: `${lab.progress}%` }}
                                ></div>
                              </div>
                            </div>
                            <Link
                              href={`/student/coding-lab/lab/${lab.id}`}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center whitespace-nowrap"
                            >
                              {lab.isCompleted ? (
                                <>
                                  <Trophy className="w-4 h-4 mr-2" />
                                  Review
                                </>
                              ) : lab.progress > 0 ? (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  Continue
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  Start
                                </>
                              )}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* My Progress */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">My Progress</h3>
              </div>
              <div className="p-6" data-testid="progress-section">
                {progress && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Overall Progress</span>
                        <span className="font-medium">
                          {Math.round((progress.completedExercises / progress.totalExercises) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(progress.completedExercises / progress.totalExercises) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{progress.averageScore}</div>
                        <div className="text-xs text-gray-500">Avg Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{progress.currentStreak}</div>
                        <div className="text-xs text-gray-500">Day Streak</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Submissions */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Submissions</h3>
              </div>
              <div className="divide-y divide-gray-200" data-testid="submissions-section">
                {recentSubmissions.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <Code className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No submissions yet</p>
                  </div>
                ) : (
                  recentSubmissions.map((submission) => (
                    <div key={submission.id} className="p-4" data-testid="submission-item">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{submission.exerciseTitle}</h4>
                          <p className="text-xs text-gray-500">{submission.labTitle}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(submission.submittedAt).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {submission.score && (
                            <span className="text-sm font-medium text-gray-900">{submission.score}/100</span>
                          )}
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(submission.status)}`}>
                            {getStatusIcon(submission.status)}
                            <span className="ml-1 capitalize">{submission.status}</span>
                          </span>
                        </div>
                      </div>
                      {submission.feedback && (
                        <p className="text-xs text-gray-600 mt-2 italic">&ldquo;{submission.feedback}&rdquo;</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
