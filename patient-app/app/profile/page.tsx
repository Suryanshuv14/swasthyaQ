'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopHeader } from '@/components/patient/top-header'
import { BottomNav } from '@/components/patient/bottom-nav'
import { AudioFeedbackToast } from '@/components/patient/audio-feedback-toast'
import { useSpeak } from '@/hooks/useSpeak'
import { useLanguage } from '@/hooks/useLanguage'
import { usePatientProfile } from '@/hooks/usePatientProfile'
import { PatientProfile } from '@/lib/patientProfile'

export default function ProfileSettingsPage() {
  const router = useRouter()
  const { speak } = useSpeak()
  const { lang, t } = useLanguage()
  const isHindi = lang === 'hi'

  const { profile, updateProfile, initials, isLoaded } = usePatientProfile()

  const [formData, setFormData] = useState<PatientProfile>(profile)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Sync state when profile is loaded from storage
  useEffect(() => {
    if (isLoaded) {
      setFormData(profile)
    }
  }, [profile, isLoaded])

  const handleFieldChange = (field: keyof PatientProfile, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    const trimmedName = formData.name.trim() || (isHindi ? 'सुनीता देवी' : 'Sunita Devi')
    const trimmedUserId = formData.userId.trim() || 'PAT-78070'

    const updated = updateProfile({
      ...formData,
      name: trimmedName,
      userId: trimmedUserId,
      age: Number(formData.age) || 47,
    })

    const msg = t.profileSavedToast
    setToastMessage(msg)
    setToastVisible(true)
    speak(
      isHindi
        ? `प्रोफ़ाइल अपडेट हो गई। मरीज का नाम: ${updated.name}, यूजर आईडी: ${updated.userId}।`
        : `Profile updated. Patient name: ${updated.name}, User ID: ${updated.userId}.`,
      isHindi ? 'hi-IN' : 'en-IN'
    )

    setTimeout(() => {
      setToastVisible(false)
    }, 3500)
  }

  const handleListenProfile = () => {
    const speech = isHindi
      ? `मरीज का नाम: ${formData.name}। यूजर आईडी: ${formData.userId}। आयु: ${formData.age} वर्ष। फोन: ${formData.phone}। गांव: ${formData.village}।`
      : `Patient name: ${formData.name}. User ID: ${formData.userId}. Age: ${formData.age} years. Phone: ${formData.phone}. Village: ${formData.village}.`
    setToastMessage(speech)
    setToastVisible(true)
    speak(speech, isHindi ? 'hi-IN' : 'en-IN')
    setTimeout(() => setToastVisible(false), 4000)
  }

  const handleBookNow = () => {
    handleSave()
    router.push('/consultation')
  }

  return (
    <main className="flex flex-col relative w-full bg-surface min-h-screen pt-20 pb-28 font-body">
      {/* Top Header */}
      <TopHeader showBack backHref="/home" />

      {/* Audio Feedback Toast */}
      <AudioFeedbackToast visible={toastVisible} message={toastMessage} />

      <div className="flex flex-col w-full max-w-md mx-auto px-margin-screen space-y-4 pb-6">
        {/* Profile Avatar & Header Card */}
        <div className="w-full bg-surface-container-lowest rounded-3xl p-5 shadow-sm border border-outline-variant/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-16 h-16 rounded-2xl bg-primary-container text-on-primary font-black text-2xl flex items-center justify-center shadow-md shrink-0">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="font-headline-lg text-lg font-black text-on-surface truncate">
                {formData.name || (isHindi ? 'मरीज प्रोफ़ाइल' : 'Patient Profile')}
              </h1>
              <span className="text-xs text-secondary font-mono font-bold mt-0.5 truncate">
                ID: {formData.userId || 'PAT-78070'}
              </span>
            </div>
          </div>

          <button
            onClick={handleListenProfile}
            aria-label={t.listenProfileText}
            className="w-11 h-11 rounded-full bg-tertiary-container text-on-tertiary flex items-center justify-center active:scale-90 transition-transform shadow-xs shrink-0"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px] text-tertiary font-bold">
              volume_up
            </span>
          </button>
        </div>

        {/* Profile Settings Form */}
        <form
          onSubmit={handleSave}
          className="w-full bg-surface-container-lowest rounded-3xl p-5 shadow-sm border border-outline-variant/30 flex flex-col gap-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
            <span className="font-headline-md text-sm font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">manage_accounts</span>
              {t.personalDetails}
            </span>
            <span className="text-[11px] text-secondary font-medium">
              {isHindi ? 'विवरण बदलें' : 'Edit details'}
            </span>
          </div>

          {/* 1. Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[16px]">person</span>
              {t.nameLabel} <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder={t.namePlaceholder}
              className="w-full h-12 px-3.5 rounded-2xl bg-surface-container text-sm text-on-surface font-semibold border border-outline-variant/50 focus:border-primary focus:outline-none transition-colors"
              required
            />
          </div>

          {/* 2. User ID / ABHA ID */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[16px]">badge</span>
              {t.userIdLabel} <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={formData.userId}
              onChange={(e) => handleFieldChange('userId', e.target.value)}
              placeholder={t.userIdPlaceholder}
              className="w-full h-12 px-3.5 rounded-2xl bg-surface-container text-sm text-on-surface font-mono font-bold border border-outline-variant/50 focus:border-primary focus:outline-none transition-colors"
              required
            />
          </div>

          {/* 3. Mobile Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[16px]">call</span>
              {t.phoneLabel}
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              placeholder={t.phonePlaceholder}
              className="w-full h-12 px-3.5 rounded-2xl bg-surface-container text-sm text-on-surface font-medium border border-outline-variant/50 focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          {/* 4. Age & Gender Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Age */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface flex items-center gap-1">
                <span className="material-symbols-outlined text-primary text-[16px]">cake</span>
                {t.ageLabel}
              </label>
              <input
                type="number"
                min="0"
                max="130"
                value={formData.age}
                onChange={(e) => handleFieldChange('age', Number(e.target.value))}
                className="w-full h-12 px-3.5 rounded-2xl bg-surface-container text-sm text-on-surface font-bold border border-outline-variant/50 focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            {/* Gender */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface flex items-center gap-1">
                <span className="material-symbols-outlined text-primary text-[16px]">wc</span>
                {t.genderLabel}
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleFieldChange('gender', e.target.value)}
                className="w-full h-12 px-3 rounded-2xl bg-surface-container text-xs text-on-surface font-bold border border-outline-variant/50 focus:border-primary focus:outline-none transition-colors"
              >
                <option value="Female">{t.genderFemale}</option>
                <option value="Male">{t.genderMale}</option>
                <option value="Other">{t.genderOther}</option>
              </select>
            </div>
          </div>

          {/* 5. Village / Area */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[16px]">location_on</span>
              {t.villageLabel}
            </label>
            <input
              type="text"
              value={formData.village}
              onChange={(e) => handleFieldChange('village', e.target.value)}
              placeholder="Ramnagar"
              className="w-full h-12 px-3.5 rounded-2xl bg-surface-container text-sm text-on-surface font-medium border border-outline-variant/50 focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          {/* 6. Primary Health Centre Facility */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[16px]">local_hospital</span>
              {t.facilitySettingLabel}
            </label>
            <input
              type="text"
              value={formData.facilityId}
              onChange={(e) => handleFieldChange('facilityId', e.target.value)}
              className="w-full h-12 px-3.5 rounded-2xl bg-surface-container text-sm text-on-surface font-mono font-bold border border-outline-variant/50 focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          {/* Submit Save Button */}
          <button
            type="submit"
            className="w-full h-14 mt-2 rounded-2xl bg-primary hover:bg-primary-container text-on-primary font-label-action text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/25 active:scale-[0.98] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">save</span>
            <span>{t.saveProfileBtn}</span>
          </button>
        </form>

        {/* Quick Direct Booking Action Card */}
        <button
          onClick={handleBookNow}
          className="w-full p-4 rounded-3xl bg-secondary-container hover:bg-secondary-container/80 text-primary border-2 border-primary/20 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer text-left"
          type="button"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">calendar_add_on</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-md text-sm font-bold text-on-surface">
                {t.bookWithProfileBtn}
              </span>
              <span className="text-[11px] text-secondary font-medium">
                {isHindi ? 'सीधे वॉइस या चैट परामर्श शुरू करें' : 'Start consultation with updated name'}
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-primary text-xl">arrow_forward</span>
        </button>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </main>
  )
}
