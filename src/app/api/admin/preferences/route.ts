import { NextResponse } from 'next/server'

export async function GET(_request: Request) {
  try {
    // For now, return default preferences
    // In the future, we can store these in database
    const defaultPreferences = {
      emailNotifications: true,
      systemAlerts: true,
      userRegistrationAlerts: true,
      weeklyReports: true,
      theme: 'light',
      language: 'id'
    }

    return NextResponse.json({
      success: true,
      data: defaultPreferences
    })

  } catch (error) {
    console.error('Error fetching admin preferences:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { email, preferences } = body

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email is required'
      }, { status: 400 })
    }

    if (!preferences) {
      return NextResponse.json({
        success: false,
        error: 'Preferences data is required'
      }, { status: 400 })
    }

    // For now, we just validate the preferences format
    // In the future, we can store these in database
    const allowedKeys = [
      'emailNotifications',
      'systemAlerts', 
      'userRegistrationAlerts',
      'weeklyReports',
      'theme',
      'language'
    ]

    const validPreferences = Object.keys(preferences).every(key => 
      allowedKeys.includes(key)
    )

    if (!validPreferences) {
      return NextResponse.json({
        success: false,
        error: 'Invalid preferences format'
      }, { status: 400 })
    }

    // Validate theme and language values
    if (preferences.theme && !['light', 'dark', 'auto'].includes(preferences.theme)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid theme value'
      }, { status: 400 })
    }

    if (preferences.language && !['id', 'en'].includes(preferences.language)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid language value'
      }, { status: 400 })
    }

    // TODO: Store preferences in database
    // For now, we just return success
    // In the future, you can create an AdminPreferences table and store these values

    return NextResponse.json({
      success: true,
      data: preferences,
      message: 'Preferences updated successfully'
    })

  } catch (error) {
    console.error('Error updating admin preferences:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}