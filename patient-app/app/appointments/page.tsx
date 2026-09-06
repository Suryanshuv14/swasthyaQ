'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TopHeader } from '@/components/patient/top-header'
import { BottomNav } from '@/components/patient/bottom-nav'
import { AudioFeedbackToast } from '@/components/patient/audio-feedback-toast'
import { useSpeak } from '@/hooks/useSpeak'

interface AppointmentItem {
  id: string
  tokenNumber: string
  doctorName: string
  doctorNameEn: string
  specialty: string
  specialtyEn: string
  dateStr: string
  timeStr: string
  facility: string
  status: 'upcoming' | 'completed' | 'cancelled'
  mode: string
}

const INITIAL_APPOINTMENTS: AppointmentItem[] = [
  {
    id: 'apt-1',
    tokenNumber: 'A-108',
    doctorName: 'डॉ. रमेश कपूर',
    doctorNameEn: 'Dr. Ramesh Kapoor',
    specialty: 'सामान्य रोग विशेषज्ञ',
    specialtyEn: 'General Physician',
    dateStr: 'कल, 14 अक्टूबर',
    timeStr: 'सुबह 10:00 बजे (10:00 AM)',
    facility: 'प्राथमिक स्वास्थ्य केंद्र (PHC Ramnagar, Room 02)',
    status: 'upcoming',
    mode: 'In-Clinic Tele-OPD',
  },
  {
    id: 'apt-2',
    tokenNumber: 'B-42',
    doctorName: 'डॉ. प्रिया शर्मा',
    doctorNameEn: 'Dr. Priya Sharma',
    specialty: 'बाल रोग विशेषज्ञ',
    specialtyEn: 'Pediatrician',
    dateStr: '2 अक्टूबर',
    timeStr: 'दोपहर 02:30 बजे',
    facility: 'टेली-परामर्श (Tele-Call Consultation)',
    status: 'completed',
    mode: 'Tele-Consultation',
  },
  {
    id: 'apt-3',
    tokenNumber: 'A-89',
    doctorName: 'डॉ. रमेश कपूर',
    doctorNameEn: 'Dr. Ramesh Kapoor',
    specialty: 'सामान्य परामर्श',
    specialtyEn: 'General Medicine',
    dateStr: '18 सितम्बर',
    timeStr: 'सुबह 11:00 बजे',
    facility: 'प्राथमिक स्वास्थ्य केंद्र (PHC Ramnagar)',
    status: 'completed',
    mode: 'In-Clinic OPD',
  },
]

