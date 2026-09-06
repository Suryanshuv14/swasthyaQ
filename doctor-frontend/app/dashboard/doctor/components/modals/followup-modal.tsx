'use client'

import React, { useState } from 'react'
import { Patient } from '@/lib/api'

interface FollowupModalProps {
  isOpen: boolean
  patient: Patient | null
  onClose: () => void
  onSubmit: (followup: {
    patient_id: string
    patient_name: string
    due_date: string
    assigned_to: string
    notes: string
  }) => Promise<void>
  loading?: boolean
}

export function FollowupModal({
  isOpen,
  patient,
  onClose,
  onSubmit,
  loading = false,
}: FollowupModalProps) {
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('Monitor vitals and medication adherence')

  if (!isOpen || !patient) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!patient) return
    await onSubmit({
      patient_id: patient.patient_id || patient.id,
      patient_name: patient.name,
      due_date: dueDate,
      assigned_to: 'Priya Sharma (ASHA)',
      notes,
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Assign Follow-Up to ASHA Worker</h2>
          <button className="close-button" onClick={onClose}>
            <md-icon>close</md-icon>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ fontSize: 13, color: '#475569', margin: '0 0 8px' }}>
              Assigning community follow-up for <strong>{patient.name}</strong> ({patient.patient_id}).
            </p>
            <label>
              <span>Due Date</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </label>
            <label>
              <span>Field Instructions / Clinical Notes</span>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required
              />
            </label>
          </div>
          <div className="modal-footer">
            <button type="button" className="outline-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button" style={{ fontWeight: 600 }} disabled={loading}>
              {loading ? 'Assigning...' : 'Assign Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
