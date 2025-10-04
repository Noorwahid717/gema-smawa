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

type Role = 'host' | 'viewer'

type ServerMessage =
  | {
      type: 'joined'
      clientId: string
      role: Role
      peers: Array<{ clientId: string; role: Role }>
    }
  | {
      type: 'peer-joined'
      clientId: string
      role: Role
    }
  | {
      type: 'peer-left'
      clientId: string
    }
  | {
      type: 'offer' | 'answer'
      clientId: string
      target: string
      sdp: string
    }
  | {
      type: 'ice'
      clientId: string
      target: string
      candidate: RTCIceCandidateInit
    }
  | {
      type: 'error'
      message: string
    }

type ConnectionStatus = 'idle' | 'initializing' | 'connecting' | 'connected' | 'error'

type VideoPreviewProps = {
  stream: MediaStream | null
  muted?: boolean
  label: string
  placeholder?: string
}

const FALLBACK_STUN = ['stun:stun.l.google.com:19302']

function resolveIceServers(): RTCIceServer[] {
  const servers: RTCIceServer[] = []
  const stunEnv = process.env.NEXT_PUBLIC_STUN_URLS

  if (stunEnv) {
    try {
      const parsed = JSON.parse(stunEnv)
      if (Array.isArray(parsed) && parsed.length) {
        servers.push({ urls: parsed })
      }
    } catch (error) {
      console.warn('Failed to parse NEXT_PUBLIC_STUN_URLS', error)
    }
  }

  if (!servers.length) {
    servers.push({ urls: FALLBACK_STUN })
  }

  const turnUrl = process.env.NEXT_PUBLIC_TURN_URL
  const turnUsername = process.env.NEXT_PUBLIC_TURN_USERNAME
  const turnPassword = process.env.NEXT_PUBLIC_TURN_PASSWORD

  if (turnUrl && turnUsername && turnPassword) {
    servers.push({
      urls: turnUrl,
      username: turnUsername,
      credential: turnPassword
    })
  }

  return servers
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
    
    // Debug logging
    console.log('🔐 Auth Debug:', {
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

  // Show loading while checking authentication
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

  // Check if user is authenticated
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
  const wsRef = useRef<WebSocket | null>(null)
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
          console.warn('Failed to close peer connection', error)
        }
        peersRef.current.delete(peerId)
      }
      remoteStreamsRef.current.delete(peerId)
      updateRemotePreview()
    },
    [updateRemotePreview]
  )

  const teardownConnections = useCallback(() => {
    wsRef.current?.close()
    wsRef.current = null

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
        console.warn('Failed to close viewer peer', error)
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
  }, [cleanupPeer, resetRecorder])

  useEffect(() => () => teardownConnections(), [teardownConnections])

  const sendSignal = useCallback(
    (payload: Record<string, unknown>) => {
      const socket = wsRef.current
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        return
      }

      socket.send(
        JSON.stringify({
          ...payload,
          roomId,
          clientId: clientIdRef.current
        })
      )
    },
    [roomId]
  )
  const handlePeerJoin = useCallback(
    async (viewerId: string) => {
      if (!localStreamRef.current) {
        console.warn('No local stream available for new peer')
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
          if (
            peer &&
            ['failed', 'disconnected', 'closed'].includes(peer.connectionState)
          ) {
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
        console.error('Failed to create/send offer', error)
        setErrorMessage('Gagal mengirim offer kepada peserta')
      }
    },
    [cleanupPeer, iceServers, sendSignal, updateRemotePreview]
  )
  const handleHostMessage = useCallback(
    async (message: ServerMessage) => {
      switch (message.type) {
        case 'joined': {
          setConnectionStatus('connected')
          setStatusMessage('Siaran langsung siap. Undang siswa untuk bergabung.')
          const viewerPeers = message.peers.filter(
            (peer) => peer.clientId !== clientIdRef.current && peer.role === 'viewer'
          )
          setViewerCount(viewerPeers.length)
          await Promise.all(viewerPeers.map((peer) => handlePeerJoin(peer.clientId)))
          break
        }
        case 'peer-joined': {
          if (message.role === 'viewer') {
            setViewerCount((count) => count + 1)
            setStatusMessage('Peserta baru bergabung ke kelas')
            await handlePeerJoin(message.clientId)
          }
          break
        }
        case 'peer-left': {
          cleanupPeer(message.clientId)
          setViewerCount((count) => Math.max(0, count - 1))
          setStatusMessage('Seorang peserta meninggalkan kelas')
          break
        }
        case 'answer': {
          const peer = peersRef.current.get(message.clientId)
          if (!peer) {
            console.warn('Peer not found for answer', message.clientId)
            break
          }
          try {
            await peer.setRemoteDescription(
              new RTCSessionDescription({ type: 'answer', sdp: message.sdp })
            )
          } catch (error) {
            console.error('Failed to set remote description (answer)', error)
          }
          break
        }
        case 'ice': {
          const peer = peersRef.current.get(message.clientId)
          if (!peer) {
            break
          }
          try {
            await peer.addIceCandidate(new RTCIceCandidate(message.candidate))
          } catch (error) {
            console.error('Failed to add ICE candidate', error)
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
    async (message: ServerMessage) => {
      switch (message.type) {
        case 'joined': {
          setConnectionStatus('connected')
          const viewers = message.peers.filter((peer) => peer.role === 'viewer')
          setViewerCount(viewers.length)
          const hostPeer = message.peers.find((peer) => peer.role === 'host')
          hostPeerIdRef.current = hostPeer?.clientId ?? null
          setStatusMessage(
            hostPeer ? 'Menunggu stream dari guru...' : 'Guru belum bergabung ke kelas'
          )
          break
        }
        case 'offer': {
          try {
            hostPeerIdRef.current = message.clientId
            let peer = viewerPeerRef.current
            if (!peer) {
              peer = new RTCPeerConnection({ iceServers })
              viewerPeerRef.current = peer

              peer.onicecandidate = (event) => {
                if (event.candidate) {
                  sendSignal({
                    type: 'ice',
                    target: message.clientId,
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
                if (!viewerPeerRef.current) {
                  return
                }
                if (
                  ['failed', 'disconnected'].includes(viewerPeerRef.current.connectionState)
                ) {
                  setStatusMessage('Koneksi ke guru terputus. Mencoba kembali...')
                }
              }
            }

            await peer.setRemoteDescription(
              new RTCSessionDescription({ type: 'offer', sdp: message.sdp })
            )
            const answer = await peer.createAnswer()
            await peer.setLocalDescription(answer)
            sendSignal({
              type: 'answer',
              target: message.clientId,
              sdp: answer.sdp
            })
          } catch (error) {
            console.error('Failed to handle offer', error)
            setErrorMessage('Gagal menerima stream dari guru')
          }
          break
        }
        case 'ice': {
          if (!viewerPeerRef.current) {
            break
          }
          try {
            await viewerPeerRef.current.addIceCandidate(
              new RTCIceCandidate(message.candidate)
            )
          } catch (error) {
            console.error('Failed to add ICE candidate (viewer)', error)
          }
          break
        }
        case 'peer-left': {
          if (message.clientId === hostPeerIdRef.current) {
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
                console.warn('Failed to close viewer peer on host leave', error)
              }
              viewerPeerRef.current = null
            }
          }
          if (message.clientId !== clientIdRef.current) {
            setViewerCount((count) => Math.max(0, count - 1))
          }
          break
        }
        case 'peer-joined': {
          if (message.role === 'viewer' && message.clientId !== clientIdRef.current) {
            setViewerCount((count) => count + 1)
          }
          if (message.role === 'host') {
            hostPeerIdRef.current = message.clientId
            setStatusMessage('Guru bergabung, menunggu stream...')
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
  const connectWebSocket = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        resolve()
        return
      }

      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
      const url = `${protocol}://${window.location.host}/api/ws`
      const socket = new WebSocket(url)
      wsRef.current = socket

      socket.onopen = () => {
        setConnectionStatus('connecting')
        socket.send(
          JSON.stringify({
            type: 'join',
            roomId,
            clientId: clientIdRef.current,
            role
          })
        )
        resolve()
      }

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as ServerMessage
          if (role === 'host') {
            void handleHostMessage(payload)
          } else {
            void handleViewerMessage(payload)
          }
        } catch (error) {
          console.error('Failed to parse signaling message', error)
        }
      }

      socket.onerror = (event) => {
        console.error('WebSocket error', event)
        setConnectionStatus('error')
        
        // Check if running on localhost
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        
        if (isLocalhost) {
          setErrorMessage('WebSocket tidak support di local development. Deploy ke Vercel untuk menggunakan Live Streaming.')
          console.warn('⚠️ WebSocket Edge Runtime hanya bekerja di production (Vercel/Cloudflare)')
          console.warn('📌 Untuk menggunakan Live Classroom, deploy aplikasi ke Vercel')
          console.warn('📌 Command: vercel --prod')
        } else {
          setErrorMessage('Koneksi signaling mengalami masalah. Coba refresh halaman.')
        }
        
        reject(new Error('WebSocket error'))
      }

      socket.onclose = () => {
        setConnectionStatus((current) => (current === 'connected' ? 'idle' : current))
        if (role === 'host') {
          setStatusMessage('Koneksi signaling ditutup')
        } else {
          setStatusMessage('Terputus dari server. Coba gabung ulang jika diperlukan.')
        }
      }
    })
  }, [handleHostMessage, handleViewerMessage, role, roomId])
  const restoreCameraTrack = useCallback(() => {
    if (!localStreamRef.current || !cameraVideoTrackRef.current) {
      return
    }

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
    if (!isSharingScreen) {
      return
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop())
      screenStreamRef.current = null
    }
    restoreCameraTrack()
  }, [isSharingScreen, restoreCameraTrack])

  const handleToggleShareScreen = useCallback(async () => {
    if (role !== 'host' || !localStreamRef.current) {
      return
    }

    if (isSharingScreen) {
      stopShareScreen()
      return
    }

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      })
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
      console.error('Failed to start screen share', error)
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
    if (role !== 'host' || isLive) {
      return
    }

    try {
      setErrorMessage(null)
      setConnectionStatus('initializing')
      await initializeLocalStream()

      setStatusMessage('Mempersiapkan sesi live...')
      const startResponse = await fetch(`/api/classroom/${roomId}/session/start`, {
        method: 'POST'
      })

      if (!startResponse.ok) {
        throw new Error('Gagal membuat sesi live')
      }

      const payload = (await startResponse.json()) as { session: { id: string } }
      setSessionId(payload.session.id)

      await connectWebSocket()
      setIsLive(true)
      setStatusMessage('Siaran dimulai. Siswa dapat bergabung sekarang.')
    } catch (error) {
      console.error('Failed to start class', error)
      setConnectionStatus('error')
      setErrorMessage(
        error instanceof Error ? error.message : 'Gagal memulai kelas langsung'
      )
      teardownConnections()
      setIsLive(false)
      setSessionId(null)
    }
  }, [connectWebSocket, initializeLocalStream, isLive, role, roomId, teardownConnections])

  const finalizeSession = useCallback(
    async (recordUrl?: string | null) => {
      if (!sessionId) {
        return
      }

      try {
        await fetch(`/api/classroom/${roomId}/session/end`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            recordingUrl: recordUrl ?? recordingUrl ?? null
          })
        })
      } catch (error) {
        console.error('Failed to finalize session', error)
        setErrorMessage('Sesi berakhir, tetapi gagal menyimpan status ke server')
      }
    },
    [recordingUrl, roomId, sessionId]
  )

  const handleStopRecording = useCallback(async () => {
    if (role !== 'host' || !isRecording) {
      return
    }

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
      console.error('Failed to stop recording', error)
      setErrorMessage('Gagal menyimpan rekaman')
    }
  }, [isRecording, role, roomId, stopRecording])
  const handleEndClass = useCallback(async () => {
    if (role !== 'host' || !isLive) {
      return
    }

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
    if (role !== 'host' || !localStreamRef.current || isRecording) {
      return
    }

    try {
      await startRecording(localStreamRef.current)
      setStatusMessage('Perekaman dimulai')
      setErrorMessage(null)
    } catch (error) {
      console.error('Failed to start recording', error)
      setErrorMessage('Gagal memulai perekaman')
    }
  }, [isRecording, role, startRecording])
  const handleJoinClass = useCallback(async () => {
    if (role !== 'viewer') {
      return
    }

    try {
      setErrorMessage(null)
      setStatusMessage('Menghubungkan ke kelas...')
      await connectWebSocket()
    } catch (error) {
      console.error('Failed to join class', error)
      setErrorMessage('Tidak dapat terhubung ke sesi live')
    }
  }, [connectWebSocket, role])
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
  const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

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
                  <a
                    href={recordingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
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

