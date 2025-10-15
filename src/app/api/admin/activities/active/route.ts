import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get count of active activities (isActive = true and date >= today)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const activeActivitiesCount = await prisma.activity.count({
      where: {
        isActive: true,
        date: {
          gte: today
        }
      }
    })

    return NextResponse.json({
      success: true,
      count: activeActivitiesCount
    })
  } catch (error) {
    console.error('Error fetching active activities count:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch active activities count',
      count: 0
    }, { status: 500 })
  }
}