"use client";

import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  MessageSquare, 
  User, 
  Send, 
  UserCheck,
  UserX,
  AlertCircle,
  MessageCircle
} from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useSession } from 'next-auth/react'

interface ChatSession {
  id: string
  userEmail: string
  userName: string
  status: 'waiting' | 'active' | 'closed'
  assignedTo?: string
  lastMessage: string
  priority: 'high' | 'normal' | 'low'
  tags?: string
  notes?: string
  messageCount: number
  unreadCount: number
  lastMessageText?: string
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
  sessionId?: string
  createdAt: string
}

export default function MultiChatPage() {
  const { data: session } = useSession()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [filter, setFilter] = useState<'all' | 'waiting' | 'active' | 'mine'>('all')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  const fetchSessions = useCallback(async () => {
    try {
      const filterParam = filter === 'mine' ? `?assignedTo=${session?.user?.id}` : filter === 'all' ? '?status=all' : `?status=${filter}`
      console.log('Fetching sessions with filter:', filterParam)
      
      const response = await fetch(`/api/chat/sessions${filterParam}`)
      if (response.ok) {
        const result = await response.json()
        console.log('Sessions response:', result)
        if (result.success) {
          setSessions(result.data || [])
        }
      } else {
        console.error('Failed to fetch sessions:', response.status)
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [filter, session?.user?.id])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const connectToNotifications = useCallback(() => {
    try {
      const eventSource = new EventSource('/api/notifications/sse')
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        setIsConnected(true)
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          console.log('Multi-chat received notification:', data)
          
          if (data.type === 'new_chat_message') {
            // Refresh sessions to show new message
            fetchSessions()
            
            // If the message is for the active session, add it
            if (data.data.sessionId === activeSessionId) {
              const newMessage: ChatMessage = {
                id: data.data.id,
                message: data.data.message,
                senderName: data.data.senderName,
                senderEmail: data.data.senderEmail,
                senderType: 'user',
                status: 'delivered',
                sessionId: data.data.sessionId,
                createdAt: data.data.timestamp
              }
              setMessages(prev => [...prev, newMessage])
            }
          } else if (data.type === 'admin_reply') {
            // Refresh sessions when admin replies
            fetchSessions()
            
            // If the reply is for the active session, add it
            if (data.data.sessionId === activeSessionId) {
              const newMessage: ChatMessage = {
                id: data.data.id,
                message: data.data.message,
                senderName: data.data.senderName,
                senderEmail: 'admin@gema.com',
                senderType: 'admin',
                status: 'sent',
                sessionId: data.data.sessionId,
                createdAt: data.data.timestamp
              }
              setMessages(prev => [...prev, newMessage])
            }
          }
        } catch (error) {
          console.error('Error parsing notification:', error)
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
      console.error('Failed to connect to notifications:', error)
    }
  }, [activeSessionId, fetchSessions])

  useEffect(() => {
    connectToNotifications()
    
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [connectToNotifications])

  useEffect(() => {
    if (activeSessionId) {
      fetchSessionMessages(activeSessionId)
    }
  }, [activeSessionId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchSessionMessages = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/send?sessionId=${sessionId}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setMessages(result.data || [])
        }
      }
    } catch (error) {
      console.error('Error fetching session messages:', error)
    }
  }

  const assignSession = async (sessionId: string) => {
    try {
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          adminId: session?.user?.id,
          adminName: session?.user?.name,
          action: 'assign'
        })
      })

      if (response.ok) {
        fetchSessions()
        setActiveSessionId(sessionId)
      }
    } catch (error) {
      console.error('Error assigning session:', error)
    }
  }

  const closeSession = async (sessionId: string) => {
    try {
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          action: 'close'
        })
      })

      if (response.ok) {
        fetchSessions()
        if (activeSessionId === sessionId) {
          setActiveSessionId(null)
          setMessages([])
        }
      }
    } catch (error) {
      console.error('Error closing session:', error)
    }
  }

  const sendMessage = async () => {
    if (!currentMessage.trim() || !activeSessionId || isSending) return

    const messageText = currentMessage.trim()
    setCurrentMessage('')
    setIsSending(true)

    // Add admin message immediately
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
        setMessages(prev => prev.map(msg => 
          msg.id === adminMessage.id ? { ...msg, status: 'sent' } : msg
        ))
        fetchSessions() // Update last message time
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => prev.filter(msg => msg.id !== adminMessage.id))
    } finally {
      setIsSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      waiting: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    }
    const labels = {
      waiting: 'Menunggu',
      active: 'Aktif',
      closed: 'Selesai'
    }
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500'
      case 'normal': return 'text-blue-500'
      case 'low': return 'text-gray-500'
      default: return 'text-gray-500'
    }
  }

  const filteredSessions = sessions.filter(chatSession => {
    switch (filter) {
      case 'waiting': return chatSession.status === 'waiting'
      case 'active': return chatSession.status === 'active'
      case 'mine': return chatSession.assignedTo === session?.user?.id
      default: return true
    }
  })

  return (
    <AdminLayout>
      <div className="h-full flex">
        {/* Sessions Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Chat Sessions</h2>
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
            
            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'waiting' | 'active' | 'mine')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              title="Filter chat sessions"
            >
              <option value="all">Semua Session</option>
              <option value="waiting">Menunggu ({sessions.filter(s => s.status === 'waiting').length})</option>
              <option value="active">Aktif ({sessions.filter(s => s.status === 'active').length})</option>
              <option value="mine">Saya ({sessions.filter(s => s.assignedTo === session?.user?.id).length})</option>
            </select>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">Loading...</div>
            ) : filteredSessions.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>Tidak ada session</p>
              </div>
            ) : (
              <div className="space-y-2 p-2">
                {filteredSessions.map((chatSession) => (
                  <div
                    key={chatSession.id}
                    onClick={() => {
                      setActiveSessionId(chatSession.id)
                      if (chatSession.status === 'waiting') {
                        assignSession(chatSession.id)
                      }
                    }}
                    className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                      activeSessionId === chatSession.id
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 truncate">
                        {chatSession.userName}
                      </h3>
                      <div className="flex items-center gap-1">
                        <AlertCircle className={`w-3 h-3 ${getPriorityColor(chatSession.priority)}`} />
                        {getStatusBadge(chatSession.status)}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {chatSession.lastMessageText || 'Belum ada pesan'}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatTime(chatSession.lastMessageTime)}</span>
                      <div className="flex items-center gap-2">
                        <span>{chatSession.messageCount} pesan</span>
                        {chatSession.unreadCount > 0 && (
                          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                            {chatSession.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                      <span className="text-xs text-gray-500">{chatSession.userEmail}</span>
                      <div className="flex gap-1">
                        {chatSession.status === 'waiting' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              assignSession(chatSession.id)
                            }}
                            className="text-green-600 hover:bg-green-100 p-1 rounded"
                            title="Ambil chat ini"
                          >
                            <UserCheck className="w-3 h-3" />
                          </button>
                        )}
                        {chatSession.status === 'active' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              closeSession(chatSession.id)
                            }}
                            className="text-red-600 hover:bg-red-100 p-1 rounded"
                            title="Tutup chat"
                          >
                            <UserX className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {activeSessionId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {sessions.find(s => s.id === activeSessionId)?.userName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {sessions.find(s => s.id === activeSessionId)?.userEmail}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(sessions.find(s => s.id === activeSessionId)?.status || '')}
                    <button
                      onClick={() => closeSession(activeSessionId)}
                      className="text-red-600 hover:bg-red-100 p-2 rounded"
                      title="Tutup chat"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-md px-4 py-3 rounded-lg ${
                        message.senderType === 'admin'
                          ? 'bg-blue-600 text-white'
                          : message.senderName === 'System'
                          ? 'bg-gray-200 text-gray-600 text-center text-sm'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}>
                        {message.senderType !== 'admin' && message.senderName !== 'System' && (
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-3 h-3" />
                            <span className="text-xs font-medium">{message.senderName}</span>
                          </div>
                        )}
                        <p className="text-sm">{message.message}</p>
                        <div className={`text-xs mt-1 ${
                          message.senderType === 'admin' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Ketik balasan..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={isSending}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!currentMessage.trim() || isSending}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {isSending ? 'Mengirim...' : 'Kirim'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Pilih Chat Session</h3>
                <p className="text-gray-600">Pilih session dari sidebar untuk memulai chat</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}