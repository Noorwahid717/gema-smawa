import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/python-coding-lab/tasks/[slug]
 * Get a specific Python coding task by slug
 * Uses studentId query parameter for authentication
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    const { slug } = await params;

    const task = await prisma.pythonCodingTask.findUnique({
      where: { slug },
      include: {
        testCases: {
          where: { isHidden: false },
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

    // Get student's submissions for this task (using studentId from query param)
    const submissions = await prisma.pythonSubmission.findMany({
      where: {
        studentId,
        taskId: task.id,
      },
      orderBy: { submittedAt: 'desc' },
      take: 10, // Last 10 submissions
    });

    const bestSubmission = submissions.reduce((best, current) => {
      if (!best || current.score > best.score) return current;
      return best;
    }, submissions[0]);

    return NextResponse.json({
      task: {
        ...task,
        solutionCode: undefined, // Don't send solution code to students
      },
      submissions,
      bestScore: bestSubmission?.score || 0,
      totalAttempts: submissions.length,
    });
  } catch (error) {
    console.error('Error fetching Python coding task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}
