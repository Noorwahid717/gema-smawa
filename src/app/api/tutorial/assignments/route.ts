import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const assignments = await prisma.assignment.findMany({
      include: {
        _count: {
          select: { submissions: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform data untuk frontend
    const transformedAssignments = assignments.map(assignment => ({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      subject: assignment.subject,
      dueDate: assignment.dueDate.toISOString(),
      submissionCount: assignment._count.submissions,
      maxSubmissions: assignment.maxSubmissions,
      status: assignment.status,
      createdAt: assignment.createdAt.toISOString(),
      instructions: assignment.instructions ? JSON.parse(assignment.instructions) : []
    }));

    return NextResponse.json({
      success: true,
      data: transformedAssignments
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, subject, dueDate, maxSubmissions, instructions } = body;

    // Validasi input
    if (!title || !description || !subject || !dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Cari admin berdasarkan email
    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email }
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    // Tentukan status berdasarkan due date
    const now = new Date();
    const dueDateObj = new Date(dueDate);
    const status = dueDateObj > now ? 'active' : 'upcoming';

    const newAssignment = await prisma.assignment.create({
      data: {
        title,
        description,
        subject,
        dueDate: dueDateObj,
        maxSubmissions: maxSubmissions || 30,
        status,
        instructions: instructions && instructions.length > 0 ? JSON.stringify(instructions) : null,
        createdBy: admin.id,
      },
      include: {
        _count: {
          select: { submissions: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Assignment created successfully',
      data: {
        id: newAssignment.id,
        title: newAssignment.title,
        description: newAssignment.description,
        subject: newAssignment.subject,
        dueDate: newAssignment.dueDate.toISOString(),
        submissionCount: newAssignment._count.submissions,
        maxSubmissions: newAssignment.maxSubmissions,
        status: newAssignment.status,
        createdAt: newAssignment.createdAt.toISOString(),
        instructions: newAssignment.instructions ? JSON.parse(newAssignment.instructions) : []
      }
    });

  } catch (error) {
    console.error('Create assignment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}