"use client";

import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Breadcrumb from '@/components/ui/Breadcrumb'
import {
  ArrowLeft,
  Code,
  Play,
  CheckCircle,
  Clock,
  Trophy,
  BookOpen,
  Target,
  Star,
  Award,
  ChevronRight
} from 'lucide-react'

interface Lab {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  language: string
  points: number
  duration: number
  exercises: Exercise[]
  completedExercises: number
  isCompleted: boolean
  progress: number
  instructions?: string
  learningObjectives?: string[]
}

interface Exercise {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  points: number
  timeLimit: number
  memoryLimit: number
  isCompleted: boolean
  score?: number
  attempts: number
  tags: string[]
}

export default function LabDetailPage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const labId = params.id as string

  const [lab, setLab] = useState<Lab | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchLabDetail = useCallback(async () => {
    try {
      // Mock data for now - in real implementation, this would be API calls
      const mockLab: Lab = {
        id: labId,
        title: labId === '1' ? 'Basic Algorithms' :
               labId === '2' ? 'Data Structures' :
               'Advanced Algorithms',
        description: labId === '1' ? 'Learn fundamental programming concepts and basic algorithms.' :
                    labId === '2' ? 'Master arrays, linked lists, stacks, and queues.' :
                    'Explore sorting, searching, and graph algorithms.',
        difficulty: labId === '1' ? 'beginner' :
                   labId === '2' ? 'intermediate' :
                   'advanced' as 'beginner' | 'intermediate' | 'advanced',
        language: labId === '1' ? 'JavaScript' :
                 labId === '2' ? 'Python' :
                 'Java',
        points: labId === '1' ? 100 :
                labId === '2' ? 150 :
                200,
        duration: labId === '1' ? 60 :
                 labId === '2' ? 90 :
                 120,
        completedExercises: labId === '1' ? 3 :
                           labId === '2' ? 8 :
                           2,
        isCompleted: labId === '2',
        progress: labId === '1' ? 60 :
                 labId === '2' ? 100 :
                 20,
        instructions: `Complete all exercises in this lab to earn ${labId === '1' ? 100 : labId === '2' ? 150 : 200} points. Each exercise has a time and memory limit.`,
        learningObjectives: labId === '1' ? [
          'Understand basic programming concepts',
          'Implement simple algorithms',
          'Debug and test code effectively'
        ] : labId === '2' ? [
          'Master fundamental data structures',
          'Implement data structure operations',
          'Analyze time and space complexity'
        ] : [
          'Apply advanced algorithmic techniques',
          'Solve complex computational problems',
          'Optimize algorithm performance'
        ],
        exercises: labId === '1' ? [
          {
            id: '1',
            title: 'Sum Array Elements',
            description: 'Write a function that returns the sum of all elements in an array.',
            difficulty: 'beginner',
            points: 10,
            timeLimit: 2,
            memoryLimit: 256,
            isCompleted: true,
            score: 95,
            attempts: 2,
            tags: ['array', 'sum', 'beginner']
          },
          {
            id: '2',
            title: 'Find Maximum Value',
            description: 'Implement a function to find the maximum value in an array.',
            difficulty: 'beginner',
            points: 15,
            timeLimit: 2,
            memoryLimit: 256,
            isCompleted: true,
            score: 88,
            attempts: 1,
            tags: ['array', 'maximum', 'beginner']
          },
          {
            id: '3',
            title: 'Count Even Numbers',
            description: 'Create a function that counts how many even numbers are in an array.',
            difficulty: 'beginner',
            points: 12,
            timeLimit: 2,
            memoryLimit: 256,
            isCompleted: true,
            score: 92,
            attempts: 1,
            tags: ['array', 'counting', 'beginner']
          },
          {
            id: '4',
            title: 'Reverse String',
            description: 'Write a function that reverses a given string.',
            difficulty: 'beginner',
            points: 13,
            timeLimit: 2,
            memoryLimit: 256,
            isCompleted: false,
            attempts: 0,
            tags: ['string', 'reverse', 'beginner']
          },
          {
            id: '5',
            title: 'Palindrome Check',
            description: 'Implement a function to check if a string is a palindrome.',
            difficulty: 'beginner',
            points: 15,
            timeLimit: 2,
            memoryLimit: 256,
            isCompleted: false,
            attempts: 0,
            tags: ['string', 'palindrome', 'beginner']
          }
        ] : labId === '2' ? [
          {
            id: '6',
            title: 'Stack Implementation',
            description: 'Implement a stack data structure with push, pop, and peek operations.',
            difficulty: 'intermediate',
            points: 25,
            timeLimit: 3,
            memoryLimit: 256,
            isCompleted: true,
            score: 90,
            attempts: 3,
            tags: ['stack', 'data-structure', 'intermediate']
          },
          {
            id: '7',
            title: 'Queue Implementation',
            description: 'Create a queue data structure with enqueue and dequeue operations.',
            difficulty: 'intermediate',
            points: 25,
            timeLimit: 3,
            memoryLimit: 256,
            isCompleted: true,
            score: 85,
            attempts: 2,
            tags: ['queue', 'data-structure', 'intermediate']
          },
          {
            id: '8',
            title: 'Linked List Operations',
            description: 'Implement basic operations for a singly linked list.',
            difficulty: 'intermediate',
            points: 30,
            timeLimit: 3,
            memoryLimit: 256,
            isCompleted: true,
            score: 88,
            attempts: 4,
            tags: ['linked-list', 'data-structure', 'intermediate']
          },
          {
            id: '9',
            title: 'Binary Tree Traversal',
            description: 'Implement inorder, preorder, and postorder traversal for binary trees.',
            difficulty: 'intermediate',
            points: 35,
            timeLimit: 4,
            memoryLimit: 256,
            isCompleted: true,
            score: 82,
            attempts: 5,
            tags: ['tree', 'traversal', 'intermediate']
          },
          {
            id: '10',
            title: 'Hash Table Implementation',
            description: 'Create a simple hash table with basic operations.',
            difficulty: 'intermediate',
            points: 35,
            timeLimit: 4,
            memoryLimit: 256,
            isCompleted: true,
            score: 87,
            attempts: 3,
            tags: ['hash-table', 'data-structure', 'intermediate']
          }
        ] : [
          {
            id: '11',
            title: 'Quick Sort',
            description: 'Implement the quick sort algorithm.',
            difficulty: 'advanced',
            points: 40,
            timeLimit: 5,
            memoryLimit: 512,
            isCompleted: false,
            attempts: 0,
            tags: ['sorting', 'algorithm', 'advanced']
          },
          {
            id: '12',
            title: 'Merge Sort',
            description: 'Implement the merge sort algorithm.',
            difficulty: 'advanced',
            points: 40,
            timeLimit: 5,
            memoryLimit: 512,
            isCompleted: false,
            attempts: 0,
            tags: ['sorting', 'algorithm', 'advanced']
          },
          {
            id: '13',
            title: 'Binary Search Tree',
            description: 'Implement a binary search tree with insert, delete, and search operations.',
            difficulty: 'advanced',
            points: 45,
            timeLimit: 5,
            memoryLimit: 512,
            isCompleted: false,
            attempts: 0,
            tags: ['tree', 'search', 'advanced']
          },
          {
            id: '14',
            title: 'Graph BFS/DFS',
            description: 'Implement breadth-first and depth-first search algorithms for graphs.',
            difficulty: 'advanced',
            points: 45,
            timeLimit: 6,
            memoryLimit: 512,
            isCompleted: false,
            attempts: 0,
            tags: ['graph', 'search', 'advanced']
          },
          {
            id: '15',
            title: 'Dijkstra Algorithm',
            description: 'Implement Dijkstra\'s algorithm for finding shortest paths.',
            difficulty: 'advanced',
            points: 50,
            timeLimit: 6,
            memoryLimit: 512,
            isCompleted: false,
            attempts: 0,
            tags: ['graph', 'shortest-path', 'advanced']
          }
        ]
      }

      setLab(mockLab)
    } catch (error) {
      console.error('Error fetching lab detail:', error)
    } finally {
      setIsLoading(false)
    }
  }, [labId])

  useEffect(() => {
    fetchLabDetail()
  }, [fetchLabDetail])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return <Star className="w-4 h-4" />
      case 'intermediate': return <Target className="w-4 h-4" />
      case 'advanced': return <Award className="w-4 h-4" />
      default: return <Star className="w-4 h-4" />
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!lab) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Lab not found</h2>
          <p className="text-gray-600 mb-4">The requested lab could not be found.</p>
          <Link
            href="/student/coding-lab"
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Coding Lab
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              {/* Breadcrumb */}
              <div className="mb-4">
                <Breadcrumb items={[{ label: 'Coding Lab', href: '/student/coding-lab' }, { label: lab?.title || 'Lab' }]} />
              </div>
              <Link
                href="/student/coding-lab"
                className="text-gray-600 hover:text-gray-900 flex items-center"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Labs
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{lab.title}</h1>
                <p className="text-gray-600 mt-1">{lab.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getDifficultyColor(lab.difficulty)}`}>
                    {getDifficultyIcon(lab.difficulty)}
                    <span className="ml-2 capitalize">{lab.difficulty}</span>
                  </span>
                  <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                    <Code className="w-4 h-4 mr-2" />
                    {lab.language}
                  </span>
                </div>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Trophy className="w-4 h-4 mr-1" />
                    {lab.points} points
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {lab.duration} min
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Lab Overview */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Lab Overview</h2>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">
                      {lab.completedExercises}/{lab.exercises.length} exercises completed
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        lab.progress === 100 ? 'bg-green-600' :
                        lab.progress >= 60 ? 'bg-blue-600' :
                        lab.progress >= 30 ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${lab.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Instructions */}
                {lab.instructions && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Instructions</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800">{lab.instructions}</p>
                    </div>
                  </div>
                )}

                {/* Learning Objectives */}
                {lab.learningObjectives && lab.learningObjectives.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Learning Objectives</h3>
                    <ul className="space-y-2">
                      {lab.learningObjectives.map((objective, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Exercises */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Exercises</h2>
                <p className="text-gray-600 mt-1">Complete all exercises to finish this lab</p>
              </div>

              <div className="divide-y divide-gray-200" data-testid="exercises-list">
                {lab.exercises.map((exercise, index) => (
                  <div key={exercise.id} className="p-6 hover:bg-gray-50 transition-colors" data-testid="exercise-item">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
                            {index + 1}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">{exercise.title}</h3>
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(exercise.difficulty)}`}>
                            {exercise.difficulty}
                          </span>
                          {exercise.isCompleted && (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600 mb-3 ml-11">{exercise.description}</p>

                        <div className="flex items-center space-x-4 text-sm text-gray-500 ml-11">
                          <span className="flex items-center">
                            <Trophy className="w-4 h-4 mr-1" />
                            {exercise.points} points
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {exercise.timeLimit}s limit
                          </span>
                          {exercise.attempts > 0 && (
                            <span className="flex items-center">
                              <Target className="w-4 h-4 mr-1" />
                              {exercise.attempts} attempts
                            </span>
                          )}
                        </div>

                        {exercise.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3 ml-11">
                            {exercise.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {exercise.isCompleted && exercise.score && (
                          <div className="mt-3 ml-11">
                            <span className="text-sm font-medium text-green-600">
                              Score: {exercise.score}/100
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="ml-6">
                        <Link
                          href={`/student/coding-lab/lab/${labId}/exercise/${exercise.id}`}
                          className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                            exercise.isCompleted
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {exercise.isCompleted ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Review
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Start
                            </>
                          )}
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Lab Stats */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Lab Statistics</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Exercises</span>
                  <span className="font-semibold">{lab.exercises.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-semibold text-green-600">{lab.completedExercises}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Remaining</span>
                  <span className="font-semibold text-orange-600">
                    {lab.exercises.length - lab.completedExercises}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Points</span>
                  <span className="font-semibold text-yellow-600">{lab.points}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-semibold">{lab.progress}%</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6 space-y-3">
                <Link
                  href={`/student/coding-lab/lab/${labId}/exercise/${lab.exercises.find(e => !e.isCompleted)?.id || lab.exercises[0].id}`}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Continue Lab
                </Link>
                <Link
                  href="/student/coding-lab"
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  All Labs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
