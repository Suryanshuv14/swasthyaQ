'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BrandLogo } from '@/components/patient/brand-logo'
import { useListen } from '@/hooks/useListen'
import { useLanguage } from '@/hooks/useLanguage'
import { usePatientProfile } from '@/hooks/usePatientProfile'
import { ChatMarkdown } from '@/components/patient/chat-markdown'
import { sendMessage, resetSessionId, SendMessageResponse } from '@/lib/n8n'
import { extractPatientPayload } from '@/lib/patientProfile'
import { parseAppointmentFromAiText, saveAppointment } from '@/lib/appointmentStore'

interface ChatMessage {
  id: string
  sender: 'ai' | 'user'
  text: string
  timestamp: string
  isError?: boolean
  triageData?: {
    symptoms?: string[]
    category?: string
    urgency?: string
  }
}

export default function ChatPage() {
  const router = useRouter()
  const { lang, t } = useLanguage()
  const { profile } = usePatientProfile()
  const isHindi = lang === 'hi'

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Suggestion chips for quick patient questions
  const suggestionQuestions = isHindi
    ? [
        'मुझे डॉक्टर का अपॉइंटमेंट चाहिए',
        'मेरे सिर में तेज दर्द और बुखार है',
        'मेरा टोकन नंबर क्या है?',
        'डॉक्टर कितने बजे बैठेंगे?',
      ]
    : [
        'I want an appointment with the doctor',
        'I have fever and severe headache',
        'What is my token number?',
        'What are the doctor OPD timings?',
      ]

  // 1. Initialize a brand new unique session ID whenever starting a new Chat conversation
  useEffect(() => {
    const newSessionId = resetSessionId()
    setSessionId(newSessionId)
  }, [])

  // Initial AI greeting message
  useEffect(() => {
    setMessages([
      {
        id: 'msg-init',
        sender: 'ai',
        text: t.chatInitMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
  }, [t.chatInitMessage])

  // Speech-to-text dictation into chat input field
  const { isListening, transcript, start: startListening, stop: stopListening } = useListen({
    lang: isHindi ? 'hi-IN' : 'en-IN',
    onResult: (finalTranscript) => {
      if (finalTranscript.trim()) {
        setInputText((prev) => (prev ? `${prev} ${finalTranscript}` : finalTranscript))
      }
    },
  })

  // Live preview while speaking
  useEffect(() => {
    if (isListening && transcript) {
      setInputText(transcript)
    }
  }, [isListening, transcript])

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Send message to n8n AI webhook
  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputText).trim()
    // Prevent duplicate sends while request is in progress or input is empty
    if (!messageContent || isTyping) return

    if (isListening) {
      stopListening()
    }

    const currentTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const userMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: messageContent,
      timestamp: currentTimestamp,
    }

    // 1. Show patient message immediately
    setMessages((prev) => [...prev, userMessage])
    setInputText('')
    setLastFailedMessage(null)
    // 2. Show loading / typing state
    setIsTyping(true)

    // 3. Use current persistent session_id (same across whole conversation)
    const activeSessionId = sessionId || resetSessionId()

    try {
      // POST to n8n webhook with message, mode, session_id, and patient profile
      const res: SendMessageResponse = await sendMessage({
        message: messageContent,
        mode: 'chat',
        session_id: activeSessionId,
        patient: extractPatientPayload(profile),
      })

      // 4. Append AI response
      const aiMessage: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'ai',
        text: res.reply_text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        triageData:
          res.symptoms && res.symptoms.length > 0
            ? {
                symptoms: res.symptoms,
                category: res.symptom_category,
                urgency: res.urgency,
              }
            : undefined,
      }

      // 4. Automatically parse and sync confirmed appointments into shared store
      const parsedAppointment = parseAppointmentFromAiText(res.reply_text, profile.name)
      if (parsedAppointment) {
        saveAppointment({
          ...parsedAppointment,
          patientName: profile.name,
          patientId: profile.userId,
        })
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (err) {
      console.error('Failed to receive response from n8n webhook:', err)
      setLastFailedMessage(messageContent)
      
      const errorMsg: ChatMessage = {
        id: 'msg-err-' + Date.now(),
        sender: 'ai',
        text: isHindi
          ? 'माफ़ कीजिए, सर्वर से जुड़ने में समस्या हुई। कृपया नीचे दिए गए बटन से पुनः प्रयास करें।'
          : 'Sorry, could not connect to the assistant server. Please retry using the button below.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsTyping(false)
    }
  }

  const handleRetry = () => {
    if (lastFailedMessage && !isTyping) {
      handleSendMessage(lastFailedMessage)
    }
  }

  const handleBookFromChat = (msg: ChatMessage) => {
    if (!msg.triageData) return
    const triagePayload = {
      reply_text: msg.text,
      symptoms: msg.triageData.symptoms || (isHindi ? ['बुखार', 'खांसी'] : ['Fever', 'Cough']),
      symptom_category: msg.triageData.category || 'General OPD',
      urgency: msg.triageData.urgency || 'Moderate',
    }

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('swasthyaq_triage_data', JSON.stringify(triagePayload))
      sessionStorage.setItem('swasthyaq_last_transcript', msg.text)
    }

    router.push('/consultation/confirm')
  }

  const handleMicToggle = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleStartNewConversation = () => {
    const newId = resetSessionId()
    setSessionId(newId)
    setMessages([
      {
        id: 'msg-init-' + Date.now(),
        sender: 'ai',
        text: t.chatInitMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
  }

  return (
    <main className="flex flex-col relative w-full bg-surface min-h-screen pb-28 font-body">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/30 pt-safe">
        <div className="max-w-md mx-auto h-16 px-margin-screen flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/home"
              aria-label={t.backBtn}
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </Link>
            <div className="flex items-center gap-2.5">
              <BrandLogo size={32} className="w-8 h-8" />
              <div>
                <h1 className="text-sm font-bold text-on-surface font-headline leading-tight">
                  {t.chatHeader}
                </h1>
                <p className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t.chatSubtitle}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStartNewConversation}
              title={isHindi ? 'नई बातचीत शुरू करें' : 'Start New Chat'}
              aria-label="New Conversation"
              className="w-8 h-8 rounded-full bg-surface-container text-secondary flex items-center justify-center active:scale-90 transition-transform"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            </button>

            <Link
              href="/consultation"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-container text-on-primary text-xs font-bold active:scale-95 shadow-xs transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">call</span>
              <span>{t.voiceCallSwitch}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div className="flex-1 max-w-md w-full mx-auto px-margin-screen pt-20 pb-4 flex flex-col gap-3.5">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai'
          return (
            <div key={msg.id} className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}>
              <div
                className={`max-w-[88%] p-4 rounded-3xl shadow-sm text-sm leading-relaxed ${
                  msg.isError
                    ? 'bg-error-container/40 text-on-error-container border border-error/30 rounded-tl-sm'
                    : isAi
                    ? 'bg-surface-container-high text-on-surface rounded-tl-sm border border-outline-variant/40'
                    : 'bg-primary text-on-primary rounded-tr-sm'
                }`}
              >
                {isAi && !msg.isError ? (
                  <ChatMarkdown content={msg.text} />
                ) : (
                  <p className="font-medium text-[14px] whitespace-pre-wrap">{msg.text}</p>
                )}

                {/* Retry Button for network error */}
                {msg.isError && lastFailedMessage && (
                  <button
                    onClick={handleRetry}
                    disabled={isTyping}
                    className="mt-2.5 px-3 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-transform"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                    <span>{isHindi ? 'पुनः प्रयास करें' : 'Retry'}</span>
                  </button>
                )}

                {/* Inline Symptoms Card & Appointment Booking Button */}
                {msg.triageData && (
                  <div className="mt-3.5 pt-3 border-t border-outline-variant/30 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                      <span className="material-symbols-outlined text-[16px]">medical_services</span>
                      <span>{t.recordedSymptoms}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {msg.triageData.symptoms?.map((sym, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-surface-container rounded-xl text-xs font-semibold text-on-surface border border-outline-variant/40 shadow-2xs"
                        >
                          {sym}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => handleBookFromChat(msg)}
                      className="mt-2 w-full py-2.5 px-4 bg-primary text-on-primary rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-primary/20 transition-all hover:bg-primary/95 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                      <span>{t.bookAppointmentFromChat}</span>
                    </button>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-on-surface-variant/70 mt-1 px-1 font-mono">
                {msg.timestamp}
              </span>
            </div>
          )
        })}

        {/* Typing Loading Indicator */}
        {isTyping && (
          <div className="flex items-start">
            <div className="bg-surface-container-high border border-outline-variant/40 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        {/* Suggestion Chips Horizontal Bar */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          {suggestionQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={isTyping}
              className="px-3 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest disabled:opacity-50 text-on-surface text-xs font-medium border border-outline-variant/40 active:scale-95 transition-all text-left"
              type="button"
            >
              {q}
            </button>
          ))}
        </div>

        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Bottom Input Bar */}
      <footer className="fixed bottom-0 left-0 right-0 w-full z-40 bg-surface/95 backdrop-blur-xl border-t border-outline-variant/30 py-3 px-4">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="max-w-md mx-auto flex items-center gap-2 bg-surface-container-low p-1.5 rounded-2xl border border-outline-variant/50 shadow-sm"
        >
          {/* Mic Button for Voice Dictation */}
          <button
            type="button"
            onClick={handleMicToggle}
            aria-label={isListening ? 'Stop listening' : 'Start speaking'}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              isListening
                ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30'
                : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">
              {isListening ? 'mic' : 'mic_none'}
            </span>
          </button>

          {/* Message Input Box (Supports Enter key) */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? t.chatListeningPlaceholder : t.chatPlaceholder}
            className="flex-1 bg-transparent px-2 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none"
            disabled={isTyping}
          />

          {/* Proper Send Button (Disabled while typing or input is empty) */}
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            aria-label="Send message"
            className="w-11 h-11 rounded-xl bg-primary text-on-primary flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all shadow-md shadow-primary/20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </form>
      </footer>
    </main>
  )
}
