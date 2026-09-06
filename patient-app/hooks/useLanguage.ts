'use client'

import { useState, useEffect, useCallback } from 'react'
import { Language, translations, TranslationDictionary } from '@/lib/translations'

export function useLanguage() {
  const [lang, setLangState] = useState<Language>('hi')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = (localStorage.getItem('swasthyaq_patient_lang') ||
        localStorage.getItem('swasthyaq_patient_language')) as Language | null
      if (saved === 'en' || saved === 'hi') {
        setLangState(saved)
      } else {
        setLangState('hi')
      }
      setIsLoaded(true)
    }
  }, [])

  const setLanguage = useCallback((newLang: Language) => {
    setLangState(newLang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('swasthyaq_patient_lang', newLang)
      localStorage.setItem('swasthyaq_patient_language', newLang)
      // Dispatch storage event so other components update synchronously
      window.dispatchEvent(new Event('languageChange'))
    }
  }, [])

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = (localStorage.getItem('swasthyaq_patient_lang') ||
        localStorage.getItem('swasthyaq_patient_language')) as Language | null
      if (saved === 'en' || saved === 'hi') {
        setLangState(saved)
      }
    }

    window.addEventListener('languageChange', handleStorageChange)
    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('languageChange', handleStorageChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const t: TranslationDictionary = translations[lang] || translations.hi

  return {
    lang,
    setLanguage,
    t,
    isLoaded,
  }
}
