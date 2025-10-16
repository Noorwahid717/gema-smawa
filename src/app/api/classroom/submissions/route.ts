import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';

const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const file = formData.get('file') as File;
    const studentName = formData.get('studentName') as string;
    const studentId = formData.get('studentId') as string;
    const assignmentId = formData.get('assignmentId') as string;
    
    if (!file || !studentName || !studentId || !assignmentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
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

    // Check if assignment is still active
    if (assignment.status === 'closed') {
      return NextResponse.json(
        { error: 'Assignment is closed for submissions' },
        { status: 400 }
      );
    }

    // Check if max submissions reached
    if (assignment._count.submissions >= assignment.maxSubmissions) {
      return NextResponse.json(
        { error: 'Maximum submissions limit reached' },
        { status: 400 }
      );
    }

    // Check if student already submitted
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        assignmentId,
        studentId
      }
    });

    if (existingSubmission) {
      return NextResponse.json(
        { error: 'You have already submitted for this assignment' },
        { status: 400 }
      );
    }

    // Validasi file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size too large. Maximum 10MB allowed.' },
        { status: 400 }
      );
    }

    // Validasi file type - Extended untuk web development
    const allowedTypes = [
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      
      // Archives
      'application/zip',
      'application/x-rar-compressed',
      'application/x-zip-compressed',
      'application/x-tar',
      'application/gzip',
      
      // Images
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/svg+xml',
      'image/webp',
      
      // Web Development Files
      'text/html',
      'text/css',
      'text/javascript',
      'application/javascript',
      'application/json',
      'text/xml',
      'application/xml',
      
      // Programming Files
      'text/x-python',
      'application/x-python-code',
      'text/x-java-source',
      'text/x-c',
      'text/x-c++',
      'text/x-php',
      'application/x-php',
      
      // Other common types
      'text/markdown',
      'application/octet-stream' // For files without proper MIME type
    ];

    // Additional check for file extensions if MIME type is not reliable
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = [
      'pdf', 'doc', 'docx', 'txt', 'zip', 'rar', '7z', 'tar', 'gz',
      'jpg', 'jpeg', 'png', 'gif', 'svg', 'webp',
      'html', 'htm', 'css', 'js', 'json', 'xml',
      'py', 'java', 'c', 'cpp', 'h', 'hpp', 'php',
      'md', 'readme', 'yml', 'yaml', 'env', 'gitignore'
    ];

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
      return NextResponse.json(
        { error: 'File type not allowed. Supported: HTML, CSS, JS, Python, Java, ZIP, PDF, images, and more.' },
        { status: 400 }
      );
    }

    // Convert file to buffer untuk Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = new Date().getTime();
    const sanitizedStudentName = studentName.replace(/[^a-zA-Z0-9]/g, '_');
    const uniqueFileName = `${sanitizedStudentName}_${timestamp}.${fileExtension}`;

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          public_id: `assignments/${assignmentId}/${uniqueFileName}`,
          folder: `gema-classroom/assignments/${assignmentId}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    const cloudinaryResult = uploadResult as { secure_url: string; public_id: string; original_filename: string };

    // Check if submission is late
    const now = new Date();
    const isLate = now > assignment.dueDate;

    // Simpan submission ke database
    const submission = await prisma.submission.create({
      data: {
        assignmentId,
        studentId,
        fileName: uniqueFileName,
        originalFileName: file.name,
        filePath: cloudinaryResult.secure_url,
        fileSize: file.size,
        mimeType: file.type,
        status: isLate ? 'late' : 'submitted',
        isLate,
        submittedAt: now,
      },
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
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      submission: {
        id: submission.id,
        studentName: submission.student.fullName,
        studentId: submission.studentId,
        assignmentTitle: submission.assignment.title,
        fileName: submission.fileName,
        originalFileName: submission.originalFileName,
        filePath: submission.filePath,
        fileSize: submission.fileSize,
        submittedAt: submission.submittedAt.toISOString(),
        status: submission.status,
        isLate: submission.isLate
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');
    const studentId = searchParams.get('studentId');

    const whereCondition: {
      assignmentId?: string;
      studentId?: string;
    } = {};

    if (assignmentId) {
      whereCondition.assignmentId = assignmentId;
    }

    if (studentId) {
      whereCondition.studentId = studentId;
    }

    const submissions = await prisma.submission.findMany({
      where: whereCondition,
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
            email: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    const transformedSubmissions = submissions.map(submission => ({
      id: submission.id,
      studentName: submission.student.fullName,
      studentId: submission.studentId,
      studentEmail: submission.student.email,
      assignmentId: submission.assignmentId,
      assignmentTitle: submission.assignment.title,
      assignmentSubject: submission.assignment.subject,
      fileName: submission.fileName,
      originalFileName: submission.originalFileName,
      filePath: submission.filePath,
      fileSize: submission.fileSize,
      mimeType: submission.mimeType,
      submittedAt: submission.submittedAt.toISOString(),
      status: submission.status,
      isLate: submission.isLate,
      grade: submission.grade,
      feedback: submission.feedback,
      reviewedAt: submission.reviewedAt?.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: transformedSubmissions
    });

  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}