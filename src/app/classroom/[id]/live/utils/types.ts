export type Role = 'host' | 'viewer'

export type RemotePeer = {
  peerId: string
  role?: Role
}

export type SignalingServerMessage =
  | {
      type: 'joined'
      room: string
      participants: number
      peerId: string
      role?: Role
      peers?: RemotePeer[]
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
  | { type: 'ping'; timestamp?: number }
  | { type: 'pong' }

export type SignalPayload = {
  type: string
  target?: string
  sdp?: string
  candidate?: RTCIceCandidateInit
  [key: string]: unknown
}

export type ConnectionStatus = 'idle' | 'initializing' | 'connecting' | 'connected' | 'error'

export function isSignalPayload(value: unknown): value is SignalPayload {
  return typeof value === 'object' && value !== null && 'type' in value
}

export function isSignalingServerMessage(value: unknown): value is SignalingServerMessage {
  if (typeof value !== 'object' || value === null || !('type' in value)) {
    return false
  }

  const { type } = value as { type?: unknown }
  if (typeof type !== 'string') {
    return false
  }

  return [
    'joined',
    'left',
    'peer',
    'error',
    'ping',
    'pong'
  ].includes(type)
}
