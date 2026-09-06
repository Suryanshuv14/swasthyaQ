'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BrandLogo } from '@/components/patient/brand-logo'
import { useSpeak } from '@/hooks/useSpeak'

interface TriageData {
  reply_text: string
  symptoms: string[]
  symptom_category: string
  urgency: string
}

export default function SymptomConfirmationPage() {
  const router = useRouter()
  const { speak, isSpeaking } = useSpeak()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [triageData, setTriageData] = useState<TriageData>({
    reply_text: 'लक्षण: दो दिन से तेज बुखार और सूखी खांसी।',
    symptoms: ['तेज बुखार (High Fever • 2 दिन से)', 'सूखी खांसी (Dry Cough • लगातार)', 'हल्का सिरदर्द (Mild Headache)'],
    symptom_category: 'General Medicine / सामान्य चिकित्सा',
    urgency: 'Moderate (मध्यम)',
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('swasthyaq_triage_data')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setTriageData((prev) => ({
            ...prev,
            ...parsed,
          }))
        } catch (e) {}
      }
    }
  }, [])

  // Speak summary automatically on load
  useEffect(() => {
    const summaryText = 'कृपया पुष्टि करें: क्या आपके लक्षण तेज बुखार और खांसी सही दर्ज हुए हैं?'
    speak(summaryText, 'hi-IN')
  }, [speak])

  const handleReplay = () => {
    const textToRead = `आपके लक्षण हैं: ${triageData.symptoms.join(', ')}। पुष्टि के लिए हाँ बटन दबाएं।`
    speak(textToRead, 'hi-IN')
  }

  const handleConfirm = async () => {
    setLoading(true)
    setError(null)

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

    try {
      const payload = {
        name: 'सुनीता देवी',
        age: 34,
        gender: 'Female',
        phone: '+91 98765 43210',
        village: 'रामनगर (Ramnagar)',
        symptoms: triageData.symptoms.join(', '),
        symptom_category: triageData.symptom_category,
        triage_urgency: triageData.urgency.includes('Urgent') ? 'high' : 'moderate',
        facility_id: 'PHC-NORTH-01',
        source: 'patient_app',
      }

      let confirmedToken = `OPD-${Math.floor(100 + Math.random() * 900)}`
      let doctorName = 'Dr. Ananya Roy'
      let room = 'कमरा नं. 03 (Room #03 - OPD Chamber)'
      let slotTime = 'आज सुबह 11:30 बजे'

      try {
        const res = await fetch(`${apiUrl}/patients/manual`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          const resData = await res.json()
          if (resData.token_number) confirmedToken = resData.token_number
          if (resData.doctor_name) doctorName = resData.doctor_name
        }
      } catch (backendErr) {
        console.warn('FastAPI appointment queue offline, generating local ticket token:', backendErr)
      }

      const confirmedData = {
        tokenNumber: confirmedToken,
        doctorName: doctorName,
        room: room,
        slotTime: slotTime,
        patientName: 'सुनीता देवी',
        abhaId: '94-8231-5612',
        symptoms: triageData.symptoms,
        symptomCategory: triageData.symptom_category,
        confirmedAt: new Date().toISOString(),
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('swasthyaq_confirmed_appointment', JSON.stringify(confirmedData))
      }

      router.push('/appointment-confirmed')
    } catch (err: any) {
      setError('अपॉइंटमेंट दर्ज करने में त्रुटि। कृपया पुनः प्रयास करें।')
      setLoading(false)
    }
  }

  const handleRepeatVoice = () => {
    router.push('/consultation')
  }

  return (
    <main className="flex flex-col relative w-full pt-16 pb-safe bg-surface min-h-screen">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/30 pt-safe">
        <div className="max-w-md mx-auto h-16 px-margin-screen flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/consultation"
              aria-label="Go back"
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </Link>
            <div className="flex items-center gap-2">
              <BrandLogo size={32} className="w-8 h-8" />
              <h1 className="font-headline-md text-[17px] text-on-surface font-bold">
                Symptom Verification
              </h1>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary font-bold text-xs flex items-center justify-center ring-2 ring-primary-container/20">
            SD
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full max-w-md mx-auto px-margin-screen pb-10 gap-stack-gap-md pt-3">
        {/* Active Call Pill Bar */}
        <div className="w-full bg-primary-container text-on-primary rounded-full px-4 py-2.5 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-fixed opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-tertiary-fixed" />
            </span>
            <span className="font-label-supporting text-[12px] tracking-wide uppercase font-bold">
              परामर्श सारांश • TRIAGE SUMMARY
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-surface-container-lowest/20 px-3 py-1 rounded-full">
            <span
              className="material-symbols-outlined text-[16px] text-primary-fixed"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              support_agent
            </span>
            <span className="font-label-supporting text-[12px] text-primary-fixed font-bold">
              AI सहायक
            </span>
          </div>
        </div>

        {/* Live Audio Waveform Visualization Badge */}
        <div className="w-full bg-surface-container-high rounded-2xl p-4 flex items-center justify-between shadow-xs border border-outline-variant/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary">
              <span className="material-symbols-outlined text-[22px]">volume_up</span>
            </div>
            <div>
              <p className="font-label-action text-[15px] text-on-surface font-bold">
                AI ने सुना (We understood):
              </p>
              <p className="font-label-supporting text-[12px] text-on-surface-variant">
                समीक्षा करें / Please verify
              </p>
            </div>
          </div>
          {/* Animated mini sound bars */}
          <div aria-hidden="true" className="flex items-center gap-1 h-6 pr-2">
            <span className="w-1 bg-tertiary rounded-full animate-pulse h-3" />
            <span className="w-1 bg-tertiary rounded-full animate-pulse h-6" style={{ animationDelay: '150ms' }} />
            <span className="w-1 bg-tertiary rounded-full animate-pulse h-4" style={{ animationDelay: '300ms' }} />
            <span className="w-1 bg-tertiary rounded-full animate-pulse h-5" style={{ animationDelay: '75ms' }} />
          </div>
        </div>

        {/* Main Central Symptom Confirmation Card */}
        <div className="w-full bg-surface-container-lowest rounded-2xl p-5 shadow-md flex flex-col gap-4 border border-outline-variant/30">
          {/* Primary Prompt Question */}
          <div className="text-center pt-1 pb-1">
            <h2 className="font-display-lg-mobile text-[24px] text-on-surface font-extrabold">
              क्या यह सही है?
            </h2>
            <p className="font-headline-md text-[15px] text-secondary font-medium">
              Is this clinical summary correct?
            </p>
          </div>

          {/* Verified Symptom Badges List */}
          <div className="flex flex-col gap-stack-gap-sm w-full">
            {/* Symptom 1: Fever */}
            <div className="w-full bg-surface-container-low rounded-xl p-3.5 flex items-center gap-3.5 shadow-xs border border-outline-variant/20">
              <div className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  thermostat
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-1">
                  <p className="font-headline-md text-[16px] text-on-surface font-bold truncate">
                    तेज बुखार
                  </p>
                  <span className="font-label-action text-[13px] text-error shrink-0 font-bold">
                    2 दिन से
                  </span>
                </div>
                <p className="font-body-md text-[13px] text-on-surface-variant">
                  High Fever • Since 2 days
                </p>
              </div>
            </div>

            {/* Symptom 2: Cough */}
            <div className="w-full bg-surface-container-low rounded-xl p-3.5 flex items-center gap-3.5 shadow-xs border border-outline-variant/20">
              <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  pulmonology
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-1">
                  <p className="font-headline-md text-[16px] text-on-surface font-bold truncate">
                    सूखी खांसी
                  </p>
                  <span className="font-label-action text-[13px] text-primary shrink-0 font-bold">
                    लगातार
                  </span>
                </div>
                <p className="font-body-md text-[13px] text-on-surface-variant">
                  Dry Cough • Persistent
                </p>
              </div>
            </div>

            {/* Symptom 3: Headache */}
            <div className="w-full bg-surface-container-low rounded-xl p-3.5 flex items-center gap-3.5 shadow-xs border border-outline-variant/20">
              <div className="w-12 h-12 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  personal_injury
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-1">
                  <p className="font-headline-md text-[16px] text-on-surface font-bold truncate">
                    हल्का सिरदर्द
                  </p>
                  <span className="font-label-action text-[13px] text-secondary shrink-0 font-bold">
                    मध्यम
                  </span>
                </div>
                <p className="font-body-md text-[13px] text-on-surface-variant">
                  Headache • Mild intensity
                </p>
              </div>
            </div>
          </div>

          {/* Doctor Hand-off Direct Notice */}
          <div className="w-full bg-surface-container p-3 rounded-xl flex items-center gap-3">
            <span className="material-symbols-outlined text-[22px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified_user
            </span>
            <p className="font-label-supporting text-[12px] text-on-surface-variant leading-tight">
              डॉक्टर को यही जानकारी भेजी जाएगी।
              <span className="block text-secondary font-normal text-[11px] mt-0.5">
                This verified summary will be directly sent to the physician.
              </span>
            </p>
          </div>

          {/* Audio Replay Action */}
          <button
            onClick={handleReplay}
            className="w-full py-3 px-4 bg-surface-container-high hover:bg-surface-variant rounded-xl flex items-center justify-center gap-3 text-on-surface transition-colors shadow-xs active:scale-95"
            type="button"
          >
            <span
              className="material-symbols-outlined text-[24px] text-primary-container"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              replay_circle_filled
            </span>
            <div className="text-left">
              <span className="font-label-action text-[14px] block leading-tight font-bold">
                फिर से सुनें
              </span>
              <span className="font-label-supporting text-secondary block text-[11px]">
                Replay Voice Summary
              </span>
            </div>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-error-container text-on-error-container text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Visual Confirmation Dual Action Buttons */}
        <div className="flex flex-col gap-3 w-full pt-1">
          {/* Affirmative Primary Confirmation */}
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full min-h-[64px] bg-tertiary hover:bg-tertiary/90 active:scale-[0.98] transition-transform text-on-tertiary rounded-2xl px-4 py-3 shadow-lg flex items-center justify-between cursor-pointer disabled:opacity-60"
            type="button"
          >
            <div className="w-11 h-11 rounded-full bg-surface-container-lowest/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[30px] text-tertiary-fixed font-bold">
                {loading ? 'hourglass_top' : 'check_circle'}
              </span>
            </div>
            <div className="flex-1 text-center pr-2">
              <span className="font-label-action text-[16px] block leading-snug font-bold">
                {loading ? 'अपॉइंटमेंट बुक हो रहा है...' : 'हाँ, बिल्कुल सही है'}
              </span>
              <span className="font-body-md text-[12px] text-tertiary-fixed block font-medium">
                {loading ? 'Booking your queue slot...' : 'Yes, that is right'}
              </span>
            </div>
            <span className="material-symbols-outlined text-[24px] text-tertiary-fixed shrink-0">
              arrow_forward
            </span>
          </button>

          {/* Repeat / Modify Negative Fallback */}
          <button
            onClick={handleRepeatVoice}
            disabled={loading}
            className="w-full min-h-[58px] bg-surface-container-lowest hover:bg-surface-container-low transition-transform active:scale-[0.98] text-error rounded-2xl px-4 py-2.5 shadow-sm border border-error/20 flex items-center justify-between cursor-pointer"
            type="button"
          >
            <div className="w-10 h-10 rounded-full bg-error-container text-on-error-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[26px] font-bold">mic_off</span>
            </div>
            <div className="flex-1 text-center pr-2">
              <span className="font-label-action text-[15px] block leading-snug font-bold">
                नहीं, दोबारा बोलें
              </span>
              <span className="font-body-md text-[12px] text-on-surface-variant block font-medium">
                No, let me repeat
              </span>
            </div>
            <span className="material-symbols-outlined text-[24px] text-error shrink-0">
              close
            </span>
          </button>
        </div>

        {/* Discreet Assistance Help Footer */}
        <div className="flex items-center justify-center gap-2 py-1 text-on-surface-variant">
          <span className="material-symbols-outlined text-[18px]">record_voice_over</span>
          <span className="font-label-supporting text-[12px]">
            स्पष्ट आवाज़ में उत्तर दें या बटन दबाएँ
          </span>
        </div>
      </div>
    </main>
  )
}
