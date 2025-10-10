import { randomUUID } from "crypto"
import { NextResponse } from "next/server"
import { AccessToken } from "livekit-server-sdk"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth-config"
import { getLivekitGrantsByRole, makeRoomName } from "@/features/livekit/utils"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN", "GURU", "TEACHER", "PRESENTER"])
const STUDENT_ROLES = new Set(["STUDENT", "SISWA"])

type TokenRequestBody = {
  role?: string
  userId?: string
  userName?: string
  roomHint?: string
  eventId?: string
}

type EffectiveRole = "presenter" | "viewer"

const normalize = (value?: string | null) => value?.toString().trim().toUpperCase() ?? ""
const sanitizeIdentity = (value: string) =>
  value
    .trim()
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")

export async function POST(request: Request) {
  const livekitUrl = process.env.LIVEKIT_URL
  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET

  if (!livekitUrl || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "LiveKit belum dikonfigurasi pada server" },
      { status: 500 }
    )
  }

  let body: TokenRequestBody | null = null

  try {
    body = (await request.json()) as TokenRequestBody
  } catch {
    return NextResponse.json({ error: "Payload tidak valid" }, { status: 400 })
  }

  const session = await getServerSession(authOptions)

  const bodyUserIdRaw = body?.userId
  const bodyUserNameRaw = body?.userName
  const bodyUserId =
    typeof bodyUserIdRaw === "string"
      ? bodyUserIdRaw.trim()
      : bodyUserIdRaw != null
        ? String(bodyUserIdRaw).trim()
        : ""
  const bodyUserName =
    typeof bodyUserNameRaw === "string"
      ? bodyUserNameRaw.trim()
      : bodyUserNameRaw != null
        ? String(bodyUserNameRaw).trim()
        : ""

  const fallbackStudent =
    (!session || !session.user) && bodyUserId && bodyUserName
      ? {
          id: bodyUserId,
          name: bodyUserName
        }
      : null

  if ((!session || !session.user) && !fallbackStudent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const sessionRole = normalize(session?.user?.role)
  const sessionUserType = normalize(session?.user?.userType)
  const requestedRole = normalize(body?.role)

  const isAdmin = ADMIN_ROLES.has(sessionRole)
  const isStudent =
    STUDENT_ROLES.has(sessionUserType) || STUDENT_ROLES.has(sessionRole) || Boolean(fallbackStudent)

  let effectiveRole: EffectiveRole = "viewer"

  if (requestedRole === "GURU" || requestedRole === "PRESENTER") {
    if (!isAdmin) {
      return NextResponse.json({ error: "Tidak memiliki izin presenter" }, { status: 403 })
    }
    effectiveRole = "presenter"
  } else if (requestedRole === "SISWA" || requestedRole === "VIEWER") {
    effectiveRole = "viewer"
  } else if (isAdmin) {
    effectiveRole = "presenter"
  } else if (isStudent) {
    effectiveRole = "viewer"
  }

  if (effectiveRole === "viewer" && !isAdmin && !isStudent) {
    return NextResponse.json({ error: "Akses live class membutuhkan akun siswa" }, { status: 403 })
  }

  const grants = getLivekitGrantsByRole(effectiveRole === "presenter" ? "presenter" : "viewer")
  const baseRoom = body?.eventId ?? body?.roomHint ?? "classroom"
  const roomName = makeRoomName(baseRoom)

  const sessionUserId = session?.user?.id ?? session?.user?.email ?? fallbackStudent?.id ?? randomUUID()
  const requestUserId = bodyUserId.length > 0 ? bodyUserId : undefined
  const rawIdentitySource = requestUserId ?? sessionUserId
  const identitySource = sanitizeIdentity(rawIdentitySource)
  const identity = `${effectiveRole}-${identitySource || randomUUID()}`.slice(0, 120)

  const sessionUserName = session?.user?.name ?? ""
  const sessionUserEmail = session?.user?.email ?? ""
  const fallbackStudentName = fallbackStudent?.name ?? ""
  const trimmedSessionName = sessionUserName.trim()

  const displayName = bodyUserName.length
    ? bodyUserName
    : fallbackStudentName.length
      ? fallbackStudentName
      : trimmedSessionName.length
        ? trimmedSessionName
        : sessionUserEmail || identity

  const token = new AccessToken(apiKey, apiSecret, {
    identity,
    ttl: 60 * 60,
    metadata: JSON.stringify({
      name: displayName,
      role: effectiveRole,
      userId: rawIdentitySource
    })
  })

  token.addGrant({
    room: roomName,
    roomJoin: grants.roomJoin,
    roomCreate: grants.roomCreate,
    canPublish: grants.canPublish,
    canSubscribe: grants.canSubscribe,
    canPublishData: grants.canPublishData
  })

  const jwt = await token.toJwt()

  return NextResponse.json({
    token: jwt,
    url: livekitUrl,
    room: roomName,
    identity,
    role: effectiveRole
  })
}
