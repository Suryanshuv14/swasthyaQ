'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MedicinesPage from '@/app/medicines/page'

export default function PrescriptionsAlias() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/medicines')
  }, [router])

  return <MedicinesPage />
}
