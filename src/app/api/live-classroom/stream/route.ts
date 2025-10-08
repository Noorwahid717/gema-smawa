export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const encoder = new TextEncoder()

  try {
    let interval: ReturnType<typeof setInterval> | null = null

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const send = (data: Record<string, unknown>) => {
          try {
            const payload = `data: ${JSON.stringify(data)}\n\n`
            controller.enqueue(encoder.encode(payload))
          } catch (error) {
            console.error('[sse] failed to serialize payload', error)
          }
        }

        send({ type: 'ready', t: Date.now() })

        interval = setInterval(() => {
          send({ type: 'ping', t: Date.now() })
        }, 25_000)

        const abort = () => {
          try {
            if (interval) {
              clearInterval(interval)
              interval = null
            }
          } catch {}
          try {
            controller.close()
          } catch {}
        }

        request.signal.addEventListener('abort', abort)
      },
      cancel() {
        if (interval) {
          try {
            clearInterval(interval)
          } catch {}
          interval = null
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive'
      }
    })
  } catch (error) {
    console.error('[sse] initialization error', error)
    return new Response('SSE init error', { status: 500 })
  }
}
