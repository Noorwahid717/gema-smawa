'use client'

import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Monitor,
  Play,
  ScreenShare,
  ScreenShareOff,
  Square,
  UploadCloud,
  Users,
  Video
} from 'lucide-react'

import { studentAuth } from '@/lib/student-auth'
import { useRecorder } from '@/hooks/useRecorder'
import { uploadRecordingToCloudinary } from '@/lib/cloudinaryUpload'

import { createSignaling } from './utils/signaling'
import { resolveIceServers } from './utils/iceServers'
import {
  ConnectionStatus,
  Role,
  SignalingServerMessage,
  isSignalPayload
} from './utils/types'
import { createDebugLogger } from './utils/debug'

const authLog = createDebugLogger('auth')
const lifecycleLog = createDebugLogger('lifecycle')
const mediaLog = createDebugLogger('media')
const networkLog = createDebugLogger('network')
const recorderLog = createDebugLogger('recorder')
const stateLog = createDebugLogger('state')

type VideoPreviewProps = {
  stream: MediaStream | null
  muted?: boolean
  label: string
  placeholder?: string
}

export default function LiveClassroomPage() {
  const params = useParams<{ id: string }>()
  const classroomIdParam = Array.isArray(params?.id) ? params.id[0] : params?.id
  const roomId = classroomIdParam || ''
  const { data: authSession, status: authStatus } = useSession()
  const [studentSession, setStudentSession] = useState<ReturnType<typeof studentAuth.getSession> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const session = studentAuth.getSession()
    setStudentSession(session)
    setIsLoading(false)

    authLog.info('Auth session state', {
      authStatus,
      authSessionFull: authSession,
      authSessionUser: authSession?.user,
      authSessionUserRole: authSession?.user?.role,
      studentSession: session,
      isAdmin: authSession?.user?.role === 'ADMIN' || authSession?.user?.role === 'SUPER_ADMIN',
      cookies: document.cookie
    })
  }, [authSession, authStatus])

  const isAdmin = authSession?.user?.role === 'ADMIN' || authSession?.user?.role === 'SUPER_ADMIN'
  const isAuthenticated = isAdmin || !!studentSession

  if (!roomId) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-2">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <p className="text-lg font-semibold">Classroom tidak ditemukan</p>
        </div>
      </div>
    )
  }

  if (authStatus === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-2">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-500" />
          <p className="text-lg font-semibold">Memeriksa autentikasi...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4">
          <AlertCircle className="mx-auto h-12 w-12 text-yellow-400" />
          <h1 className="text-2xl font-semibold">Masuk untuk bergabung</h1>
          <p className="text-slate-300">
            Siaran langsung hanya dapat diakses oleh guru (admin) dan siswa yang sudah masuk.
            Silakan login terlebih dahulu untuk melanjutkan.
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <a
              href="/admin/login"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Login Admin
            </a>
            <a
              href="/student/login"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Login Siswa
            </a>
          </div>
        </div>
      </div>
    )
  }

  const role: Role = isAdmin ? 'host' : 'viewer'

  return (
    <LiveRoom
      key={role}
      roomId={roomId}
      role={role}
      viewerName={studentSession?.fullName}
    />
  )
}

