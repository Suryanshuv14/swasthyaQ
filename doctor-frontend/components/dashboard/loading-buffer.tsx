'use client'

import React from 'react'

interface LoadingBufferProps {
  title: string
  subtitle?: string
  icon?: string
  style?: React.CSSProperties
}

export function LoadingBuffer({
  title,
  subtitle = 'Fetching live data from MongoDB Atlas',
  icon = 'sync',
  style,
}: LoadingBufferProps) {
  return (
    <div className="loading-buffer-wrap" style={style}>
      <div className="buffer-spinner-wrap">
        <div className="buffer-spinner" />
        <md-icon className="buffer-center-icon">{icon}</md-icon>
      </div>
      <div className="buffer-text-wrap">
        <span className="buffer-title">{title}</span>
        {subtitle && <span className="buffer-subtitle">{subtitle}</span>}
      </div>
    </div>
  )
}
