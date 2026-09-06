'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseSpeakReturn {
  speak: (textToSpeak?: string, lang?: string) => void
  stop: () => void
  isSpeaking: boolean
}

export function useSpeak(defaultText?: string, defaultLang: string = 'hi-IN'): UseSpeakReturn {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [])

  const speak = useCallback(
    (textToSpeak?: string, lang?: string) => {
      const targetText = textToSpeak || defaultText
      const targetLang = lang || defaultLang

      if (!targetText || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(targetText)
      utterance.lang = targetLang
      utterance.rate = 0.95
      utterance.pitch = 1.0

      // Match voice if available
      const voices = window.speechSynthesis.getVoices()
      const matchedVoice = voices.find((v) => v.lang.startsWith(targetLang.slice(0, 2)))
      if (matchedVoice) {
        utterance.voice = matchedVoice
      }

      utterance.onstart = () => {
        setIsSpeaking(true)
      }

      utterance.onend = () => {
        setIsSpeaking(false)
      }

      utterance.onerror = () => {
        setIsSpeaking(false)
      }

      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
    },
    [defaultText, defaultLang]
  )

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  return { speak, stop, isSpeaking }
}
