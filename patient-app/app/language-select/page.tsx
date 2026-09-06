'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BrandLogo } from '@/components/patient/brand-logo'
import { AudioFeedbackToast } from '@/components/patient/audio-feedback-toast'
import { useSpeak } from '@/hooks/useSpeak'
import { Language, translations } from '@/lib/translations'

interface LanguageOption {
  code: Language
  nameNative: string
  nameEnglish: string
  speech: string
  langTag: string
}

const LANGUAGES: LanguageOption[] = [
  {
    code: 'hi',
    nameNative: 'हिन्दी',
    nameEnglish: 'Hindi',
    speech: 'हिन्दी भाषा चुनी गई। आगे बढ़ने के लिए नीचे हरा बटन दबाएं।',
    langTag: 'hi-IN',
  },
  {
    code: 'en',
    nameNative: 'English',
    nameEnglish: 'English',
    speech: 'English language selected. Tap continue button at the bottom to proceed.',
    langTag: 'en-IN',
  },
]

export default function LanguageSelectPage() {
  const router = useRouter()
  const { speak } = useSpeak()
  const [selectedLang, setSelectedLang] = useState<Language>('hi')
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('हिन्दी भाषा चुनी गई')

  const triggerAudio = (message: string, langTag: string = 'hi-IN') => {
    setToastMessage(message)
    setToastVisible(true)
    speak(message, langTag)
    setTimeout(() => {
      setToastVisible(false)
    }, 3500)
  }

  const handleSelect = (lang: LanguageOption) => {
    setSelectedLang(lang.code)
    localStorage.setItem('swasthyaq_patient_lang', lang.code)
    localStorage.setItem('swasthyaq_patient_language', lang.code)
    triggerAudio(lang.speech, lang.langTag)
  }

  const handleContinue = () => {
    const chosen = LANGUAGES.find((l) => l.code === selectedLang) || LANGUAGES[0]
    localStorage.setItem('swasthyaq_patient_lang', chosen.code)
    localStorage.setItem('swasthyaq_patient_language', chosen.code)
    window.dispatchEvent(new Event('languageChange'))

    const confirmSpeech =
      chosen.code === 'en'
        ? 'Language confirmed. Going to home screen...'
        : 'भाषा की पुष्टि हो गई। होम स्क्रीन पर जा रहे हैं...'
    triggerAudio(confirmSpeech, chosen.langTag)

    setTimeout(() => {
      router.push('/home')
    }, 600)
  }

  const isHindi = selectedLang === 'hi'
  const t = translations[selectedLang]

  const readScreenAloud = () => {
    const text = isHindi
      ? 'स्वास्थय-क्यू में आपका स्वागत है। कृपया अपनी पसंदीदा भाषा चुनें: हिन्दी या अंग्रेजी। चुनने के बाद आगे बढ़ें बटन दबाएं।'
      : 'Welcome to SwasthyaQ. Please choose your preferred language: Hindi or English. After selecting, tap continue.'
    triggerAudio(text, isHindi ? 'hi-IN' : 'en-IN')
  }

  return (
    <main className="flex flex-col relative w-full bg-surface min-h-screen pt-safe pb-safe font-body">
      {/* Top Accessibility Announcement & Live Feedback Toast */}
      <AudioFeedbackToast visible={toastVisible} message={toastMessage} />

      <div className="flex flex-col w-full max-w-md mx-auto px-margin-screen pb-36 pt-6">
        {/* Branding & Logo Section */}
        <div className="flex flex-col items-center text-center mt-2 mb-4">
          <div className="w-20 h-20 rounded-2xl p-1 bg-surface-container shadow-md flex items-center justify-center mb-3">
            <BrandLogo size={64} className="w-16 h-16" />
          </div>
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-on-surface font-extrabold tracking-tight mb-1">
            {t.appName}
          </h1>
          <p className="font-label-supporting text-sm text-secondary font-semibold">
            {t.tagline}
          </p>
        </div>

        {/* Welcome Message Card */}
        <div className="flex flex-col items-center text-center mb-4">
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
            {t.welcomeTitle}
          </h2>
          <p className="font-body-md text-secondary font-medium mt-1">
            {t.welcomeSubtitle}
          </p>
        </div>

        {/* Prominent Large Speaker Button */}
        <button
          onClick={readScreenAloud}
          aria-label={t.listenOptions}
          className="w-full flex items-center justify-between p-4 rounded-2xl bg-tertiary-container text-on-tertiary shadow-md active:scale-[0.98] transition-transform mb-5 border border-tertiary/20"
          type="button"
        >
          <div className="flex items-center gap-3.5 text-left">
            <div className="w-12 h-12 rounded-full bg-on-tertiary-container flex items-center justify-center shrink-0 shadow-sm">
              <span
                className="material-symbols-outlined text-tertiary font-black text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                volume_up
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-md text-lg text-tertiary-fixed font-black leading-tight">
                {t.listenOptions}
              </span>
              <span className="font-body-md text-xs text-on-tertiary-container font-semibold mt-0.5">
                {t.listenOptionsDesc}
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-tertiary-fixed text-2xl shrink-0">
            play_circle
          </span>
        </button>

        {/* Section Heading */}
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="font-headline-md text-base font-bold text-on-surface">
            {t.chooseLanguage}
          </span>
          <span className="text-xs text-secondary font-medium">
            {t.selectLangDesc}
          </span>
        </div>

        {/* Two Large Language Options (हिन्दी & English) */}
        <div aria-label="Select Language" className="flex flex-col gap-3.5" role="radiogroup">
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLang === lang.code

            return (
              <div
                key={lang.code}
                onClick={() => handleSelect(lang)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleSelect(lang)
                  }
                }}
                aria-checked={isSelected}
                role="radio"
                tabIndex={0}
                className={`relative flex items-center justify-between w-full min-h-[84px] p-4 rounded-2xl cursor-pointer transition-all bg-surface-container-lowest select-none border-2 ${
                  isSelected
                    ? 'border-primary ring-4 ring-primary/20 shadow-md bg-primary-container/10'
                    : 'border-outline-variant/40 shadow-sm hover:bg-surface-container'
                }`}
              >
                {/* Selection Accent Indicator Line */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-3 bg-primary rounded-l-2xl" />
                )}

                <div className="flex items-center gap-4 pl-2 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'bg-primary text-white shadow-sm' : 'bg-surface-container-high text-transparent'
                    }`}
                  >
                    <span className="material-symbols-outlined text-2xl font-black">check</span>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-headline-lg text-2xl font-black text-on-surface leading-tight">
                      {lang.nameNative}
                    </span>
                    <span className="font-body-md text-xs text-secondary font-semibold mt-0.5">
                      {lang.nameEnglish}
                    </span>
                  </div>
                </div>

                {/* Inline Audio Pronunciation Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelect(lang)
                  }}
                  aria-label={`Pronounce ${lang.nameEnglish}`}
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 active:scale-90 transition-transform ${
                    isSelected
                      ? 'bg-secondary-container text-primary shadow-xs'
                      : 'bg-surface-container text-secondary hover:bg-secondary-container'
                  }`}
                  type="button"
                >
                  <span
                    className="material-symbols-outlined font-bold text-2xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    volume_up
                  </span>
                </button>
              </div>
            )
          })}
        </div>

        {/* Reassurance Footer Card */}
        <div className="flex items-center gap-3 p-4 mt-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 shadow-xs">
          <span
            className="material-symbols-outlined text-tertiary text-3xl shrink-0"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            verified_user
          </span>
          <p className="font-body-md text-xs text-on-surface-variant font-medium leading-relaxed">
            {t.freeServiceNotice}
          </p>
        </div>
      </div>

      {/* Sticky Bottom Navigation CTA Dock */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-surface-container-lowest/95 backdrop-blur-md shadow-2xl border-t border-outline-variant/30">
        <div className="max-w-md mx-auto w-full">
          <button
            onClick={handleContinue}
            className="w-full h-16 rounded-2xl bg-primary hover:bg-primary-container text-on-primary font-label-action text-label-action flex items-center justify-between px-6 shadow-lg shadow-primary/25 active:scale-[0.98] transition-transform cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-3xl font-black">arrow_forward</span>
            <span className="tracking-wide text-lg font-bold">
              {t.continueBtn}
            </span>
            <span className="material-symbols-outlined text-3xl font-black">chevron_right</span>
          </button>
        </div>
      </div>
    </main>
  )
}
