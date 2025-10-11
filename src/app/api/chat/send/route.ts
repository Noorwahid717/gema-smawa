import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Import broadcast function for real-time chat
async function broadcastToAdmins(messageData: {
  id: string;
  message: string;
  senderName: string;
  senderEmail: string;
  sessionId?: string;
  timestamp: Date;
}) {
  try {
    // Import dynamically to avoid circular dependencies
    const { broadcastToClients } = await import('@/lib/notification-broadcast')
    
    broadcastToClients({
      type: 'new_chat_message',
      message: 'Pesan chat baru!',
      data: {
        id: messageData.id,
        senderName: messageData.senderName,
        senderEmail: messageData.senderEmail,
        message: messageData.message,
        sessionId: messageData.sessionId,
        timestamp: messageData.timestamp
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.log('Failed to broadcast chat notification:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, senderName, senderEmail, sessionId } = body

    console.log('Chat message received:', { message, senderName, senderEmail, sessionId })

    // Validasi input
    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Pesan tidak boleh kosong' },
        { status: 400 }
      )
    }

    let currentSessionId = sessionId

    // Create or get existing session
    if (!currentSessionId) {
      console.log('Creating new session for:', senderEmail)
      
      // Check if user has an active session
      const existingSession = await prisma.chatSession.findFirst({
        where: {
          userEmail: senderEmail || 'guest@example.com',
          status: { in: ['waiting', 'active'] }
        }
      })

      if (existingSession) {
        console.log('Found existing session:', existingSession.id)
        currentSessionId = existingSession.id
        // Update last message time
        await prisma.chatSession.update({
          where: { id: existingSession.id },
          data: { lastMessage: new Date() }
        })
      } else {
        // Create new session
        console.log('Creating new session')
        const newSession = await prisma.chatSession.create({
          data: {
            userEmail: senderEmail || 'guest@example.com',
            userName: senderName || 'Pengunjung',
            status: 'waiting', // waiting for admin assignment
            priority: 'normal',
            lastMessage: new Date()
          }
        })
        currentSessionId = newSession.id
        console.log('New session created:', currentSessionId)
      }
    }

    // Simpan pesan chat ke database
    const chatMessage = await prisma.chatMessage.create({
      data: {
        message: message.trim(),
        senderName: senderName || 'Pengunjung',
        senderEmail: senderEmail || 'guest@example.com',
        senderType: 'user',
        status: 'sent',
        sessionId: currentSessionId,
        createdAt: new Date()
      }
    })

    console.log('Chat message saved:', chatMessage.id)

    // Send notification to admin in real-time
    await broadcastToAdmins({
      id: chatMessage.id,
      message: chatMessage.message,
      senderName: chatMessage.senderName,
      senderEmail: chatMessage.senderEmail,
      sessionId: currentSessionId,
      timestamp: chatMessage.createdAt
    })

    console.log('Broadcast sent to admins')

    return NextResponse.json({
      success: true,
      message: 'Pesan terkirim',
      data: { 
        id: chatMessage.id,
        sessionId: currentSessionId,
        timestamp: chatMessage.createdAt 
      },
      sessionId: currentSessionId
    })

  } catch (error) {
    console.error('Error sending chat message:', error)
    return NextResponse.json(
      { error: 'Gagal mengirim pesan. Silakan coba lagi.' },
      { status: 500 }
    )
  }
}

// GET untuk admin - mendapatkan riwayat chat per session
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    if (sessionId) {
      // Get messages for specific session
      const messages = await prisma.chatMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' },
        take: limit
      })

      return NextResponse.json({
        success: true,
        data: messages
      })
    } else {
      // Get all messages (fallback)
      const messages = await prisma.chatMessage.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit
      })

      return NextResponse.json({
        success: true,
        data: messages.reverse() // Return in chronological order
      })
    }
  } catch (error) {
    console.error('Error fetching chat messages:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil riwayat chat' },
      { status: 500 }
    )
  }
}
