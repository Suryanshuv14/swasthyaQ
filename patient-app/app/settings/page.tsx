'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProfileSettingsPage from '@/app/profile/page'

export default function SettingsAliasPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/profile')
  }, [router])

  return <ProfileSettingsPage />
}
