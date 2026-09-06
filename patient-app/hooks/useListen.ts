'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseListenOptions {
  lang?: string
  continuous?: boolean
  interimResults?: boolean
  onResult?: (transcript: string) => void
  onError?: (error: string) => void
}

interface UseListenReturn {
  isListening: boolean
  transcript: string
  error: string | null
  start: () => void
  stop: () => void
  reset: () => void
  hasSupport: boolean
}

export function useListen(options?: UseListenOptions): UseListenReturn {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [hasSupport, setHasSupport] = useState(false)

  const recognitionRef = useRef<any>(null)
  const optionsRef = useRef(options)
  optionsRef.current = options

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        setHasSupport(true)
        const recognition = new SpeechRecognition()
        recognition.continuous = options?.continuous ?? true
        recognition.interimResults = options?.interimResults ?? true
        recognition.lang = options?.lang || 'hi-IN'

        recognition.onstart = () => {
          setIsListening(true)
          setError(null)
        }

        recognition.onresult = (event: any) => {
          let currentTranscript = ''
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript
          }
          setTranscript(currentTranscript)

          // Check if latest result is final
          const isFinal = event.results[event.results.length - 1].isFinal
          if (isFinal && optionsRef.current?.onResult) {
            optionsRef.current.onResult(currentTranscript)
          }
        }

        recognition.onerror = (event: any) => {
          console.warn('SpeechRecognition error:', event.error)
          setError(event.error)
          setIsListening(false)
          if (optionsRef.current?.onError) {
            optionsRef.current.onError(event.error)
          }
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current = recognition
      } else {
        setHasSupport(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {}
      }
    }
  }, [options?.continuous, options?.interimResults, options?.lang])

  const start = useCallback(() => {
    setError(null)
    setTranscript('')
    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = optionsRef.current?.lang || 'hi-IN'
        recognitionRef.current.start()
        setIsListening(true)
      } catch (err: any) {
        console.warn('Failed to start SpeechRecognition:', err)
        // If already started, ignore error
      }
    } else {
      // Fallback for demo environments without SpeechRecognition API support
      setIsListening(true)
    }
  }, [])

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {}
    }
    setIsListening(false)
  }, [])

  const reset = useCallback(() => {
    stop()
    setTranscript('')
    setError(null)
  }, [stop])

  return {
    isListening,
    transcript,
    error,
    start,
    stop,
    reset,
    hasSupport,
  }
}
