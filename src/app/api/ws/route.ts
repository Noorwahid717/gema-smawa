export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET() {
  return new Response(
    JSON.stringify({
      error: 'WebSocket API Archived',
      message: 'Live Classroom WebSocket signaling has been archived due to infrastructure limitations.',
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
