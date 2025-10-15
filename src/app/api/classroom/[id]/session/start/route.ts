import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      error: 'Live Session API Archived',
      message: 'Live Classroom session management has been archived due to infrastructure limitations.',
      archived: true
    },
    { status: 410 } // Gone
  )
}
