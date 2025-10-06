import { createDebugLogger } from './debug'
import { Role, SignalingServerMessage, isSignalingServerMessage } from './types'

const signalingLog = createDebugLogger('signaling')

function makeWsUrl(path = '/api/ws') {
  const loc = window.location
  const isSecure = loc.protocol === 'https:'
  const scheme = isSecure ? 'wss' : 'ws'
  return `${scheme}://${loc.host}${path}`
}

type SignalingStatus = 'connecting' | 'open' | 'closed' | 'error' | 'reconnecting'

type WsOpts = {
  room: string
  peerId: string
  role: Role
  onMessage: (data: SignalingServerMessage) => void
  onStatus?: (s: SignalingStatus) => void
}

export function createSignaling({ room, peerId, role, onMessage, onStatus }: WsOpts) {
  let ws: WebSocket | null = null
  let retry = 0
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let manuallyClosed = false

  const connect = () => {
    signalingLog.info('Connecting to signaling server', { room, peerId, role })
    onStatus?.('connecting')
    ws = new WebSocket(makeWsUrl('/api/ws'))

    ws.onopen = () => {
      signalingLog.info('WebSocket connected')
      retry = 0
      manuallyClosed = false
      onStatus?.('open')
      const payload = {
        type: 'join' as const,
        room,
        peerId,
        role
      }
      signalingLog.log('Sending join payload', payload)
      ws!.send(JSON.stringify(payload))
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
        reconnectTimer = null
      }
    }

    ws.onmessage = async (event) => {
      signalingLog.time('message-handling')
      try {
        const raw = await normalizeIncomingPayload(event.data)
        if (!raw) {
          signalingLog.warn('Received empty message from signaling server')
          return
        }

        const parsed = JSON.parse(raw)
        if (!isSignalingServerMessage(parsed)) {
          signalingLog.warn('Received malformed message', { raw })
          return
        }

        if (parsed.type === 'ping') {
          signalingLog.log('↪️ Responding to ping heartbeat', parsed)
          ws?.send(JSON.stringify({ type: 'pong' }))
          return
        }

        signalingLog.log('Dispatching signaling message', parsed)
        onMessage?.(parsed)
      } catch (error) {
        signalingLog.error('Failed to process WebSocket message', error)
      } finally {
        signalingLog.timeEnd('message-handling')
      }
    }

    const scheduleReconnect = () => {
      if (manuallyClosed) return
      if (reconnectTimer) clearTimeout(reconnectTimer)
      onStatus?.('reconnecting')
      const delay = Math.min(30_000, 1_000 * Math.pow(2, retry++))
      signalingLog.warn('Scheduling reconnect', { delay, retry })
      ws = null
      reconnectTimer = setTimeout(connect, delay)
    }

    ws.onerror = (error) => {
      signalingLog.error('WebSocket error', error)
      onStatus?.('error')
      try {
        ws?.close()
      } catch (closeError) {
        signalingLog.warn('Error closing socket after failure', closeError)
      }
    }

    ws.onclose = (event) => {
      signalingLog.warn('WebSocket closed', { code: event.code, reason: event.reason })
      onStatus?.('closed')
      ws = null
      scheduleReconnect()
    }
  }

  const send = (payload: unknown) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      signalingLog.log('Sending payload', payload)
      ws.send(JSON.stringify(payload))
    } else {
      signalingLog.warn('Attempted to send payload while socket not open', { readyState: ws?.readyState })
    }
  }

  const close = () => {
    manuallyClosed = true
    signalingLog.info('Closing signaling connection manually')
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    try {
      ws?.close()
    } catch (error) {
      signalingLog.warn('Failed to close WebSocket cleanly', error)
    }
    ws = null
  }

  connect()

  return { send, close }
}

async function normalizeIncomingPayload(payload: unknown): Promise<string> {
  if (typeof payload === 'string') {
    return payload
  }

  if (typeof Blob !== 'undefined' && payload instanceof Blob) {
    return payload.text()
  }

  if (typeof ArrayBuffer !== 'undefined' && payload instanceof ArrayBuffer) {
    return new TextDecoder('utf-8').decode(payload)
  }

  if (payload && ArrayBuffer.isView(payload)) {
    return new TextDecoder('utf-8').decode(payload.buffer as ArrayBuffer)
  }

  signalingLog.warn('Unable to normalize incoming payload', { payloadType: typeof payload })
  return ''
}
