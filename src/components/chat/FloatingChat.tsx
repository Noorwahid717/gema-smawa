"use client";

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Minimize2, Maximize2, User, Bot } from 'lucide-react'
import { studentAuth, type StudentSession } from '@/lib/student-auth'

const CHAT_SESSION_KEY_PREFIX = 'gema-chat-session'

const getChatStorageKey = (email?: string) => {
  const normalized = email?.trim().toLowerCase()
  if (!normalized || normalized === 'guest@example.com') {
    return `${CHAT_SESSION_KEY_PREFIX}:guest`
  }
  return `${CHAT_SESSION_KEY_PREFIX}:${normalized}`
}

const deriveStudentEmail = (session: StudentSession) => {
  if (session.email && session.email.trim().length > 0) {
    return session.email.trim()
  }
  if (session.studentId && session.studentId.trim().length > 0) {
    const normalizedId = session.studentId.trim().toLowerCase().replace(/\s+/g, '')
    return `${normalizedId}@students.gema.local`
  }
  if (session.id && session.id.trim().length > 0) {
    return `${session.id.trim().toLowerCase()}@students.gema.local`
  }
  return 'student@gema.local'
}

interface Message {
  id: string
  message: string
  sender: 'user' | 'admin'
  senderName?: string
  timestamp: Date
  status?: 'sending' | 'sent' | 'delivered'
}

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [userInfo, setUserInfo] = useState({ name: '', email: '' })
  const [showUserForm, setShowUserForm] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [studentSession, setStudentSession] = useState<StudentSession | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  const studentDisplayName =
    studentSession?.fullName && studentSession.fullName.trim().length > 0
      ? studentSession.fullName.trim()
      : studentSession?.studentId && studentSession.studentId.trim().length > 0
      ? `Siswa ${studentSession.studentId.trim()}`
      : null

  const studentDisplayId =
    studentSession?.studentId && studentSession.studentId.trim().length > 0
      ? studentSession.studentId.trim()
      : null

  useEffect(() => {
    if (typeof window === 'undefined') return

    const session = studentAuth.getSession()
    if (session) {
      setStudentSession(session)
      const studentEmail = deriveStudentEmail(session)
      const displayName =
        session.fullName && session.fullName.trim().length > 0
          ? session.fullName.trim()
          : session.studentId && session.studentId.trim().length > 0
          ? `Siswa ${session.studentId.trim()}`
          : 'Siswa GEMA'

      setUserInfo({ name: displayName, email: studentEmail })
      setShowUserForm(false)

      const storedStudentSessionId = localStorage.getItem(getChatStorageKey(studentEmail))
      if (storedStudentSessionId) {
        setSessionId(storedStudentSessionId)
      }
    } else {
      const storedGuestSessionId = localStorage.getItem(getChatStorageKey())
      if (storedGuestSessionId) {
        setSessionId(storedGuestSessionId)
      }
    }
  }, [])

  useEffect(() => {
    if (isOpen && !isConnected) {
      connectToChat()
    }
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && sessionId) {
      loadChatHistory()
    }
  }, [isOpen, sessionId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (typeof window === 'undefined' || !sessionId) return

    const emailForStorage = studentSession
      ? deriveStudentEmail(studentSession)
      : userInfo.email && userInfo.email.trim().length > 0
      ? userInfo.email.trim()
      : 'guest@example.com'

    localStorage.setItem(getChatStorageKey(emailForStorage), sessionId)
  }, [sessionId, studentSession, userInfo.email])

  const connectToChat = () => {
    try {
      const eventSource = new EventSource('/api/chat/sse')
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        setIsConnected(true)
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          console.log('FloatingChat received message:', data)
          
          if (data.type === 'admin_message') {
            // Only show admin messages for current session or if no session yet
            if (!sessionId || !data.sessionId || data.sessionId === sessionId) {
              const newMessage: Message = {
                id: Date.now().toString(),
                message: data.message,
                sender: 'admin',
                senderName: data.senderName || 'Admin GEMA',
                timestamp: new Date(data.timestamp),
                status: 'delivered'
              }
              
              setMessages(prev => [...prev, newMessage])
              
              if (!isOpen) {
                setUnreadCount(prev => prev + 1)
              }
              
              // Show browser notification
              if (Notification.permission === 'granted' && !isOpen) {
                new Notification('Pesan dari Admin GEMA', {
                  body: data.message,
                  icon: '/gema.svg',
                  tag: 'chat-message'
                })
              }
            }
          } else if (data.type === 'typing') {
            setIsTyping(data.isTyping)
          } else if (data.type === 'connected') {
            console.log('Chat connected:', data.message)
          } else if (data.type === 'heartbeat') {
            // Heartbeat received, connection is alive
          }
        } catch (error) {
          console.error('Error parsing chat message:', error)
        }
      }

      eventSource.onerror = () => {
        setIsConnected(false)
        setTimeout(() => {
          if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
            connectToChat()
          }
        }, 5000)
      }
    } catch (error) {
      console.error('Failed to connect to chat:', error)
    }
  }

  const addSystemMessage = (message: string) => {
    const systemMessage: Message = {
      id: Date.now().toString(),
      message,
      sender: 'admin',
      senderName: 'System',
      timestamp: new Date(),
      status: 'delivered'
    }
    setMessages(prev => [...prev, systemMessage])
  }

  const sendMessage = async () => {
    if (!currentMessage.trim() || isSending) return

    const messageText = currentMessage.trim()
    setCurrentMessage('')
    setIsSending(true)

    const senderName =
      (studentDisplayName && studentDisplayName.length > 0)
        ? studentDisplayName
        : userInfo.name && userInfo.name.trim().length > 0
        ? userInfo.name.trim()
        : studentDisplayId
        ? `Siswa ${studentDisplayId}`
        : 'Pengunjung'

    const senderEmail = studentSession
      ? deriveStudentEmail(studentSession)
      : userInfo.email && userInfo.email.trim().length > 0
      ? userInfo.email.trim()
      : 'guest@example.com'

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      message: messageText,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending'
    }
    setMessages(prev => [...prev, userMessage])

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          senderName,
          senderEmail,
          sessionId: sessionId
        })
      })

      if (response.ok) {
        const result = await response.json()
        
        // Store session ID for subsequent messages
        if (result.sessionId && !sessionId) {
          setSessionId(result.sessionId)
        }
        
        // Update message status to sent
        setMessages(prev => prev.map(msg => 
          msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
        ))
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      // Update message status to error
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
      ))
      addSystemMessage('Gagal mengirim pesan. Silakan coba lagi.')
    } finally {
      setIsSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChatHistory = async () => {
    if (!sessionId) return
    
    try {
      const response = await fetch(`/api/chat/send?sessionId=${sessionId}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          const historyMessages: Message[] = result.data.map((msg: {
            id: string;
            message: string;
            senderType: string;
            senderName: string;
            createdAt: string;
          }) => ({
            id: msg.id,
            message: msg.message,
            sender: msg.senderType === 'admin' ? 'admin' : 'user',
            senderName: msg.senderName,
            timestamp: new Date(msg.createdAt),
            status: 'delivered'
          }))
          setMessages(historyMessages)
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
    }
  }

  const handleUserInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (userInfo.name.trim()) {
      setShowUserForm(false)
      addSystemMessage(`Halo ${userInfo.name}! Ada yang bisa kami bantu?`)
    }
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setUnreadCount(0)
      // Request notification permission
      if (Notification.permission === 'default') {
        Notification.requestPermission()
      }
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'sending':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
      case 'sent':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      case 'delivered':
        return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
      default:
        return null
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleChat}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 relative"
          title="Chat dengan Admin GEMA"
        >
          <MessageCircle className="w-6 h-6" />
          
          {/* Connection indicator */}
          <div className={`absolute -top-1 -left-1 w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          
          {/* Unread badge */}
          {unreadCount > 0 && !isOpen && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-24 right-6 w-[22rem] max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 transition-all duration-300 ${
            isMinimized ? 'h-16' : 'h-[28rem]'
          } flex flex-col overflow-hidden`}
        >
          {/* Chat Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold">Admin GEMA</h3>
                <p className="text-xs opacity-90">
                  {isConnected ? 'Online' : 'Offline'}
                  {isTyping && ' • sedang mengetik...'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/20 rounded"
                title={isMinimized ? 'Perbesar' : 'Perkecil'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded"
                title="Tutup chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <div className="flex flex-1 flex-col overflow-hidden">
              {studentSession && (
                <div className="px-4 py-2 bg-blue-50 text-xs text-blue-700 border-b border-blue-100">
                  Terhubung sebagai {studentDisplayName || 'Siswa GEMA'}
                  {studentSession.email && studentSession.email.trim().length > 0
                    ? ` (${studentSession.email.trim()})`
                    : studentDisplayId
                    ? ` (NIS ${studentDisplayId})`
                    : ''}
                </div>
              )}

              {showUserForm ? (
                <div className="flex flex-1 flex-col gap-4 p-5">
                  <div className="text-sm text-gray-700">
                    Sebelum memulai chat, isi data singkatmu agar admin mudah mengenali.
                  </div>
                  <form onSubmit={handleUserInfoSubmit} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-700">Nama Lengkap</label>
                      <input
                        type="text"
                        placeholder="Nama Anda"
                        value={userInfo.name}
                        onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-700">Email (opsional)</label>
                      <input
                        type="email"
                        placeholder="Email (opsional)"
                        value={userInfo.email}
                        onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      Mulai Chat
                    </button>
                  </form>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3 bg-white">
                    {messages.length === 0 ? (
                      <div className="flex h-full flex-col items-center justify-center text-center text-sm text-gray-500">
                        <Bot className="w-8 h-8 mb-2 text-gray-300" />
                        <p>Belum ada percakapan. Kirim pesan pertama kamu.</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                              message.sender === 'user'
                                ? 'bg-blue-600 text-white'
                                : message.senderName === 'System'
                                ? 'bg-gray-100 text-gray-600 text-center text-xs'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            {message.sender === 'admin' && message.senderName !== 'System' && (
                              <div className="flex items-center gap-2 mb-1 text-xs font-medium text-gray-600">
                                <User className="w-3 h-3" />
                                <span>{message.senderName}</span>
                              </div>
                            )}
                            <p className="text-sm whitespace-pre-line">{message.message}</p>
                            <div
                              className={`mt-1 flex items-center gap-2 text-xs ${
                                message.sender === 'user' ? 'text-blue-100 justify-end' : 'text-gray-500 justify-between'
                              }`}
                            >
                              <span>{formatTime(message.timestamp)}</span>
                              {message.sender === 'user' && getStatusIcon(message.status)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
                    <div className="flex items-end gap-2">
                      <textarea
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            sendMessage()
                          }
                        }}
                        rows={1}
                        placeholder={isConnected ? 'Ketik pesan...' : 'Menghubungkan ke admin...'}
                        className="flex-1 max-h-32 min-h-[44px] resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                        disabled={!isConnected || isSending}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!currentMessage.trim() || !isConnected || isSending}
                        className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
                        title="Kirim pesan"
                      >
                        {isSending ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Send className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="mt-1 text-[10px] text-gray-400">
                      Tekan Enter untuk mengirim, Shift + Enter untuk baris baru.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </>
  )
}
