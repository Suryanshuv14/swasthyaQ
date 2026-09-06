'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TopHeader } from '@/components/patient/top-header'
import { BottomNav } from '@/components/patient/bottom-nav'
import { AudioFeedbackToast } from '@/components/patient/audio-feedback-toast'
import { useSpeak } from '@/hooks/useSpeak'
import { useLanguage } from '@/hooks/useLanguage'
import { usePatientProfile } from '@/hooks/usePatientProfile'
import { usePatientAppointment } from '@/hooks/usePatientAppointment'

export default function PatientHomePage() {
  const router = useRouter()
  const { speak } = useSpeak()
  const { lang, t } = useLanguage()
  const isHindi = lang === 'hi'

  const { profile, initials } = usePatientProfile()
  const { activeAppointment } = usePatientAppointment()

  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const playAudio = (msg: string) => {
    setToastMessage(msg)
    setToastVisible(true)
    speak(msg, isHindi ? 'hi-IN' : 'en-IN')
    setTimeout(() => {
      setToastVisible(false)
    }, 3500)
  }

  const handleStartVoice = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([80, 40, 80])
    }
    router.push('/consultation')
  }

  const handleStartChat = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(60)
    }
    router.push('/chat')
  }

  const handleReadHomeScreen = () => {
    const text = isHindi
      ? `नमस्ते ${profile.name}। स्वास्थय-क्यू होम स्क्रीन। आप बोलकर या चैट करके अपॉइंटमेंट बुक कर सकते हैं।`
      : `Hello ${profile.name}. SwasthyaQ Home screen. You can book an appointment by voice or chat.`
    playAudio(text)
  }

  return (
    <main className="flex flex-col relative w-full bg-surface min-h-screen pt-20 pb-24 font-body">
      {/* Top Header with Language Switcher and Profile */}
      <TopHeader />

      {/* Audio Feedback Toast */}
      <AudioFeedbackToast visible={toastVisible} message={toastMessage} />

      <div className="flex flex-col w-full max-w-md mx-auto px-margin-screen space-y-4 pb-6">
        {/* Top Greeting & Profile Banner */}
        <div className="w-full bg-surface-container-lowest rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3 border border-outline-variant/30">
          <Link
            href="/profile"
            className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer"
          >
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary font-black text-sm flex items-center justify-center shadow-xs">
                {initials}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-tertiary shadow-sm flex items-center justify-center ring-2 ring-surface">
                <span
                  className="material-symbols-outlined text-on-tertiary text-[9px] font-black"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  edit
                </span>
              </div>
            </div>

            <div className="flex flex-col min-w-0">
              <span className="font-headline-md text-base text-on-surface truncate font-bold">
                {isHindi ? `नमस्ते, ${profile.name}` : `Hello, ${profile.name}`}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-secondary font-medium truncate">
                <span className="truncate">{profile.village || t.location}</span>
                <span>•</span>
                <span className="font-mono text-[10px] bg-surface-container px-1.5 py-0.5 rounded font-bold text-on-surface">
                  {profile.userId}
                </span>
              </div>
            </div>
          </Link>

          {/* Prominent Speaker Button for Screen Narration */}
          <button
            onClick={handleReadHomeScreen}
            aria-label={t.listenScreenText}
            className="shrink-0 w-11 h-11 rounded-full bg-tertiary-container hover:bg-tertiary-container/80 text-on-tertiary flex items-center justify-center active:scale-90 transition-transform shadow-xs border border-tertiary/20 cursor-pointer"
            type="button"
          >
            <span
              className="material-symbols-outlined text-tertiary font-bold text-[22px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              volume_up
            </span>
          </button>
        </div>

        {/* Dynamic Active Appointment Banner (if booked) */}
        {activeAppointment && (
          <Link
            href="/appointments"
            className="w-full bg-surface-container-lowest rounded-2xl p-4 shadow-sm border-2 border-primary/30 flex items-center justify-between gap-3 active:scale-[0.99] transition-all hover:bg-surface-container"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-primary text-on-primary font-mono font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                {activeAppointment.tokenNumber}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-headline-sm text-xs font-bold text-on-surface flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  {isHindi ? 'सक्रिय टोकन' : 'Active Token'}: {activeAppointment.tokenNumber}
                </span>
                <span className="text-[11px] text-secondary font-medium truncate mt-0.5">
                  {activeAppointment.date} • {activeAppointment.time} • {activeAppointment.doctorName}
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-primary text-lg shrink-0">chevron_right</span>
          </Link>
        )}

        {/* PRIMARY ACTIONS: 2 LARGE CARDS (VOICE & CHAT) */}
        <div className="grid grid-cols-1 gap-3.5">
          {/* 1. VOICE CARD: Talk to SwasthyaQ */}
          <button
            onClick={handleStartVoice}
            aria-label={t.talkHeroTitle}
            className="w-full bg-primary-container text-on-primary rounded-3xl p-5 shadow-md flex items-center gap-4 text-left active:scale-[0.98] transition-all duration-200 border-2 border-primary/40 relative overflow-hidden group cursor-pointer"
            type="button"
          >
            <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none group-hover:scale-110 transition-transform" />

            <div className="w-16 h-16 rounded-2xl bg-white text-primary flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <span
                className="material-symbols-outlined text-4xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                mic
              </span>
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-headline-lg text-lg font-black text-white tracking-tight">
                  {t.talkHeroTitle}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase">
                  {t.talkHeroButton}
                </span>
              </div>
              <p className="text-xs text-on-primary-container font-medium mt-1 leading-snug">
                {t.talkHeroSubtitle}
              </p>
            </div>

            <span className="material-symbols-outlined text-2xl text-white/80 shrink-0">
              arrow_forward_ios
            </span>
          </button>

          {/* 2. CHAT CARD: Chat with SwasthyaQ */}
          <button
            onClick={handleStartChat}
            aria-label={t.chatHeroTitle}
            className="w-full bg-surface-container-lowest hover:bg-surface-container text-on-surface rounded-3xl p-5 shadow-sm flex items-center gap-4 text-left active:scale-[0.98] transition-all duration-200 border-2 border-outline-variant/40 relative overflow-hidden group cursor-pointer"
            type="button"
          >
            <div className="w-16 h-16 rounded-2xl bg-secondary-container text-primary flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <span
                className="material-symbols-outlined text-4xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                chat
              </span>
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-headline-lg text-lg font-black text-on-surface tracking-tight">
                  {t.chatHeroTitle}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-secondary text-[10px] font-extrabold uppercase">
                  {t.chatHeroButton}
                </span>
              </div>
              <p className="text-xs text-secondary font-medium mt-1 leading-snug">
                {t.chatHeroSubtitle}
              </p>
            </div>

            <span className="material-symbols-outlined text-2xl text-secondary shrink-0">
              arrow_forward_ios
            </span>
          </button>
        </div>

        {/* SUGGESTION BUTTONS / CHIPS */}
        <div className="w-full bg-surface-container-lowest rounded-3xl p-4 shadow-sm border border-outline-variant/30 flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="font-headline-md text-xs font-bold text-secondary uppercase tracking-wider">
              {t.suggestionsTitle}
            </span>
            <span className="text-[11px] text-primary font-semibold">
              {isHindi ? 'त्वरित सहायता' : 'Quick Actions'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {/* Suggestion 1: I want an appointment */}
            <Link
              href="/consultation"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-container-low hover:bg-surface-container active:scale-[0.98] transition-all border border-outline-variant/30"
            >
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">calendar_add_on</span>
                </span>
                <span className="font-headline-sm text-sm font-bold text-on-surface">
                  {t.suggestAppointment}
                </span>
              </div>
              <span className="material-symbols-outlined text-secondary text-lg">chevron_right</span>
            </Link>

            {/* Suggestion 2: Check my appointment */}
            <Link
              href="/appointments"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-container-low hover:bg-surface-container active:scale-[0.98] transition-all border border-outline-variant/30"
            >
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-secondary-container text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">event_available</span>
                </span>
                <span className="font-headline-sm text-sm font-bold text-on-surface">
                  {t.suggestCheckAppointment}
                </span>
              </div>
              <span className="material-symbols-outlined text-secondary text-lg">chevron_right</span>
            </Link>

            {/* Suggestion 3: Edit Profile Settings */}
            <Link
              href="/profile"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-container-low hover:bg-surface-container active:scale-[0.98] transition-all border border-outline-variant/30"
            >
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">account_circle</span>
                </span>
                <span className="font-headline-sm text-sm font-bold text-on-surface">
                  {t.profileHeader}
                </span>
              </div>
              <span className="material-symbols-outlined text-secondary text-lg">chevron_right</span>
            </Link>

            {/* Suggestion 4: Where is my token? */}
            <Link
              href="/appointments"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-container-low hover:bg-surface-container active:scale-[0.98] transition-all border border-outline-variant/30"
            >
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-tertiary-container text-on-tertiary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl text-tertiary font-bold">tag</span>
                </span>
                <span className="font-headline-sm text-sm font-bold text-on-surface">
                  {t.suggestWhereToken}
                </span>
              </div>
              <span className="material-symbols-outlined text-secondary text-lg">chevron_right</span>
            </Link>
          </div>
        </div>

        {/* Emergency Helpline Card */}
        <a
          href="tel:104"
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-error-container/40 hover:bg-error-container/60 border border-error/20 active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-error text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-xl font-bold">call</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-sm font-bold text-error">
                {t.call104Title}
              </span>
              <span className="text-[11px] text-secondary font-medium">
                {t.call104Subtitle}
              </span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-error text-white text-xs font-bold">
            {isHindi ? 'कॉल करें' : 'Call'}
          </span>
        </a>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </main>
  )
}
