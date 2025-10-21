import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        _count: {
          select: { submissions: true }
        }
      }
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    const transformedAssignment = {
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
    };

    return NextResponse.json({
      success: true,
      data: transformedAssignment
    });
  } catch (error) {
    console.error('Error fetching assignment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, subject, dueDate, maxSubmissions, instructions, status } = body;

    // Check if assignment exists
    const existingAssignment = await prisma.assignment.findUnique({
      where: { id }
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Update assignment
    const updatedAssignment = await prisma.assignment.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(subject && { subject }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(maxSubmissions && { maxSubmissions }),
        ...(status && { status }),
        ...(instructions && { 
          instructions: instructions.length > 0 ? JSON.stringify(instructions) : null 
        }),
      },
      include: {
        _count: {
          select: { submissions: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Assignment updated successfully',
      data: {
        id: updatedAssignment.id,
        title: updatedAssignment.title,
        description: updatedAssignment.description,
        subject: updatedAssignment.subject,
        dueDate: updatedAssignment.dueDate.toISOString(),
        submissionCount: updatedAssignment._count.submissions,
        maxSubmissions: updatedAssignment.maxSubmissions,
        status: updatedAssignment.status,
        createdAt: updatedAssignment.createdAt.toISOString(),
        instructions: updatedAssignment.instructions ? JSON.parse(updatedAssignment.instructions) : []
      }
    });

  } catch (error) {
    console.error('Update assignment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if assignment exists
    const existingAssignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        _count: {
          select: { submissions: true }
        }
      }
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Check if assignment has submissions
    if (existingAssignment._count.submissions > 0) {
      return NextResponse.json(
        { error: 'Cannot delete assignment with existing submissions' },
        { status: 400 }
      );
    }

    // Delete assignment (submissions will be deleted by CASCADE)
    await prisma.assignment.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Assignment deleted successfully'
    });

  } catch (error) {
    console.error('Delete assignment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}