'use client'

import React, { useState } from 'react'
import { TopHeader } from '@/components/patient/top-header'
import { BottomNav } from '@/components/patient/bottom-nav'
import { AudioFeedbackToast } from '@/components/patient/audio-feedback-toast'
import { useSpeak } from '@/hooks/useSpeak'

interface NotificationItem {
  id: string
  type: 'medication' | 'appointment' | 'asha' | 'camp'
  tag: string
  tagColor: string
  timeAgo: string
  titleHi: string
  titleEn: string
  bodyHi: string
  bodyEn: string
  audioText: string
  action?: {
    type: 'taken' | 'call' | 'view'
    label: string
  }
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'medication',
    tag: 'तुरंत लें / Due Now',
    tagColor: 'bg-error-container text-on-error-container',
    timeAgo: '10 मिनट पहले',
    titleHi: 'दवा लेने का समय',
    titleEn: 'Medicine Reminder',
    bodyHi: 'पैरासिटामोल 1 गोली दोपहर के भोजन के बाद लें।',
    bodyEn: 'Take 1 Paracetamol tablet (500mg) after lunch with clean water.',
    audioText: 'दवा लेने का समय: पैरासिटामोल 1 गोली दोपहर के भोजन के बाद लें।',
    action: { type: 'taken', label: '✓ ले ली (Taken)' },
  },
  {
    id: 'notif-2',
    type: 'appointment',
    tag: 'अपॉइंटमेंट अलर्ट',
    tagColor: 'bg-secondary-container text-on-secondary-container',
    timeAgo: 'आज सुबह (9:00 AM)',
    titleHi: 'कल का अपॉइंटमेंट',
    titleEn: "Tomorrow's Tele-Consultation",
    bodyHi: 'डॉ. कपूर से कल सुबह 10 बजे परामर्श है। समय पर प्राथमिक स्वास्थ्य केंद्र पहुंचें।',
    bodyEn: 'Consultation with Dr. Ramesh Kapoor tomorrow at 10:00 AM at PHC Ramnagar (Room 2).',
    audioText: 'कल सुबह 10 बजे डॉ. कपूर से परामर्श है। समय पर प्राथमिक स्वास्थ्य केंद्र पहुंचें।',
  },
  {
    id: 'notif-3',
    type: 'asha',
    tag: 'आशा सहयोगिनी',
    tagColor: 'bg-secondary-fixed text-on-secondary-fixed',
    timeAgo: 'कल (Yesterday)',
    titleHi: 'आशा दीदी का संदेश',
    titleEn: 'Message from ASHA Sunita',
    bodyHi: 'दीदी ने आपका हालचाल पूछा है। बात करने के लिए कॉल करें।',
    bodyEn: '"नमस्ते, आपका बुखार अब कैसा है? अगर आराम न हो तो मुझे तुरंत कॉल करें।"',
    audioText: 'आशा दीदी सुनीता ने आपका हालचाल पूछा है। बात करने के लिए कॉल करें।',
    action: { type: 'call', label: 'आशा दीदी को कॉल करें (Call)' },
  },
  {
    id: 'notif-4',
    type: 'camp',
    tag: 'निःशुल्क स्वास्थ्य शिविर',
    tagColor: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
    timeAgo: '3 दिन पहले',
    titleHi: 'नेत्र जांच व बीपी जांच शिविर',
    titleEn: 'Free Health & Eye Checkup Camp',
    bodyHi: 'रामनगर पंचायत भवन में इस रविवार सुबह 9 बजे से निःशुल्क स्वास्थ्य शिविर लगेगा।',
    bodyEn: 'Free eye and blood pressure checkup at Ramnagar Panchayat Bhavan this Sunday at 9 AM.',
    audioText: 'रामनगर पंचायत भवन में इस रविवार सुबह 9 बजे से निःशुल्क स्वास्थ्य शिविर लगेगा।',
  },
]

