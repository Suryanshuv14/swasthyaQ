'use client'

import React from 'react'

export interface StatCardProps {
  icon: string
  iconColorClass?: 'soft-blue' | 'soft-green' | 'soft-orange' | 'soft-purple' | 'soft-red'
  customIconStyle?: React.CSSProperties
  title: string
  value: string | number
  trendText?: string
  trendSubtext?: string
  trendClass?: 'trend' | 'trend neutral' | 'trend alert'
  isAlert?: boolean
  onClick?: () => void
  style?: React.CSSProperties
}

export function StatCard({
  icon,
  iconColorClass = 'soft-blue',
  customIconStyle,
  title,
  value,
  trendText,
  trendClass = 'trend',
  isAlert,
  onClick,
  style,
}: StatCardProps) {
  const alertStyles: React.CSSProperties | undefined = isAlert
    ? {
        background: 'linear-gradient(180deg, #fff5f5 0%, #fee2e2 100%)',
        borderColor: '#ef4444',
        boxShadow: '0 6px 18px rgba(220, 38, 38, 0.16), 0 2px 6px rgba(220, 38, 38, 0.08)',
        transition: 'all 0.25s ease-in-out',
      }
    : undefined

  const alertIconStyle: React.CSSProperties | undefined = isAlert
    ? {
        background: '#dc2626',
        color: '#ffffff',
        border: '1px solid #b91c1c',
        boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.25), 0 2px 6px rgba(220, 38, 38, 0.15)',
        transition: 'all 0.25s ease-in-out',
      }
    : undefined

  return (
    <div
      className="stat-card"
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        ...alertStyles,
        ...style,
      }}
    >
      <div
        className={`stat-icon ${isAlert ? '' : iconColorClass}`}
        style={{ ...customIconStyle, ...alertIconStyle }}
      >
        <md-icon>{icon}</md-icon>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
        <span style={{ color: isAlert ? '#991b1b' : undefined, fontWeight: isAlert ? 700 : 600 }}>
          {title}
        </span>
        <strong
          style={{
            fontSize: '24px',
            fontWeight: 700,
            margin: '2px 0 3px',
            color: isAlert ? '#dc2626' : undefined,
          }}
        >
          {value}
        </strong>
        {trendText && (
          <small
            className={trendClass}
            style={{
              color: isAlert ? '#b91c1c' : undefined,
              fontWeight: isAlert ? 600 : 400,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {trendText}
          </small>
        )}
      </div>
    </div>
  )
}
