'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BrandLogo } from '@/components/patient/brand-logo'
import { useListen } from '@/hooks/useListen'
import { sendMessage, getSessionId, SendMessageResponse } from '@/lib/n8n'

interface ChatMessage {
  id: string
  sender: 'ai' | 'user'
  text: string
  textEn?: string
  timestamp: string
  triageData?: {
    symptoms?: string[]
    category?: string
    urgency?: string
  }
}

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'ai',
      text: 'नमस्ते सुनीता जी! मैं स्वास्थय-क्यू का स्वास्थ्य सहायक हूँ। आपको क्या परेशानी हो रही है? आप लिखकर या माइक दबाकर बोल सकते हैं।',
      textEn: 'Namaste Sunita ji! I am your SwasthyaQ Health Assistant. How are you feeling today? You can type or tap the mic to speak.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Web Speech recognition for voice-to-text in chat input
  const { isListening, transcript, start: startListening, stop: stopListening } = useListen({
    lang: 'hi-IN',
    onResult: (finalTranscript) => {
      if (finalTranscript.trim()) {
        setInputText((prev) => (prev ? `${prev} ${finalTranscript}` : finalTranscript))
      }
    },
  })

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // If transcript changes while listening, keep input text live
  useEffect(() => {
    if (isListening && transcript) {
      setInputText(transcript)
    }
  }, [isListening, transcript])

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = inputText.trim()
    if (!trimmed || isTyping) return

    if (isListening) {
      stopListening()
    }

    const userMsgId = 'msg-' + Date.now()
    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    // Optimistic UI update
    setMessages((prev) => [...prev, userMessage])
    setInputText('')
    setIsTyping(true)

    try {
      const sessionId = getSessionId()
      const res: SendMessageResponse = await sendMessage({
        message: trimmed,
        mode: 'chat',
        session_id: sessionId,
      })

      const aiMsgId = 'msg-' + (Date.now() + 1)
      const aiMessage: ChatMessage = {
        id: aiMsgId,
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

      setMessages((prev) => [...prev, aiMessage])
    } catch (err) {
      console.error('Failed to send message:', err)
      const errorMsg: ChatMessage = {
        id: 'msg-err-' + Date.now(),
        sender: 'ai',
        text: 'माफ़ कीजिए, सर्वर से जुड़ने में समस्या हुई। कृपया दोबारा प्रयास करें।',
        textEn: 'Sorry, could not reach the server. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsTyping(false)
    }
  }

  const handleBookAppointment = (msg: ChatMessage) => {
    if (!msg.triageData) return
    const triagePayload = {
      reply_text: msg.text,
      symptoms: msg.triageData.symptoms || ['बुखार (Fever)', 'खांसी (Cough)'],
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

  return (
    <main className="flex flex-col relative w-full bg-surface min-h-screen pb-24 font-body">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/30">
        <div className="max-w-md mx-auto h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/home"
              aria-label="Back to home"
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </Link>
            <div className="flex items-center gap-2.5">
              <BrandLogo size={32} className="w-8 h-8" />
              <div>
                <h1 className="text-sm font-bold text-on-surface font-headline leading-tight">
                  AI स्वास्थ्य सहायक (Chat)
                </h1>
                <p className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ऑनलाइन • n8n Clinical AI
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/consultation"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">call</span>
            <span>Voice Call</span>
          </Link>
        </div>
      </header>

      {/* Messages Container */}
      <div className="flex-1 max-w-md w-full mx-auto px-4 pt-20 pb-4 flex flex-col gap-4">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai'
          return (
            <div key={msg.id} className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}>
              <div
                className={`max-w-[85%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                  isAi
                    ? 'bg-surface-container-high text-on-surface rounded-tl-sm border border-outline-variant/40'
                    : 'bg-primary text-on-primary rounded-tr-sm'
                }`}
              >
                <p className="font-medium text-[14px]">{msg.text}</p>
                {msg.textEn && (
                  <p
                    className={`mt-1.5 text-xs ${
                      isAi ? 'text-on-surface-variant/80' : 'text-on-primary/80'
                    }`}
                  >
                    {msg.textEn}
                  </p>
                )}

                {/* Inline Symptoms Card & Appointment Booking Button */}
                {msg.triageData && (
                  <div className="mt-3.5 pt-3 border-t border-outline-variant/30 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                      <span className="material-symbols-outlined text-[16px]">medical_services</span>
                      <span>दर्ज लक्षण (Identified Symptoms)</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {msg.triageData.symptoms?.map((sym, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-surface-container rounded-lg text-xs font-medium text-on-surface border border-outline-variant/40"
                        >
                          {sym}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => handleBookAppointment(msg)}
                      className="mt-2 w-full py-2.5 px-4 bg-primary text-on-primary rounded-xl font-semibold text-xs flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-primary/20 transition-all hover:bg-primary/95"
                    >
                      <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                      <span>अपॉइंटमेंट बुक करें (Book Appointment)</span>
                    </button>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-on-surface-variant/70 mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          )
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start">
            <div className="bg-surface-container-high border border-outline-variant/40 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Bottom Input Bar */}
      <footer className="fixed bottom-0 left-0 right-0 w-full z-40 bg-surface/95 backdrop-blur-xl border-t border-outline-variant/30 py-3 px-4">
        <form
          onSubmit={handleSend}
          className="max-w-md mx-auto flex items-center gap-2 bg-surface-container-low p-1.5 rounded-2xl border border-outline-variant/50 shadow-sm"
        >
          {/* Mic Button for Voice Typing */}
          <button
            type="button"
            onClick={handleMicToggle}
            aria-label={isListening ? 'Stop listening' : 'Start speaking'}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
              isListening
                ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30'
                : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">
              {isListening ? 'mic' : 'mic_none'}
            </span>
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isListening ? 'सुन रहे हैं... बोलिए...' : 'लक्षण लिखें या बोलें (Type symptoms)...'}
            className="flex-1 bg-transparent px-2 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            aria-label="Send message"
            className="w-11 h-11 rounded-xl bg-primary text-on-primary flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all shadow-md shadow-primary/20"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </form>
      </footer>
    </main>
  )
}
