'use client'

import React, { useState } from 'react'
import { TopHeader } from '@/components/patient/top-header'
import { BottomNav } from '@/components/patient/bottom-nav'
import { AudioFeedbackToast } from '@/components/patient/audio-feedback-toast'
import { useSpeak } from '@/hooks/useSpeak'

interface MedicineItem {
  id: string
  name: string
  dose: string
  indication: string
  timing: {
    morning: boolean
    afternoon: boolean
    night: boolean
  }
  foodInstruction: string
  audioText: string
}

const CURRENT_MEDICINES: MedicineItem[] = [
  {
    id: 'med-1',
    name: 'Paracetamol 500mg',
    dose: '1 गोली',
    indication: 'बुखार और दर्द की गोली (For fever & body pain)',
    timing: { morning: true, afternoon: true, night: true },
    foodInstruction: 'खाना खाने के बाद लें (After Food)',
    audioText: 'पैरासिटामोल 500 एमजी: सुबह, दोपहर और रात को खाना खाने के बाद एक-एक गोली लें।',
  },
  {
    id: 'med-2',
    name: 'Cetirizine 10mg',
    dose: '1 गोली',
    indication: 'खांसी-जुकाम व एलर्जी की दवा (For cough & allergy)',
    timing: { morning: false, afternoon: false, night: true },
    foodInstruction: 'रात को सोने से पहले लें (Before Bed)',
    audioText: 'सेट्रिज़िन 10 एमजी: रात को सोने से पहले केवल एक गोली लें।',
  },
  {
    id: 'med-3',
    name: 'ORS घोल (ओआरएस)',
    dose: '1 पैकेट',
    indication: 'शरीर में पानी की कमी दूर करने हेतु (Oral Rehydration)',
    timing: { morning: true, afternoon: true, night: true },
    foodInstruction: 'दिन भर में 1 लीटर पानी में मिलाकर पिएं (Mix in 1L clean water)',
    audioText: 'ओआरएस पैकेट: पूरे पैकेट को एक लीटर साफ पीने के पानी में घोलकर दिन भर पिएं।',
  },
]

