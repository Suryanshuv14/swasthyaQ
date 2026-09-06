'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BrandLogo } from '@/components/patient/brand-logo'
import { useSpeak } from '@/hooks/useSpeak'
import { useLanguage } from '@/hooks/useLanguage'
import { AudioFeedbackToast } from '@/components/patient/audio-feedback-toast'

interface ConfirmedAppointment {
  tokenNumber: string
  doctorName: string
  facility: string
  date: string
  time: string
  patientName: string
  status: string
}

export default function AppointmentConfirmedPage() {
  const router = useRouter()
  const { speak } = useSpeak()
  const { lang, t } = useLanguage()
  const isHindi = lang === 'hi'

  const [toastVisible, setToastVisible] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const [appointment, setAppointment] = useState<ConfirmedAppointment>({
    tokenNumber: '#A104',
    doctorName: 'Dr. Ananya Kapoor',
    facility: 'PHC North',
    date: '8 September 2026',
    time: '10:30 AM',
    patientName: isHindi ? 'सुनीता देवी' : 'Sunita Devi',
    status: 'Confirmed',
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('swasthyaq_confirmed_appointment')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setAppointment((prev) => ({
            ...prev,
            tokenNumber: parsed.tokenNumber.startsWith('#') ? parsed.tokenNumber : `#${parsed.tokenNumber}`,
            doctorName: parsed.doctorName || prev.doctorName,
            facility: parsed.facility || prev.facility,
            date: parsed.date || prev.date,
            time: parsed.time || parsed.slotTime || prev.time,
            patientName: parsed.patientName || prev.patientName,
          }))
        } catch (e) {}
      }
    }
  }, [])

  // Auto speak warm confirmation on mount
  useEffect(() => {
    const text = isHindi
      ? `आपका अपॉइंटमेंट हो गया है। धन्यवाद। समय पर स्वास्थ्य केंद्र पहुँचें। आपका टोकन नंबर है ${appointment.tokenNumber}।`
      : `Your appointment is booked. Thank you. Please arrive at the health centre on time. Your token number is ${appointment.tokenNumber}.`
    speak(text, isHindi ? 'hi-IN' : 'en-IN')
  }, [appointment.tokenNumber, speak, isHindi])

  const handleListenDetails = () => {
    const text = isHindi
      ? `टोकन ${appointment.tokenNumber}। तारीख ${appointment.date}, समय ${appointment.time}। ${appointment.facility}। मरीज ${appointment.patientName}।`
      : `Token ${appointment.tokenNumber}. Date ${appointment.date}, time ${appointment.time}. Facility ${appointment.facility}. Patient ${appointment.patientName}.`
    setToastMsg(text)
    setToastVisible(true)
    speak(text, isHindi ? 'hi-IN' : 'en-IN')
    setTimeout(() => setToastVisible(false), 3800)
  }

  return (
    <main className="flex flex-col relative w-full pt-16 pb-safe bg-surface min-h-screen font-body">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/30 pt-safe">
        <div className="max-w-md mx-auto h-16 px-margin-screen flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/home"
              aria-label={t.backToHomeBtn}
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined text-[24px]">home</span>
            </Link>
            <div className="flex items-center gap-2">
              <BrandLogo size={32} className="w-8 h-8" />
              <h1 className="font-headline-md text-base text-on-surface font-bold">
                {t.appName}
              </h1>
            </div>
          </div>

          <button
            onClick={handleListenDetails}
            aria-label={t.listenTokenAudio}
            className="w-10 h-10 rounded-full bg-tertiary-container text-on-tertiary flex items-center justify-center active:scale-90 transition-transform"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px] text-tertiary">volume_up</span>
          </button>
        </div>
      </header>

      {/* Audio Feedback Toast */}
      <AudioFeedbackToast visible={toastVisible} message={toastMsg} />

      <div className="flex flex-col w-full max-w-md mx-auto px-margin-screen pb-12 gap-5 pt-4">
        {/* Success Icon & Header */}
        <div className="flex flex-col items-center text-center mt-2">
          <div className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-3">
            <span className="material-symbols-outlined text-5xl font-black">check</span>
          </div>
          <h2 className="font-display-lg-mobile text-2xl font-black text-on-surface">
            {t.appointmentSuccessTitle}
          </h2>
          <p className="text-xs text-secondary font-medium mt-1">
            {t.appointmentSuccessSubtitle}
          </p>
        </div>

        {/* Big Clean Token Card */}
        <div className="w-full bg-surface-container-lowest rounded-3xl p-6 shadow-md border-2 border-primary/20 flex flex-col items-center text-center relative">
          <span className="text-xs font-bold text-secondary uppercase tracking-widest">
            {t.tokenNumberLabel}
          </span>
          <span className="font-mono text-5xl font-black text-primary my-2 tracking-tight">
            {appointment.tokenNumber}
          </span>

          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-bold mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {t.statusConfirmed}
          </span>

          {/* Key Appointment Details */}
          <div className="w-full border-t border-outline-variant/30 pt-4 flex flex-col gap-3 text-left text-xs">
            <div className="flex justify-between items-center py-0.5">
              <span className="text-secondary font-medium">{isHindi ? 'मरीज का नाम' : 'Patient Name'}:</span>
              <span className="font-bold text-on-surface text-sm">{appointment.patientName}</span>
            </div>

            <div className="flex justify-between items-center py-0.5">
              <span className="text-secondary font-medium">{t.dateHeaderLabel}:</span>
              <span className="font-bold text-on-surface text-sm">{appointment.date}</span>
            </div>

            <div className="flex justify-between items-center py-0.5">
              <span className="text-secondary font-medium">{t.timeHeaderLabel}:</span>
              <span className="font-bold text-primary text-sm">{appointment.time}</span>
            </div>

            <div className="flex justify-between items-center py-0.5">
              <span className="text-secondary font-medium">{t.facilityLabel}:</span>
              <span className="font-bold text-on-surface text-sm">{appointment.facility}</span>
            </div>

            {appointment.doctorName && (
              <div className="flex justify-between items-center py-0.5">
                <span className="text-secondary font-medium">{t.doctorLabel}:</span>
                <span className="font-bold text-on-surface text-sm">{appointment.doctorName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Warm Simple Ending Message Box */}
        <div className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center">
          <p className="text-sm font-bold text-emerald-800 leading-relaxed whitespace-pre-line">
            {isHindi
              ? 'आपका अपॉइंटमेंट हो गया है।\nधन्यवाद। समय पर स्वास्थ्य केंद्र पहुँचें।'
              : 'Your appointment is booked.\nThank you. Please arrive at the health centre on time.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Link
            href="/appointments"
            className="w-full h-14 rounded-2xl bg-primary text-on-primary font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/25 active:scale-98 transition-all hover:bg-primary/95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">calendar_month</span>
            <span>{t.viewAppointmentsBtn}</span>
          </Link>

          <Link
            href="/home"
            className="w-full h-12 rounded-2xl bg-surface-container text-on-surface font-semibold text-sm flex items-center justify-center gap-2 border border-outline-variant/40 active:scale-98 transition-all hover:bg-surface-container-high cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">home</span>
            <span>{t.backToHomeBtn}</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
