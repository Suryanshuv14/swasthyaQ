'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BrandLogo } from '@/components/patient/brand-logo'
import { useSpeak } from '@/hooks/useSpeak'
import { AudioFeedbackToast } from '@/components/patient/audio-feedback-toast'

interface ConfirmedAppointment {
  tokenNumber: string
  doctorName: string
  room: string
  slotTime: string
  patientName: string
  abhaId: string
  symptoms?: string[]
  symptomCategory?: string
  confirmedAt?: string
}

export default function AppointmentConfirmedPage() {
  const router = useRouter()
  const { speak, isSpeaking } = useSpeak()
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const [appointment, setAppointment] = useState<ConfirmedAppointment>({
    tokenNumber: 'OPD-402',
    doctorName: 'डॉ. रमेश कपूर (Dr. Ramesh Kapoor)',
    room: 'कमरा नंबर २ (Room No. 2)',
    slotTime: 'आज सुबह 11:30 बजे (Today, 11:30 AM)',
    patientName: 'सुनीता देवी (Sunita Devi)',
    abhaId: '94-8231-5612',
    symptoms: ['तेज बुखार', 'सूखी खांसी'],
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('swasthyaq_confirmed_appointment')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setAppointment((prev) => ({ ...prev, ...parsed }))
        } catch (e) {}
      }
    }
  }, [])

  // Auto pronounce token on mount
  useEffect(() => {
    const text = `बधाई हो सुनीता जी! आपका टोकन नंबर है ${appointment.tokenNumber}। कृपया कमरा नंबर 3 पर डॉक्टर अनन्या रॉय से परामर्श के लिए उपस्थित रहें।`
    speak(text, 'hi-IN')
  }, [appointment.tokenNumber, speak])

  const handleListenToken = () => {
    const text = `आपका टोकन नंबर है ${appointment.tokenNumber}। ${appointment.doctorName}, ${appointment.room}। समय ${appointment.slotTime}।`
    setToastMsg(text)
    setToastVisible(true)
    speak(text, 'hi-IN')
    setTimeout(() => setToastVisible(false), 3500)
  }

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: `SwasthyaQ Appointment: ${appointment.tokenNumber}`,
        text: `SwasthyaQ Tele-Clinic Token: ${appointment.tokenNumber} for ${appointment.patientName} with ${appointment.doctorName}. Room: ${appointment.room}`,
      }).catch(() => {})
    } else {
      setToastMsg('पर्ची का लिंक कॉपी हो गया (Link Copied)')
      setToastVisible(true)
      setTimeout(() => setToastVisible(false), 2500)
    }
  }

  const handleSave = () => {
    setToastMsg('डिजिटल टोकन पर्ची सहेज ली गई (Slip Saved)')
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2500)
  }

  return (
    <main className="flex flex-col relative w-full pt-16 pb-safe bg-surface min-h-screen">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/30 pt-safe">
        <div className="max-w-md mx-auto h-16 px-margin-screen flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/home"
              aria-label="Go home"
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined text-[24px]">home</span>
            </Link>
            <div className="flex items-center gap-2">
              <BrandLogo size={32} className="w-8 h-8" />
              <h1 className="font-headline-md text-[17px] text-on-surface font-bold">
                Book Token
              </h1>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary font-bold text-xs flex items-center justify-center ring-2 ring-primary-container/20">
            SD
          </div>
        </div>
      </header>

      {/* Audio Feedback Toast */}
      <AudioFeedbackToast visible={toastVisible} message={toastMsg} />

      <div className="flex flex-col w-full px-margin-screen pb-12 gap-stack-gap-md max-w-md mx-auto pt-3">
        {/* Success Celebration & Header Badge */}
        <div className="flex flex-col items-center justify-center pt-3 pb-2 text-center">
          <div className="relative flex items-center justify-center w-18 h-18 rounded-full bg-tertiary shadow-md mb-2">
            <span
              className="material-symbols-outlined text-on-tertiary text-[40px]"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}
            >
              check
            </span>
            {/* Decorative pulse ring */}
            <span className="absolute -inset-1.5 rounded-full bg-tertiary-fixed opacity-40 animate-ping pointer-events-none" />
          </div>
          <h2 className="font-headline-lg text-[22px] text-on-surface font-bold tracking-tight">
            आपका नंबर लग गया है!
          </h2>
          <p className="font-body-md text-[14px] text-on-surface-variant mt-0.5">
            Appointment Confirmed Successfully
          </p>
        </div>

        {/* Centerpiece: Token Placard Card */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-md overflow-hidden flex flex-col border border-outline-variant/30">
          {/* Token Top Highlight Header */}
          <div className="bg-primary-container px-card-padding py-3 flex items-center justify-between text-on-primary">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[24px]">confirmation_number</span>
              <span className="font-label-action text-[15px] uppercase tracking-wide font-bold">
                टोकन संख्या / Token No.
              </span>
            </div>
            <span className="bg-primary px-3 py-0.5 rounded-full font-label-supporting text-[12px] text-on-primary font-bold">
              Live
            </span>
          </div>

          {/* Token Big Display */}
          <div className="px-card-padding py-6 flex flex-col items-center justify-center bg-surface-container-lowest text-center">
            <div className="inline-flex items-baseline justify-center gap-1">
              <span className="font-queue-token text-[48px] text-primary font-extrabold tracking-tight">
                {appointment.tokenNumber}
              </span>
            </div>
            <p className="font-label-supporting text-[14px] text-on-surface-variant mt-1 font-semibold">
              {appointment.room}
            </p>

            {/* Audio Guidance Button for Token Readout */}
            <button
              onClick={handleListenToken}
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-tertiary hover:bg-tertiary/90 text-on-tertiary font-label-supporting text-[14px] font-bold active:scale-[0.98] transition-transform shadow-xs cursor-pointer"
              type="button"
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                volume_up
              </span>
              <span>{isSpeaking ? '🔊 टोकन सुनाया जा रहा है...' : '🔊 टोकन नंबर सुनें (Listen to token)'}</span>
            </button>
          </div>

          {/* Live Waiting Estimate Strip */}
          <div className="bg-surface-container px-card-padding py-3 flex items-center gap-3 border-t border-outline-variant/30">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-[22px]">
                hourglass_top
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-label-supporting text-[13px] text-on-surface font-bold truncate">
                अनुमानित प्रतीक्षा: ~10 मिनट
              </p>
              <p className="font-body-md text-[12px] text-on-surface-variant truncate">
                Estimated wait: 2 patients ahead
              </p>
            </div>
          </div>
        </div>

        {/* Key Consultation Details Mosaic */}
        <div className="flex flex-col gap-stack-gap-sm">
          <h3 className="font-label-supporting text-[12px] text-on-surface-variant uppercase px-1 tracking-wider font-bold">
            परामर्श विवरण (Consultation Details)
          </h3>

          {/* Doctor Detail Card */}
          <div className="bg-surface-container-lowest rounded-xl p-card-padding shadow-xs flex items-center gap-3.5 border border-outline-variant/30">
            <div className="w-11 h-11 rounded-xl bg-primary-fixed flex items-center justify-center shrink-0 text-primary">
              <span className="material-symbols-outlined text-[26px]">stethoscope</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-label-supporting text-[11px] text-secondary font-semibold">
                डॉक्टर / Doctor
              </p>
              <p className="font-headline-md text-[15px] text-on-surface font-bold truncate">
                {appointment.doctorName}
              </p>
              <p className="font-body-md text-[12px] text-on-surface-variant truncate">
                General Medicine • PHC Room 03
              </p>
            </div>
          </div>

          {/* Clinic Detail Card */}
          <div className="bg-surface-container-lowest rounded-xl p-card-padding shadow-xs flex items-center gap-3.5 border border-outline-variant/30">
            <div className="w-11 h-11 rounded-xl bg-secondary-fixed flex items-center justify-center shrink-0 text-secondary">
              <span className="material-symbols-outlined text-[26px]">local_hospital</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-label-supporting text-[11px] text-secondary font-semibold">
                स्वास्थ्य केंद्र / Health Center
              </p>
              <p className="font-headline-md text-[15px] text-on-surface font-bold truncate">
                प्राथमिक स्वास्थ्य केंद्र, रामनगर
              </p>
              <p className="font-body-md text-[12px] text-on-surface-variant truncate">
                PHC Ramnagar Tele-Clinic
              </p>
            </div>
          </div>

          {/* Time & Date Card */}
          <div className="bg-surface-container-lowest rounded-xl p-card-padding shadow-xs flex items-center gap-3.5 border border-outline-variant/30">
            <div className="w-11 h-11 rounded-xl bg-surface-variant flex items-center justify-center shrink-0 text-primary-container">
              <span className="material-symbols-outlined text-[26px]">event_available</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-label-supporting text-[11px] text-secondary font-semibold">
                तारीख एवं समय / Date &amp; Time
              </p>
              <p className="font-headline-md text-[15px] text-on-surface font-bold truncate">
                {appointment.slotTime}
              </p>
              <p className="font-body-md text-[12px] text-on-surface-variant truncate">
                Live Queue Slot Confirmed
              </p>
            </div>
          </div>
        </div>

        {/* Help Notice Banner */}
        <div className="bg-surface-container-high rounded-xl p-3.5 flex items-start gap-3 border border-outline-variant/30">
          <span className="material-symbols-outlined text-primary text-[24px] shrink-0 mt-0.5">
            sms
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-label-supporting text-[13px] text-on-surface font-bold leading-snug">
              SMS और पर्ची फोन पर भेज दी गई है
            </p>
            <p className="font-body-md text-on-surface-variant text-[11px] mt-0.5 leading-tight">
              Confirmation SMS &amp; digital slip dispatched to registered mobile number.
            </p>
          </div>
        </div>

        {/* Quick Action / Share & Save Option */}
        <div className="grid grid-cols-2 gap-stack-gap-sm pt-1">
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 py-3 px-3 bg-surface-container-lowest hover:bg-surface-container text-primary rounded-xl shadow-xs font-label-supporting text-[13px] font-bold active:scale-95 transition-transform border border-outline-variant/30 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">share</span>
            <span>शेयर करें (Share)</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center justify-center gap-2 py-3 px-3 bg-surface-container-lowest hover:bg-surface-container text-primary rounded-xl shadow-xs font-label-supporting text-[13px] font-bold active:scale-95 transition-transform border border-outline-variant/30 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            <span>पर्ची सेव करें (Save)</span>
          </button>
        </div>

        {/* Single Full-Width Primary Action */}
        <div className="pt-2 flex flex-col gap-2">
          <Link
            href="/appointments"
            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary-container text-on-primary font-label-action text-[15px] font-bold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform"
          >
            <span className="material-symbols-outlined text-[22px]">calendar_month</span>
            <span>अपॉइंटमेंट देखें / View Appointments</span>
          </Link>
          <Link
            href="/home"
            className="w-full h-12 rounded-2xl bg-surface-container text-on-surface font-label-action text-[14px] font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <span className="material-symbols-outlined text-[20px]">home</span>
            <span>मुख्य पृष्ठ पर जाएँ / Back to Home</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
