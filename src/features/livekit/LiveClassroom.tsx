"use client"

import { useCallback, useEffect, useState } from "react"
import {
  ControlBar,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useConnectionState,
  useTracks
} from "@livekit/components-react"
import "@livekit/components-styles"
import { ConnectionState, Track } from "livekit-client"
import { Loader2, RefreshCw, ScreenShare, Video, Volume2 } from "lucide-react"
import type { TrackReference } from "@livekit/components-core"

type LiveClassroomMode = "presenter" | "viewer"

type LiveClassroomProps = {
  mode: LiveClassroomMode
  userId?: string
  userName?: string
  roomHint?: string
}

type TokenRequestPayload = {
  userId?: string
  userName?: string
  roomHint?: string
}

type TokenResponse = {
  token: string
  url: string
  room: string
  identity: string
  role: string
}

type Status = "idle" | "loading" | "ready" | "connecting" | "connected" | "error"

const makeTrackKey = (track: TrackReference) =>
  track.publication?.trackSid ?? `${track.participant.identity}-${track.source}`

const MODE_LABEL: Record<LiveClassroomMode, string> = {
  presenter: "Guru / Presenter",
  viewer: "Siswa / Penonton"
}

const STATUS_LABEL: Record<Status, string> = {
  idle: "Menunggu",
  loading: "Meminta akses...",
  ready: "Siap terhubung",
  connecting: "Menghubungkan...",
  connected: "Terhubung",
  error: "Terjadi kesalahan"
}

const statusColor: Record<Status, string> = {
  idle: "text-slate-500",
  loading: "text-blue-500",
  ready: "text-amber-500",
  connecting: "text-blue-600",
  connected: "text-emerald-600",
  error: "text-red-600"
}

const connectionColor: Record<ConnectionState, string> = {
  [ConnectionState.Connecting]: "text-blue-500",
  [ConnectionState.Connected]: "text-emerald-600",
  [ConnectionState.SignalReconnecting]: "text-amber-500",
  [ConnectionState.Reconnecting]: "text-amber-500",
  [ConnectionState.Disconnected]: "text-slate-500"
}

const connectionLabel: Record<ConnectionState, string> = {
  [ConnectionState.Connecting]: "Menghubungkan...",
  [ConnectionState.Connected]: "Terhubung",
  [ConnectionState.SignalReconnecting]: "Menghubungkan ulang sinyal...",
  [ConnectionState.Reconnecting]: "Mencoba kembali...",
  [ConnectionState.Disconnected]: "Terputus"
}

const fetchToken = async (
  mode: LiveClassroomMode,
  body: TokenRequestPayload
): Promise<TokenResponse> => {
  const response = await fetch("/api/livekit/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      ...body,
      role: mode === "presenter" ? "guru" : "siswa"
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `Gagal mendapatkan token (status ${response.status})`)
  }

  return (await response.json()) as TokenResponse
}

