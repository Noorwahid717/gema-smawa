import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PythonSubmissionStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { 
  LANGUAGE_IDS, 
  runTestCases
} from '@/lib/judge0';

/**
 * POST /api/python-coding-lab/submit
 * Submit Python code for execution and evaluation
 * Uses studentId from request body for authentication
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, code, studentId } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    if (!taskId || !code) {
      return NextResponse.json(
        { error: 'Task ID and code are required' },
        { status: 400 }
      );
    }
    // Get task with test cases
    const task = await prisma.pythonCodingTask.findUnique({
      where: { id: taskId },
      include: {
        testCases: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    if (!task.isActive) {
      return NextResponse.json(
        { error: 'Task is not active' },
        { status: 403 }
      );
    }

    // Count previous attempts (using studentId from request body)
    const previousAttempts = await prisma.pythonSubmission.count({
      where: {
        studentId,
        taskId,
      },
    });

    // Create initial submission record
    const submission = await prisma.pythonSubmission.create({
      data: {
        taskId,
        studentId,
        code,
        language: 'python',
        status: 'PROCESSING',
        attempts: previousAttempts + 1,
      },
    });

    // Run test cases asynchronously
    try {
      const testCasesData = task.testCases.map(tc => ({
        name: tc.name,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
      }));

      const testResults = await runTestCases(
        code,
        LANGUAGE_IDS.python,
        testCasesData,
        task.timeLimit
      );

      // Calculate score
      const passedTests = testResults.filter(r => r.passed).length;
      const totalTests = testResults.length;
      const score = Math.round((passedTests / totalTests) * task.points);

      // Determine overall status
      let overallStatus: PythonSubmissionStatus = 'COMPLETED';
      const hasErrors = testResults.some(r => r.error && r.error.includes('error'));
      const hasTimeout = testResults.some(r => r.error && r.error.includes('time'));

      if (hasTimeout) {
        overallStatus = 'TIME_LIMIT_EXCEEDED';
      } else if (hasErrors) {
        overallStatus = 'RUNTIME_ERROR';
      }

      // Update submission with results
      const updatedSubmission = await prisma.pythonSubmission.update({
        where: { id: submission.id },
        data: {
          status: overallStatus,
          score,
          totalTests,
          passedTests,
          testResults: testResults as unknown as Prisma.InputJsonValue,
          completedAt: new Date(),
          stdout: testResults[0]?.actualOutput || null,
          stderr: testResults.find(r => r.error)?.error || null,
          time: testResults[0]?.time ? parseFloat(testResults[0].time) : null,
          memory: testResults[0]?.memory || null,
        },
      });

      return NextResponse.json({
        success: true,
        submission: updatedSubmission,
        testResults,
        summary: {
          passedTests,
          totalTests,
          score,
          percentage: Math.round((passedTests / totalTests) * 100),
        },
      });
    } catch (error) {
      // Update submission with error
      await prisma.pythonSubmission.update({
        where: { id: submission.id },
        data: {
          status: 'FAILED',
          stderr: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date(),
        },
      });

      throw error;
    }
  } catch (error) {
    console.error('Error submitting Python code:', error);
    return NextResponse.json(
      { 
        error: 'Failed to submit code',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
