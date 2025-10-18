import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('Student dashboard API called')

    // Get student ID from query parameters
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      )
    }

    console.log('Fetching data for student:', studentId)

    // Calculate date ranges for time-based analysis
    const now = new Date()
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(now.getDate() - 7)
    
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(now.getMonth() - 1)

    // Execute all queries in parallel for optimal performance
    const [
      // Student specific data
      studentInfo,
      studentSubmissions,
      studentFeedbacks,
      studentActivities,
      
      // Assignment and learning progress
      totalAssignments,
      completedAssignments,
      pendingAssignments,
      overdueAssignments,
      
      // Coding Lab data
      codingLabSubmissions,
      codingLabTasks,
      
      // Recent activities and engagement
      recentSubmissions,
      recentFeedbacks,
      weeklyProgress,
      
      // General statistics for context
      totalStudents,
      totalTutorialArticles,
      
      // Roadmap progress (from localStorage will be handled client-side)
      roadmapStages
    ] = await Promise.all([
      // Student info
      prisma.student.findUnique({
        where: { studentId: studentId },
        select: {
          id: true,
          studentId: true,
          fullName: true,
          class: true,
          email: true,
          createdAt: true
        }
      }),

      // Student submissions
      prisma.submission.count({
        where: { studentId: studentId }
      }),

      // Student feedbacks given
      prisma.articleFeedback.count({
        where: { studentId: studentId }
      }),

      // Student activity count (generic activity tracking)
      prisma.activity.count({
        where: { 
          AND: [
            { description: { contains: studentId } },
            { createdAt: { gte: oneMonthAgo } }
          ]
        }
      }),

      // Assignment statistics
      prisma.assignment.count(),
      
      prisma.assignment.count({
        where: {
          submissions: {
            some: { studentId: studentId }
          }
        }
      }),

      prisma.assignment.count({
        where: {
          AND: [
            { dueDate: { gte: now } },
            {
              NOT: {
                submissions: {
                  some: { studentId: studentId }
                }
              }
            }
          ]
        }
      }),

      prisma.assignment.count({
        where: {
          AND: [
            { dueDate: { lt: now } },
            {
              NOT: {
                submissions: {
                  some: { studentId: studentId }
                }
              }
            }
          ]
        }
      }),

      // Coding Lab data
      prisma.codingLabSubmission.count({
        where: { studentId: studentId }
      }),

      prisma.codingLabTask.count(),

      // Recent activities
      prisma.submission.count({
        where: {
          AND: [
            { studentId: studentId },
            { submittedAt: { gte: oneWeekAgo } }
          ]
        }
      }),

      prisma.articleFeedback.count({
        where: {
          AND: [
            { studentId: studentId },
            { createdAt: { gte: oneWeekAgo } }
          ]
        }
      }),

      // Weekly progress comparison
      prisma.submission.count({
        where: {
          AND: [
            { studentId: studentId },
            { submittedAt: { gte: oneWeekAgo } }
          ]
        }
      }),

      // Context data
      prisma.student.count(),
      
      prisma.article.count({
        where: { status: 'published' }
      }),

      // Coding Lab tasks as learning stages
      prisma.codingLabTask.count()
    ])

    // Calculate completion percentage
    const completionPercentage = totalAssignments > 0 
      ? Math.round((completedAssignments / totalAssignments) * 100) 
      : 0

    // Calculate learning streak (days with activity)
    const learningStreak = Math.min(
      Math.floor((studentSubmissions + studentFeedbacks) / 2), 
      30
    ) // Max 30 days

    // Calculate engagement score
    const engagementScore = Math.min(
      Math.round(((studentSubmissions * 2) + (studentFeedbacks * 1.5) + (studentActivities * 1)) / 3),
      100
    )

    // Prepare dashboard statistics
    const dashboardStats = {
      // Student personal data
      student: studentInfo,
      
      // Learning progress
      totalAssignments,
      completedAssignments,
      pendingAssignments,
      overdueAssignments,
      completionPercentage,
      
      // Engagement metrics
      totalSubmissions: studentSubmissions,
      totalFeedbacks: studentFeedbacks,
      codingLabSubmissions,
      codingLabTasks,
      
      // Recent activity
      recentSubmissions,
      recentFeedbacks,
      weeklyProgress,
      
      // Achievement metrics
      learningStreak,
      engagementScore,
      
      // Context and ranking
      totalStudents,
      totalTutorialArticles,
      roadmapStages,
      
      // Performance indicators
      isActiveThisWeek: (recentSubmissions + recentFeedbacks) > 0,
      hasOverdueAssignments: overdueAssignments > 0,
      codingLabProgress: codingLabTasks > 0 ? Math.round((codingLabSubmissions / codingLabTasks) * 100) : 0,
      
      // Weekly comparison
      weeklyGrowth: weeklyProgress > 0 ? 'increasing' : 'stable',
      
      // Status indicators
      status: {
        assignments: overdueAssignments > 0 ? 'needs_attention' : pendingAssignments > 0 ? 'in_progress' : 'up_to_date',
        codingLab: codingLabSubmissions === 0 ? 'needs_start' : codingLabSubmissions < codingLabTasks ? 'in_progress' : 'complete',
        engagement: engagementScore >= 70 ? 'high' : engagementScore >= 40 ? 'medium' : 'low'
      }
    }

    console.log('Dashboard stats prepared:', {
      studentId,
      totalAssignments,
      completedAssignments,
      completionPercentage,
      engagementScore
    })

    return NextResponse.json({
      success: true,
      data: dashboardStats
    })

  } catch (error) {
    console.error('Student dashboard API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}