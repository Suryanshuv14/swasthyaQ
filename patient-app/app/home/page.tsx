'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TopHeader } from '@/components/patient/top-header'
import { BottomNav } from '@/components/patient/bottom-nav'
import { AudioFeedbackToast } from '@/components/patient/audio-feedback-toast'
import { useSpeak } from '@/hooks/useSpeak'

export default function PatientHomePage() {
  const router = useRouter()
  const { speak } = useSpeak()
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const playAudio = (msg: string) => {
    setToastMessage(msg)
    setToastVisible(true)
    speak(msg, 'hi-IN')
    setTimeout(() => {
      setToastVisible(false)
    }, 3200)
  }

  const handleStartConsultation = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([80, 40, 80])
    }
    router.push('/consultation')
  }

  return (
    <main className="flex flex-col relative w-full bg-surface min-h-screen pt-20 pb-24">
      {/* Top Header */}
      <TopHeader />

      {/* Audio Feedback Toast */}
      <AudioFeedbackToast visible={toastVisible} message={toastMessage} />

      <div className="flex flex-col w-full max-w-md mx-auto px-margin-screen space-y-stack-gap-md pb-6">
        {/* Top Greeting Banner */}
        <div className="w-full bg-surface-container-lowest rounded-2xl p-card-padding shadow-sm flex items-center gap-4 border border-outline-variant/30">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-full bg-primary-container text-on-primary font-black text-xl flex items-center justify-center shadow-xs">
              SD
            </div>
            <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-tertiary shadow-sm flex items-center justify-center ring-2 ring-surface">
              <span className="material-symbols-outlined text-on-tertiary text-[10px] font-black" style={{ fontVariationSettings: "'FILL' 1" }}>
                check
              </span>
            </div>
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-headline-md text-headline-md text-on-surface truncate font-bold">
              नमस्ते, सुनीता देवी
            </span>
            <span className="font-label-supporting text-label-supporting text-on-surface-variant truncate">
              Sunita Devi
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-on-surface-variant text-[13px] font-medium leading-none flex-wrap">
              <span className="material-symbols-outlined text-[16px] text-primary">home_pin</span>
              <span className="truncate">रामनगर (Ramnagar)</span>
              <span className="text-outline-variant font-bold">•</span>
              <span className="truncate font-mono text-[11px] bg-surface-container px-1.5 py-0.5 rounded text-on-surface">
                ABHA: 94-8231-5612
              </span>
            </div>
          </div>

          <button
            onClick={() => playAudio('नमस्ते सुनीता देवी। आपका आभा नंबर चौरानवे बयासी इकत्तीस छप्पन बारह है।')}
            aria-label="Audio read name and ABHA"
            className="shrink-0 w-11 h-11 rounded-full bg-surface-container hover:bg-secondary-container flex items-center justify-center active:scale-90 transition-transform"
            type="button"
          >
            <span className="material-symbols-outlined text-primary text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              volume_up
            </span>
          </button>
        </div>

        {/* Center Hero Action: Voice Assistant (Dominates screen) */}
        <div className="w-full bg-surface-container-lowest rounded-2xl p-card-padding shadow-md flex flex-col items-center justify-center text-center relative overflow-hidden py-8 border border-outline-variant/30">
          {/* Audio waves background animation glow */}
          <div className="relative flex items-center justify-center my-4">
            {/* Outer Concentric Ripple 2 */}
            <div
              className="absolute w-52 h-52 rounded-full bg-primary-fixed/40 animate-ping pointer-events-none"
              style={{ animationDuration: '3s', animationIterationCount: 'infinite' }}
            />
            {/* Outer Concentric Ripple 1 */}
            <div className="absolute w-44 h-44 rounded-full bg-primary-fixed/50 pointer-events-none" />
            {/* Inner Pulse Core */}
            <div className="absolute w-36 h-36 rounded-full bg-secondary-fixed opacity-70 pointer-events-none" />

            {/* Primary Voice Interactive Button */}
            <button
              onClick={handleStartConsultation}
              aria-label="बोलने के लिए दबाएं - Tap to Talk to Doctor Assistant"
              className="relative w-36 h-36 rounded-full bg-primary-container hover:bg-primary text-on-primary flex flex-col items-center justify-center shadow-xl active:scale-95 transition-all duration-200 z-10 select-none group cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[56px] leading-none mb-1 text-on-primary group-hover:scale-105 transition-transform">
                mic
              </span>
              <span className="text-[12px] font-extrabold tracking-widest uppercase text-on-primary-container">
                बोलें • TALK
              </span>
            </button>
          </div>

          {/* Dual-language prominent CTA labels */}
          <div className="mt-4 flex flex-col items-center">
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">
              बोलने के लिए दबाएं
            </h2>
            <p className="font-body-lg text-body-lg text-primary-container font-semibold mt-0.5">
              Tap to Talk to Doctor Assistant
            </p>
          </div>

          {/* Supportive Accessibility / No Typing Badge */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container text-on-surface-variant font-label-supporting text-[13px]">
            <span className="material-symbols-outlined text-tertiary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              volume_up
            </span>
            <span>आवाज़ से बताएं • No typing needed</span>
          </div>

          {/* Secondary Entry Point: Chat with Assistant */}
          <Link
            href="/chat"
            className="mt-3.5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-primary text-xs font-semibold border border-outline-variant/40 active:scale-95 transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">chat</span>
            <span>सहायक से चैट करें • Chat with Assistant</span>
          </Link>
        </div>

        {/* Secondary Actions Section (3 Large Equal-Width Touch Tiles) */}
        <div className="w-full grid grid-cols-3 gap-stack-gap-sm">
          {/* 1. Appointments */}
          <Link
            href="/appointments"
            className="flex flex-col items-center justify-center text-center p-3 rounded-xl bg-surface-container-lowest shadow-sm hover:bg-surface-container active:bg-secondary-fixed active:scale-95 transition-all min-h-[92px] border border-outline-variant/30"
          >
            <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-2 shadow-xs">
              <span className="material-symbols-outlined text-[26px]">calendar_today</span>
            </div>
            <span className="font-label-supporting text-[14px] font-bold text-on-surface leading-tight">
              अपॉइंटमेंट
            </span>
            <span className="text-[11px] text-on-surface-variant font-semibold mt-0.5">
              Appointments
            </span>
          </Link>

          {/* 2. Prescriptions */}
          <Link
            href="/prescriptions"
            className="flex flex-col items-center justify-center text-center p-3 rounded-xl bg-surface-container-lowest shadow-sm hover:bg-surface-container active:bg-secondary-fixed active:scale-95 transition-all min-h-[92px] border border-outline-variant/30"
          >
            <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary-container mb-2 shadow-xs">
              <span className="material-symbols-outlined text-[26px]">receipt_long</span>
            </div>
            <span className="font-label-supporting text-[14px] font-bold text-on-surface leading-tight">
              दवाइयां
            </span>
            <span className="text-[11px] text-on-surface-variant font-semibold mt-0.5">
              Prescriptions
            </span>
          </Link>

          {/* 3. Village ASHA Worker Immediate Call */}
          <a
            href="tel:104"
            className="flex flex-col items-center justify-center text-center p-3 rounded-xl bg-surface-container-lowest shadow-sm hover:bg-surface-container active:bg-tertiary-fixed active:scale-95 transition-all min-h-[92px] border border-outline-variant/30"
          >
            <div className="w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center text-on-primary mb-2 shadow-xs">
              <span className="material-symbols-outlined text-[26px]">call</span>
            </div>
            <span className="font-label-supporting text-[14px] font-bold text-on-surface leading-tight">
              आशा दीदी
            </span>
            <span className="text-[11px] text-tertiary font-bold mt-0.5">
              Call 104
            </span>
          </a>
        </div>

        {/* Bottom Status Strip (Upcoming Tele-Clinic Token Placard) */}
        <div className="w-full bg-surface-container-lowest rounded-2xl p-card-padding shadow-sm flex flex-col gap-3 border border-outline-variant/30">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-secondary-fixed text-on-secondary-fixed font-bold text-[12px]">
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              <span>आगामी परामर्श • UPCOMING</span>
            </div>
            <span className="px-2.5 py-1 rounded bg-primary-fixed text-primary font-extrabold text-[13px] tracking-wide">
              Token #A-108
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col min-w-0">
              <span className="font-headline-md text-[17px] font-bold text-on-surface leading-snug">
                अगला नंबर: आज सुबह 11:30 बजे
              </span>
              <span className="font-body-md text-[14px] text-on-surface-variant mt-0.5">
                Dr. Ananya Roy (जनरल फिजीशियन / General Medicine)
              </span>
            </div>
            <Link
              href="/appointments"
              aria-label="Token Details"
              className="shrink-0 w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined text-[24px]">chevron_right</span>
            </Link>
          </div>

          <div className="bg-surface-container-low rounded-xl p-3 flex items-center justify-between text-[13px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse" />
              <span className="font-bold text-tertiary">टेली-क्लिनिक कमरा नं. 03 में तैयार रहें</span>
            </div>
            <Link href="/appointments" className="font-bold text-primary flex items-center text-[12px] hover:underline">
              विवरण देखें &gt;
            </Link>
          </div>
        </div>
      </div>

      {/* Shared Bottom Nav */}
      <BottomNav />
    </main>
  )
}
