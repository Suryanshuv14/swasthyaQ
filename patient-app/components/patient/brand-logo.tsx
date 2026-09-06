'use client'

import React from 'react'

interface BrandLogoProps {
  className?: string
  size?: number
  src?: string
}

export function BrandLogo({ className = 'w-10 h-10', size = 40, src }: BrandLogoProps) {
  if (src) {
    return <img src={src} alt="SwasthyaQ Brand Logo" className={`object-contain rounded-xl ${className}`} />
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      width={size}
      height={size}
      fill="none"
      className={`shrink-0 rounded-2xl shadow-sm ${className}`}
    >
      <rect width="120" height="120" rx="28" fill="#1A5F7A" />
      <circle cx="60" cy="60" r="44" stroke="#FFFFFF" strokeWidth="4" strokeOpacity="0.25" />
      {/* Medical Cross integrated with Voice Soundwaves */}
      <path d="M60 32 V88" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" />
      <path d="M32 60 H88" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" />
      {/* Voice soundwave radiating dots */}
      <circle cx="60" cy="20" r="5" fill="#38BDF8" />
      <circle cx="60" cy="100" r="5" fill="#38BDF8" />
      <circle cx="20" cy="60" r="5" fill="#38BDF8" />
      <circle cx="100" cy="60" r="5" fill="#38BDF8" />
    </svg>
  )
}