export default function PrescriptionsPage() {
  const { speak, isSpeaking, stop } = useSpeak()
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const handlePlayAudio = (text: string) => {
    setToastMsg(text)
    setToastVisible(true)
    speak(text, 'hi-IN')
    setTimeout(() => setToastVisible(false), 4000)
  }

  const handleListenAll = () => {
    const fullRx =
      'आपकी वर्तमान दवाइयां: पैरासिटामोल 500 एमजी दिन में तीन बार खाना खाने के बाद। सेट्रिज़िन 10 एमजी रात को सोने से पहले। ओआरएस घोल एक लीटर पानी में दिनभर पिएं।'
    handlePlayAudio(fullRx)
  }

  const handleRefillRequest = () => {
    const msg = 'दवा रीफिल अनुरोध दर्ज कर लिया गया है। नजदीकी आशा कार्यकर्ता या PHC से संपर्क किया जाएगा।'
    handlePlayAudio(msg)
  }

  return (
    <main className="flex flex-col relative w-full pt-20 pb-24 bg-surface min-h-screen">
      {/* Top Header */}
      <TopHeader />

      {/* Audio Feedback Toast */}
      <AudioFeedbackToast visible={toastVisible} message={toastMsg} />

      <div className="flex flex-col w-full max-w-md mx-auto px-margin-screen pb-stack-gap-lg">
        {/* Header & Audio Guidance Banner */}
        <div className="flex flex-col gap-stack-gap-sm mb-stack-gap-md pt-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="font-headline-lg text-[22px] text-on-surface font-extrabold">
                मेरी दवाइयां
              </h1>
              <span className="font-label-supporting text-[12px] text-on-surface-variant">
                My Prescriptions &amp; Digital Rx
              </span>
            </div>

            {/* Audio Reader Button */}
            <button
              onClick={handleListenAll}
              aria-label="पर्ची सुनें (Listen Prescription)"
              className="h-12 px-4 rounded-full bg-tertiary-container hover:bg-tertiary text-on-tertiary flex items-center gap-2 shadow-xs active:scale-95 transition-transform cursor-pointer"
              type="button"
            >
              <span
                className="material-symbols-outlined text-[24px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                volume_up
              </span>
              <div className="flex flex-col text-left">
                <span className="font-label-supporting text-xs font-bold leading-none">
                  {isSpeaking ? 'रुकें' : 'पर्ची सुनें'}
                </span>
                <span className="text-[10px] opacity-90 leading-tight">Listen All</span>
              </div>
            </button>
          </div>
        </div>

        {/* ACTIVE PRESCRIPTION CARD */}
        <div className="flex flex-col rounded-2xl bg-surface-container-lowest shadow-sm mb-stack-gap-lg overflow-hidden border border-outline-variant/30">
          {/* Card Header */}
          <div className="p-card-padding bg-surface-container-low flex flex-col gap-2 border-b border-outline-variant/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-tertiary inline-block animate-ping" />
                <span className="font-headline-md text-[17px] text-on-surface font-bold">
                  वर्तमान दवाइयां (Active Course)
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-bold">
                आज • Live
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1">
              <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed font-bold">
                <span className="material-symbols-outlined text-[22px]">stethoscope</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-action text-[15px] text-on-surface leading-tight font-bold">
                  डॉ. रमेश कपूर (Dr. Ramesh Kapoor)
                </span>
                <span className="font-label-supporting text-[11px] text-on-surface-variant">
                  PHC रामनगर • General Physician
                </span>
              </div>
            </div>
          </div>

          {/* Medicine Items Stack */}
          <div className="p-card-padding flex flex-col gap-stack-gap-md">
            {CURRENT_MEDICINES.map((med, idx) => (
              <div
                key={med.id}
                className="flex flex-col rounded-xl bg-surface-container-low p-4 border border-outline-variant/20"
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-headline-md text-[16px] text-on-surface font-bold">
                        {idx + 1}. {med.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-bold">
                        {med.dose}
                      </span>
                    </div>
                    <span className="font-label-supporting text-[12px] text-primary font-bold mt-0.5">
                      {med.indication}
                    </span>
                  </div>

                  <button
                    onClick={() => handlePlayAudio(med.audioText)}
                    aria-label={`Listen ${med.name} instructions`}
                    className="w-10 h-10 rounded-full bg-surface-container-high hover:bg-secondary-container flex items-center justify-center text-primary active:scale-90 transition-transform cursor-pointer"
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

                {/* Visual Dosage Timing Grid */}
                <div className="grid grid-cols-3 gap-2 my-3">
                  {/* Morning */}
                  <div
                    className={`flex flex-col items-center justify-center p-2 rounded-lg ${
                      med.timing.morning
                        ? 'bg-surface-container-lowest shadow-xs'
                        : 'bg-surface-container-lowest/40 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-1 text-on-surface-variant mb-0.5">
                      <span className="material-symbols-outlined text-[16px] text-amber-500">
                        light_mode
                      </span>
                      <span className="font-label-supporting text-[11px]">सुबह</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {med.timing.morning ? (
                        <>
                          <span
                            className="material-symbols-outlined text-[18px] text-primary"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            pill
                          </span>
                          <span className="font-label-action text-[13px] text-on-surface font-black">
                            1 गोली
                          </span>
                        </>
                      ) : (
                        <span className="text-[11px] font-bold text-error">--</span>
                      )}
                    </div>
                  </div>

                  {/* Afternoon */}
                  <div
                    className={`flex flex-col items-center justify-center p-2 rounded-lg ${
                      med.timing.afternoon
                        ? 'bg-surface-container-lowest shadow-xs'
                        : 'bg-surface-container-lowest/40 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-1 text-on-surface-variant mb-0.5">
                      <span className="material-symbols-outlined text-[16px] text-amber-600">
                        sunny
                      </span>
                      <span className="font-label-supporting text-[11px]">दोपहर</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {med.timing.afternoon ? (
                        <>
                          <span
                            className="material-symbols-outlined text-[18px] text-primary"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            pill
                          </span>
                          <span className="font-label-action text-[13px] text-on-surface font-black">
                            1 गोली
                          </span>
                        </>
                      ) : (
                        <span className="text-[11px] font-bold text-error">--</span>
                      )}
                    </div>
                  </div>

                  {/* Night */}
                  <div
                    className={`flex flex-col items-center justify-center p-2 rounded-lg ${
                      med.timing.night
                        ? 'bg-surface-container-lowest shadow-xs'
                        : 'bg-surface-container-lowest/40 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-1 text-on-surface-variant mb-0.5">
                      <span className="material-symbols-outlined text-[16px] text-indigo-500">
                        bedtime
                      </span>
                      <span className="font-label-supporting text-[11px]">रात</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {med.timing.night ? (
                        <>
                          <span
                            className="material-symbols-outlined text-[18px] text-primary"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            pill
                          </span>
                          <span className="font-label-action text-[13px] text-on-surface font-black">
                            1 गोली
                          </span>
                        </>
                      ) : (
                        <span className="text-[11px] font-bold text-error">--</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Food timing badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary-fixed text-on-secondary-fixed text-[12px] font-bold">
                  <span className="material-symbols-outlined text-[18px]">restaurant</span>
                  <span>{med.foodInstruction}</span>
                </div>
              </div>
            ))}

            {/* Instruction Readout Action Bar */}
            <button
              onClick={handleListenAll}
              className="w-full h-12 rounded-xl bg-primary-container hover:bg-primary text-on-primary flex items-center justify-center gap-2 active:opacity-95 transition-all shadow-xs cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">campaign</span>
              <span className="font-label-supporting text-[14px] font-bold">
                दवा कैसे खानी है, बोलकर सुनें
              </span>
            </button>
          </div>
        </div>

        {/* SECONDARY SECTION: PAST PRESCRIPTIONS */}
        <div className="flex flex-col gap-stack-gap-sm mb-stack-gap-lg">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-headline-md text-[17px] text-on-surface font-bold">पुरानी पर्चियां</h2>
            <span className="font-label-supporting text-[12px] text-on-surface-variant">
              Past Records
            </span>
          </div>

          {/* Past Record 1 */}
          <div
            onClick={() => handlePlayAudio('22 सितम्बर 2024 की पर्ची: वायरल बुखार व जुकाम के लिए दवाइयां।')}
            className="flex items-center justify-between p-card-padding rounded-2xl bg-surface-container-lowest shadow-xs hover:bg-surface-container active:bg-surface-container-low transition-colors cursor-pointer border border-outline-variant/30"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[22px]">description</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-md text-[15px] text-on-surface font-bold">
                  वायरल बुखार व जुकाम
                </span>
                <span className="font-label-supporting text-[11px] text-on-surface-variant">
                  22 सितम्बर • डॉ. अनिता शर्मा
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-primary">
              <span className="font-label-supporting text-xs font-bold">देखें</span>
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </div>
          </div>

          {/* Past Record 2 */}
          <div
            onClick={() => handlePlayAudio('05 अगस्त 2024 की पर्ची: सामान्य पेट दर्द परामर्श।')}
            className="flex items-center justify-between p-card-padding rounded-2xl bg-surface-container-lowest shadow-xs hover:bg-surface-container active:bg-surface-container-low transition-colors cursor-pointer border border-outline-variant/30"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[22px]">description</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-md text-[15px] text-on-surface font-bold">
                  सामान्य पेट दर्द परामर्श
                </span>
                <span className="font-label-supporting text-[11px] text-on-surface-variant">
                  05 अगस्त • डॉ. रमेश कपूर
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-primary">
              <span className="font-label-supporting text-xs font-bold">देखें</span>
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION: REQUEST REFILL */}
        <div className="w-full flex flex-col items-center pt-2">
          <button
            onClick={handleRefillRequest}
            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary-container text-on-primary flex items-center justify-center gap-3 shadow-md active:scale-[0.98] transition-transform cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[26px]">medication</span>
            <div className="flex flex-col text-left">
              <span className="font-label-action text-[15px] font-bold leading-tight">
                दवा समाप्त हो गई? रीफिल मांगें
              </span>
              <span className="font-label-supporting text-[10px] opacity-90 leading-tight">
                Request Medicine Refill
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Shared Bottom Nav */}
      <BottomNav />
    </main>
  )
}
