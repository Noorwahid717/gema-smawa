import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      )
    }

    // For now, return default preferences since we don't have a preferences table
    // In production, you might want to create a separate table for user preferences
    const defaultPreferences = {
      emailNotifications: true,
      assignmentReminders: true,
      weeklyReports: false,
      theme: 'light'
    }

    return NextResponse.json({
      success: true,
      data: defaultPreferences
    })

  } catch (error) {
    console.error('Student preferences GET error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch preferences',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, preferences } = body

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      )
    }

    // For now, just return success since we don't have a preferences table
    // In production, you would save preferences to database
    console.log('Saving preferences for student:', studentId, preferences)

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully',
      data: preferences
    })

  } catch (error) {
    console.error('Student preferences PUT error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update preferences',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}