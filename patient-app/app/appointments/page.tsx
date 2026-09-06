'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TopHeader } from '@/components/patient/top-header'
import { BottomNav } from '@/components/patient/bottom-nav'
import { AudioFeedbackToast } from '@/components/patient/audio-feedback-toast'
import { useSpeak } from '@/hooks/useSpeak'
import { useLanguage } from '@/hooks/useLanguage'

import { usePatientAppointment } from '@/hooks/usePatientAppointment'
import { AppointmentRecord } from '@/lib/appointmentStore'

export default function AppointmentsPage() {
  const router = useRouter()
  const { speak } = useSpeak()
  const { lang, t } = useLanguage()
  const isHindi = lang === 'hi'

  const { activeAppointment, allAppointments } = usePatientAppointment()

  const [toastVisible, setToastVisible] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const currentAppointment = activeAppointment

  const handleReadAppointment = (apt: AppointmentRecord) => {
    const text = isHindi
      ? `टोकन ${apt.tokenNumber}। समय ${apt.time}, तारीख ${apt.date}। केंद्र ${apt.facility}। डॉक्टर ${apt.doctorName || ''}। स्थिति: ${getStatusLabel(apt.status)}`
      : `Token ${apt.tokenNumber}. Time ${apt.time}, Date ${apt.date}. Facility ${apt.facility}. Doctor ${apt.doctorName || ''}. Status: ${apt.status}`
    setToastMsg(text)
    setToastVisible(true)
    speak(text, isHindi ? 'hi-IN' : 'en-IN')
    setTimeout(() => setToastVisible(false), 4000)
  }

  const getStatusLabel = (status: AppointmentRecord['status']) => {
    switch (status) {
      case 'Waiting':
        return t.statusWaiting
      case 'Confirmed':
        return t.statusConfirmed
      case 'Completed':
        return t.statusDone
      case 'Cancelled':
        return t.statusCancelled
      default:
        return status
    }
  }

  const getStatusBadgeStyle = (status: AppointmentRecord['status']) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30'
      case 'Waiting':
        return 'bg-amber-500/10 text-amber-700 border-amber-500/30'
      case 'Completed':
        return 'bg-surface-container text-secondary border-outline-variant/40'
      case 'Cancelled':
        return 'bg-error-container text-error border-error/30'
      default:
        return 'bg-primary/10 text-primary border-primary/20'
    }
  }

  return (
    <main className="flex flex-col relative w-full pt-20 pb-24 bg-surface min-h-screen font-body">
      {/* Top Header */}
      <TopHeader />

      {/* Audio Feedback Toast */}
      <AudioFeedbackToast visible={toastVisible} message={toastMsg} />

      <div className="flex flex-col w-full max-w-md mx-auto px-margin-screen space-y-4 pb-8">
        {/* Page Title & Speaker */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col">
            <h1 className="font-headline-lg text-xl text-on-surface font-extrabold">
              {t.appointmentsHeader}
            </h1>
            <span className="text-xs text-secondary font-medium">
              {isHindi ? 'सक्रिय टोकन व कतार स्थिति' : 'Active Token & Queue Status'}
            </span>
          </div>

          {currentAppointment && (
            <button
              onClick={() => handleReadAppointment(currentAppointment)}
              aria-label="Read appointment aloud"
              className="w-11 h-11 rounded-full bg-tertiary-container text-on-tertiary flex items-center justify-center active:scale-90 transition-transform shadow-xs"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px] text-tertiary">volume_up</span>
            </button>
          )}
        </div>

        {/* MOST PROMINENT HERO CARD: CURRENT APPOINTMENT & TOKEN */}
        {currentAppointment ? (
          <div className="w-full bg-surface-container-lowest rounded-3xl p-6 shadow-md border-2 border-primary/30 flex flex-col items-center text-center relative overflow-hidden">
            {/* Status Pill */}
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-secondary uppercase tracking-widest">
                {t.tokenHeaderLabel}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeStyle(
                  currentAppointment.status
                )}`}
              >
                {getStatusLabel(currentAppointment.status)}
              </span>
            </div>

            {/* VERY LARGE TOKEN DISPLAY */}
            <div className="my-3 flex flex-col items-center">
              <span className="font-mono text-6xl font-black text-primary tracking-tight">
                {currentAppointment.tokenNumber}
              </span>
            </div>

            {/* Date & Time */}
            <div className="my-2 flex flex-col items-center">
              <span className="text-xl font-bold text-on-surface">
                {currentAppointment.time}
              </span>
              <span className="text-sm font-semibold text-secondary mt-0.5">
                {currentAppointment.date}
              </span>
            </div>

            {/* Facility & Doctor Info */}
            <div className="w-full border-t border-outline-variant/30 mt-4 pt-4 flex flex-col gap-2.5 text-left text-xs">
              <div className="flex justify-between items-center py-0.5">
                <span className="text-secondary font-medium">{t.facilityHeaderLabel}:</span>
                <span className="font-bold text-on-surface text-sm">{currentAppointment.facility}</span>
              </div>

              {currentAppointment.doctorName && (
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-secondary font-medium">{t.doctorHeaderLabel}:</span>
                  <span className="font-bold text-on-surface text-sm">{currentAppointment.doctorName}</span>
                </div>
              )}

              <div className="flex justify-between items-center py-0.5">
                <span className="text-secondary font-medium">{t.currentStatusLabel}:</span>
                <span className="font-bold text-primary text-sm">
                  {getStatusLabel(currentAppointment.status)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full bg-surface-container-lowest rounded-3xl p-8 text-center border border-outline-variant/30 flex flex-col items-center">
            <span className="material-symbols-outlined text-4xl text-secondary mb-2">
              event_busy
            </span>
            <p className="text-sm font-bold text-on-surface">{t.noAppointments}</p>
            <Link
              href="/consultation"
              className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md shadow-primary/20"
            >
              {t.suggestAppointment}
            </Link>
          </div>
        )}

        {/* Quick Help Card */}
        <div className="w-full bg-surface-container rounded-2xl p-4 border border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">support_agent</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-on-surface">
                {isHindi ? 'नया अपॉइंटमेंट चाहिए?' : 'Need a new appointment?'}
              </span>
              <span className="text-[11px] text-secondary">
                {isHindi ? 'बोलकर या चैट से बुक करें' : 'Book by voice or chat'}
              </span>
            </div>
          </div>

          <Link
            href="/consultation"
            className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary font-bold text-xs active:scale-95 shadow-xs"
          >
            {isHindi ? 'बुक करें' : 'Book'}
          </Link>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </main>
  )
}
