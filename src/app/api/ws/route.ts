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
  | { type: 'pong' }

type ClientMessage =
  | { type: 'join'; room: string; peerId?: string; role?: Role }
  | { type: 'signal'; room: string; from?: string; to?: string; payload: unknown }
  | { type: 'ping' }
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
    } catch {}
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
      } catch {}
      return
    }
  }
}

export function GET(request: Request) {
  const upgradeHeader = request.headers.get('upgrade') || ''
  if (upgradeHeader.toLowerCase() !== 'websocket') {
    return new Response('Expected websocket', { status: 426 })
  }

  const globalWithPair = globalThis as typeof globalThis & {
    WebSocketPair?: new () => { 0: WebSocket; 1: WebSocket }
  }
  if (!globalWithPair.WebSocketPair) {
    return new Response('WebSocket not supported', { status: 500 })
  }

  const { 0: client, 1: server } = new globalWithPair.WebSocketPair()
  const ws = server as WebSocket & { accept: () => void }
  ws.accept()

  let currentRoom: string | null = null
  let currentPeerId = `peer_${Math.random().toString(36).slice(2, 9)}`
  let currentRole: Role | undefined

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
      const raw = typeof ev.data === 'string' ? ev.data : new TextDecoder().decode(ev.data)
      const msg = JSON.parse(raw) as ClientMessage

      if (msg.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' } satisfies ServerMessage))
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
    } catch (error) {
      try {
        ws.send(
          JSON.stringify({ type: 'error', message: 'invalid message' } satisfies ServerMessage)
        )
      } catch {}
    }
  })

  ws.addEventListener('close', () => {
    leaveRoom()
  })

  ws.addEventListener('error', () => {
    leaveRoom()
  })

  return new Response(null, { status: 101, webSocket: client } as ResponseInit & {
    webSocket: WebSocket
  })
}
