"use client";

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  MessageCircle,
  X,
  Loader2,
  AlertCircle,
  Send,
  User,
  Clock
} from 'lucide-react'
import { useSession } from 'next-auth/react'

interface ChatSession {
  id: string
  userEmail: string
  userName: string
  status: 'waiting' | 'active' | 'closed'
  assignedTo?: string | null
  lastMessage: string
  priority: 'high' | 'normal' | 'low'
  tags?: string | null
  notes?: string | null
  messageCount: number
  unreadCount: number
  lastMessageText?: string | null
  lastMessageTime: string
  createdAt: string
}

interface ChatMessage {
  id: string
  message: string
  senderName: string
  senderEmail: string
  senderType: 'user' | 'admin'
  status: string
  sessionId?: string | null
  createdAt: string
}

type SessionFilter = 'all' | 'waiting' | 'active' | 'mine'

export default function AdminChatPanel() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [filter, setFilter] = useState<SessionFilter>('waiting')
  const [currentMessage, setCurrentMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const eventSourceRef = useRef<EventSource | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const activeSessionRef = useRef<string | null>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const appendMessageFromEvent = useCallback(
    (payload: Record<string, unknown>, senderType: 'user' | 'admin') => {
      const sessionId = typeof payload.sessionId === 'string' ? payload.sessionId : undefined
      if (!sessionId) return

      const isActiveSession = activeSessionRef.current === sessionId

      const message: ChatMessage = {
        id:
          typeof payload.id === 'string'
            ? payload.id
            : String(payload.id ?? Date.now()),
        message:
          typeof payload.message === 'string'
            ? payload.message
            : String(payload.message ?? ''),
        senderName:
          typeof payload.senderName === 'string'
            ? payload.senderName
            : senderType === 'admin'
            ? 'Admin GEMA'
            : 'Pengunjung',
        senderEmail:
          typeof payload.senderEmail === 'string' ? payload.senderEmail : '',
        senderType,
        status: senderType === 'admin' ? 'sent' : 'delivered',
        sessionId,
        createdAt:
          typeof payload.timestamp === 'string'
            ? payload.timestamp
            : new Date().toISOString()
      }

      if (isActiveSession) {
        setMessages(prev => {
          if (prev.some(item => item.id === message.id)) {
            return prev
          }
          return [...prev, message]
        })
      }

      if (!isOpen || !isActiveSession) {
        setUnreadCount(prev => prev + 1)
      }
    },
    [isOpen]
  )

  const fetchSessions = useCallback(
    async (options: { silent?: boolean } = {}) => {
      const { silent = false } = options

      if (!silent) {
        setIsLoadingSessions(true)
      }

      try {
        const filterParam = (() => {
          if (filter === 'mine') {
            return session?.user?.id
              ? `?assignedTo=${session.user.id}`
              : '?status=active'
          }
          if (filter === 'all') return '?status=all'
          return `?status=${filter}`
        })()

        const response = await fetch(`/api/chat/sessions${filterParam}`)
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            const fetchedSessions: ChatSession[] = result.data || []
            setSessions(fetchedSessions)

            setActiveSessionId(prev => {
              if (prev && fetchedSessions.some(item => item.id === prev)) {
                return prev
              }
              return fetchedSessions[0]?.id || null
            })

            if (!isOpen) {
              const totalUnread = fetchedSessions.reduce((acc, chat) => acc + (chat.unreadCount || 0), 0)
              setUnreadCount(totalUnread)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching chat sessions:', error)
      } finally {
        if (!silent) {
          setIsLoadingSessions(false)
        }
      }
    },
    [filter, session?.user?.id, isOpen]
  )

  const fetchMessages = useCallback(async (sessionId: string, options: { silent?: boolean } = {}) => {
    const { silent = false } = options
    if (!silent) {
      setIsLoadingMessages(true)
    }
    try {
      const response = await fetch(`/api/chat/send?sessionId=${sessionId}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setMessages(result.data || [])
        }
      }
    } catch (error) {
      console.error('Error fetching chat messages:', error)
    } finally {
      if (!silent) {
        setIsLoadingMessages(false)
      }
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen, scrollToBottom])

  useEffect(() => {
    activeSessionRef.current = activeSessionId
  }, [activeSessionId])

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      fetchSessions({ silent: true })
    }
  }, [isOpen, fetchSessions])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  useEffect(() => {
    if (activeSessionId) {
      fetchMessages(activeSessionId)
    } else {
      setMessages([])
    }
  }, [activeSessionId, fetchMessages])

  useEffect(() => {
    const connectToNotifications = () => {
      try {
        const eventSource = new EventSource('/api/notifications/sse')
        eventSourceRef.current = eventSource

        eventSource.onopen = () => {
          setIsConnected(true)
        }

        eventSource.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data) as {
              type: string
              data?: Record<string, unknown>
            }

            if (data.type === 'heartbeat' || data.type === 'connected') {
              return
            }

            if (data.type === 'new_chat_message') {
              appendMessageFromEvent(data.data ?? {}, 'user')
              await fetchSessions({ silent: true })
              const sessionId = typeof data.data?.sessionId === 'string' ? data.data.sessionId : undefined
              if (sessionId && activeSessionRef.current === sessionId) {
                await fetchMessages(sessionId, { silent: true })
              }
              return
            }

            if (data.type === 'admin_reply') {
              appendMessageFromEvent(data.data ?? {}, 'admin')
              await fetchSessions({ silent: true })
              const sessionId = typeof data.data?.sessionId === 'string' ? data.data.sessionId : undefined
              if (sessionId && activeSessionRef.current === sessionId) {
                await fetchMessages(sessionId, { silent: true })
              }
              return
            }
          } catch (error) {
            console.error('Error parsing chat notification:', error)
          }
        }

        eventSource.onerror = () => {
          setIsConnected(false)
          setTimeout(() => {
            if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
              connectToNotifications()
            }
          }, 5000)
        }
      } catch (error) {
        console.error('Failed to connect to chat notifications:', error)
      }
    }

    connectToNotifications()

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [fetchSessions, fetchMessages, appendMessageFromEvent])

  const handleTogglePanel = () => {
    setIsOpen(prev => !prev)
  }

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId)
  }

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !activeSessionId || isSending) return

    const messageText = currentMessage.trim()
    setCurrentMessage('')

    const adminMessage: ChatMessage = {
      id: Date.now().toString(),
      message: messageText,
      senderName: session?.user?.name || 'Admin GEMA',
      senderEmail: 'admin@gema.com',
      senderType: 'admin',
      status: 'sending',
      sessionId: activeSessionId,
      createdAt: new Date().toISOString()
    }

    setMessages(prev => [...prev, adminMessage])
    setIsSending(true)

    try {
      const response = await fetch('/api/chat/admin-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          adminName: session?.user?.name || 'Admin GEMA',
          sessionId: activeSessionId
        })
      })

      if (response.ok) {
        setMessages(prev => prev.map(msg => msg.id === adminMessage.id ? { ...msg, status: 'sent' } : msg))
        fetchSessions({ silent: true })
      } else {
        setMessages(prev => prev.filter(msg => msg.id !== adminMessage.id))
      }
    } catch (error) {
      console.error('Error sending admin message:', error)
      setMessages(prev => prev.filter(msg => msg.id !== adminMessage.id))
    } finally {
      setIsSending(false)
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: ChatSession['status']) => {
    const styles: Record<ChatSession['status'], string> = {
      waiting: 'bg-yellow-100 text-yellow-700',
      active: 'bg-green-100 text-green-700',
      closed: 'bg-gray-100 text-gray-600'
    }
    const labels: Record<ChatSession['status'], string> = {
      waiting: 'Menunggu',
      active: 'Aktif',
      closed: 'Selesai'
    }
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={handleTogglePanel}
        className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
        title="Panel Chat"
      >
        <MessageCircle className="w-6 h-6" />
        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-semibold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[520px] max-w-[calc(100vw-1rem)] bg-white border border-gray-200 shadow-2xl rounded-xl z-50">
          <div className="flex flex-col h-[70vh] min-h-[420px] max-h-[80vh]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <div>
                <p className="text-sm font-semibold text-gray-900">Chat Live</p>
                <p className="text-xs text-gray-500">
                  {isConnected ? 'Terhubung dengan real-time chat' : 'Tidak terhubung ke server'}
                </p>
              </div>
              <button
                onClick={handleTogglePanel}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                title="Tutup panel chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-gray-50">
              {(['waiting', 'active', 'mine', 'all'] as SessionFilter[]).map(item => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    filter === item ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-blue-50'
                  }`}
                >
                  {item === 'waiting' && 'Menunggu'}
                  {item === 'active' && 'Aktif'}
                  {item === 'mine' && 'Tugas Saya'}
                  {item === 'all' && 'Semua'}
                </button>
              ))}
            </div>

            <div className="flex flex-1 flex-col md:flex-row min-h-0 overflow-hidden">
              <div className="md:w-64 border-b md:border-b-0 md:border-r border-gray-100 min-h-0">
                <div className="h-full overflow-y-auto">
                  {isLoadingSessions ? (
                    <div className="flex items-center justify-center py-12 text-gray-500">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Memuat sesi...
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center px-4 text-gray-500">
                      <AlertCircle className="w-6 h-6 mb-2" />
                      <p className="text-sm">Belum ada sesi chat pada filter ini</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {sessions.map(chatSession => (
                        <button
                          key={chatSession.id}
                          onClick={() => handleSelectSession(chatSession.id)}
                          className={`w-full text-left px-4 py-3 transition-colors ${
                            activeSessionId === chatSession.id
                              ? 'bg-blue-50 border-l-2 border-blue-500'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-900 truncate">{chatSession.userName}</p>
                            {getStatusBadge(chatSession.status)}
                          </div>
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {chatSession.lastMessageText || 'Belum ada pesan'}
                          </p>
                          <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                            <span>{formatTime(chatSession.lastMessageTime)}</span>
                            {chatSession.unreadCount > 0 && (
                              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-semibold">
                                {chatSession.unreadCount}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                {activeSessionId ? (
                  <>
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {sessions.find(item => item.id === activeSessionId)?.userName || 'Pengguna'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {sessions.find(item => item.id === activeSessionId)?.userEmail}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {sessions.find(item => item.id === activeSessionId)?.messageCount || 0} pesan
                      </span>
                    </div>

                    <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3 bg-white">
                      {isLoadingMessages ? (
                        <div className="flex items-center justify-center py-10 text-gray-500">
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          Memuat percakapan...
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="text-center text-gray-500 py-10">
                          <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">Belum ada pesan pada sesi ini</p>
                        </div>
                      ) : (
                        <>
                          {messages.map(chatMessage => (
                            <div
                              key={chatMessage.id}
                              className={`flex ${
                                chatMessage.senderType === 'admin' ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <div
                                className={`max-w-[80%] rounded-xl px-3 py-2 shadow-sm ${
                                  chatMessage.senderType === 'admin'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-900'
                                }`}
                              >
                                <div className="flex items-center gap-2 text-xs opacity-80 mb-1">
                                  <User className="w-3 h-3" />
                                  <span>{chatMessage.senderName}</span>
                                </div>
                                <p className="text-sm whitespace-pre-line">{chatMessage.message}</p>
                                <div className="flex items-center justify-end gap-2 text-xs opacity-70 mt-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatTime(chatMessage.createdAt)}</span>
                                  {chatMessage.senderType === 'admin' && (
                                    <span>{chatMessage.status === 'sent' ? 'Terkirim' : 'Mengirim...'}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </>
                      )}
                    </div>

                    <div className="border-t border-gray-100 p-3 bg-gray-50">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={currentMessage}
                          onChange={(e) => setCurrentMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleSendMessage()
                            }
                          }}
                          placeholder="Ketik balasan untuk pengunjung..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={isSending}
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={isSending || !currentMessage.trim()}
                          className="relative flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
                          title="Kirim"
                          aria-label="Kirim"
                        >
                          {isSending ? (
                            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                          ) : (
                            <Send className="w-4 h-4" aria-hidden="true" />
                          )}
                          <span className="sr-only">Kirim</span>
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 px-6">
                    <MessageCircle className="w-10 h-10 mb-3 text-gray-300" />
                    <p className="text-sm">Pilih salah satu sesi chat untuk melihat percakapan dan membalas pesan.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
