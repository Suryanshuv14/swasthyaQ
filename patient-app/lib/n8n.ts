/**
 * n8n AI Consultation Webhook Client
 *
 * Production Webhook URL: https://n8n.resizemyphoto.me/webhook/swasthyaq-intake
 *
 * The ONLY request body fields sent to n8n are:
 * {
 *   "message": "<patient message>",
 *   "mode": "chat",
 *   "session_id": "<current conversation session id>"
 * }
 *
 * Response Format:
 * {
 *   "response": "<AI response>"
 * }
 */

export const PRODUCTION_N8N_WEBHOOK_URL = 'https://n8n.resizemyphoto.me/webhook/swasthyaq-intake'

export interface SendMessageParams {
  message: string
  mode: 'chat' | 'voice'
  session_id: string
}

export interface SendMessageResponse {
  reply_text: string
  symptoms?: string[]
  symptom_category?: string
  urgency?: string
  risk_level?: 'low' | 'high'
}

/**
 * Retrieves the current conversation session ID or generates a unique UUID.
 * Keeps the same session ID for every message in the current conversation.
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') {
    return 'server-session'
  }
  let sessionId = sessionStorage.getItem('swasthyaq_consultation_session_id')
  if (!sessionId) {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      sessionId = crypto.randomUUID()
    } else {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now()
    }
    sessionStorage.setItem('swasthyaq_consultation_session_id', sessionId)
  }
  return sessionId
}

/**
 * Generates and stores a new unique session ID when starting a completely new conversation.
 */
export function resetSessionId(): string {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('swasthyaq_consultation_session_id')
  }
  return getSessionId()
}

/**
 * Sends patient message to n8n production webhook.
 * Only sends: message, mode, session_id.
 */
export async function sendMessage({
  message,
  mode,
  session_id,
}: SendMessageParams): Promise<SendMessageResponse> {
  const webhookUrl =
    process.env.NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL ||
    PRODUCTION_N8N_WEBHOOK_URL

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 20000)

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        mode,
        session_id,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`n8n webhook responded with status ${response.status}`)
    }

    const data = await response.json()
    
    // n8n response format: { "response": "<AI response>" }
    const replyText =
      data.response ||
      data.reply_text ||
      data.reply ||
      data.output ||
      data.message ||
      (typeof data === 'string' ? data : 'मैंने आपका संदेश प्राप्त कर लिया है।')

    return {
      reply_text: replyText,
      symptoms: data.symptoms,
      symptom_category: data.symptom_category || data.category,
      urgency: data.urgency,
      risk_level: data.risk_level || 'low',
    }
  } catch (err: any) {
    clearTimeout(timeoutId)
    console.error('Error communicating with n8n webhook:', err)
    throw err
  }
}

