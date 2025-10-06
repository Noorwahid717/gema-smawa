export const runtime = 'edge'
export const dynamic = 'force-dynamic'

type Role = 'host' | 'viewer'

type ServerMessage =
  | {
      type: 'joined'
      room: string
      participants: number
      peerId: string
      role?: Role
      peers?: Array<{ peerId: string; role?: Role }>
    }
  | {
      type: 'left'
      room: string
      participants: number
      peerId: string
      role?: Role
    }
  | { type: 'peer'; from: string; payload: unknown }
  | { type: 'error'; message: string }
  | { type: 'ping'; timestamp: number }

type ClientMessage =
  | { type: 'join'; room: string; peerId?: string; role?: Role }
  | { type: 'signal'; room: string; from?: string; to?: string; payload: unknown }
  | { type: 'pong' }
  | { type: 'leave'; room: string; peerId?: string }

type PeerMetadata = { peerId: string; role?: Role }

type GlobalState = {
  __rooms?: Map<string, Set<WebSocket>>
  __roomPeers?: Map<string, Map<WebSocket, PeerMetadata>>
}

const g = globalThis as unknown as GlobalState
if (!g.__rooms) g.__rooms = new Map()
if (!g.__roomPeers) g.__roomPeers = new Map()

const rooms = g.__rooms
const roomPeers = g.__roomPeers

function getPeerRegistry(room: string) {
  let registry = roomPeers.get(room)
  if (!registry) {
    registry = new Map()
    roomPeers.set(room, registry)
  }
  return registry
}

function broadcast(room: string, data: ServerMessage, except?: WebSocket) {
  const sockets = rooms.get(room)
  if (!sockets) return
  const payload = JSON.stringify(data)
  for (const socket of sockets) {
    if (except && socket === except) continue
    try {
      socket.send(payload)
    } catch {
      // noop: ignore broken socket
    }
  }
}

function sendToPeer(room: string, targetPeerId: string, data: ServerMessage) {
  const registry = roomPeers.get(room)
  if (!registry) return
  const payload = JSON.stringify(data)
  for (const [socket, meta] of registry.entries()) {
    if (meta.peerId === targetPeerId) {
      try {
        socket.send(payload)
      } catch {
        // noop
      }
      return
    }
  }
}

export function GET(request: Request) {
  const upgradeHeader = request.headers.get('upgrade') || ''
  if (upgradeHeader.toLowerCase() !== 'websocket') {
    return new Response('Expected Upgrade: websocket', { status: 426 })
  }

  try {
    // @ts-expect-error - WebSocketPair is provided by the Edge runtime
    const { 0: client, 1: server } = new WebSocketPair()
    const ws = server as WebSocket & { accept: () => void }
    ws.accept()

  let currentRoom: string | null = null
  let currentPeerId = `peer_${Math.random().toString(36).slice(2, 9)}`
  let currentRole: Role | undefined

  // --- Heartbeat: server -> ping, client -> pong ---
  let heartbeatAlive = true
  const HEARTBEAT_MS = 25_000
  const heartbeatTimer = setInterval(() => {
    try {
      if ((ws as WebSocket).readyState !== ws.OPEN) return
      if (!heartbeatAlive) {
        try {
          ws.close(4000, 'No heartbeat (pong) received')
        } catch {}
        return
      }
      heartbeatAlive = false
      ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() } satisfies ServerMessage))
    } catch {
      // ignore send errors
    }
  }, HEARTBEAT_MS)

  const leaveRoom = () => {
    if (!currentRoom) return
    const sockets = rooms.get(currentRoom)
    const registry = roomPeers.get(currentRoom)
    const meta = registry?.get(ws)

    if (sockets) {
      sockets.delete(ws)
      if (sockets.size === 0) {
        rooms.delete(currentRoom)
      }
    }

    if (registry) {
      registry.delete(ws)
      if (registry.size === 0) {
        roomPeers.delete(currentRoom)
      }
    }

    if (meta) {
      console.log('[ws] leave', currentRoom, meta.peerId, meta.role, 'participants', sockets?.size ?? 0)
      broadcast(currentRoom, {
        type: 'left',
        room: currentRoom,
        participants: sockets?.size ?? 0,
        peerId: meta.peerId,
        role: meta.role
      })
    }

    currentRoom = null
  }

  const broadcastServerMessage = (room: string, data: ServerMessage) => {
    broadcast(room, data, ws)
  }

  ws.addEventListener('message', (ev: MessageEvent) => {
    try {
      const raw = typeof ev.data === 'string' ? ev.data : new TextDecoder().decode(ev.data as ArrayBuffer)
      const msg = JSON.parse(raw) as ClientMessage

      if (msg.type === 'pong') {
        // client replied to heartbeat
        heartbeatAlive = true
        return
      }

      if (msg.type === 'join') {
        const room = msg.room?.trim()
        if (!room) {
          ws.send(JSON.stringify({ type: 'error', message: 'room required' } satisfies ServerMessage))
          return
        }

        currentRoom = room
        currentPeerId = msg.peerId?.trim() || currentPeerId
        currentRole = msg.role === 'host' ? 'host' : 'viewer'

        let sockets = rooms.get(room)
        if (!sockets) {
          sockets = new Set()
          rooms.set(room, sockets)
        }
        const registry = getPeerRegistry(room)
        const existingPeers = Array.from(registry.values()).map((peer) => ({
          peerId: peer.peerId,
          role: peer.role
        }))

        sockets.add(ws)
        registry.set(ws, { peerId: currentPeerId, role: currentRole })

        console.log('[ws] join', room, currentPeerId, currentRole, 'participants', sockets.size)

        ws.send(
          JSON.stringify({
            type: 'joined',
            room,
            participants: sockets.size,
            peerId: currentPeerId,
            role: currentRole,
            peers: existingPeers
          } satisfies ServerMessage)
        )

        broadcastServerMessage(room, {
          type: 'joined',
          room,
          participants: sockets.size,
          peerId: currentPeerId,
          role: currentRole
        })
        return
      }

      if (msg.type === 'leave') {
        leaveRoom()
        return
      }

      if (msg.type === 'signal') {
        if (!currentRoom) return
        const payload: ServerMessage = {
          type: 'peer',
          from: msg.from ?? currentPeerId,
          payload: msg.payload
        }

        if (msg.to) {
          sendToPeer(currentRoom, msg.to, payload)
        } else {
          broadcastServerMessage(currentRoom, payload)
        }
        return
      }
    } catch {
      try {
        ws.send(JSON.stringify({ type: 'error', message: 'invalid message' } satisfies ServerMessage))
      } catch {}
    }
  })

  const cleanup = () => {
    try {
      clearInterval(heartbeatTimer)
    } catch {}
    leaveRoom()
  }

    ws.addEventListener('close', cleanup)
    ws.addEventListener('error', cleanup)

    return new Response(null, { status: 101, webSocket: client } as ResponseInit & {
      webSocket: WebSocket
    })
  } catch (err) {
    console.error('[ws] upgrade error', err)
    return new Response('Failed to establish WebSocket connection', { status: 500 })
  }
}
