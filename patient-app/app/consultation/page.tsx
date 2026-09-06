'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BrandLogo } from '@/components/patient/brand-logo'
import { useListen } from '@/hooks/useListen'
import { useSpeak } from '@/hooks/useSpeak'

import { sendMessage, getSessionId, SendMessageResponse } from '@/lib/n8n'

export default function VoiceConsultationPage() {
  const router = useRouter()
  const { speak, isSpeaking, stop: stopSpeaking } = useSpeak()

  // Consultation state
  const [seconds, setSeconds] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Dialogue messages
  const [aiMessage, setAiMessage] = useState(
    'नमस्ते सुनीता जी, आपको क्या परेशानी हो रही है? कृपया बताएं।'
  )
  const [aiMessageEn, setAiMessageEn] = useState(
    'Namaste Sunita ji, what symptoms are you experiencing?'
  )
  const [userSpeech, setUserSpeech] = useState('')
  const [userSpeechEn, setUserSpeechEn] = useState('')

  // Web Speech Listen Hook
  const { isListening, transcript, start: startListening, stop: stopListening } = useListen({
    lang: 'hi-IN',
    onResult: (finalTranscript) => {
      if (finalTranscript.trim()) {
        handleSendVoiceTranscript(finalTranscript)
      }
    },
    onError: (err) => {
      console.warn('Speech recognition error:', err)
    },
  })

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto speak greeting on mount
  useEffect(() => {
    const initialGreeting = 'नमस्ते सुनीता जी, आपको क्या परेशानी हो रही है? कृपया बताएं।'
    speak(initialGreeting, 'hi-IN')
    // Automatically start listening after greeting
    const timeout = setTimeout(() => {
      startListening()
    }, 2800)
    return () => {
      clearTimeout(timeout)
      stopSpeaking()
      stopListening()
    }
  }, [speak, startListening, stopSpeaking, stopListening])

  // Process speech transcript to n8n webhook (or fallback triage)
  const handleSendVoiceTranscript = async (spokenText: string) => {
    stopListening()
    setUserSpeech(spokenText)
    setUserSpeechEn(spokenText)
    setIsProcessing(true)
    setErrorMessage(null)

    const sessionId = getSessionId()
    const triageResult: SendMessageResponse = await sendMessage({
      message: spokenText,
      mode: 'voice',
      session_id: sessionId,
      patient_name: 'सुनीता देवी',
      abha_id: '94-8231-5612',
    })

    // Update AI reply
    setAiMessage(triageResult.reply_text)
    setAiMessageEn('Understood symptoms. Let us proceed to confirmation.')
    setIsProcessing(false)

    // Store in sessionStorage for confirmation screen
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        'swasthyaq_triage_data',
        JSON.stringify({
          reply_text: triageResult.reply_text,
          symptoms: triageResult.symptoms || ['बुखार (Fever)', 'खांसी (Cough)'],
          symptom_category: triageResult.symptom_category || 'General OPD',
          urgency: triageResult.urgency || 'Moderate',
        })
      )
      sessionStorage.setItem('swasthyaq_last_transcript', spokenText)
    }

    // Speak AI response
    if (isSpeakerOn) {
      speak(triageResult.reply_text, 'hi-IN')
    }

    // Navigate to confirmation page after AI speaks
    setTimeout(() => {
      router.push('/consultation/confirm')
    }, 2800)
  }

  const handleMicToggle = () => {
    if (isListening) {
      stopListening()
    } else {
      setErrorMessage(null)
      startListening()
    }
  }

  const handleRepeat = () => {
    if (aiMessage) {
      speak(aiMessage, 'hi-IN')
    }
  }

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0')
    const secs = (totalSeconds % 60).toString().padStart(2, '0')
    return `${mins}:${secs}`
  }

  return (
    <main className="flex flex-col relative w-full bg-surface min-h-screen pt-16 pb-safe">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/30 pt-safe">
        <div className="max-w-md mx-auto h-16 px-margin-screen flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/home"
              aria-label="Go back"
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </Link>
            <div className="flex items-center gap-2">
              <BrandLogo size={32} className="w-8 h-8" />
              <h1 className="font-headline-md text-[17px] text-on-surface font-bold">
                Live Consultation
              </h1>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary font-bold text-xs flex items-center justify-center ring-2 ring-primary-container/20">
            SD
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full max-w-md mx-auto px-margin-screen pb-safe">
        {/* Call Timer & Status Indicator */}
        <div className="flex flex-col items-center justify-center pt-3 pb-3">
          <div className="inline-flex items-center gap-2 bg-tertiary/10 px-4 py-1 rounded-full shadow-xs mb-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-tertiary" />
            </span>
            <span className="font-label-supporting text-[13px] text-tertiary font-bold tracking-wide">
              कॉल जारी है • {formatTimer(seconds)}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">support_agent</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-md text-[16px] text-on-surface font-bold leading-tight">
                स्वास्थ्य सहायक
              </span>
              <span className="font-label-supporting text-[11px] text-on-surface-variant leading-none">
                SwasthyaQ Clinical AI Voice
              </span>
            </div>
          </div>
        </div>

        {/* Center Animated Voice Core / Mic Trigger */}
        <div className="flex flex-col items-center justify-center my-2 relative">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Pulsing concentric rings when active */}
            {(isListening || isSpeaking || isProcessing) && (
              <>
                <div className="absolute inset-0 rounded-full bg-primary-fixed-dim/40 animate-ping opacity-60 pointer-events-none" />
                <div className="absolute inset-2 rounded-full bg-secondary-fixed/50 animate-pulse pointer-events-none" />
              </>
            )}

            <button
              onClick={handleMicToggle}
              aria-label={isListening ? 'Stop listening' : 'Start talking'}
              className={`relative w-28 h-28 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all z-10 cursor-pointer ${
                isListening
                  ? 'bg-tertiary text-on-tertiary ring-4 ring-tertiary/30'
                  : isProcessing
                  ? 'bg-secondary text-on-secondary animate-pulse'
                  : 'bg-primary text-on-primary'
              }`}
              type="button"
            >
              {isProcessing ? (
                <span className="material-symbols-outlined text-[36px] animate-spin">
                  progress_activity
                </span>
              ) : isSpeaking ? (
                /* Animated Sound Wave Bars */
                <div className="flex items-center gap-1.5 h-10">
                  <span className="w-1 bg-primary-fixed rounded-full animate-[bounce_1s_infinite_100ms] h-5" />
                  <span className="w-1 bg-surface-container-lowest rounded-full animate-[bounce_1.2s_infinite_200ms] h-8" />
                  <span className="w-1 bg-primary-fixed-dim rounded-full animate-[bounce_0.9s_infinite_300ms] h-10" />
                  <span className="w-1 bg-surface-container-lowest rounded-full animate-[bounce_1.1s_infinite_150ms] h-7" />
                  <span className="w-1 bg-primary-fixed rounded-full animate-[bounce_1s_infinite_250ms] h-4" />
                </div>
              ) : (
                <span className="material-symbols-outlined text-[40px]">
                  {isListening ? 'mic' : 'mic_none'}
                </span>
              )}
            </button>
          </div>

          {/* Status Label Pill */}
          <div className="mt-3 flex items-center gap-2 bg-surface-container-high px-4 py-1.5 rounded-full shadow-xs">
            <span
              className="material-symbols-outlined text-primary text-[18px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {isProcessing ? 'hourglass_top' : isSpeaking ? 'volume_up' : isListening ? 'mic' : 'hearing'}
            </span>
            <span className="font-label-supporting text-[13px] text-primary font-bold">
              {isProcessing
                ? 'विश्लेषण हो रहा है... (Analyzing...)'
                : isSpeaking
                ? 'सहायक बोल रहा है... (Assistant Speaking...)'
                : isListening
                ? 'सुन रहा हूँ... बोलिए (Listening...)'
                : 'बोलने के लिए माइक दबाएं (Tap to Speak)'}
            </span>
          </div>
        </div>

        {/* Error / Timeout banner */}
        {errorMessage && (
          <div className="mt-2 p-3 rounded-xl bg-error-container text-on-error-container text-xs font-semibold flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => handleSendVoiceTranscript(userSpeech || 'मुझे बुखार और खांसी है')}
              className="px-2.5 py-1 rounded bg-error text-on-error font-bold text-xs"
            >
              पुनः प्रयास (Retry)
            </button>
          </div>
        )}

        {/* Conversation Dialogue Cards */}
        <div className="flex flex-col gap-stack-gap-sm my-3">
          {/* AI Assistant Message Bubble */}
          <div className="bg-primary text-on-primary rounded-2xl p-card-padding shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="material-symbols-outlined text-[18px] text-primary-fixed">
                hearing
              </span>
              <span className="font-label-supporting text-[11px] text-primary-fixed font-bold uppercase tracking-wider">
                AI सहायक • AI Assistant
              </span>
            </div>
            <p className="font-headline-md text-[17px] leading-snug">
              &quot;{aiMessage}&quot;
            </p>
            <p className="font-label-supporting text-[12px] text-on-primary-container mt-1">
              {aiMessageEn}
            </p>
          </div>

          {/* Patient Voice Response Bubble */}
          <div className="bg-surface-container text-on-surface rounded-2xl p-card-padding shadow-sm border border-outline-variant/30">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="material-symbols-outlined text-[18px] text-tertiary">mic</span>
              <span className="font-label-supporting text-[11px] text-tertiary font-bold uppercase tracking-wider">
                आपकी आवाज़ • Your Response
              </span>
            </div>
            <p className="font-body-lg text-[16px] text-on-surface font-semibold leading-snug">
              {transcript
                ? `"${transcript}"`
                : userSpeech
                ? `"${userSpeech}"`
                : '"बोलिए... आपकी आवाज़ यहाँ दिखाई देगी (Speak now...)"'}
            </p>
            <p className="font-label-supporting text-[12px] text-on-surface-variant mt-1">
              {userSpeechEn || 'Listening to your symptoms via microphone.'}
            </p>
          </div>
        </div>

        {/* Interactive Controls Bar (Mute / Speaker / Repeat) */}
        <div className="flex items-center justify-between gap-3 pt-1 pb-3">
          {/* Mute Button */}
          <button
            onClick={() => {
              setIsMuted(!isMuted)
              if (!isMuted) stopListening()
              else startListening()
            }}
            className={`flex-1 flex flex-col items-center justify-center h-16 rounded-2xl active:scale-95 transition-all shadow-xs border border-outline-variant/30 ${
              isMuted
                ? 'bg-error-container text-on-error-container ring-2 ring-error'
                : 'bg-surface-container-high text-on-surface hover:bg-surface-container'
            }`}
            type="button"
          >
            <span className={`material-symbols-outlined text-[24px] ${isMuted ? 'text-error' : 'text-secondary'}`}>
              {isMuted ? 'mic_off' : 'mic'}
            </span>
            <span className="font-label-supporting text-[12px] mt-0.5 font-bold">
              {isMuted ? 'माइक बंद' : 'माइक चालू'}
            </span>
            <span className="text-[10px] text-on-surface-variant leading-none">
              {isMuted ? 'Unmute' : 'Mute'}
            </span>
          </button>

          {/* Speaker Button */}
          <button
            onClick={() => {
              setIsSpeakerOn(!isSpeakerOn)
              if (isSpeakerOn) stopSpeaking()
            }}
            className={`flex-1 flex flex-col items-center justify-center h-16 rounded-2xl active:scale-95 transition-all shadow-xs border border-outline-variant/30 ${
              isSpeakerOn
                ? 'bg-secondary-container text-on-secondary-container ring-2 ring-primary'
                : 'bg-surface-container-high text-on-surface'
            }`}
            type="button"
          >
            <span
              className="material-symbols-outlined text-[24px] text-primary"
              style={{ fontVariationSettings: isSpeakerOn ? "'FILL' 1" : "'FILL' 0" }}
            >
              volume_up
            </span>
            <span className="font-label-supporting text-[12px] mt-0.5 font-bold text-primary">
              {isSpeakerOn ? 'आवाज़ चालू' : 'आवाज़ बंद'}
            </span>
            <span className="text-[10px] text-primary font-medium leading-none">
              Speaker
            </span>
          </button>

          {/* Repeat Button */}
          <button
            onClick={handleRepeat}
            className="flex-1 flex flex-col items-center justify-center h-16 rounded-2xl bg-surface-container-high hover:bg-surface-container text-on-surface active:scale-95 transition-all shadow-xs border border-outline-variant/30"
            type="button"
          >
            <span className="material-symbols-outlined text-[24px] text-secondary">replay</span>
            <span className="font-label-supporting text-[12px] mt-0.5 font-bold">फिर सुनें</span>
            <span className="text-[10px] text-on-surface-variant leading-none">Repeat</span>
          </button>
        </div>

        {/* Manual Direct Proceed Option (Simulate Triage for Testing) */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => handleSendVoiceTranscript('मुझे दो दिन से तेज बुखार और खांसी है')}
            className="flex-1 py-2 px-3 rounded-xl bg-surface-container-low text-primary font-bold text-xs border border-outline-variant/30 hover:bg-secondary-container active:scale-95 transition-all"
            type="button"
          >
            बुखार + खांसी टेस्ट (Demo Speech)
          </button>
        </div>

        {/* End Call Button */}
        <div className="w-full pb-4">
          <button
            onClick={() => {
              stopSpeaking()
              stopListening()
              router.push('/home')
            }}
            className="w-full h-14 rounded-2xl bg-error hover:bg-error/90 text-on-error flex items-center justify-center gap-3 active:scale-[0.98] transition-transform shadow-md"
            type="button"
          >
            <span className="material-symbols-outlined text-[28px]">call_end</span>
            <div className="flex flex-col items-start leading-none text-left">
              <span className="font-label-action text-[16px] font-bold text-on-error">
                कॉल समाप्त करें
              </span>
              <span className="font-label-supporting text-[11px] text-on-error/80 mt-0.5">
                End Voice Consultation
              </span>
            </div>
          </button>
        </div>
      </div>
    </main>
  )
}
