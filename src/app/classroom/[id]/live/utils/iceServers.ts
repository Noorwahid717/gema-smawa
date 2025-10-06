import { createDebugLogger } from './debug'

const FALLBACK_STUN = [
  'stun:stun.l.google.com:19302',
  'stun:stun1.l.google.com:19302',
  'stun:stun2.l.google.com:19302',
  'stun:stun3.l.google.com:19302'
]

const iceLog = createDebugLogger('ice')

let cachedIceServers: RTCIceServer[] | null = null

export function sanitizeStunEnv(rawValue: string): string {
  const trimmed = rawValue.trim()
  if (!trimmed.length) return trimmed
  const withoutWrappingQuotes = trimmed.replace(/^['"]|['"]$/g, '')
  return withoutWrappingQuotes
}

function normalizeStunConfig(rawValue: string): string[] {
  const sanitized = sanitizeStunEnv(rawValue)
  if (!sanitized) {
    return []
  }

  try {
    const parsed = JSON.parse(sanitized)
    const entries = Array.isArray(parsed) ? parsed : [parsed]
    return entries
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .filter((entry) => entry.length > 0)
  } catch (jsonError) {
    iceLog.warn('Failed to parse STUN config as JSON, attempting comma split', {
      error: jsonError,
      value: sanitized
    })
    return sanitized
      .split(',')
      .map((segment) => segment.trim())
      .filter((segment) => segment.length > 0)
  }
}

export function resolveIceServers(): RTCIceServer[] {
  if (cachedIceServers) {
    return cachedIceServers.map((server) => ({ ...server }))
  }

  const servers: RTCIceServer[] = []
  const stunEnvRaw = process.env.NEXT_PUBLIC_STUN_URLS
  const resolvedStunUrls: string[] = []

  if (stunEnvRaw) {
    const candidateStun = normalizeStunConfig(stunEnvRaw)
    if (candidateStun.length) {
      resolvedStunUrls.push(...candidateStun)
      iceLog.info('Using STUN servers from environment', candidateStun)
    }
  }

  if (!resolvedStunUrls.length) {
    resolvedStunUrls.push(...FALLBACK_STUN)
    iceLog.info('Falling back to default STUN servers', FALLBACK_STUN)
  }

  servers.push({ urls: resolvedStunUrls })

  const turnUrl = process.env.NEXT_PUBLIC_TURN_URL
  const turnUsername = process.env.NEXT_PUBLIC_TURN_USERNAME
  const turnPassword = process.env.NEXT_PUBLIC_TURN_PASSWORD

  if (turnUrl && turnUsername && turnPassword) {
    iceLog.info('TURN configuration detected')
    servers.push({
      urls: turnUrl,
      username: turnUsername,
      credential: turnPassword
    })
  } else if (turnUrl || turnUsername || turnPassword) {
    iceLog.warn('Incomplete TURN configuration detected, ignoring credentials', {
      turnUrl,
      hasUsername: Boolean(turnUsername),
      hasPassword: Boolean(turnPassword)
    })
  }

  cachedIceServers = servers.map((server) => ({ ...server }))
  iceLog.info('Resolved ICE servers', cachedIceServers)
  return cachedIceServers.map((server) => ({ ...server }))
}
