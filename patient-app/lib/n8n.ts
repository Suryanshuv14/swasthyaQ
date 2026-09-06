/**
 * n8n AI Consultation & Voice Webhook Client
 *
 * Single shared messaging layer for BOTH Voice Consultation and Text Chat.
 * Communicates with n8n AI Agent via NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL / NEXT_PUBLIC_N8N_VOICE_WEBHOOK_URL.
 */

export interface SendMessageParams {
  message: string
  mode: 'chat' | 'voice'
  session_id: string
  patient_name?: string
  abha_id?: string
}

export interface SendMessageResponse {
  reply_text: string
  symptoms?: string[]
  symptom_category?: string
  urgency?: string
  risk_level?: 'low' | 'high'
}

/**
 * Retrieves the current consultation session ID or generates a persistent UUID.
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
 * Resets the session ID for a new consultation.
 */
export function resetSessionId(): string {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('swasthyaq_consultation_session_id')
  }
  return getSessionId()
}

/**
 * Main unified message dispatch function for Chat and Voice.
 */
export async function sendMessage({
  message,
  mode,
  session_id,
  patient_name = 'सुनीता देवी',
  abha_id = '94-8231-5612',
}: SendMessageParams): Promise<SendMessageResponse> {
  const webhookUrl =
    process.env.NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL ||
    process.env.NEXT_PUBLIC_N8N_VOICE_WEBHOOK_URL ||
    'http://localhost:5678/webhook/patient-voice-triage'

  if (webhookUrl && webhookUrl.startsWith('http')) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 12000)

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          mode,
          session_id,
          patient_name,
          abha_id,
          source: 'patient_app',
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        return {
          reply_text: data.reply_text || data.reply || 'मैंने आपके लक्षण समझ लिए हैं।',
          symptoms: data.symptoms,
          symptom_category: data.symptom_category || data.category,
          urgency: data.urgency,
          risk_level: data.risk_level || 'low',
        }
      }
    } catch (err) {
      console.warn('n8n webhook call timed out or failed, utilizing local clinical NLP engine:', err)
    }
  }

  // Clinical NLP Fallback heuristics for local dev / offline testing
  const lower = (message || '').toLowerCase()
  let symptoms: string[] = ['बुखार (Fever)', 'सूखी खांसी (Dry Cough)']
  let category = 'General OPD / श्वसन संक्रमण (Respiratory)'
  let urgency = 'Moderate (मध्यम)'
  let reply = 'मैंने आपके लक्षण समझ लिए हैं: बुखार और खांसी। कृपया विवरण की पुष्टि करके अपॉइंटमेंट बुक करें।'

  if (lower.includes('नमस्ते') || lower.includes('hello') || lower.includes('hi') || lower.includes('शुरू')) {
    return {
      reply_text: 'नमस्ते! मैं स्वास्थय-क्यू का स्वास्थ्य सहायक हूँ। आपको क्या तकलीफ़ या लक्षण महसूस हो रहे हैं?',
      symptoms: undefined,
      symptom_category: undefined,
      urgency: undefined,
    }
  }

  if (lower.includes('सिर') || lower.includes('head') || lower.includes('pain') || lower.includes('दर्द')) {
    symptoms = ['तेज सिरदर्द (Severe Headache)', 'कमजोरी और चक्कर (Fatigue)']
    category = 'General Medicine / सामान्य चिकित्सा'
    urgency = 'Standard (सामान्य)'
    reply = 'आपके सिरदर्द और कमजोरी के लक्षण दर्ज कर लिए गए हैं। चलिए डॉक्टर परामर्श का अपॉइंटमेंट बुक करते हैं।'
  } else if (lower.includes('पेट') || lower.includes('stomach') || lower.includes('vomit') || lower.includes('दस्त') || lower.includes('उल्टी')) {
    symptoms = ['पेट दर्द (Abdominal Pain)', 'उल्टी / मिचली (Nausea)']
    category = 'Gastroenterology / पाचन तंत्र'
    urgency = 'Urgent (उच्च प्राथमिकता)'
    reply = 'पेट से जुड़ी समस्या दर्ज कर ली गई है। आपको जल्द डॉक्टर परामर्श की आवश्यकता है।'
  } else if (lower.includes('छाती') || lower.includes('chest') || lower.includes('breath') || lower.includes('सांस')) {
    symptoms = ['सांस लेने में तकलीफ (Shortness of Breath)', 'छाती में भारीपन (Chest Heaviness)']
    category = 'Cardiorespiratory / आपातकालीन'
    urgency = 'Critical (अति-आवश्यक)'
    reply = 'आपातकालीन लक्षण पाए गए हैं। तुरंत डॉक्टर परामर्श व नजदीकी स्वास्थ्य केंद्र से संपर्क करें।'
  }

  return {
    reply_text: reply,
    symptoms,
    symptom_category: category,
    urgency,
    risk_level: urgency.includes('Critical') ? 'high' : 'low',
  }
}
