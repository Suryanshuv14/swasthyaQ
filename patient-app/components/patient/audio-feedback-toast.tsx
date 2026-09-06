'use client'

import React from 'react'

interface AudioFeedbackToastProps {
  visible: boolean
  title?: string
  message: string
  onClose?: () => void
}

export function AudioFeedbackToast({
  visible,
  title = 'Audio playing / आवाज़ चालू है',
  message,
}: AudioFeedbackToastProps) {
  return (
    <div
      className={`fixed top-4 left-4 right-4 max-w-md mx-auto z-50 transform transition-all duration-300 pointer-events-none flex items-center gap-3 p-4 rounded-xl bg-primary text-on-primary shadow-xl ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'
      }`}
      role="alert"
      aria-live="polite"
    >
      <span
        className="material-symbols-outlined text-tertiary-fixed text-3xl shrink-0 animate-pulse"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        volume_up
      </span>
      <div className="flex flex-col min-w-0">
        <span className="font-label-supporting text-label-supporting text-primary-fixed leading-tight">
          {title}
        </span>
        <span className="font-body-md text-body-md text-on-primary font-bold truncate">
          {message}
        </span>
      </div>
    </div>
  )
}
