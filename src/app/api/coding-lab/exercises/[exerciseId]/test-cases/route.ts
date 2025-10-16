import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    exerciseId: string
  }>
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.userType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { exerciseId } = await params

    const testCases = await prisma.codingTestCase.findMany({
      where: { exerciseId },
      orderBy: { createdAt: 'asc' }
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = testCases.map((testCase: any) => ({
      id: testCase.id,
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      isHidden: testCase.isHidden,
      explanation: testCase.explanation,
      createdAt: testCase.createdAt
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching test cases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch test cases' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.userType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { exerciseId } = await params
    const body = await request.json()
    const { input, expectedOutput, isHidden = false, explanation } = body

    if (!input || !expectedOutput) {
      return NextResponse.json(
        { error: 'Input and expected output are required' },
        { status: 400 }
      )
    }

    // Verify exercise exists
    const exercise = await prisma.codingExercise.findUnique({
      where: { id: exerciseId }
    })

    if (!exercise) {
      return NextResponse.json(
        { error: 'Coding exercise not found' },
        { status: 404 }
      )
    }

    const testCase = await prisma.codingTestCase.create({
      data: {
        exerciseId,
        input,
        expectedOutput,
        isHidden,
        explanation
      }
    })

    const data = {
      id: testCase.id,
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      isHidden: testCase.isHidden,
      explanation: testCase.explanation,
      createdAt: testCase.createdAt
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error creating test case:', error)
    return NextResponse.json(
      { error: 'Failed to create test case' },
      { status: 500 }
    )
  }
}