export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const upgrade = req.headers.get('upgrade') || ''
  if (upgrade.toLowerCase() !== 'websocket') {
    return new Response('Expected Upgrade: websocket', { status: 426 })
  }

  // @ts-expect-error - WebSocketPair is provided by the Edge runtime
  const { 0: client, 1: server } = new WebSocketPair()
  const ws = server as WebSocket

  try {
    ws.accept()

    console.info('[ws] connection accepted')

    const heartbeat = setInterval(() => {
      try {
        ws.send(
          JSON.stringify({
            type: 'ping',
            t: Date.now()
          })
        )
      } catch (error) {
        console.warn('[ws] failed to send ping', error)
      }
    }, 25_000)

    ws.addEventListener('message', (event) => {
      try {
        const text = typeof event.data === 'string' ? event.data : ''
        const message = JSON.parse(text || '{}')
        ws.send(
          JSON.stringify({
            type: 'echo',
            data: message,
            t: Date.now()
          })
        )
      } catch (error) {
        try {
          ws.send(
            JSON.stringify({
              type: 'error',
              message: 'bad_json'
            })
          )
        } catch {}
        console.error('[ws] invalid JSON message', error)
      }
    })

    const cleanup = () => {
      try {
        clearInterval(heartbeat)
      } catch {}
    }

    ws.addEventListener('close', cleanup)
    ws.addEventListener('error', cleanup)

    // @ts-expect-error - ResponseInit.webSocket is available in the Edge runtime
    return new Response(null, { status: 101, webSocket: client })
  } catch (error) {
    console.error('[ws] initialization error', error)
    try {
      ws.close()
    } catch {}
    return new Response('WS init error', { status: 500 })
  }
}
