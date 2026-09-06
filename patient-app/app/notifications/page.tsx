'use client'

import React, { useState } from 'react'
import { TopHeader } from '@/components/patient/top-header'
import { BottomNav } from '@/components/patient/bottom-nav'
import { AudioFeedbackToast } from '@/components/patient/audio-feedback-toast'
import { useSpeak } from '@/hooks/useSpeak'
import { useLanguage } from '@/hooks/useLanguage'

import { usePatientNotifications } from '@/hooks/usePatientNotifications'
import { PatientNotification } from '@/lib/notificationStore'

export default function NotificationsPage() {
  const { speak } = useSpeak()
  const { lang, t } = useLanguage()
  const isHindi = lang === 'hi'

  const { notifications, unreadCount, markAllRead } = usePatientNotifications()

  const [toastVisible, setToastVisible] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const handlePlayAudio = (n: PatientNotification) => {
    const text = isHindi ? `${n.titleHi}: ${n.bodyHi}` : `${n.titleEn}: ${n.bodyEn}`
    setToastMsg(text)
    setToastVisible(true)
    speak(text, isHindi ? 'hi-IN' : 'en-IN')
    setTimeout(() => setToastVisible(false), 4000)
  }

  const handleListenAll = () => {
    if (notifications.length === 0) {
      const emptyText = isHindi ? 'कोई नई सूचना नहीं है।' : 'No new notifications.'
      setToastMsg(emptyText)
      setToastVisible(true)
      speak(emptyText, isHindi ? 'hi-IN' : 'en-IN')
      setTimeout(() => setToastVisible(false), 3000)
      return
    }
    const allText = notifications
      .map((n) => (isHindi ? `${n.titleHi}: ${n.bodyHi}` : `${n.titleEn}: ${n.bodyEn}`))
      .join('. ')
    setToastMsg(allText)
    setToastVisible(true)
    speak(allText, isHindi ? 'hi-IN' : 'en-IN')
    setTimeout(() => setToastVisible(false), 5000)
  }

  const getIconForType = (type: PatientNotification['type']) => {
    switch (type) {
      case 'appointment_confirmed':
        return 'check_circle'
      case 'appointment_reminder':
        return 'alarm'
      case 'token_update':
        return 'confirmation_number'
      case 'prescription_available':
        return 'medication'
      case 'health_announcement':
        return 'campaign'
      default:
        return 'notifications'
    }
  }

  return (
    <main className="flex flex-col relative w-full pt-20 pb-24 bg-surface min-h-screen font-body">
      {/* Top Header */}
      <TopHeader />

      {/* Audio Feedback Toast */}
      <AudioFeedbackToast visible={toastVisible} message={toastMsg} />

      <div className="flex flex-col w-full max-w-md mx-auto px-margin-screen space-y-4 pb-8">
        {/* Page Header */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <h1 className="font-headline-lg text-xl text-on-surface font-extrabold">
              {t.notificationsHeader}
            </h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-error text-white text-[10px] font-black">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-primary font-bold hover:underline"
                type="button"
              >
                {t.markAllRead}
              </button>
            )}

            <button
              onClick={handleListenAll}
              aria-label="Listen all notifications"
              className="w-10 h-10 rounded-full bg-tertiary-container text-on-tertiary flex items-center justify-center active:scale-90 transition-transform shadow-xs"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px] text-tertiary">volume_up</span>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="w-full bg-surface-container-lowest rounded-3xl p-8 text-center border border-outline-variant/30 flex flex-col items-center shadow-sm">
            <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-secondary mb-3">
              <span className="material-symbols-outlined text-3xl">notifications_off</span>
            </div>
            <h2 className="font-headline-md text-base font-bold text-on-surface">
              {isHindi ? 'कोई नई सूचना नहीं है' : 'No notifications yet'}
            </h2>
            <p className="text-xs text-secondary font-medium mt-1 max-w-xs leading-relaxed">
              {isHindi
                ? 'अपॉइंटमेंट बुकिंग व कतार से संबंधित संदेश यहाँ दिखाई देंगे।'
                : 'Appointment booking confirmations and token updates will appear here.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`w-full rounded-3xl p-5 shadow-sm border transition-all flex flex-col gap-2.5 ${
                  n.isRead
                    ? 'bg-surface-container-lowest border-outline-variant/30'
                    : 'bg-surface-container-lowest border-primary/40 ring-1 ring-primary/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                        n.isRead ? 'bg-surface-container text-secondary' : 'bg-primary/10 text-primary'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {getIconForType(n.type)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-on-surface">
                        {isHindi ? n.titleHi : n.titleEn}
                      </span>
                      <span className="text-[10px] text-secondary font-medium">
                        {isHindi ? n.timeAgoHi : n.timeAgoEn}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePlayAudio(n)}
                    aria-label="Listen notification"
                    className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary active:scale-90"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">volume_up</span>
                  </button>
                </div>

                <p className="text-xs text-on-surface-variant font-medium leading-relaxed pl-1">
                  {isHindi ? n.bodyHi : n.bodyEn}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </main>
  )
}
