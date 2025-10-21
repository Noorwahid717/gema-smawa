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
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        assignment: {
          select: {
            title: true,
            subject: true
          }
        },
        student: {
          select: {
            fullName: true,
            studentId: true
          }
        }
      }
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Return submission data with download URL
    return NextResponse.json({
      success: true,
      data: {
        id: submission.id,
        studentName: submission.student.fullName,
        studentId: submission.studentId,
        fileName: submission.originalFileName,
        downloadUrl: submission.filePath, // Cloudinary URL
        submittedAt: submission.submittedAt.toISOString(),
        assignment: submission.assignment
      }
    });

  } catch (error) {
    console.error('Error fetching submission:', error);
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
    const { status, grade, feedback } = body;

    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email }
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    const updatedSubmission = await prisma.submission.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(grade !== undefined && { grade }),
        ...(feedback !== undefined && { feedback }),
        reviewedAt: new Date(),
        reviewedBy: admin.id,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Submission updated successfully',
      data: updatedSubmission
    });

  } catch (error) {
    console.error('Error updating submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}