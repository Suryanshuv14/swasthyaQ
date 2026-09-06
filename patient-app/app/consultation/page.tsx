'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BrandLogo } from '@/components/patient/brand-logo'
import { useListen } from '@/hooks/useListen'
import { useSpeak } from '@/hooks/useSpeak'
import { useLanguage } from '@/hooks/useLanguage'
import { usePatientProfile } from '@/hooks/usePatientProfile'
import { sendMessage, getSessionId, resetSessionId, SendMessageResponse } from '@/lib/n8n'

export default function VoiceConsultationPage() {
  const router = useRouter()
  const { speak, isSpeaking, stop: stopSpeaking } = useSpeak()
  const { lang, t } = useLanguage()
  const { profile } = usePatientProfile()
  const isHindi = lang === 'hi'

  // Consultation call status
  const [seconds, setSeconds] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')

  // Dialogue messages & conversation history
  const [aiMessage, setAiMessage] = useState('')
  const [patientMessage, setPatientMessage] = useState('')
  const [hasConfirmedAppointment, setHasConfirmedAppointment] = useState(false)

  // Initialize session ID on mount and persist throughout the conversation
  useEffect(() => {
    const activeSessionId = getSessionId()
    setSessionId(activeSessionId)
  }, [])

  // Initial AI greeting
  useEffect(() => {
    setAiMessage(t.aiGreetingVoice)
  }, [t.aiGreetingVoice])

  // Web Speech Listen Hook
  const {
    isListening,
    transcript,
    start: startListening,
    stop: stopListening,
    reset: resetListening,
  } = useListen({
    lang: isHindi ? 'hi-IN' : 'en-IN',
    onResult: (finalTranscript) => {
      if (finalTranscript.trim()) {
        handlePatientSpeechSubmit(finalTranscript.trim())
      }
    },
    onError: (err) => {
      console.warn('Speech recognition error:', err)
    },
  })

  // Call duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto speak greeting on mount
  useEffect(() => {
    speak(t.aiGreetingVoice, isHindi ? 'hi-IN' : 'en-IN')
    const timeout = setTimeout(() => {
      startListening()
    }, 3200)
    return () => {
      clearTimeout(timeout)
      stopSpeaking()
      stopListening()
    }
  }, [speak, startListening, stopSpeaking, stopListening, t.aiGreetingVoice, isHindi])

  // Patient speaks -> STT -> send to n8n ({ message, mode: "voice", session_id }) -> AI response -> TTS playback
  const handlePatientSpeechSubmit = async (spokenText: string) => {
    stopListening()
    stopSpeaking()
    setPatientMessage(spokenText)
    setIsProcessing(true)

    const activeSessionId = sessionId || getSessionId()

    try {
      const response: SendMessageResponse = await sendMessage({
        message: spokenText,
        mode: 'voice',
        session_id: activeSessionId,
      })

      const reply = response.reply_text || (isHindi ? 'मैंने आपकी बात समझ ली है।' : 'I have understood your message.')
      setAiMessage(reply)
      setIsProcessing(false)

      // Store triage data for confirmed screen if symptoms identified
      if (response.symptoms && response.symptoms.length > 0) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(
            'swasthyaq_triage_data',
            JSON.stringify({
              reply_text: reply,
              symptoms: response.symptoms,
              symptom_category: response.symptom_category || 'General OPD',
              urgency: response.urgency || 'Moderate',
            })
          )
        }
      }

      // Check if AI response indicates booking confirmation
      const lowerReply = reply.toLowerCase()
      if (
        lowerReply.includes('टोकन') ||
        lowerReply.includes('token') ||
        lowerReply.includes('कन्फर्म') ||
        lowerReply.includes('booked') ||
        lowerReply.includes('appointment confirmed') ||
        lowerReply.includes('हो गया')
      ) {
        setHasConfirmedAppointment(true)
      }

      // Automatically speak AI response using TTS (Voice Mode requirement)
      if (isSpeakerOn) {
        speak(reply, isHindi ? 'hi-IN' : 'en-IN')
      }
    } catch (err) {
      console.error('Voice consultation request error:', err)
      const errReply = isHindi
        ? 'माफ़ कीजिए, सर्वर से जुड़ने में समस्या हुई। कृपया पुनः बोलें।'
        : 'Could not connect to the server. Please speak again.'
      setAiMessage(errReply)
      setIsProcessing(false)
      if (isSpeakerOn) {
        speak(errReply, isHindi ? 'hi-IN' : 'en-IN')
      }
    }
  }

  const handleMicClick = () => {
    if (isListening) {
      stopListening()
      if (transcript.trim()) {
        handlePatientSpeechSubmit(transcript.trim())
      }
    } else {
      stopSpeaking()
      resetListening()
      startListening()
    }
  }

  const handleEndCall = () => {
    stopSpeaking()
    stopListening()
    router.push('/home')
  }

  const handleRepeatAI = () => {
    if (aiMessage) {
      speak(aiMessage, isHindi ? 'hi-IN' : 'en-IN')
    }
  }

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0')
    const secs = (totalSeconds % 60).toString().padStart(2, '0')
    return `${mins}:${secs}`
  }

  // Current visual call status
  const currentStatus = isProcessing
    ? t.processingSpeech
    : isSpeaking
    ? t.speakingPrompt
    : isListening
    ? t.listeningPrompt
    : t.speakNow

  return (
    <main className="flex flex-col relative w-full bg-surface min-h-screen pt-16 pb-safe font-body">
      {/* Top Fixed Header */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/30 pt-safe">
        <div className="max-w-md mx-auto h-16 px-margin-screen flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleEndCall}
              aria-label={t.backBtn}
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface active:scale-90 transition-transform"
              type="button"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <div className="flex items-center gap-2">
              <BrandLogo size={32} className="w-8 h-8" />
              <div className="flex flex-col">
                <span className="font-headline-md text-sm text-on-surface font-bold">
                  {t.voiceCallHeader}
                </span>
                <span className="text-[10px] font-mono text-secondary">
                  ID: {sessionId.slice(0, 8)}
                </span>
              </div>
            </div>
          </div>

          {/* Call Duration Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container rounded-full text-on-surface text-xs font-mono font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
            <span>{formatTimer(seconds)}</span>
          </div>
        </div>
      </header>

      {/* Main Phone-Call Conversation Body */}
      <div className="flex-1 flex flex-col items-center justify-between max-w-md mx-auto w-full px-margin-screen py-5">
        {/* Assistant Visualizer & Status */}
        <div className="flex flex-col items-center justify-center text-center w-full my-auto">
          {/* Audio Visualizer Circle */}
          <div className="relative flex items-center justify-center my-4">
            {(isListening || isSpeaking || isProcessing) && (
              <>
                <div
                  className="absolute w-56 h-56 rounded-full bg-primary/20 animate-ping pointer-events-none"
                  style={{ animationDuration: '2.5s', animationIterationCount: 'infinite' }}
                />
                <div className="absolute w-44 h-44 rounded-full bg-primary/30 animate-pulse pointer-events-none" />
              </>
            )}

            {/* Central Animated Circle Icon */}
            <div className="w-32 h-32 rounded-full bg-primary-container border-4 border-surface shadow-xl flex items-center justify-center text-on-primary z-10 transition-transform">
              <span
                className="material-symbols-outlined text-[56px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {isProcessing
                  ? 'neurology'
                  : isSpeaking
                  ? 'record_voice_over'
                  : isListening
                  ? 'hearing'
                  : 'medical_services'}
              </span>
            </div>
          </div>

          {/* Status Badge (Listening / Processing / Speaking) */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-semibold text-xs mb-4 shadow-xs transition-colors ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : isProcessing
                ? 'bg-amber-500 text-white'
                : isSpeaking
                ? 'bg-primary text-white'
                : 'bg-surface-container text-secondary'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isListening || isSpeaking ? 'bg-white animate-pulse' : 'bg-current'
              }`}
            />
            <span>{currentStatus}</span>
          </div>

          {/* 1. AI Response Box (Spoken automatically via TTS) */}
          <div className="w-full bg-surface-container-lowest p-5 rounded-3xl shadow-sm border border-outline-variant/30 text-left mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                {t.aiReplied}
              </span>
              <button
                onClick={handleRepeatAI}
                aria-label={t.repeatVoice}
                className="text-xs text-secondary hover:text-primary flex items-center gap-1 active:scale-95"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">replay</span>
                <span>{t.repeatVoice}</span>
              </button>
            </div>
            <p className="font-headline-sm text-sm text-on-surface font-semibold leading-relaxed">
              {aiMessage}
            </p>
          </div>

          {/* 2. Patient Spoken Message Preview */}
          {(patientMessage || transcript) && (
            <div className="w-full bg-secondary-container/40 p-4 rounded-2xl border border-secondary/20 text-left mb-3">
              <span className="text-[11px] font-bold text-secondary flex items-center gap-1 mb-1">
                <span className="material-symbols-outlined text-[14px]">person</span>
                {t.patientSpoke}
              </span>
              <p className="text-xs text-on-surface font-medium leading-normal">
                {patientMessage || transcript}
              </p>
            </div>
          )}

          {/* If appointment confirmed during voice call, provide immediate navigation button */}
          {hasConfirmedAppointment && (
            <Link
              href="/appointment-confirmed"
              className="w-full p-4 rounded-2xl bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform mt-1"
            >
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span>{t.viewAppointmentsBtn}</span>
            </Link>
          )}
        </div>

        {/* Bottom Call Controls Bar */}
        <div className="w-full bg-surface-container-lowest p-4 rounded-3xl shadow-xl border border-outline-variant/30 flex items-center justify-around gap-2 mt-4">
          {/* Speaker Mute/Unmute */}
          <button
            type="button"
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            aria-label={isSpeakerOn ? t.speakerOn : t.speakerOff}
            className={`w-14 h-14 rounded-full flex flex-col items-center justify-center transition-all ${
              isSpeakerOn
                ? 'bg-surface-container text-primary hover:bg-secondary-container'
                : 'bg-surface-container text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[26px]">
              {isSpeakerOn ? 'volume_up' : 'volume_off'}
            </span>
          </button>

          {/* Large Microphone Center Button */}
          <button
            type="button"
            onClick={handleMicClick}
            aria-label={isListening ? 'Stop listening' : 'Start speaking'}
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-all cursor-pointer ${
              isListening
                ? 'bg-red-500 text-white shadow-red-500/40 animate-pulse'
                : 'bg-primary text-on-primary shadow-primary/30 hover:bg-primary-container'
            }`}
          >
            <span
              className="material-symbols-outlined text-[40px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {isListening ? 'mic' : 'mic_none'}
            </span>
          </button>

          {/* End Call / Stop Button */}
          <button
            type="button"
            onClick={handleEndCall}
            aria-label={t.endCall}
            className="w-14 h-14 rounded-full bg-error text-on-error flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[26px]">call_end</span>
          </button>
        </div>
      </div>
    </main>
  )
}