export default function NotificationsPage() {
  const { speak, isSpeaking } = useSpeak()
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const [medTaken, setMedTaken] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const handlePlayAudio = (text: string) => {
    setToastMsg(text)
    setToastVisible(true)
    speak(text, 'hi-IN')
    setTimeout(() => setToastVisible(false), 4000)
  }

  const handleListenAll = () => {
    const fullText =
      'पहली सूचना: पैरासिटामोल दवा लेने का समय हो गया है। दूसरी सूचना: कल सुबह 10 बजे डॉ कपूर से अपॉइंटमेंट है। तीसरी सूचना: आशा दीदी का संदेश है।'
    handlePlayAudio(fullText)
  }

  const handleMarkMedTaken = (id: string) => {
    setMedTaken(true)
    handlePlayAudio('दवा लेने की पुष्टि हो गई। धन्यवाद!')
  }

  return (
    <main className="flex flex-col relative w-full pt-20 pb-24 bg-surface min-h-screen">
      {/* Top Header */}
      <TopHeader />

      {/* Audio Feedback Toast */}
      <AudioFeedbackToast visible={toastVisible} message={toastMsg} />

      <div className="flex flex-col w-full max-w-md mx-auto px-margin-screen space-y-stack-gap-md pb-6">
        {/* Header Block with Voice Assistant Feature */}
        <section className="flex flex-col space-y-stack-gap-sm pt-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse" />
                <span className="font-label-supporting text-[11px] text-primary uppercase tracking-wide font-bold">
                  नया अपडेट / Live Feed
                </span>
              </div>
              <h1 className="font-headline-lg text-[22px] text-on-surface font-extrabold">
                सूचनाएं / Reminders
              </h1>
              <p className="font-label-supporting text-[12px] text-on-surface-variant">
                4 नई सूचनाएं आपके स्वास्थ्य हेतु
              </p>
            </div>

            {/* Listen All Audio Button */}
            <button
              onClick={handleListenAll}
              aria-label="Listen to all notifications"
              className="h-12 px-4 bg-tertiary-container hover:bg-tertiary text-on-tertiary rounded-xl flex items-center gap-2 shadow-xs active:scale-95 transition-transform flex-shrink-0 cursor-pointer"
              type="button"
            >
              <span
                className="material-symbols-outlined text-[24px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                volume_up
              </span>
              <div className="flex flex-col text-left">
                <span className="font-label-action text-[13px] leading-none text-on-primary font-bold">
                  {isSpeaking ? 'रुकें' : 'सब सुनें'}
                </span>
                <span className="text-[10px] opacity-90 leading-tight">Listen All</span>
              </div>
            </button>
          </div>
        </section>

        {/* Notification Stream (Inbox Cards) */}
        <section aria-label="Notifications List" className="flex flex-col space-y-stack-gap-md">
          {notifications.map((item) => {
            const isMed = item.type === 'medication'

            return (
              <article
                key={item.id}
                className="relative bg-surface-container-lowest rounded-2xl p-card-padding shadow-sm flex flex-col space-y-3 transition-all duration-300 overflow-hidden border border-outline-variant/30"
              >
                {/* Side indicator line */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-2 ${
                    isMed
                      ? 'bg-error'
                      : item.type === 'appointment'
                      ? 'bg-primary-container'
                      : 'bg-tertiary'
                  }`}
                />

                <div className="flex items-start justify-between gap-3 pl-1">
                  <div className="flex items-center gap-3">
                    {/* Circular Icon Placard */}
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        isMed
                          ? 'bg-error-container text-on-error-container'
                          : item.type === 'appointment'
                          ? 'bg-secondary-container text-primary'
                          : 'bg-secondary-fixed text-tertiary'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[26px]">
                        {isMed
                          ? 'medication'
                          : item.type === 'appointment'
                          ? 'calendar_clock'
                          : item.type === 'asha'
                          ? 'support_agent'
                          : 'campaign'}
                      </span>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-full font-label-supporting text-[10px] font-bold ${item.tagColor}`}
                        >
                          {item.tag}
                        </span>
                        <span className="font-label-supporting text-[11px] text-on-surface-variant flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[12px]">schedule</span>{' '}
                          {item.timeAgo}
                        </span>
                      </div>
                      <h2 className="font-headline-md text-[16px] text-on-surface font-bold mt-0.5">
                        {item.titleHi}
                      </h2>
                      <p className="font-label-supporting text-[11px] text-on-surface-variant font-medium">
                        {item.titleEn}
                      </p>
                    </div>
                  </div>

                  {/* Voice Button */}
                  <button
                    onClick={() => handlePlayAudio(item.audioText)}
                    aria-label="Play reminder voice note"
                    className="w-10 h-10 rounded-full bg-surface-container hover:bg-secondary-container flex items-center justify-center text-primary active:scale-90 transition-transform cursor-pointer shrink-0"
                    type="button"
                  >
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      volume_up
                    </span>
                  </button>
                </div>

                {/* Detail Body */}
                <div className="pl-1 bg-surface-container-low p-3 rounded-xl flex flex-col space-y-1 border border-outline-variant/20">
                  <p className="font-body-lg text-[14px] text-on-surface font-semibold">
                    {item.bodyHi}
                  </p>
                  <p className="font-body-md text-[12px] text-on-surface-variant">
                    {item.bodyEn}
                  </p>
                </div>

                {/* Action Button */}
                {isMed && (
                  <div className="pl-1 pt-1 flex items-center gap-2">
                    <button
                      onClick={() => handleMarkMedTaken(item.id)}
                      disabled={medTaken}
                      className={`flex-1 h-12 rounded-xl flex items-center justify-center gap-2 shadow-xs font-label-action text-[14px] font-bold active:scale-98 transition-all cursor-pointer ${
                        medTaken
                          ? 'bg-surface-container-high text-tertiary opacity-80'
                          : 'bg-tertiary hover:bg-tertiary/90 text-on-tertiary'
                      }`}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[22px]">check_circle</span>
                      <span>{medTaken ? '✓ ले ली गई (Taken)' : '✓ ले ली (Mark as Taken)'}</span>
                    </button>
                  </div>
                )}

                {item.type === 'asha' && (
                  <div className="pl-1 pt-1 flex items-center gap-2">
                    <a
                      href="tel:104"
                      className="flex-1 h-12 bg-secondary-container hover:bg-secondary-fixed text-on-secondary-container rounded-xl flex items-center justify-center gap-2 shadow-xs font-label-action text-[14px] font-bold active:scale-98 transition-all"
                    >
                      <span className="material-symbols-outlined text-[20px]">call</span>
                      <span>आशा दीदी को कॉल करें (Call 104)</span>
                    </a>
                  </div>
                )}
              </article>
            )
          })}
        </section>
      </div>

      {/* Shared Bottom Nav */}
      <BottomNav />
    </main>
  )
}
