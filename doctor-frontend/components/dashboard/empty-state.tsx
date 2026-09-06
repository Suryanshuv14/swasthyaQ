'use client'

import React from 'react'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  style?: React.CSSProperties
}

export function EmptyState({
  icon = 'task_alt',
  title,
  description,
  action,
  style,
}: EmptyStateProps) {
  return (
    <div className="empty-state" style={style}>
      <md-icon>{icon}</md-icon>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && (
        <button
          type="button"
          className="outline-button"
          onClick={action.onClick}
          style={{ marginTop: 14, fontSize: 13 }}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
