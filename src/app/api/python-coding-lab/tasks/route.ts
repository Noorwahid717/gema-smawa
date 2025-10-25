import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/python-coding-lab/tasks
 * Get all Python coding tasks (optionally filtered)
 * Uses studentId query parameter for authentication (consistent with other student APIs)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    console.log('\n=========================================');
    console.log('🐍 PYTHON CODING LAB - GET TASKS');
    console.log('=========================================');
    console.log('📍 URL:', request.url);
    console.log('👤 Student ID:', studentId);
    
    if (!studentId) {
      console.error('❌ NO STUDENT ID PROVIDED');
      console.log('=========================================\n');
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    console.log('✅ Student ID provided - Fetching tasks...');

    const difficulty = searchParams.get('difficulty');
    const category = searchParams.get('category');

    const tasks = await prisma.pythonCodingTask.findMany({
      where: {
        isActive: true,
        ...(difficulty && { difficulty: difficulty as any }),
        ...(category && { category }),
      },
      include: {
        testCases: {
          where: { isHidden: false },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { submissions: true },
        },
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    // Get student's submissions for these tasks (using studentId from query param)
    const submissions = await prisma.pythonSubmission.findMany({
      where: {
        studentId,
        taskId: { in: tasks.map(t => t.id) },
      },
      orderBy: { submittedAt: 'desc' },
    });

    // Merge task data with submission status
    const tasksWithStatus = tasks.map(task => {
      const studentSubmissions = submissions.filter(s => s.taskId === task.id);
      const bestSubmission = studentSubmissions.reduce((best, current) => {
        if (!best || current.score > best.score) return current;
        return best;
      }, studentSubmissions[0]);

      return {
        ...task,
        studentStatus: {
          attempted: studentSubmissions.length > 0,
          attempts: studentSubmissions.length,
          bestScore: bestSubmission?.score || 0,
          completed: bestSubmission?.score === task.points,
          lastSubmittedAt: bestSubmission?.submittedAt || null,
        },
      };
    });

    console.log(`✅ Found ${tasks.length} tasks`);
    console.log('=========================================\n');

    return NextResponse.json({ tasks: tasksWithStatus });
  } catch (error) {
    console.error('Error fetching Python coding tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}
