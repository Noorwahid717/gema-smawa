export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET() {
  return new Response(
    JSON.stringify({
      error: 'Live Classroom Stream API Archived',
      message: 'Live Classroom streaming has been archived due to infrastructure limitations.',
      archived: true
    }),
    {
      status: 410, // Gone
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
}
