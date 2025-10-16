import { NextRequest } from 'next/server'
import { addChatClient, removeChatClient } from '@/lib/chat-broadcast'

export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      // Add this client to chat connections
      addChatClient(controller)
      
      // Send initial connection message
      const data = JSON.stringify({
        type: 'connected',
        message: 'Terhubung dengan sistem chat GEMA',
        timestamp: new Date().toISOString()
      })
      
      controller.enqueue(`data: ${data}\n\n`)
      
      // Send heartbeat every 30 seconds
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(`data: ${JSON.stringify({ 
            type: 'heartbeat', 
            timestamp: new Date().toISOString() 
          })}\n\n`)
        } catch (_error) {
          clearInterval(heartbeat)
          removeChatClient(controller)
        }
      }, 30000)
      
      // Clean up when client disconnects
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        removeChatClient(controller)
        try {
          controller.close()
        } catch (_error) {
          // Connection already closed
        }
      })
    },
    
    cancel(controller: ReadableStreamDefaultController) {
      removeChatClient(controller)
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  })
}