function LiveRoom({
  roomId,
  role,
  viewerName
}: {
  roomId: string
  role: Role
  viewerName?: string
}) {
  const [clientId] = useState(() =>
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  )
  const clientIdRef = useRef(clientId)
  const signalingRef = useRef<ReturnType<typeof createSignaling> | null>(null)
  const isMountedRef = useRef(true)
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map())
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map())
  const localStreamRef = useRef<MediaStream | null>(null)
  const cameraStreamRef = useRef<MediaStream | null>(null)
  const cameraVideoTrackRef = useRef<MediaStreamTrack | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const viewerPeerRef = useRef<RTCPeerConnection | null>(null)
  const hostPeerIdRef = useRef<string | null>(null)

  const [sessionId, setSessionId] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle')
  const [statusMessage, setStatusMessage] = useState('Kelas belum dimulai')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLive, setIsLive] = useState(false)
  const [viewerCount, setViewerCount] = useState(0)
  const [localPreviewStream, setLocalPreviewStream] = useState<MediaStream | null>(null)
  const [remotePreviewStream, setRemotePreviewStream] = useState<MediaStream | null>(null)
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null)
  const [isSharingScreen, setIsSharingScreen] = useState(false)

  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null)

  const iceServers = useMemo(resolveIceServers, [])

  const {
    startRecording,
    stopRecording,
    isRecording,
    isProcessing: isProcessingRecording,
    error: recorderError,
    reset: resetRecorder
  } = useRecorder()

  useEffect(() => {
    if (recorderError) {
      setErrorMessage(recorderError)
    }
  }, [recorderError])

  useEffect(() => {
    stateLog.info('Connection state updated', { connectionStatus, statusMessage, errorMessage })
  }, [connectionStatus, statusMessage, errorMessage])

  useEffect(() => {
    stateLog.info('Session metrics updated', {
      isLive,
      viewerCount,
      sessionId,
      isSharingScreen
    })
  }, [isLive, isSharingScreen, sessionId, viewerCount])

  useEffect(() => {
    if (localVideoRef.current && localPreviewStream) {
      localVideoRef.current.srcObject = localPreviewStream
    }
  }, [localPreviewStream])

  useEffect(() => {
    if (remoteVideoRef.current && remotePreviewStream) {
      remoteVideoRef.current.srcObject = remotePreviewStream
    }
  }, [remotePreviewStream])

  const updateRemotePreview = useCallback(() => {
    const streams = Array.from(remoteStreamsRef.current.values())
    setRemotePreviewStream(streams[0] ?? null)
  }, [])

  const cleanupPeer = useCallback(
    (peerId: string) => {
      const peer = peersRef.current.get(peerId)
      if (peer) {
        try {
          peer.onicecandidate = null
          peer.ontrack = null
          peer.onconnectionstatechange = null
          peer.close()
        } catch (error) {
          mediaLog.warn('Failed to close peer connection', { error, peerId })
        }
        peersRef.current.delete(peerId)
      }
      remoteStreamsRef.current.delete(peerId)
      updateRemotePreview()
    },
    [updateRemotePreview]
  )

  const teardownConnections = useCallback(() => {
    const controller = signalingRef.current
    if (controller) {
      try {
        controller.send({
          type: 'leave',
          room: roomId,
          peerId: clientIdRef.current
        })
      } catch {}
      controller.close()
    }
    signalingRef.current = null

    peersRef.current.forEach((_, peerId) => {
      cleanupPeer(peerId)
    })
    peersRef.current.clear()

    if (viewerPeerRef.current) {
      try {
        viewerPeerRef.current.ontrack = null
        viewerPeerRef.current.onicecandidate = null
        viewerPeerRef.current.onconnectionstatechange = null
        viewerPeerRef.current.close()
      } catch (error) {
        mediaLog.warn('Failed to close viewer peer', { error, peerId: 'viewerPeer' })
      }
      viewerPeerRef.current = null
    }

    remoteStreamsRef.current.clear()
    setRemotePreviewStream(null)

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop())
      screenStreamRef.current = null
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
    }

    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop())
      cameraStreamRef.current = null
    }

    cameraVideoTrackRef.current = null
    setLocalPreviewStream(null)
    setIsSharingScreen(false)
    resetRecorder()
  }, [cleanupPeer, resetRecorder, roomId])

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      teardownConnections()
    }
  }, [teardownConnections])

  const sendSignal = useCallback(
    (payload: Record<string, unknown>) => {
      const controller = signalingRef.current
      if (!controller) return

      const target = typeof payload.target === 'string' ? (payload.target as string) : undefined

      controller.send({
        type: 'signal',
        room: roomId,
        from: clientIdRef.current,
        to: target,
        payload: { ...payload }
      })
    },
    [roomId]
  )

  const handlePeerJoin = useCallback(
    async (viewerId: string) => {
      if (!localStreamRef.current) {
        mediaLog.warn('No local stream available for new peer', { viewerId })
        return
      }

      let peer = peersRef.current.get(viewerId)
      if (!peer) {
        peer = new RTCPeerConnection({ iceServers })
        peersRef.current.set(viewerId, peer)

        localStreamRef.current.getTracks().forEach((track) => {
          peer?.addTrack(track, localStreamRef.current as MediaStream)
        })

        peer.onicecandidate = (event) => {
          if (event.candidate) {
            sendSignal({
              type: 'ice',
              target: viewerId,
              candidate: event.candidate.toJSON()
            })
          }
        }

        peer.onconnectionstatechange = () => {
          if (peer && ['failed', 'disconnected', 'closed'].includes(peer.connectionState)) {
            cleanupPeer(viewerId)
          }
        }

        peer.ontrack = (event) => {
          if (event.streams[0]) {
            remoteStreamsRef.current.set(viewerId, event.streams[0])
            updateRemotePreview()
          }
        }
      }

      try {
        const offer = await peer.createOffer()
        await peer.setLocalDescription(offer)
        sendSignal({
          type: 'offer',
          target: viewerId,
          sdp: offer.sdp
        })
      } catch (error) {
        mediaLog.error('Failed to create/send offer', { error, viewerId })
        setErrorMessage('Gagal mengirim offer kepada peserta')
      }
    },
    [cleanupPeer, iceServers, sendSignal, updateRemotePreview]
  )

  const handleHostMessage = useCallback(
    async (message: SignalingServerMessage) => {
      switch (message.type) {
        case 'joined': {
          if (message.peerId === clientIdRef.current) {
            setErrorMessage(null)
            setConnectionStatus('connected')
            setStatusMessage('Siaran langsung siap. Undang siswa untuk bergabung.')
            const viewerPeers = (message.peers ?? []).filter(
              (peer) => peer.peerId !== clientIdRef.current && (peer.role ?? 'viewer') === 'viewer'
            )
            setViewerCount(viewerPeers.length)
            await Promise.all(viewerPeers.map((peer) => handlePeerJoin(peer.peerId)))
          } else if ((message.role ?? 'viewer') === 'viewer') {
            const nextCount = Math.max(0, message.participants - 1)
            setViewerCount(nextCount)
            setStatusMessage('Peserta baru bergabung ke kelas')
            if (!peersRef.current.has(message.peerId)) {
              await handlePeerJoin(message.peerId)
            }
          }
          break
        }
        case 'left': {
          if (message.peerId === clientIdRef.current) break
          if ((message.role ?? 'viewer') === 'viewer') {
            cleanupPeer(message.peerId)
            setViewerCount(Math.max(0, message.participants - 1))
            setStatusMessage('Seorang peserta meninggalkan kelas')
          }
          break
        }
        case 'peer': {
          const payload = message.payload
          if (!isSignalPayload(payload)) break

          if (payload.type === 'answer' && payload.target === clientIdRef.current) {
            if (typeof payload.sdp !== 'string') break
            const peer = peersRef.current.get(message.from)
            if (!peer) {
              networkLog.warn('Peer not found for answer', { from: message.from })
              break
            }
            try {
              await peer.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: payload.sdp }))
            } catch (error) {
              mediaLog.error('Failed to set remote description (answer)', { error, from: message.from })
            }
            break
          }

          if (payload.type === 'ice' && payload.target === clientIdRef.current) {
            const peer = peersRef.current.get(message.from)
            if (!peer) break
            try {
              await peer.addIceCandidate(new RTCIceCandidate(payload.candidate as RTCIceCandidateInit))
            } catch (error) {
              mediaLog.error('Failed to add ICE candidate', { error, from: message.from })
            }
          }
          break
        }
        case 'error': {
          setErrorMessage(message.message)
          break
        }
      }
    },
    [cleanupPeer, handlePeerJoin]
  )

  const handleViewerMessage = useCallback(
    async (message: SignalingServerMessage) => {
      switch (message.type) {
        case 'joined': {
          if (message.peerId === clientIdRef.current) {
            setErrorMessage(null)
            setConnectionStatus('connected')
            setViewerCount(Math.max(0, message.participants - 1))
            const hostPeer = (message.peers ?? []).find((peer) => (peer.role ?? 'viewer') === 'host')
            hostPeerIdRef.current = hostPeer?.peerId ?? hostPeerIdRef.current
            setStatusMessage(hostPeer ? 'Menunggu stream dari guru...' : 'Guru belum bergabung ke kelas')
          } else if ((message.role ?? 'viewer') === 'host') {
            hostPeerIdRef.current = message.peerId
            setStatusMessage('Guru bergabung, menunggu stream...')
          } else if (message.peerId !== clientIdRef.current && (message.role ?? 'viewer') === 'viewer') {
            setViewerCount(Math.max(0, message.participants - 1))
          }
          break
        }
        case 'peer': {
          const payload = message.payload
          if (!isSignalPayload(payload)) break

          if (payload.type === 'offer' && payload.target === clientIdRef.current) {
            try {
              if (typeof payload.sdp !== 'string') break
              hostPeerIdRef.current = message.from
              let peer = viewerPeerRef.current
              if (!peer) {
                peer = new RTCPeerConnection({ iceServers })
                viewerPeerRef.current = peer

                peer.onicecandidate = (event) => {
                  if (event.candidate) {
                    sendSignal({
                      type: 'ice',
                      target: message.from,
                      candidate: event.candidate.toJSON()
                    })
                  }
                }

                peer.ontrack = (event) => {
                  if (event.streams[0]) {
                    setRemotePreviewStream(event.streams[0])
                    setStatusMessage('Terhubung dengan guru')
                  }
                }

                peer.onconnectionstatechange = () => {
                  if (!viewerPeerRef.current) return
                  if (['failed', 'disconnected'].includes(viewerPeerRef.current.connectionState)) {
                    setStatusMessage('Koneksi ke guru terputus. Mencoba kembali...')
                  }
                }
              }

              await peer.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: payload.sdp }))
              const answer = await peer.createAnswer()
              await peer.setLocalDescription(answer)
              sendSignal({
                type: 'answer',
                target: message.from,
                sdp: answer.sdp
              })
            } catch (error) {
              mediaLog.error('Failed to handle offer', { error, from: message.from })
              setErrorMessage('Gagal menerima stream dari guru')
            }
          }

          if (payload.type === 'ice' && payload.target === clientIdRef.current) {
            if (!viewerPeerRef.current) break
            try {
              await viewerPeerRef.current.addIceCandidate(
                new RTCIceCandidate(payload.candidate as RTCIceCandidateInit)
              )
            } catch (error) {
              mediaLog.error('Failed to add ICE candidate (viewer)', { error, from: message.from })
            }
          }
          break
        }
        case 'left': {
          if (message.peerId === hostPeerIdRef.current) {
            setStatusMessage('Guru keluar dari sesi. Menunggu untuk bergabung kembali...')
            hostPeerIdRef.current = null
            setRemotePreviewStream(null)
            if (viewerPeerRef.current) {
              try {
                viewerPeerRef.current.ontrack = null
                viewerPeerRef.current.onicecandidate = null
                viewerPeerRef.current.onconnectionstatechange = null
                viewerPeerRef.current.close()
              } catch (error) {
                mediaLog.warn('Failed to close viewer peer on host leave', { error })
              }
              viewerPeerRef.current = null
            }
          }
          if (message.peerId !== clientIdRef.current && (message.role ?? 'viewer') === 'viewer') {
            setViewerCount(Math.max(0, message.participants - 1))
          }
          break
        }
        case 'error': {
          setErrorMessage(message.message)
          break
        }
      }
    },
    [iceServers, sendSignal]
  )

  const connectSignaling = useCallback(
    () =>
      new Promise<void>((resolve, reject) => {
        if (typeof window === 'undefined') {
          reject(new Error('WebSocket hanya tersedia di browser'))
          return
        }

        if (signalingRef.current) {
          resolve()
          return
        }

        let settled = false
        const settleResolve = () => {
          if (!settled) {
            settled = true
            resolve()
          }
        }
        const settleReject = (error: Error) => {
          if (!settled) {
            settled = true
            reject(error)
          }
        }

        try {
          const controller = createSignaling({
            room: roomId,
            peerId: clientIdRef.current,
            role,
            onMessage: (data) => {
              if (!isMountedRef.current) return
              try {
                const parsed = data
                if (parsed.type === 'pong') {
                  return
                }
                if (role === 'host') {
                  void handleHostMessage(parsed)
                } else {
                  void handleViewerMessage(parsed)
                }
              } catch (error) {
                networkLog.error('Failed to process signaling message', { error, data })
              }
            },
            onStatus: (status) => {
              if (!isMountedRef.current) return
              networkLog.info('Signaling status update', { status })
              switch (status) {
                case 'connecting': {
                  setConnectionStatus('connecting')
                  setStatusMessage('Menghubungkan ke server signaling...')
                  break
                }
                case 'open': {
                  setConnectionStatus('connecting')
                  if (role === 'host') {
                    setStatusMessage('Terhubung ke server signaling. Menyelaraskan peserta...')
                  } else {
                    setStatusMessage('Menghubungkan ke server signaling...')
                  }
                  settleResolve()
                  break
                }
                case 'reconnecting': {
                  setConnectionStatus('connecting')
                  setStatusMessage('Koneksi signaling terputus. Mencoba lagi...')
                  break
                }
                case 'error': {
                  setConnectionStatus('error')
                  const isLocalhost =
                    window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1'
                  if (isLocalhost) {
                    setErrorMessage(
                      'WebSocket signaling memerlukan Edge Runtime. Jalankan di Vercel atau gunakan HTTPS saat pengembangan.'
                    )
                    setStatusMessage('Koneksi signaling tidak tersedia di localhost tanpa Edge Runtime.')
                  } else {
                    setErrorMessage('Koneksi signaling mengalami gangguan. Sistem akan mencoba menyambung ulang.')
                    setStatusMessage('Koneksi signaling gagal. Menunggu percobaan ulang...')
                  }
                  settleReject(new Error('WebSocket error'))
                  break
                }
                case 'closed': {
                  if (!settled) {
                    settleReject(new Error('WebSocket closed'))
                  }
                  break
                }
              }
            }
          })
          signalingRef.current = controller
        } catch (error) {
          settleReject(error instanceof Error ? error : new Error('WebSocket error'))
        }
      }),
    [handleHostMessage, handleViewerMessage, role, roomId]
  )

  const restoreCameraTrack = useCallback(() => {
    if (!localStreamRef.current || !cameraVideoTrackRef.current) return

    const localStream = localStreamRef.current
    const videoTracks = localStream.getVideoTracks()
    videoTracks.forEach((track) => {
      localStream.removeTrack(track)
      if (screenStreamRef.current) {
        track.stop()
      }
    })

    localStream.addTrack(cameraVideoTrackRef.current)
    setLocalPreviewStream(new MediaStream(localStream.getTracks()))

    peersRef.current.forEach((peer) => {
      const sender = peer.getSenders().find((item) => item.track?.kind === 'video')
      sender?.replaceTrack(cameraVideoTrackRef.current as MediaStreamTrack)
    })

    setIsSharingScreen(false)
  }, [])

  const stopShareScreen = useCallback(() => {
    if (!isSharingScreen) return
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop())
      screenStreamRef.current = null
    }
    restoreCameraTrack()
  }, [isSharingScreen, restoreCameraTrack])

  const handleToggleShareScreen = useCallback(async () => {
    if (role !== 'host' || !localStreamRef.current) return

    if (isSharingScreen) {
      stopShareScreen()
      return
    }

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
      const screenTrack = displayStream.getVideoTracks()[0]
      if (!screenTrack) {
        setErrorMessage('Tidak dapat mengambil layar untuk dibagikan')
        return
      }

      screenStreamRef.current = displayStream
      screenTrack.onended = () => {
        stopShareScreen()
      }

      const localStream = localStreamRef.current
      localStream.getVideoTracks().forEach((track) => {
        localStream.removeTrack(track)
      })
      localStream.addTrack(screenTrack)

      setLocalPreviewStream(new MediaStream(localStream.getTracks()))
      peersRef.current.forEach((peer) => {
        const sender = peer.getSenders().find((item) => item.track?.kind === 'video')
        sender?.replaceTrack(screenTrack)
      })

      setIsSharingScreen(true)
      setStatusMessage('Berbagi layar ke peserta')
    } catch (error) {
      mediaLog.error('Failed to start screen share', { error })
      setErrorMessage('Gagal memulai share screen')
    }
  }, [isSharingScreen, role, stopShareScreen])

  const initializeLocalStream = useCallback(async () => {
    setStatusMessage('Meminta izin kamera & mikrofon...')
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    cameraStreamRef.current = stream
    cameraVideoTrackRef.current = stream.getVideoTracks()[0] ?? null
    localStreamRef.current = stream
    setLocalPreviewStream(new MediaStream(stream.getTracks()))
  }, [])

  const handleStartClass = useCallback(async () => {
    if (role !== 'host' || isLive) return

    try {
      setErrorMessage(null)
      setConnectionStatus('initializing')
      await initializeLocalStream()

      setStatusMessage('Mempersiapkan sesi live...')
      const startResponse = await fetch(`/api/classroom/${roomId}/session/start`, { method: 'POST' })
      if (!startResponse.ok) throw new Error('Gagal membuat sesi live')

      const payload = (await startResponse.json()) as { session: { id: string } }
      setSessionId(payload.session.id)

      await connectSignaling()
      setIsLive(true)
      setStatusMessage('Siaran dimulai. Siswa dapat bergabung sekarang.')
    } catch (error) {
      lifecycleLog.error('Failed to start class', { error, roomId })
      setConnectionStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Gagal memulai kelas langsung')
      teardownConnections()
      setIsLive(false)
      setSessionId(null)
    }
  }, [connectSignaling, initializeLocalStream, isLive, role, roomId, teardownConnections])

  const finalizeSession = useCallback(
    async (recordUrl?: string | null) => {
      if (!sessionId) return
      try {
        await fetch(`/api/classroom/${roomId}/session/end`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, recordingUrl: recordUrl ?? recordingUrl ?? null })
        })
      } catch (error) {
        networkLog.error('Failed to finalize session', { error, sessionId, roomId })
        setErrorMessage('Sesi berakhir, tetapi gagal menyimpan status ke server')
      }
    },
    [recordingUrl, roomId, sessionId]
  )

  const handleStopRecording = useCallback(async () => {
    if (role !== 'host' || !isRecording) return
    try {
      const blob = await stopRecording()
      if (blob) {
        setStatusMessage('Mengunggah rekaman ke Cloudinary...')
        const upload = await uploadRecordingToCloudinary(blob, {
          folder: `gema-classroom/${roomId}`,
          fileName: `classroom-${roomId}-${Date.now()}.webm`
        })
        setRecordingUrl(upload.secureUrl)
        setStatusMessage('Rekaman berhasil disimpan')
      }
    } catch (error) {
      recorderLog.error('Failed to stop recording', { error })
      setErrorMessage('Gagal menyimpan rekaman')
    }
  }, [isRecording, role, roomId, stopRecording])

  const handleEndClass = useCallback(async () => {
    if (role !== 'host' || !isLive) return
    try {
      setStatusMessage('Mengakhiri sesi live...')
      if (isRecording) {
        await handleStopRecording()
      }
      await finalizeSession()
    } finally {
      teardownConnections()
      setIsLive(false)
      setViewerCount(0)
      setSessionId(null)
      setConnectionStatus('idle')
      setStatusMessage('Kelas telah diakhiri')
    }
  }, [finalizeSession, handleStopRecording, isLive, isRecording, role, teardownConnections])

  const handleStartRecording = useCallback(async () => {
    if (role !== 'host' || !localStreamRef.current || isRecording) return
    try {
      await startRecording(localStreamRef.current)
      setStatusMessage('Perekaman dimulai')
      setErrorMessage(null)
    } catch (error) {
      recorderLog.error('Failed to start recording', { error })
      setErrorMessage('Gagal memulai perekaman')
    }
  }, [isRecording, role, startRecording])

  const handleJoinClass = useCallback(async () => {
    if (role !== 'viewer') return
    try {
      setErrorMessage(null)
      setStatusMessage('Menghubungkan ke kelas...')
      await connectSignaling()
    } catch (error) {
      networkLog.error('Failed to join class', { error, roomId })
      setErrorMessage('Tidak dapat terhubung ke sesi live')
    }
    }, [connectSignaling, role, roomId])

  const statusLabel = useMemo(() => {
    switch (connectionStatus) {
      case 'initializing':
        return 'Menyiapkan...'
      case 'connecting':
        return 'Menghubungkan'
      case 'connected':
        return 'Terhubung'
      case 'error':
        return 'Kesalahan'
      default:
        return 'Idle'
    }
  }, [connectionStatus])

  const statusClass = useMemo(() => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/40'
      case 'connecting':
      case 'initializing':
        return 'bg-amber-500/10 text-amber-300 border border-amber-500/40'
      case 'error':
        return 'bg-red-500/10 text-red-300 border border-red-500/40'
      default:
        return 'bg-slate-700/40 text-slate-300 border border-slate-600/60'
    }
  }, [connectionStatus])

  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
        {/* Local Development Warning */}
        {isLocalhost && (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-300 mb-1">
                  ⚠️ Mode Development - WebSocket Tidak Tersedia
                </h3>
                <p className="text-sm text-amber-200/90 mb-2">
                  Live Streaming menggunakan WebSocket Edge Runtime yang <strong>hanya bekerja di production</strong> (Vercel/Cloudflare).
                </p>
                <p className="text-sm text-amber-200/90">
                  Untuk menggunakan fitur Live Classroom secara penuh, deploy aplikasi ke Vercel:
                </p>
                <code className="block mt-2 px-3 py-1.5 bg-slate-900/50 rounded text-xs text-amber-300 border border-amber-500/20">
                  vercel --prod
                </code>
              </div>
            </div>
          </div>
        )}

        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Video className="h-5 w-5 text-sky-400" />
              <span>Classroom ID: {roomId}</span>
            </div>
            <h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold">
              Live Classroom
              <span className="rounded-full bg-sky-500/10 px-3 py-1 text-sm font-medium text-sky-300">
                {role === 'host' ? 'Mode Guru' : 'Mode Siswa'}
              </span>
            </h1>
            <p className="mt-1 text-slate-300">
              {role === 'host'
                ? 'Mulai siaran langsung dan hubungkan siswa secara real-time.'
                : viewerName
                ? `Halo ${viewerName}, klik "Join Class" untuk mulai menonton.`
                : 'Klik "Join Class" untuk mulai menonton siaran guru secara langsung.'}
            </p>
          </div>
          <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${statusClass}`}>
            <Monitor className="h-4 w-4" />
            <span>{statusLabel}</span>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {role === 'host' ? (
              <div className="space-y-6">
                <VideoPreview
                  ref={localVideoRef}
                  stream={localPreviewStream}
                  muted
                  label="Preview Guru"
                  placeholder="Mulai kelas untuk melihat pratinjau kamera"
                />
                <VideoPreview
                  ref={remoteVideoRef}
                  stream={remotePreviewStream}
                  label="Preview Peserta"
                  placeholder="Peserta akan muncul di sini ketika terhubung"
                />
              </div>
            ) : (
              <VideoPreview
                ref={remoteVideoRef}
                stream={remotePreviewStream}
                label="Live dari Guru"
                placeholder="Menunggu guru memulai siaran"
              />
            )}

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex items-center gap-3 text-slate-300">
                <Users className="h-5 w-5 text-sky-400" />
                <span className="text-sm">Viewer saat ini: {viewerCount}</span>
              </div>
              <p className="mt-4 text-sm text-slate-300">{statusMessage}</p>
              {errorMessage && (
                <div className="mt-4 flex items-center gap-3 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
                  <AlertCircle className="h-5 w-5" />
                  <span>{errorMessage}</span>
                </div>
              )}
              {recordingUrl && (
                <div className="mt-4 flex items-center gap-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                  <CheckCircle2 className="h-5 w-5" />
                  <a href={recordingUrl} target="_blank" rel="noreferrer" className="underline">
                    Rekaman tersedia di Cloudinary
                  </a>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold">Kontrol</h2>
              <div className="mt-4 flex flex-col gap-3">
                {role === 'host' ? (
                  <>
                    <button
                      onClick={handleStartClass}
                      disabled={isLive || connectionStatus === 'initializing'}
                      className="flex items-center justify-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-600"
                    >
                      <Play className="h-4 w-4" /> Mulai Kelas
                    </button>
                    <button
                      onClick={handleEndClass}
                      disabled={!isLive}
                      className="flex items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:bg-slate-600"
                    >
                      <Square className="h-4 w-4" /> Akhiri Kelas
                    </button>
                    <button
                      onClick={handleToggleShareScreen}
                      disabled={!isLive}
                      className="flex items-center justify-center gap-2 rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:bg-slate-600"
                    >
                      {isSharingScreen ? (
                        <>
                          <ScreenShareOff className="h-4 w-4" /> Berhenti Bagikan Layar
                        </>
                      ) : (
                        <>
                          <ScreenShare className="h-4 w-4" /> Bagikan Layar
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleStartRecording}
                      disabled={!isLive || isRecording || isProcessingRecording}
                      className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-600"
                    >
                      <UploadCloud className="h-4 w-4" /> Mulai Rekam
                    </button>
                    <button
                      onClick={handleStopRecording}
                      disabled={!isRecording}
                      className="flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-600"
                    >
                      <Square className="h-4 w-4" /> Simpan Rekaman
                    </button>
                    {isProcessingRecording && (
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Loader2 className="h-4 w-4 animate-spin" /> Memproses rekaman...
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    onClick={handleJoinClass}
                    disabled={connectionStatus === 'connecting' || connectionStatus === 'connected'}
                    className="flex items-center justify-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-600"
                  >
                    {connectionStatus === 'connecting' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    {connectionStatus === 'connected' ? 'Sudah Terhubung' : 'Join Class'}
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300">
              <h3 className="text-base font-semibold text-white">Catatan</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>Gunakan headphone untuk menghindari feedback audio.</li>
                <li>Stabilkan koneksi internet sebelum memulai siaran.</li>
                <li>Rekaman akan otomatis diunggah setelah tombol simpan ditekan.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

const VideoPreview = forwardRef<HTMLVideoElement, VideoPreviewProps>(
  ({ stream, muted, label, placeholder }, ref) => {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-slate-300">
          <span className="font-medium text-white">{label}</span>
          {stream ? (
            <span className="flex items-center gap-2 text-emerald-300">
              <CheckCircle2 className="h-4 w-4" /> Aktif
            </span>
          ) : (
            <span className="text-slate-400">Menunggu sinyal...</span>
          )}
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-black/60">
          <video
            ref={ref}
            className="aspect-video w-full bg-black"
            playsInline
            autoPlay
            muted={muted ?? false}
          />
          {!stream && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Video className="h-10 w-10 text-slate-500" />
              <p className="text-center text-sm">{placeholder ?? 'Menunggu stream tersedia'}</p>
            </div>
          )}
        </div>
      </div>
    )
  }
)

VideoPreview.displayName = 'VideoPreview'
