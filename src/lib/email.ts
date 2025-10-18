export type CodingLabNotificationPayload = {
  to: string
  subject: string
  message: string
  metadata?: Record<string, unknown>
}

export async function sendCodingLabNotification(payload: CodingLabNotificationPayload) {
  // Mock email service – in production integrate with SMTP/service provider
  console.info('📬 [mock-email] coding lab notification sent', {
    to: payload.to,
    subject: payload.subject,
    metadata: payload.metadata
  })
}
