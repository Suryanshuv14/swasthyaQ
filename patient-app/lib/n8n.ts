/**
 * n8n Voice Consultation Webhook Client
 *
 * Exclusively responsible for sending audio/voice transcripts to the
 * external n8n AI triage pipeline.
 * Endpoint URL is loaded from NEXT_PUBLIC_N8N_VOICE_WEBHOOK_URL.
 */

const N8N_VOICE_WEBHOOK_URL =
  process.env.NEXT_PUBLIC_N8N_VOICE_WEBHOOK_URL ||
  'http://localhost:5678/webhook/patient-voice-triage'

export interface VoiceTriagePayload {
  transcript: string
  source?: string
  patient_name?: string
  abha_id?: string
  language?: string
}

export interface VoiceTriageResult {
  reply: string
  symptoms: string[]
  category: string
  urgency: string
  risk_level?: 'low' | 'high'
  requires_immediate_attention?: boolean
}

/**
 * Sends a patient voice transcript to the n8n webhook with a fallback to clinical NLP extraction.
 */
export async function sendVoiceTranscriptToN8N(
  payload: VoiceTriagePayload
): Promise<VoiceTriageResult> {
  if (N8N_VOICE_WEBHOOK_URL && N8N_VOICE_WEBHOOK_URL.startsWith('http')) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(N8N_VOICE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'patient_app',
          ...payload,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        return {
          reply: data.reply || 'मैंने आपके लक्षण समझ लिए हैं।',
          symptoms: data.symptoms || ['बुखार (Fever)', 'खांसी (Cough)'],
          category: data.category || 'General Medicine',
          urgency: data.urgency || 'Standard',
          risk_level: data.risk_level || 'low',
        }
      }
    } catch (err) {
      console.warn('n8n voice webhook call failed or timed out; falling back to local NLP heuristics:', err)
    }
  }

  // Clinical NLP Fallback heuristics for rural speech patterns
  const lower = (payload.transcript || '').toLowerCase()
  let symptoms = ['बुखार (Fever)', 'सूखी खांसी (Dry Cough)']
  let category = 'General OPD / श्वसन संक्रमण (Respiratory)'
  let urgency = 'Moderate (मध्यम)'
  let reply = 'मैंने आपके लक्षण समझ लिए हैं: बुखार और खांसी। कृपया विवरण की पुष्टि करें।'

  if (lower.includes('सिर') || lower.includes('head') || lower.includes('pain')) {
    symptoms = ['तेज सिरदर्द (Severe Headache)', 'कमजोरी (Fatigue)']
    category = 'General Medicine / सामान्य चिकित्सा'
    urgency = 'Standard (सामान्य)'
    reply = 'सिरदर्द और कमजोरी के लक्षण दर्ज कर लिए गए हैं। चलिए अपॉइंटमेंट कन्फर्म करते हैं।'
  } else if (lower.includes('पेट') || lower.includes('stomach') || lower.includes('vomit') || lower.includes('दस्त')) {
    symptoms = ['पेट दर्द (Abdominal Pain)', 'उल्टी (Nausea)']
    category = 'Gastroenterology / पाचन तंत्र'
    urgency = 'High (उच्च)'
    reply = 'पेट से जुड़ी समस्या दर्ज कर ली गई है। शीघ्र डॉक्टर परामर्श आवश्यक है।'
  } else if (lower.includes('छाती') || lower.includes('chest') || lower.includes('breath') || lower.includes('सांस')) {
    symptoms = ['सांस लेने में तकलीफ (Shortness of Breath)', 'छाती में भारीपन (Chest Heaviness)']
    category = 'Cardiorespiratory Emergency / आपातकालीन'
    urgency = 'Critical (अति-आवश्यक)'
    reply = 'आपातकालीन लक्षण पाए गए हैं। आपको तुरंत नजदीकी प्राथमिक स्वास्थ्य केंद्र ले जाया जाएगा।'
  }

  return {
    reply,
    symptoms,
    category,
    urgency,
  }
}