export function LiveClassroom({ mode, userId, userName, roomHint }: LiveClassroomProps) {
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string | null>(null)
  const [tokenData, setTokenData] = useState<TokenResponse | null>(null)
  const [volume, setVolume] = useState(0.85)
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    ConnectionState.Disconnected
  )

  const refreshToken = useCallback(async () => {
    setStatus("loading")
    setError(null)

    try {
      const data = await fetchToken(mode, {
        userId,
        userName,
        roomHint
      })

      setTokenData(data)
      setStatus("ready")
    } catch (tokenError) {
      console.error("[livekit] failed to fetch token", tokenError)
      setError(
        tokenError instanceof Error
          ? tokenError.message
          : "Gagal menghubungkan ke server LiveKit"
      )
      setStatus("error")
    }
  }, [mode, roomHint, userId, userName])

  useEffect(() => {
    refreshToken()
  }, [refreshToken])

  useEffect(() => {
    if (connectionState === ConnectionState.Connecting) {
      setStatus("connecting")
    } else if (connectionState === ConnectionState.Connected) {
      setStatus("connected")
    } else if (connectionState === ConnectionState.SignalReconnecting) {
      setStatus("connecting")
    } else if (connectionState === ConnectionState.Reconnecting) {
      setStatus("connecting")
    } else if (connectionState === ConnectionState.Disconnected && tokenData) {
      setStatus("ready")
    }
  }, [connectionState, tokenData])

  const connectionDetails = {
    identity: tokenData?.identity,
    room: tokenData?.room ?? roomHint ?? "gema-classroom",
    role: tokenData?.role ?? mode
  }

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Mode {MODE_LABEL[mode]}
            </p>
            <h3 className="text-xl font-bold text-slate-900">Live Classroom</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              {connectionDetails.room}
            </div>
            <div className={`rounded-full px-3 py-1 text-sm font-semibold ${statusColor[status]}`}>
              {STATUS_LABEL[status]}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
          {connectionDetails.identity && (
            <span className="rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-700">
              ID: {connectionDetails.identity}
            </span>
          )}
          <span className="rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-700">
            Peran: {MODE_LABEL[mode]}
          </span>
          <span className={`rounded-md px-2 py-1 font-medium ${connectionColor[connectionState]}`}>
            {connectionLabel[connectionState]}
          </span>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">Tidak dapat terhubung ke LiveKit</p>
            <p className="mt-1">{error}</p>
            <button
              type="button"
              onClick={refreshToken}
              className="mt-3 inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-red-700"
            >
              <RefreshCw className="h-4 w-4" /> Coba lagi
            </button>
          </div>
        )}

        <div className="relative min-h-[360px] w-full overflow-hidden rounded-2xl bg-slate-900 text-white">
          {!tokenData && status !== "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
              <p className="text-sm text-slate-300">Mempersiapkan LiveKit room...</p>
            </div>
          )}

          {tokenData && (
            <LiveKitRoom
              data-lk-theme="default"
              serverUrl={tokenData.url}
              token={tokenData.token}
              connect={Boolean(tokenData)}
              video={mode === "presenter"}
              audio={mode === "presenter"}
              options={{
                adaptiveStream: true,
                dynacast: true,
                publishDefaults: {
                  simulcast: true
                }
              }}
              connectOptions={{
                autoSubscribe: true
              }}
              onDisconnected={() => setStatus("ready")}
              onError={(livekitError) => {
                console.error("[livekit] room error", livekitError)
                setError(livekitError?.message ?? "Terjadi kesalahan pada koneksi LiveKit")
                setStatus("error")
              }}
            >
              <ConnectionStateWatcher onChange={setConnectionState} />
              <div className="flex h-full w-full flex-col">
                <div className="flex-1 overflow-hidden">
                  <ClassroomTracks mode={mode} />
                </div>

                {mode === "viewer" ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/70 px-4 py-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-2 text-slate-200">
                        <Video className="h-4 w-4" />
                        <span>Tayangan langsung</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-200">
                        <ScreenShare className="h-4 w-4" />
                        <span>Berbagi layar otomatis</span>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-slate-200">
                      <Volume2 className="h-4 w-4" />
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={volume}
                        onChange={(event) => setVolume(Number(event.target.value))}
                        className="h-1 w-40 cursor-pointer appearance-none rounded-full bg-slate-600"
                      />
                    </label>
                  </div>
                ) : (
                  <ControlBar
                    variation="minimal"
                    className="border-t border-slate-800/40 bg-slate-950/60"
                  />
                )}
              </div>

              <RoomAudioRenderer volume={volume} />
            </LiveKitRoom>
          )}
        </div>
      </div>
    </div>
  )
}

type ConnectionStateWatcherProps = {
  onChange: (state: ConnectionState) => void
}

function ConnectionStateWatcher({ onChange }: ConnectionStateWatcherProps) {
  const state = useConnectionState()

  useEffect(() => {
    onChange(state)
  }, [onChange, state])

  return null
}

type ClassroomTracksProps = {
  mode: LiveClassroomMode
}

function ClassroomTracks({ mode }: ClassroomTracksProps) {
  const screenShareTracks = useTracks([Track.Source.ScreenShare], {
    onlySubscribed: mode === "viewer"
  })
  const cameraTracks = useTracks([Track.Source.Camera], {
    onlySubscribed: mode === "viewer"
  })

  if (screenShareTracks.length === 0 && cameraTracks.length === 0) {
    return (
      <div className="grid h-full w-full gap-2 p-2 md:grid-cols-2">
        <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl border border-slate-800/40 bg-slate-900/60 p-6 text-center text-sm text-slate-200">
          <Video className="mb-2 h-5 w-5" />
          <p>Menunggu presenter menyalakan kamera atau berbagi layar.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid h-full w-full gap-2 p-2 md:grid-cols-2">
      {screenShareTracks.map((track) => (
        <div key={makeTrackKey(track)} className="col-span-full">
          <ParticipantTile trackRef={track} className="!bg-slate-950/70" />
        </div>
      ))}
      {cameraTracks.map((track) => (
        <div
          key={makeTrackKey(track)}
          className={screenShareTracks.length > 0 ? "col-span-1" : "col-span-full"}
        >
          <ParticipantTile trackRef={track} className="!bg-slate-900/70" />
        </div>
      ))}
    </div>
  )
}
