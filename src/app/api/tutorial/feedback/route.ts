import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    let studentId: string | null = null;
    let student = null;

    if (session?.user?.id && session.user.userType === 'student') {
      studentId = session.user.id;
      student = await prisma.student.findUnique({
        where: { id: studentId }
      });
    } else {
      const headerStudentId = request.headers.get('x-student-id');
      if (headerStudentId) {
        student = await prisma.student.findUnique({
          where: { id: headerStudentId }
        });
        if (student) {
          studentId = student.id;
        }
      }
    }

    if (!studentId || !student) {
      return NextResponse.json(
        { success: false, error: 'Hanya siswa yang sudah login yang dapat memberikan feedback' },
        { status: 401 }
      );
    }

    const { articleId, rating, comment, challenge, checklist } = await request.json();

    // Validate required fields
    if (!articleId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Data tidak valid. Rating harus antara 1-5.' },
        { status: 400 }
      );
    }

    // Check if student already gave feedback for this article
    const existingFeedback = await prisma.articleFeedback.findFirst({
      where: {
        articleId,
        studentId
      }
    });

    if (existingFeedback) {
      return NextResponse.json(
        { success: false, error: 'Anda sudah memberikan feedback untuk artikel ini' },
        { status: 409 }
      );
    }

    // Create feedback record
    const feedback = await prisma.articleFeedback.create({
      data: {
        articleId,
        studentId,
        rating,
        comment: comment || '',
        challenge: challenge || null,
        checklist: checklist || null,
        userAgent: request.headers.get('user-agent') || '',
        ipAddress: request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown'
      }
    });

    // Update article's average rating
    const allFeedback = await prisma.articleFeedback.findMany({
      where: { articleId },
      select: { rating: true }
    });

    const averageRating = allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length;
    
    await prisma.article.update({
      where: { id: articleId },
      data: { 
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalFeedback: allFeedback.length
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: feedback.id,
        message: 'Feedback berhasil dikirim! Terima kasih atas partisipasi Anda.'
      }
    });

  } catch (error) {
    console.error('Error saving feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');

    if (!articleId) {
      return NextResponse.json(
        { success: false, error: 'Article ID is required' },
        { status: 400 }
      );
    }

    // Get feedback for specific article with student information
    const feedback = await prisma.articleFeedback.findMany({
      where: { articleId },
      orderBy: { timestamp: 'desc' },
      select: {
        id: true,
        rating: true,
        comment: true,
        challenge: true,
        timestamp: true,
        student: {
          select: {
            fullName: true,
            class: true
          }
        }
      }
    });

    // Get article stats
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: {
        averageRating: true,
        totalFeedback: true,
        title: true
      }
    });

    // Format feedback data for frontend
    const formattedFeedback = feedback.map(item => ({
      id: item.id,
      rating: item.rating,
      comment: item.comment,
      challenge: item.challenge,
      timestamp: item.timestamp,
      studentName: item.student?.fullName || 'Anonymous',
      studentClass: item.student?.class || '',
      timeAgo: getTimeAgo(item.timestamp)
    }));

    return NextResponse.json({
      success: true,
      data: {
        feedback: formattedFeedback,
        stats: article || { averageRating: 0, totalFeedback: 0 }
      }
    });

  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to calculate time ago
function getTimeAgo(timestamp: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - timestamp.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInWeeks = Math.floor(diffInDays / 7);

  if (diffInMinutes < 1) {
    return 'Baru saja';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} menit yang lalu`;
  } else if (diffInHours < 24) {
    return `${diffInHours} jam yang lalu`;
  } else if (diffInDays < 7) {
    return `${diffInDays} hari yang lalu`;
  } else {
    return `${diffInWeeks} minggu yang lalu`;
  }
}
