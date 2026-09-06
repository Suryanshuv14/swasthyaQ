/**
 * n8n AI Consultation Webhook Client
 *
 * Production Webhook URL: https://n8n.resizemyphoto.me/webhook/swasthyaq-intake
 *
 * Request Body:
 * {
 *   "message": "<patient message>",
 *   "mode": "chat" | "voice",
 *   "session_id": "<new session id>",
 *   "patient": {
 *     "first_name": "<current profile first name>",
 *     "last_name": "<current profile last name>",
 *     "age": <current profile age>,
 *     "gender": "<current profile gender>",
 *     "mobile": "<current profile mobile>",
 *     "village": "<current profile village>"
 *   }
 * }
 *
 * Response Format:
 * {
 *   "response": "<AI response>"
 * }
 */

import { getPatientProfile, extractPatientPayload, PatientPayload } from './patientProfile'

export const PRODUCTION_N8N_WEBHOOK_URL = 'https://n8n.resizemyphoto.me/webhook/swasthyaq-intake'

export interface SendMessageParams {
  message: string
  mode: 'chat' | 'voice'
  session_id: string
  patient?: PatientPayload
}

export interface SendMessageResponse {
  reply_text: string
  symptoms?: string[]
  symptom_category?: string
  urgency?: string
  risk_level?: 'low' | 'high'
}

/**
 * Creates a brand new unique session ID (UUID).
 */
export function createUniqueSessionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now()
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
    sessionId = createUniqueSessionId()
    sessionStorage.setItem('swasthyaq_consultation_session_id', sessionId)
  }
  return sessionId
}

/**
 * Generates and stores a new unique session ID when starting a completely new conversation.
 */
export function resetSessionId(): string {
  const newId = createUniqueSessionId()
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('swasthyaq_consultation_session_id', newId)
  }
  return newId
}

/**
 * Sends patient message and profile to n8n production webhook.
 * Payload fields: message, mode, session_id, patient
 */
export async function sendMessage({
  message,
  mode,
  session_id,
  patient,
}: SendMessageParams): Promise<SendMessageResponse> {
  const webhookUrl =
    process.env.NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL ||
    PRODUCTION_N8N_WEBHOOK_URL

  const patientData = patient || extractPatientPayload(getPatientProfile())

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
        patient: patientData,
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

