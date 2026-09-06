'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PatientAppRoot() {
  const router = useRouter()

  useEffect(() => {
    const savedLang = localStorage.getItem('swasthyaq_patient_language')
    if (savedLang) {
      router.replace('/home')
    } else {
      router.replace('/language-select')
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm font-semibold text-on-surface-variant font-headline">Loading SwasthyaQ...</p>
      </div>
    </div>
  )
}
