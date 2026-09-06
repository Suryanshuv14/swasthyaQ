'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BrandLogo } from '@/components/patient/brand-logo'
import { AudioFeedbackToast } from '@/components/patient/audio-feedback-toast'
import { useSpeak } from '@/hooks/useSpeak'

interface LanguageOption {
  code: string
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
    nameEnglish: 'अंग्रेज़ी',
    speech: 'English language selected. Tap continue at the bottom to proceed.',
    langTag: 'en-IN',
  },
  {
    code: 'mr',
    nameNative: 'मराठी',
    nameEnglish: 'Marathi',
    speech: 'मराठी भाषा निवडली. पुढे जाण्यासाठी खालील बटण दाबा.',
    langTag: 'mr-IN',
  },
  {
    code: 'bn',
    nameNative: 'বাংলা',
    nameEnglish: 'Bengali',
    speech: 'বাংলা ভাষা নির্বাচিত হয়েছে। এগিয়ে যেতে নিচের বোতামে চাপ দিন।',
    langTag: 'bn-IN',
  },
  {
    code: 'te',
    nameNative: 'తెలుగు',
    nameEnglish: 'Telugu',
    speech: 'తెలుగు భాష ఎంపిక చేయబడింది. కొనసాగడానికి క్రింది బటన్‌ను నొక్కండి.',
    langTag: 'te-IN',
  },
]

export default function LanguageSelectPage() {
  const router = useRouter()
  const { speak } = useSpeak()
  const [selectedLang, setSelectedLang] = useState<string>('hi')
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('हिन्दी भाषा चुनी गई')

  const triggerAudio = (message: string, langTag: string = 'hi-IN') => {
    setToastMessage(message)
    setToastVisible(true)
    speak(message, langTag)
    setTimeout(() => {
      setToastVisible(false)
    }, 3200)
  }

  const handleSelect = (lang: LanguageOption) => {
    setSelectedLang(lang.code)
    localStorage.setItem('swasthyaq_patient_lang', lang.code)
    triggerAudio(lang.speech, lang.langTag)
  }

  const handleContinue = () => {
    const chosen = LANGUAGES.find((l) => l.code === selectedLang) || LANGUAGES[0]
    localStorage.setItem('swasthyaq_patient_lang', chosen.code)
    triggerAudio('भाषा की पुष्टि हो गई। होम स्क्रीन पर जा रहे हैं...', chosen.langTag)
    setTimeout(() => {
      router.push('/home')
    }, 600)
  }

  return (
    <main className="flex flex-col relative w-full bg-surface min-h-screen pt-safe pb-safe">
      {/* Top Accessibility Announcement & Live Feedback Toast */}
      <AudioFeedbackToast visible={toastVisible} message={toastMessage} />

      <div className="flex flex-col w-full max-w-md mx-auto px-margin-screen pb-36 pt-4">
        {/* Branding & Logo Section */}
        <div className="flex flex-col items-center text-center mt-2 mb-4">
          <div className="w-20 h-20 rounded-2xl p-1 bg-surface-container shadow-md flex items-center justify-center mb-3">
            <BrandLogo size={64} className="w-16 h-16" />
          </div>
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-on-surface font-extrabold tracking-tight mb-1">
            SwasthyaQ
          </h1>
          <p className="font-label-supporting text-label-supporting text-secondary font-semibold">
            Rural Health by Voice / आवाज़ से स्वास्थ्य सेवा
          </p>
        </div>

        {/* Screen Title / Dual Language Prompt */}
        <div className="flex flex-col items-center text-center mb-4">
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
            Choose your language
          </h2>
          <p className="font-headline-md text-headline-md text-primary font-bold mt-0.5">
            अपनी भाषा चुनें
          </p>
        </div>

        {/* Audio Helper Banner (Assisted Navigation) */}
        <button
          onClick={() => triggerAudio('कृपया अपनी पसंदीदा भाषा चुनें और नीचे आगे बढ़ें बटन दबाएं।', 'hi-IN')}
          aria-label="Listen to instructions: विकल्प सुनने के लिए टैप करें"
          className="w-full flex items-center justify-between p-4 rounded-xl bg-tertiary-container text-on-tertiary shadow-sm active:scale-[0.98] transition-transform mb-stack-gap-md"
          type="button"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="w-11 h-11 rounded-full bg-on-tertiary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-tertiary font-bold text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                volume_up
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-md text-headline-md text-tertiary-fixed leading-tight">
                Listen to options
              </span>
              <span className="font-body-md text-body-md text-on-tertiary-container font-semibold">
                विकल्प सुनने के लिए टैप करें
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-tertiary-fixed text-2xl shrink-0">
            play_circle
          </span>
        </button>

        {/* Language Selector Options List */}
        <div aria-label="Select Language" className="flex flex-col gap-stack-gap-sm" role="radiogroup">
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
                className={`relative flex items-center justify-between w-full min-h-[72px] p-4 rounded-xl cursor-pointer transition-all bg-surface-container-lowest select-none ${
                  isSelected
                    ? 'shadow-md shadow-primary/10 ring-2 ring-primary'
                    : 'shadow-sm hover:bg-surface-container'
                }`}
              >
                {/* Selection Accent Indicator Line */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-primary rounded-l-xl" />
                )}

                <div className="flex items-center gap-4 pl-2 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'bg-primary text-white shadow-sm' : 'bg-surface-container-high text-transparent'
                    }`}
                  >
                    <span className="material-symbols-outlined text-2xl font-black">check</span>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-headline-lg text-headline-lg font-extrabold text-on-surface leading-tight">
                      {lang.nameNative}
                    </span>
                    <span className="font-body-md text-body-md text-secondary font-medium">
                      {lang.nameEnglish}
                    </span>
                  </div>
                </div>

                {/* Inline Audio Assist Trigger */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelect(lang)
                  }}
                  aria-label={`Listen ${lang.nameEnglish} pronunciation`}
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 active:scale-90 transition-transform ${
                    isSelected
                      ? 'bg-secondary-container text-primary'
                      : 'bg-surface-container text-secondary hover:bg-secondary-container'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined font-bold text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    volume_up
                  </span>
                </button>
              </div>
            )
          })}
        </div>

        {/* Reassurance Footer Card */}
        <div className="flex items-center gap-3 p-4 mt-6 rounded-xl bg-surface-container-low">
          <span className="material-symbols-outlined text-tertiary text-3xl shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
            verified_user
          </span>
          <p className="font-body-md text-body-md text-on-surface-variant font-medium">
            Free public health queue &amp; token service. No registration fee required.
          </p>
        </div>
      </div>

      {/* Sticky Bottom Navigation CTA Dock */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-surface-container-lowest/95 backdrop-blur-md shadow-2xl border-t border-outline-variant/30">
        <div className="max-w-md mx-auto w-full">
          <button
            onClick={handleContinue}
            className="w-full h-16 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-action text-label-action flex items-center justify-between px-6 shadow-lg shadow-primary/25 active:scale-[0.98] transition-transform"
            type="button"
          >
            <span className="material-symbols-outlined text-3xl font-black">arrow_forward</span>
            <span className="tracking-wide">आगे बढ़ें / Continue</span>
            <span className="material-symbols-outlined text-3xl font-black">chevron_right</span>
          </button>
        </div>
      </div>
    </main>
  )
}
