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
  | { type: 'left'; room: string; participants: number; peerId: string; role?: Role }
  | { type: 'peer'; from: string; payload: unknown }
  | { type: 'error'; message: string }
  | { type: 'pong' }

type ClientMessage =
  | { type: 'join'; room: string; peerId: string; role?: Role }
  | { type: 'signal'; room: string; to?: string; from: string; payload: unknown }
  | { type: 'ping' }
  | { type: 'leave'; room: string; peerId: string }

type PeerMeta = { peerId: string; role?: Role }

type GlobalState = {
  __rooms?: Map<string, Set<WebSocket>>
  __roomPeers?: Map<string, Map<string, { socket: WebSocket; meta: PeerMeta }>>
  __socketMeta?: Map<WebSocket, { room: string; meta: PeerMeta }>
}

const g = globalThis as unknown as GlobalState
if (!g.__rooms) g.__rooms = new Map()
if (!g.__roomPeers) g.__roomPeers = new Map()
if (!g.__socketMeta) g.__socketMeta = new Map()

const rooms = g.__rooms
const roomPeers = g.__roomPeers
const socketMeta = g.__socketMeta
const OPEN_STATE = (WebSocket as { OPEN?: number }).OPEN ?? 1
const decoder = new TextDecoder()

function getRoomPeerRegistry(room: string) {
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
    const readyState = (socket as { readyState?: number }).readyState
    if (typeof readyState === 'number' && readyState !== OPEN_STATE) continue
    try {
      socket.send(payload)
    } catch {}
  }
}

function sendToPeer(room: string, peerId: string, data: ServerMessage, except?: WebSocket) {
  const registry = roomPeers.get(room)
  if (!registry) return
  const entry = registry.get(peerId)
  if (!entry) return
  if (except && entry.socket === except) return
  const readyState = (entry.socket as { readyState?: number }).readyState
  if (typeof readyState === 'number' && readyState !== OPEN_STATE) return
  try {
    entry.socket.send(JSON.stringify(data))
  } catch {}
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
    const metaEntry = socketMeta.get(ws)

    if (registry && metaEntry) {
      registry.delete(metaEntry.meta.peerId)
      if (registry.size === 0) {
        roomPeers.delete(currentRoom)
      }
    }

    if (sockets) {
      sockets.delete(ws)
      if (sockets.size === 0) {
        rooms.delete(currentRoom)
      }
    }

    if (metaEntry) {
      socketMeta.delete(ws)
      console.log('[ws] leave', metaEntry.meta.peerId, metaEntry.meta.role, 'room', currentRoom)
      broadcast(currentRoom, {
        type: 'left',
        room: currentRoom,
        participants: sockets?.size ?? 0,
        peerId: metaEntry.meta.peerId,
        role: metaEntry.meta.role
      })
    }

    currentRoom = null
  }

  ws.addEventListener('message', (event: MessageEvent) => {
    try {
      const raw =
        typeof event.data === 'string'
          ? event.data
          : decoder.decode(event.data as ArrayBuffer)
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
        currentRole = msg.role

        let sockets = rooms.get(room)
        if (!sockets) {
          sockets = new Set()
          rooms.set(room, sockets)
        }

        const registry = getRoomPeerRegistry(room)
        const existingPeers: Array<{ peerId: string; role?: Role }> = []
        for (const { meta } of registry.values()) {
          if (meta.peerId !== currentPeerId) {
            existingPeers.push({ peerId: meta.peerId, role: meta.role })
          }
        }

        sockets.add(ws)
        registry.set(currentPeerId, { socket: ws, meta: { peerId: currentPeerId, role: currentRole } })
        socketMeta.set(ws, { room, meta: { peerId: currentPeerId, role: currentRole } })

        console.log('[ws] join', currentPeerId, currentRole, 'room', room, 'participants', sockets.size)

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

        broadcast(
          room,
          {
            type: 'joined',
            room,
            participants: sockets.size,
            peerId: currentPeerId,
            role: currentRole
          },
          ws
        )
        return
      }

      if (msg.type === 'leave') {
        if (msg.peerId === currentPeerId) {
          leaveRoom()
        }
        return
      }

      if (msg.type === 'signal') {
        if (!currentRoom) return
        const payload: ServerMessage = {
          type: 'peer',
          from: msg.from || currentPeerId,
          payload: msg.payload
        }

        if (msg.to) {
          sendToPeer(currentRoom, msg.to, payload, ws)
        } else {
          broadcast(currentRoom, payload, ws)
        }
        return
      }
    } catch (error) {
      try {
        ws.send(JSON.stringify({ type: 'error', message: 'invalid message' } satisfies ServerMessage))
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
