'use client'

import React from 'react'

interface DashboardTopbarProps {
  eyebrow: string
  title: string
  loading?: boolean
  isRefreshing?: boolean
  onRefresh?: () => void
  refreshTooltip?: string
  primaryAction?: {
    icon: string
    label: string
    onClick: () => void
  }
  extraActions?: React.ReactNode
}

export function DashboardTopbar({
  eyebrow,
  title,
  loading,
  isRefreshing,
  onRefresh,
  refreshTooltip,
  primaryAction,
  extraActions,
}: DashboardTopbarProps) {
  return (
    <header className="topbar">
      {(loading || isRefreshing) && <div className="topbar-progress-loader" />}
      <div className="topbar-inner">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
        </div>

        <div className="top-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {extraActions}

          {primaryAction && (
            <button className="primary-button" onClick={primaryAction.onClick}>
              <md-icon>{primaryAction.icon}</md-icon> {primaryAction.label}
            </button>
          )}

          {onRefresh && (
            <button
              className="outline-button"
              onClick={onRefresh}
              disabled={isRefreshing || loading}
              title={refreshTooltip || `Refresh ${title} Data`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                fontWeight: 500,
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                cursor: isRefreshing || loading ? 'wait' : 'pointer',
              }}
            >
              <md-icon
                style={{
                  fontSize: 18,
                  transition: 'transform 0.4s ease',
                  transform: isRefreshing ? 'rotate(360deg)' : 'none',
                }}
              >refresh</md-icon>
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
