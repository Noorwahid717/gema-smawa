import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get current date for time-based queries
    const now = new Date()
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Fetch dashboard statistics
    const [
      totalContacts,
      totalRegistrations,
      pendingRegistrations,
      totalActivities,
      unreadContacts,
      // Time-based comparisons
      contactsThisWeek,
      contactsLastWeek,
      registrationsThisWeek,
      registrationsLastWeek,
      totalStudents,
      recentActivities,
      totalCodingLabSubmissions,
      totalAssignments
    ] = await Promise.all([
      // Basic counts
      prisma.contact.count(),
      prisma.registration.count(),
      prisma.registration.count({
        where: { status: 'PENDING' }
      }),
      prisma.activity.count({
        where: { isActive: true }
      }),
      prisma.contact.count({
        where: { status: 'unread' }
      }),
      // Weekly comparisons for contacts
      prisma.contact.count({
        where: { createdAt: { gte: lastWeek } }
      }),
      prisma.contact.count({
        where: { 
          createdAt: { 
            gte: new Date(lastWeek.getTime() - 7 * 24 * 60 * 60 * 1000),
            lt: lastWeek
          }
        }
      }),
      // Weekly comparisons for registrations
      prisma.registration.count({
        where: { createdAt: { gte: lastWeek } }
      }),
      prisma.registration.count({
        where: { 
          createdAt: { 
            gte: new Date(lastWeek.getTime() - 7 * 24 * 60 * 60 * 1000),
            lt: lastWeek
          }
        }
      }),
      // Additional stats
      prisma.student.count({
        where: { status: 'active' }
      }),
      prisma.activity.count({
        where: { 
          isActive: true,
          createdAt: { gte: lastMonth }
        }
      }),
      prisma.codingLabSubmission.count(),
      prisma.assignment.count()
    ])

    // Calculate percentage changes
    const contactsChange = contactsLastWeek > 0 
      ? Math.round(((contactsThisWeek - contactsLastWeek) / contactsLastWeek) * 100)
      : contactsThisWeek > 0 ? 100 : 0

    const registrationsChange = registrationsLastWeek > 0
      ? Math.round(((registrationsThisWeek - registrationsLastWeek) / registrationsLastWeek) * 100)
      : registrationsThisWeek > 0 ? 100 : 0

    return NextResponse.json({
      totalContacts,
      totalRegistrations,
      pendingRegistrations,
      totalActivities,
      unreadContacts,
      totalStudents,
      totalCodingLabSubmissions,
      totalAssignments,
      // Change statistics
      contactsChange,
      registrationsChange,
      contactsThisWeek,
      registrationsThisWeek,
      recentActivities
    })

  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}