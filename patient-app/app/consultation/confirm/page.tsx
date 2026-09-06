'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BrandLogo } from '@/components/patient/brand-logo'
import { useSpeak } from '@/hooks/useSpeak'
import { useLanguage } from '@/hooks/useLanguage'
import { usePatientProfile } from '@/hooks/usePatientProfile'

interface TriageData {
  reply_text: string
  symptoms: string[]
  symptom_category: string
  urgency: string
}

export default function SymptomConfirmationPage() {
  const router = useRouter()
  const { speak, isSpeaking } = useSpeak()
  const { lang, t } = useLanguage()
  const isHindi = lang === 'hi'

  const { profile, initials } = usePatientProfile()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [triageData, setTriageData] = useState<TriageData>({
    reply_text: isHindi ? 'लक्षण: तेज बुखार और खांसी।' : 'Symptoms: Fever and Cough.',
    symptoms: isHindi
      ? ['तेज बुखार (2 दिन से)', 'सूखी खांसी (लगातार)', 'सिरदर्द']
      : ['High Fever (2 days)', 'Dry Cough (Persistent)', 'Headache'],
    symptom_category: isHindi ? 'सामान्य चिकित्सा (General OPD)' : 'General OPD / Medicine',
    urgency: isHindi ? 'मध्यम (Moderate)' : 'Moderate',
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
    const summaryText = isHindi
      ? `नमस्ते ${profile.name} जी। कृपया पुष्टि करें: क्या आपके लक्षण सही दर्ज हुए हैं?`
      : `Hello ${profile.name}. Please confirm: were your symptoms recorded correctly?`
    speak(summaryText, isHindi ? 'hi-IN' : 'en-IN')
  }, [speak, isHindi, profile.name])

  const handleReplay = () => {
    const textToRead = isHindi
      ? `मरीज: ${profile.name}। आपके लक्षण हैं: ${triageData.symptoms.join(', ')}। पुष्टि के लिए टोकन प्राप्त करें बटन दबाएं।`
      : `Patient: ${profile.name}. Your symptoms are: ${triageData.symptoms.join(', ')}. Tap confirm to book appointment.`
    speak(textToRead, isHindi ? 'hi-IN' : 'en-IN')
  }

  const handleConfirm = async () => {
    setLoading(true)
    setError(null)

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

    try {
      let confirmedToken = `A-${Math.floor(100 + Math.random() * 899)}`
      let doctorName = 'Dr. Keshav Kapoor'
      let room = isHindi ? 'कमरा नं. 03 (Room #03 - OPD)' : 'Room #03 (OPD Chamber)'
      let slotTime = isHindi ? 'आज 11:30 AM' : 'Today 11:30 AM'
      let appointmentDate = '2026-09-08'

      try {
        const res = await fetch(`${apiUrl}/queue/book`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'swasthyaq_secret_api_key_2026',
          },
          body: JSON.stringify({
            patient_name: profile.name,
            patient_id: profile.userId,
            age: profile.age,
            symptom_category: triageData.symptom_category,
            symptoms: triageData.symptoms,
            appointment_date: appointmentDate,
            appointment_time: '10:00 AM',
            facility_id: profile.facilityId || 'PHC-NORTH-01',
            department: triageData.symptom_category || 'General Medicine',
            source: 'patient_app',
            risk_level: triageData.urgency.includes('Critical') ? 'high' : 'low',
          }),
        })
        if (res.ok) {
          const resData = await res.json()
          if (resData.token_no) confirmedToken = resData.token_no
          if (resData.doctor_name) doctorName = resData.doctor_name
          if (resData.appointment_time) slotTime = resData.appointment_time
          if (resData.appointment_date) appointmentDate = resData.appointment_date
        }
      } catch (backendErr) {
        console.warn('FastAPI appointment queue offline, generating local ticket token:', backendErr)
      }

      const confirmedData = {
        tokenNumber: confirmedToken,
        doctorName: doctorName,
        room: room,
        slotTime: slotTime,
        date: appointmentDate,
        patientName: profile.name,
        abhaId: profile.userId,
        symptoms: triageData.symptoms,
        symptomCategory: triageData.symptom_category,
        confirmedAt: new Date().toISOString(),
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('swasthyaq_confirmed_appointment', JSON.stringify(confirmedData))
      }

      router.push('/appointment-confirmed')
    } catch (err: any) {
      setError(
        isHindi
          ? 'अपॉइंटमेंट दर्ज करने में त्रुटि। कृपया पुनः प्रयास करें।'
          : 'Error booking appointment. Please try again.'
      )
      setLoading(false)
    }
  }

  return (
    <main className="flex flex-col relative w-full pt-16 pb-safe bg-surface min-h-screen font-body">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/30 pt-safe">
        <div className="max-w-md mx-auto h-16 px-margin-screen flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/consultation"
              aria-label={t.backBtn}
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </Link>
            <div className="flex items-center gap-2">
              <BrandLogo size={32} className="w-8 h-8" />
              <h1 className="font-headline-md text-[17px] text-on-surface font-bold">
                {t.confirmTitle}
              </h1>
            </div>
          </div>

          {/* Profile Initials Link */}
          <Link
            href="/profile"
            className="w-8 h-8 rounded-full bg-primary-container text-on-primary font-bold text-xs flex items-center justify-center ring-2 ring-primary-container/20"
          >
            {initials}
          </Link>
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
            <span className="font-label-supporting text-[12px] tracking-wide uppercase font-bold truncate">
              {profile.name} ({profile.userId})
            </span>
          </div>
          <Link
            href="/profile"
            className="flex items-center gap-1 bg-surface-container-lowest/20 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white hover:bg-white/30"
          >
            <span className="material-symbols-outlined text-[14px]">edit</span>
            <span>{isHindi ? 'बदलें' : 'Edit'}</span>
          </Link>
        </div>

        {/* Live Audio Waveform Visualization Badge */}
        <div className="w-full bg-surface-container-high rounded-2xl p-4 flex items-center justify-between shadow-xs border border-outline-variant/30">
          <div className="flex items-center gap-3">
            <button
              onClick={handleReplay}
              aria-label={t.listenSummary}
              className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[22px]">volume_up</span>
            </button>
            <div>
              <p className="font-label-action text-[15px] text-on-surface font-bold">
                {t.verifiedSymptoms}
              </p>
              <p className="font-label-supporting text-[12px] text-on-surface-variant">
                {t.confirmSubtitle}
              </p>
            </div>
          </div>
          <div aria-hidden="true" className="flex items-center gap-1 h-6 pr-2">
            <span className="w-1 bg-tertiary rounded-full animate-pulse h-3" />
            <span className="w-1 bg-tertiary rounded-full animate-pulse h-6" style={{ animationDelay: '150ms' }} />
            <span className="w-1 bg-tertiary rounded-full animate-pulse h-4" style={{ animationDelay: '300ms' }} />
            <span className="w-1 bg-tertiary rounded-full animate-pulse h-5" style={{ animationDelay: '75ms' }} />
          </div>
        </div>

        {/* Main Central Symptom Confirmation Card */}
        <div className="w-full bg-surface-container-lowest rounded-2xl p-5 shadow-md flex flex-col gap-4 border border-outline-variant/30">
          <div className="text-center pt-1 pb-1">
            <h2 className="font-display-lg-mobile text-[22px] text-on-surface font-extrabold">
              {isHindi ? 'क्या यह विवरण सही है?' : 'Are these details correct?'}
            </h2>
            <p className="font-headline-md text-sm text-secondary font-medium mt-0.5">
              {profile.name} • {profile.userId} • {profile.age} {isHindi ? 'वर्ष' : 'yrs'}
            </p>
          </div>

          {/* Verified Symptom Badges List */}
          <div className="flex flex-col gap-2.5 w-full">
            {triageData.symptoms.map((sym, idx) => (
              <div
                key={idx}
                className="w-full bg-surface-container-low rounded-xl p-3.5 flex items-center gap-3.5 shadow-xs border border-outline-variant/20"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">medical_services</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-headline-md text-sm text-on-surface font-bold truncate">
                    {sym}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Department & Urgency */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-surface-container rounded-xl">
              <span className="text-[11px] text-secondary font-medium block">
                {t.primaryDepartment}
              </span>
              <span className="text-xs font-bold text-on-surface mt-0.5 block">
                {triageData.symptom_category}
              </span>
            </div>
            <div className="p-3 bg-surface-container rounded-xl">
              <span className="text-[11px] text-secondary font-medium block">
                {t.urgencyLevel}
              </span>
              <span className="text-xs font-bold text-primary mt-0.5 block">
                {triageData.urgency}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-2">
          {error && (
            <div className="p-3 bg-error-container text-on-error-container rounded-xl text-xs font-semibold text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-primary text-on-primary font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/25 active:scale-98 transition-all hover:bg-primary/95 disabled:opacity-50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">check_circle</span>
            <span>{loading ? t.loading : t.confirmAndBookBtn}</span>
          </button>

          <Link
            href="/consultation"
            className="w-full h-12 rounded-2xl bg-surface-container text-on-surface font-semibold text-sm flex items-center justify-center gap-2 border border-outline-variant/40 active:scale-98 transition-all hover:bg-surface-container-high cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">mic</span>
            <span>{t.editSymptomsBtn}</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
