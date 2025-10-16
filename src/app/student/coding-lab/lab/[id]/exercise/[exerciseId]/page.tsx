"use client";

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
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
  ChevronRight,
  TestTube,
  AlertCircle,
  Check,
  X
} from 'lucide-react'

interface Exercise {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  points: number
  timeLimit: number
  memoryLimit: number
  instructions: string
  starterCode: string
  solutionCode?: string
  testCases: TestCase[]
  hints: string[]
  tags: string[]
  isCompleted: boolean
  score?: number
  attempts: number
  lastSubmission?: string
}

interface TestCase {
  id: string
  input: string
  expectedOutput: string
  isHidden: boolean
  explanation?: string
}

interface SubmissionResult {
  success: boolean
  score: number
  message: string
  testResults: TestResult[]
  executionTime: number
  memoryUsed: number
}

interface TestResult {
  id: string
  passed: boolean
  input: string
  expectedOutput: string
  actualOutput?: string
  error?: string
}

export default function ExerciseDetailPage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const labId = params.id as string
  const exerciseId = params.exerciseId as string

  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [code, setCode] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastResult, setLastResult] = useState<SubmissionResult | null>(null)
  const [showHints, setShowHints] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchExerciseDetail()
  }, [labId, exerciseId])

  const fetchExerciseDetail = async () => {
    try {
      // Mock data for now - in real implementation, this would be API calls
      const mockExercise: Exercise = {
        id: exerciseId,
        title: exerciseId === '1' ? 'Sum Array Elements' :
               exerciseId === '6' ? 'Stack Implementation' :
               'Exercise Title',
        description: exerciseId === '1' ? 'Write a function that returns the sum of all elements in an array.' :
                    exerciseId === '6' ? 'Implement a stack data structure with push, pop, and peek operations.' :
                    'Exercise description',
        difficulty: exerciseId === '1' ? 'beginner' :
                   exerciseId === '6' ? 'intermediate' :
                   'advanced' as 'beginner' | 'intermediate' | 'advanced',
        points: exerciseId === '1' ? 10 :
                exerciseId === '6' ? 25 :
                15,
        timeLimit: 2,
        memoryLimit: 256,
        instructions: exerciseId === '1' ?
          'Implement a function `sumArray(arr)` that takes an array of numbers and returns their sum. The function should handle empty arrays by returning 0.' :
          exerciseId === '6' ?
          'Create a Stack class with the following methods:\n- push(item): Add an item to the top of the stack\n- pop(): Remove and return the top item\n- peek(): Return the top item without removing it\n- isEmpty(): Check if the stack is empty' :
          'Implement the required functionality according to the specifications.',
        starterCode: exerciseId === '1' ?
          `function sumArray(arr) {
  // Your code here
  // Return the sum of all elements in the array
}` :
          exerciseId === '6' ?
          `class Stack {
  constructor() {
    // Initialize your stack
  }

  push(item) {
    // Add item to the top of the stack
  }

  pop() {
    // Remove and return the top item
    // Return undefined if stack is empty
  }

  peek() {
    // Return the top item without removing it
    // Return undefined if stack is empty
  }

  isEmpty() {
    // Return true if stack is empty, false otherwise
  }
}` :
          '// Your code here',
        testCases: exerciseId === '1' ? [
          {
            id: '1',
            input: '[1, 2, 3, 4, 5]',
            expectedOutput: '15',
            isHidden: false,
            explanation: 'Sum of [1, 2, 3, 4, 5] should be 15'
          },
          {
            id: '2',
            input: '[]',
            expectedOutput: '0',
            isHidden: false,
            explanation: 'Empty array should return 0'
          },
          {
            id: '3',
            input: '[-1, 1, -2, 2]',
            expectedOutput: '0',
            isHidden: true,
            explanation: 'Sum of negative and positive numbers'
          }
        ] : exerciseId === '6' ? [
          {
            id: '1',
            input: 'push(1), push(2), peek()',
            expectedOutput: '2',
            isHidden: false,
            explanation: 'Peek should return the last pushed item'
          },
          {
            id: '2',
            input: 'push(1), pop()',
            expectedOutput: '1',
            isHidden: false,
            explanation: 'Pop should return and remove the top item'
          },
          {
            id: '3',
            input: 'isEmpty()',
            expectedOutput: 'true',
            isHidden: false,
            explanation: 'New stack should be empty'
          }
        ] : [
          {
            id: '1',
            input: 'test input',
            expectedOutput: 'expected output',
            isHidden: false
          }
        ],
        hints: exerciseId === '1' ? [
          'Use a loop to iterate through each element in the array',
          'Initialize a variable to store the sum (start with 0)',
          'Add each array element to the sum variable',
          'Return the final sum'
        ] : exerciseId === '6' ? [
          'Use an array to store stack elements',
          'For push: add element to the end of the array',
          'For pop: remove and return the last element',
          'For peek: return the last element without removing it',
          'For isEmpty: check if array length is 0'
        ] : [
          'Think about the problem step by step',
          'Consider edge cases'
        ],
        tags: exerciseId === '1' ? ['array', 'sum', 'beginner'] :
              exerciseId === '6' ? ['stack', 'data-structure', 'intermediate'] :
              ['exercise'],
        isCompleted: false,
        attempts: 0
      }

      setExercise(mockExercise)
      setCode(mockExercise.starterCode)
    } catch (error) {
      console.error('Error fetching exercise detail:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const runTests = async () => {
    if (!exercise) return

    setIsRunning(true)
    try {
      // Mock test execution - in real implementation, this would send code to server
      await new Promise(resolve => setTimeout(resolve, 2000))

      const mockResult: SubmissionResult = {
        success: Math.random() > 0.5,
        score: Math.floor(Math.random() * 40) + 60,
        message: 'Tests executed successfully',
        testResults: exercise.testCases.map(testCase => ({
          id: testCase.id,
          passed: Math.random() > 0.3,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: Math.random() > 0.3 ? testCase.expectedOutput : 'wrong output'
        })),
        executionTime: Math.floor(Math.random() * 100) + 50,
        memoryUsed: Math.floor(Math.random() * 50) + 10
      }

      setLastResult(mockResult)
    } catch (error) {
      console.error('Error running tests:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const submitSolution = async () => {
    if (!exercise) return

    setIsSubmitting(true)
    try {
      // Mock submission - in real implementation, this would send code to server
      await new Promise(resolve => setTimeout(resolve, 3000))

      const mockResult: SubmissionResult = {
        success: Math.random() > 0.2,
        score: Math.floor(Math.random() * 40) + 60,
        message: '',
        testResults: exercise.testCases.map(testCase => ({
          id: testCase.id,
          passed: Math.random() > 0.2,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: Math.random() > 0.2 ? testCase.expectedOutput : 'wrong output'
        })),
        executionTime: Math.floor(Math.random() * 100) + 50,
        memoryUsed: Math.floor(Math.random() * 50) + 10
      }

      mockResult.message = mockResult.success ? 'Solution submitted successfully!' : 'Some tests failed. Try again.'

      setLastResult(mockResult)

      if (mockResult.success) {
        // Update exercise status
        setExercise(prev => prev ? {
          ...prev,
          isCompleted: true,
          score: mockResult.score,
          attempts: prev.attempts + 1,
          lastSubmission: new Date().toISOString()
        } : null)
      }
    } catch (error) {
      console.error('Error submitting solution:', error)
    } finally {
      setIsSubmitting(false)
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

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Exercise not found</h2>
          <p className="text-gray-600 mb-4">The requested exercise could not be found.</p>
          <Link
            href={`/student/coding-lab/lab/${labId}`}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Lab
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
              <Link
                href={`/student/coding-lab/lab/${labId}`}
                className="text-gray-600 hover:text-gray-900 flex items-center"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Lab
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{exercise.title}</h1>
                <p className="text-gray-600 mt-1">{exercise.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getDifficultyColor(exercise.difficulty)}`}>
                    <Star className="w-4 h-4 mr-2" />
                    {exercise.difficulty}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                    <Trophy className="w-4 h-4 mr-2" />
                    {exercise.points} points
                  </span>
                </div>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {exercise.timeLimit}s limit
                  </span>
                  <span className="flex items-center">
                    <Target className="w-4 h-4 mr-1" />
                    {exercise.attempts} attempts
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
            {/* Instructions */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <pre className="text-blue-800 whitespace-pre-wrap font-mono text-sm">
                    {exercise.instructions}
                  </pre>
                </div>
              </div>
            </div>

            {/* Code Editor */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Code Editor</h2>
                <p className="text-gray-600 mt-1">Write your solution below</p>
              </div>
              <div className="p-6">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-96 font-mono text-sm border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Write your code here..."
                  data-testid="code-editor"
                />
              </div>
            </div>

            {/* Test Results */}
            {lastResult && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Test Results</h2>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                        lastResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {lastResult.success ? (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        ) : (
                          <AlertCircle className="w-4 h-4 mr-2" />
                        )}
                        {lastResult.success ? 'Passed' : 'Failed'}
                      </span>
                      <span className="text-sm text-gray-600">
                        Score: {lastResult.score}/100
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {lastResult.testResults.map((test) => (
                      <div key={test.id} className={`border rounded-lg p-4 ${
                        test.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {test.passed ? (
                              <Check className="w-5 h-5 text-green-600" />
                            ) : (
                              <X className="w-5 h-5 text-red-600" />
                            )}
                            <span className="font-medium text-gray-900">Test Case {test.id}</span>
                          </div>
                          <span className={`text-sm font-medium ${
                            test.passed ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {test.passed ? 'PASSED' : 'FAILED'}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Input:</span>
                            <pre className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono">{test.input}</pre>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Expected:</span>
                            <pre className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono">{test.expectedOutput}</pre>
                          </div>
                          {!test.passed && test.actualOutput && (
                            <div className="md:col-span-2">
                              <span className="font-medium text-gray-700">Your Output:</span>
                              <pre className="mt-1 p-2 bg-red-100 rounded text-xs font-mono text-red-800">{test.actualOutput}</pre>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Execution time: {lastResult.executionTime}ms</span>
                      <span>Memory used: {lastResult.memoryUsed}MB</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
              </div>
              <div className="p-6 space-y-3">
                <button
                  onClick={runTests}
                  disabled={isRunning}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isRunning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <TestTube className="w-4 h-4 mr-2" />
                      Run Tests
                    </>
                  )}
                </button>
                <button
                  onClick={submitSolution}
                  disabled={isSubmitting}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  data-testid="submit-solution"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Submit Solution
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Test Cases */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Test Cases</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {exercise.testCases.filter(testCase => !testCase.isHidden).map((testCase) => (
                    <div key={testCase.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">Test Case {testCase.id}</span>
                        <span className="text-xs text-gray-500">Sample</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2 text-xs">
                        <div>
                          <span className="font-medium text-gray-700">Input:</span>
                          <pre className="mt-1 p-2 bg-gray-100 rounded font-mono">{testCase.input}</pre>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Expected:</span>
                          <pre className="mt-1 p-2 bg-gray-100 rounded font-mono">{testCase.expectedOutput}</pre>
                        </div>
                      </div>
                      {testCase.explanation && (
                        <p className="text-xs text-gray-600 mt-2 italic">{testCase.explanation}</p>
                      )}
                    </div>
                  ))}
                  {exercise.testCases.some(tc => tc.isHidden) && (
                    <div className="text-center text-sm text-gray-500 py-2">
                      + {exercise.testCases.filter(tc => tc.isHidden).length} hidden test case(s)
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Hints */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Hints</h3>
                  <button
                    onClick={() => setShowHints(!showHints)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    {showHints ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              {showHints && (
                <div className="p-6">
                  <ol className="space-y-2">
                    {exercise.hints.map((hint, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 text-xs font-medium rounded-full mr-3 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-sm text-gray-700">{hint}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {/* Tags */}
            {exercise.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {exercise.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}