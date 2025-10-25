import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/python-coding-lab/submissions
 * Get student's submission history
 * Uses studentId query parameter for authentication
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const taskId = searchParams.get('taskId');

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    const submissions = await prisma.pythonSubmission.findMany({
      where: {
        studentId,
        ...(taskId && { taskId }),
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            slug: true,
            difficulty: true,
            points: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
