"use client";

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Users, MessageSquare, User, Bot } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useSession } from 'next-auth/react'

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

export default function LiveChatPage() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [connectedUsers] = useState(0)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    fetchChatHistory()
  }, [])

  const connectToLiveChat = useCallback(() => {
    try {
      const eventSource = new EventSource('/api/notifications/sse')
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        setIsConnected(true)
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          console.log('Admin chat received data:', data)
          
          if (data.type === 'new_chat_message') {
            // Add new message from user
            const newMessage: ChatMessage = {
              id: data.data.id,
              message: data.data.message,
              senderName: data.data.senderName,
              senderEmail: data.data.senderEmail,
              senderType: 'user',
              status: 'delivered',
              createdAt: data.data.timestamp
            }
            
            setMessages(prev => [...prev, newMessage])
          } else if (data.type === 'admin_reply') {
            // Admin reply broadcasted to all admin instances
            const newMessage: ChatMessage = {
              id: data.data.id,
              message: data.data.message,
              senderName: data.data.senderName,
              senderEmail: 'admin@gema.com',
              senderType: 'admin',
              status: 'sent',
              createdAt: data.data.timestamp
            }
            setMessages(prev => {
              // Avoid duplicate messages from same admin
              const exists = prev.find(msg => msg.id === newMessage.id)
              if (!exists) {
                return [...prev, newMessage]
              }
              return prev
            })
          }
        } catch (error) {
          console.error('Error parsing live chat data:', error)
        }
      }

      eventSource.onerror = () => {
        setIsConnected(false)
        
        setTimeout(() => {
          if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
            connectToLiveChat()
          }
        }, 5000)
      }
    } catch (error) {
      console.error('Failed to connect to live chat:', error)
    }
  }, [])

  useEffect(() => {
    connectToLiveChat()
    
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [connectToLiveChat])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchChatHistory = async () => {
    try {
      const response = await fetch('/api/chat/send?limit=100')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setMessages(result.data || [])
        }
      }
    } catch (error) {
      console.error('Error fetching chat history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendAdminMessage = async () => {
    if (!currentMessage.trim() || isSending) return

    const messageText = currentMessage.trim()
    setCurrentMessage('')
    setIsSending(true)

    // Find the most recent user message to get sessionId
    const lastUserMessage = [...messages].reverse().find(msg => msg.senderType === 'user')
    const sessionId = lastUserMessage?.sessionId || null

    // Add admin message to chat immediately
    const adminMessage: ChatMessage = {
      id: Date.now().toString(),
      message: messageText,
      senderName: session?.user?.name || 'Admin GEMA',
      senderEmail: 'admin@gema.com',
      senderType: 'admin',
      status: 'sending',
      createdAt: new Date().toISOString()
    }
    setMessages(prev => [...prev, adminMessage])

    try {
      console.log('Admin sending message with sessionId:', sessionId)
      const response = await fetch('/api/chat/admin-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          adminName: session?.user?.name || 'Admin GEMA',
          sessionId: sessionId
        })
      })

      if (response.ok) {
        // Update message status to sent
        setMessages(prev => prev.map(msg => 
          msg.id === adminMessage.id ? { ...msg, status: 'sent' } : msg
        ))
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending admin message:', error)
      // Remove failed message
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusIcon = (status: string) => {
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

  const groupedMessages = messages.reduce((groups: { [key: string]: ChatMessage[] }, message) => {
    const date = formatDate(message.createdAt)
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {})

  return (
    <AdminLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Live Chat</h1>
              <p className="text-gray-600">Chat real-time dengan pengunjung website</p>
            </div>
            
            {/* Status indicators */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Terhubung' : 'Terputus'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{connectedUsers} pengguna online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : Object.keys(groupedMessages).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <MessageSquare className="w-12 h-12 mb-4" />
              <p className="text-lg font-medium">Belum ada percakapan</p>
              <p className="text-sm">Pesan akan muncul di sini ketika pengunjung memulai chat</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {Object.entries(groupedMessages).map(([date, dayMessages]) => (
                <div key={date}>
                  {/* Date separator */}
                  <div className="flex items-center justify-center my-4">
                    <div className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 border">
                      {date}
                    </div>
                  </div>
                  
                  {/* Messages for this date */}
                  <div className="space-y-4">
                    {dayMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-md px-4 py-3 rounded-lg ${
                          message.senderType === 'admin'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}>
                          {/* Sender info */}
                          <div className="flex items-center gap-2 mb-2">
                            {message.senderType === 'admin' ? (
                              <Bot className="w-4 h-4" />
                            ) : (
                              <User className="w-4 h-4" />
                            )}
                            <span className="text-sm font-medium">
                              {message.senderName}
                            </span>
                          </div>
                          
                          {/* Message content */}
                          <p className="text-sm mb-2">{message.message}</p>
                          
                          {/* Time and status */}
                          <div className={`flex items-center justify-between text-xs ${
                            message.senderType === 'admin' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            <span>{formatTime(message.createdAt)}</span>
                            {message.senderType === 'admin' && getStatusIcon(message.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendAdminMessage()}
                placeholder="Ketik balasan untuk pengunjung..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!isConnected || isSending}
              />
              <button
                onClick={sendAdminMessage}
                disabled={!currentMessage.trim() || !isConnected || isSending}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                title="Kirim pesan"
              >
                <Send className="w-4 h-4" />
                {isSending ? 'Mengirim...' : 'Kirim'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}