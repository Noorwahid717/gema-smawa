export type LivekitGrantConfig = {
  roomJoin: boolean
  roomCreate: boolean
  canPublish: boolean
  canSubscribe: boolean
  canPublishData: boolean
}

const PRESENTER_ROLES = new Set([
  'admin',
  'super_admin',
  'guru',
  'teacher',
  'presenter'
])

const STUDENT_ROLES = new Set(['student', 'siswa', 'viewer'])

const sanitizeSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')

export const mapRoleToGrants = (role?: string): LivekitGrantConfig => {
  const normalized = role?.trim().toLowerCase() ?? ''

  if (PRESENTER_ROLES.has(normalized)) {
    return {
      roomJoin: true,
      roomCreate: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true
    }
  }

  if (STUDENT_ROLES.has(normalized)) {
    return {
      roomJoin: true,
      roomCreate: false,
      canPublish: false,
      canSubscribe: true,
      canPublishData: true
    }
  }

  return {
    roomJoin: true,
    roomCreate: false,
    canPublish: false,
    canSubscribe: true,
    canPublishData: false
  }
}

export const getLivekitGrantsByRole = mapRoleToGrants

export const makeRoomName = (eventId?: string) => {
  const prefix = process.env.LIVEKIT_ROOM_PREFIX?.trim() || 'gema'
  const base = eventId ? sanitizeSlug(eventId) : 'classroom'
  const roomSlug = base.length > 0 ? base : 'classroom'
  const prefixSlug = sanitizeSlug(prefix) || 'gema'
  return `${prefixSlug}-${roomSlug}`
}