export default function AppointmentsPage() {
  const router = useRouter()
  const { speak, isSpeaking } = useSpeak()
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const handleReadList = () => {
    const text = 'आपके पास कल 14 अक्टूबर सुबह 10 बजे डॉक्टर रमेश कपूर का आगामी टोकन A-108 है। कमरा नंबर 2।'
    setToastMsg(text)
    setToastVisible(true)
    speak(text, 'hi-IN')
    setTimeout(() => setToastVisible(false), 3800)
  }

  return (
    <main className="flex flex-col relative w-full pt-20 pb-24 bg-surface min-h-screen">
      {/* Top Header */}
      <TopHeader />

      {/* Audio Feedback Toast */}
      <AudioFeedbackToast visible={toastVisible} message={toastMsg} />

      <div className="flex flex-col w-full max-w-md mx-auto px-margin-screen space-y-stack-gap-md pb-8">
        {/* Page Header & Voice Assist Banner */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col">
            <h1 className="font-headline-lg text-[22px] text-on-surface font-extrabold">
              मेरे अपॉइंटमेंट
            </h1>
            <span className="font-label-supporting text-[12px] text-on-surface-variant">
              My Appointments &amp; Token History
            </span>
          </div>

          {/* Prominent Audio Reader Action Button */}
          <button
            onClick={handleReadList}
            aria-label="सूची को सुनकर समझें / Read aloud appointments list"
            className="flex items-center gap-2 h-12 px-4 rounded-xl bg-tertiary hover:bg-tertiary/90 text-on-tertiary font-label-action text-[14px] shadow-xs active:scale-95 transition-transform cursor-pointer"
            type="button"
          >
            <span
              className="material-symbols-outlined text-[24px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              volume_up
            </span>
            <span className="font-bold flex flex-col text-left leading-none">
              <span>सुनें</span>
              <span className="text-[10px] opacity-80 uppercase tracking-wider">Listen</span>
            </span>
          </button>
        </div>

        {/* Appointment List Container */}
        <div className="flex flex-col space-y-stack-gap-md">
          {INITIAL_APPOINTMENTS.map((apt) => {
            const isUpcoming = apt.status === 'upcoming'

            return (
              <article
                key={apt.id}
                className={`bg-surface-container-lowest rounded-2xl shadow-sm p-card-padding flex flex-col relative overflow-hidden transition-all border border-outline-variant/30 ${
                  isUpcoming ? 'ring-2 ring-primary/20 shadow-md' : 'opacity-95'
                }`}
              >
                {/* Status Strip Indicator */}
                <div className="flex items-center justify-between pb-3">
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-label-action text-[12px] font-bold ${
                      isUpcoming
                        ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                        : 'bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    {isUpcoming ? (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-ping" />
                        <span>🟢 कल है (Upcoming)</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        <span>⚪ पूरा हुआ (Completed)</span>
                      </>
                    )}
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-label-supporting text-[12px] font-bold">
                    {apt.dateStr}
                  </span>
                </div>

                {/* Token Badge & Doctor Header */}
                <div className="flex items-start justify-between gap-2 mt-1">
                  <div>
                    <span className="font-headline-lg text-[20px] text-primary font-extrabold tracking-tight block">
                      टोकन #{apt.tokenNumber}
                    </span>
                    <h2 className="font-headline-md text-[17px] text-on-surface font-bold mt-0.5">
                      {apt.doctorName}{' '}
                      <span className="font-normal text-[14px] text-on-surface-variant font-body-md block">
                        ({apt.doctorNameEn})
                      </span>
                    </h2>
                    <p className="font-label-supporting text-[12px] text-secondary mt-0.5">
                      {apt.specialty} • {apt.specialtyEn}
                    </p>
                  </div>

                  <div className="w-14 h-14 rounded-2xl bg-primary-container text-on-primary font-black text-xl flex items-center justify-center shrink-0 shadow-xs">
                    {apt.doctorName.slice(3, 5)}
                  </div>
                </div>

                {/* Detail Chips: Schedule & Clinic Location */}
                <div className="mt-3 p-3 bg-surface-container-low rounded-xl flex flex-col space-y-1.5 border border-outline-variant/20">
                  <div className="flex items-center gap-2 text-on-surface">
                    <span className="material-symbols-outlined text-[20px] text-primary">schedule</span>
                    <span className="font-label-action text-[14px] font-bold">
                      {apt.dateStr} • {apt.timeStr}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px] text-primary">
                      local_hospital
                    </span>
                    <span className="font-body-md text-[13px] text-on-surface truncate">
                      {apt.facility}
                    </span>
                  </div>
                </div>

                {/* Card Action Button */}
                {isUpcoming ? (
                  <button
                    onClick={() => {
                      sessionStorage.setItem(
                        'swasthyaq_confirmed_appointment',
                        JSON.stringify({
                          tokenNumber: apt.tokenNumber,
                          doctorName: `${apt.doctorName} (${apt.doctorNameEn})`,
                          room: 'कमरा नंबर २ (Room No. 2)',
                          slotTime: `${apt.dateStr}, ${apt.timeStr}`,
                          patientName: 'सुनीता देवी',
                          abhaId: '94-8231-5612',
                        })
                      )
                      router.push('/appointment-confirmed')
                    }}
                    className="mt-3 w-full h-12 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary flex items-center justify-between font-label-action text-[15px] font-bold shadow-xs active:scale-[0.99] transition-transform cursor-pointer"
                    type="button"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px]">description</span>
                      <span>विवरण देखें / View Details</span>
                    </span>
                    <span className="material-symbols-outlined text-[22px]">arrow_forward</span>
                  </button>
                ) : (
                  <Link
                    href="/prescriptions"
                    className="mt-3 w-full h-12 px-4 rounded-xl bg-secondary-container hover:bg-secondary-fixed text-on-secondary-container flex items-center justify-between font-label-action text-[14px] font-bold active:scale-[0.99] transition-transform"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px] text-primary">
                        receipt_long
                      </span>
                      <span>दवा पर्ची देखें / View Prescription</span>
                    </span>
                    <span className="material-symbols-outlined text-[20px]">download</span>
                  </Link>
                )}
              </article>
            )
          })}
        </div>

        {/* Big Voice Quick Action Hero Banner */}
        <div className="pt-2">
          <div className="rounded-2xl p-card-padding bg-primary-container text-on-primary flex flex-col space-y-3 shadow-lg relative overflow-hidden border border-outline-variant/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[26px]">mic</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-md text-[17px] text-on-primary font-bold leading-tight">
                  बोलकर अपॉइंटमेंट लें
                </span>
                <span className="font-label-supporting text-[13px] text-on-primary-container">
                  Book New Token by Voice in Hindi
                </span>
              </div>
            </div>

            <p className="font-body-md text-[14px] text-primary-fixed leading-snug">
              बस बोलें &quot;मुझे डॉक्टर से मिलना है&quot; और हमारा डिजिटल सहायक आपका टोकन बना देगा।
            </p>

            <Link
              href="/consultation"
              className="w-full h-14 rounded-xl bg-tertiary hover:bg-tertiary/90 text-on-tertiary font-label-action text-[16px] font-bold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform"
            >
              <span className="material-symbols-outlined text-[28px]">record_voice_over</span>
              <span>नया अपॉइंटमेंट बोलें • Start Voice Call</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Shared Bottom Nav */}
      <BottomNav />
    </main>
  )
}
