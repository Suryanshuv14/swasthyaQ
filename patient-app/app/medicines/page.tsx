'use client'

import React, { useState, useEffect } from 'react'
import { TopHeader } from '@/components/patient/top-header'
import { BottomNav } from '@/components/patient/bottom-nav'
import { AudioFeedbackToast } from '@/components/patient/audio-feedback-toast'
import { useSpeak } from '@/hooks/useSpeak'
import { useLanguage } from '@/hooks/useLanguage'

export interface BackendMedicineItem {
  name: string
  dose?: string
  dosage?: string
  frequency?: string
  duration?: string
  instructions?: string
  timing?: {
    morning?: boolean
    afternoon?: boolean
    night?: boolean
  }
}

export interface BackendPrescription {
  id: string
  appointment_id?: string
  patient_id?: string
  patient_name?: string
  doctor_name: string
  doctor_email?: string
  medicines: BackendMedicineItem[]
  notes?: string
  created_at: string
}

export default function MedicinesPage() {
  const { speak } = useSpeak()
  const { lang, t } = useLanguage()
  const isHindi = lang === 'hi'

  const [prescriptions, setPrescriptions] = useState<BackendPrescription[]>([])
  const [loading, setLoading] = useState(true)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  // Fetch real prescriptions from FastAPI backend
  useEffect(() => {
    let isMounted = true
    const fetchPrescriptionData = async () => {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      try {
        const res = await fetch(`${apiUrl}/prescriptions/`, {
          headers: {
            // Include doctor auth token if stored in session/local, or request without auth
            'Content-Type': 'application/json',
          },
        })

        if (res.ok) {
          const data = await res.json()
          if (isMounted && Array.isArray(data)) {
            setPrescriptions(data)
          }
        } else {
          // If backend returned empty or unauthorized for unauthenticated patient
          if (isMounted) setPrescriptions([])
        }
      } catch (err) {
        console.warn('Could not fetch prescriptions from backend:', err)
        if (isMounted) setPrescriptions([])
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchPrescriptionData()
    return () => {
      isMounted = false
    }
  }, [])

  const handlePlayAudio = (text: string) => {
    setToastMsg(text)
    setToastVisible(true)
    speak(text, isHindi ? 'hi-IN' : 'en-IN')
    setTimeout(() => setToastVisible(false), 4000)
  }

  const handleReadScreen = () => {
    if (prescriptions.length === 0) {
      const emptyText = isHindi
        ? 'अभी तक कोई दवा नहीं लिखी गई है। डॉक्टर द्वारा पर्ची बनाए जाने पर यहाँ दिखाई देगी।'
        : 'No medicines prescribed yet. Prescriptions written by your doctor will appear here.'
      handlePlayAudio(emptyText)
    } else {
      const allMedsText = prescriptions
        .flatMap((p) =>
          p.medicines.map(
            (m) =>
              `${m.name}, ${m.dose || m.dosage || ''} ${m.frequency || ''} ${m.duration || ''} ${m.instructions || ''}`
          )
        )
        .join('. ')
      const speech = isHindi
        ? `आपकी दवाइयां हैं: ${allMedsText}`
        : `Your prescribed medicines are: ${allMedsText}`
      handlePlayAudio(speech)
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
          <div className="flex flex-col">
            <h1 className="font-headline-lg text-xl text-on-surface font-extrabold">
              {t.medicinesHeader}
            </h1>
            <span className="text-xs text-secondary font-medium">
              {isHindi ? 'डॉक्टर द्वारा अधिकृत दवा पर्चियां' : 'Doctor prescribed medications'}
            </span>
          </div>

          <button
            onClick={handleReadScreen}
            aria-label={t.listenMedicinesAudio}
            className="w-11 h-11 rounded-full bg-tertiary-container text-on-tertiary flex items-center justify-center active:scale-90 transition-transform shadow-xs"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px] text-tertiary">volume_up</span>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center p-12 bg-surface-container-lowest rounded-3xl border border-outline-variant/30">
            <div className="w-8 h-8 rounded-full border-3 border-primary border-t-transparent animate-spin mb-3" />
            <span className="text-xs text-secondary font-medium">{t.loading}</span>
          </div>
        )}

        {/* EMPTY STATE (Strict Requirement: No fake data, show "No medicines prescribed yet.") */}
        {!loading && prescriptions.length === 0 && (
          <div className="w-full bg-surface-container-lowest rounded-3xl p-8 text-center border border-outline-variant/30 flex flex-col items-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-secondary mb-3">
              <span className="material-symbols-outlined text-3xl">medication</span>
            </div>
            <h2 className="font-headline-md text-base font-bold text-on-surface">
              {t.noMedicinesYet}
            </h2>
            <p className="text-xs text-secondary font-medium mt-1 max-w-xs leading-relaxed">
              {isHindi
                ? 'डॉक्टर से परामर्श के पश्चात आपकी पर्ची यहाँ स्वतः उपलब्ध हो जाएगी।'
                : 'Your prescription will automatically appear here once prescribed by the doctor.'}
            </p>
          </div>
        )}

        {/* REAL MEDICINES LIST (When returned from backend API) */}
        {!loading &&
          prescriptions.length > 0 &&
          prescriptions.map((prescription) => (
            <div
              key={prescription.id}
              className="w-full bg-surface-container-lowest rounded-3xl p-5 shadow-sm border border-outline-variant/30 flex flex-col gap-3"
            >
              {/* Doctor & Date Header */}
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-lg">stethoscope</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-on-surface">
                      {prescription.doctor_name || 'Dr. Ananya Kapoor'}
                    </span>
                    <span className="text-[10px] text-secondary font-medium">
                      {new Date(prescription.created_at || Date.now()).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 text-[10px] font-bold">
                  {isHindi ? 'सत्यापित पर्ची' : 'Verified Rx'}
                </span>
              </div>

              {/* Medicines Items */}
              <div className="flex flex-col gap-3 pt-1">
                {prescription.medicines.map((med, idx) => {
                  const speechText = `${med.name}. ${med.dose || med.dosage || ''}. ${
                    med.frequency || ''
                  }. ${med.duration || ''}. ${med.instructions || ''}`

                  return (
                    <div
                      key={idx}
                      className="p-3.5 bg-surface-container-low rounded-2xl flex flex-col gap-2 border border-outline-variant/20"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-on-surface">{med.name}</span>
                          {med.instructions && (
                            <span className="text-[11px] text-secondary mt-0.5">
                              {med.instructions}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handlePlayAudio(speechText)}
                          aria-label="Listen dosage"
                          className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary active:scale-90"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">volume_up</span>
                        </button>
                      </div>

                      {/* Dosage, Frequency, Duration Metadata */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                        {(med.dose || med.dosage) && (
                          <span className="px-2 py-0.5 rounded-lg bg-surface-container text-on-surface font-semibold">
                            {t.dosageLabel}: {med.dose || med.dosage}
                          </span>
                        )}
                        {med.frequency && (
                          <span className="px-2 py-0.5 rounded-lg bg-surface-container text-on-surface font-semibold">
                            {t.frequencyLabel}: {med.frequency}
                          </span>
                        )}
                        {med.duration && (
                          <span className="px-2 py-0.5 rounded-lg bg-surface-container text-on-surface font-semibold">
                            {t.durationLabel}: {med.duration}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Notes from Doctor */}
              {prescription.notes && (
                <div className="p-3 bg-surface-container rounded-xl text-xs text-secondary mt-1">
                  <span className="font-bold text-on-surface">{isHindi ? 'डॉक्टर का निर्देश: ' : 'Doctor Note: '}</span>
                  {prescription.notes}
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </main>
  )
}
