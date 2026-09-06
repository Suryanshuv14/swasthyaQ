'use client'

import React, { useState } from 'react'

interface ReferralModalProps {
  isOpen: boolean
  patientId?: string
  patientName?: string
  onClose: () => void
  onSubmit: (referral: {
    patient_id: string
    patient_name: string
    to_facility: string
    reason: string
  }) => Promise<void>
  loading?: boolean
}

export function ReferralModal({
  isOpen,
  patientId = '',
  patientName = '',
  onClose,
  onSubmit,
  loading = false,
}: ReferralModalProps) {
  const [name, setName] = useState(patientName)
  const [toFacility, setToFacility] = useState('District Hospital East')
  const [reason, setReason] = useState('Specialist Evaluation required')

  // Keep name synced when prop changes
  React.useEffect(() => {
    if (patientName) setName(patientName)
  }, [patientName])

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit({
      patient_id: patientId || 'PAT-MANUAL',
      patient_name: name,
      to_facility: toFacility,
      reason,
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Create Facility Referral</h2>
          <button className="close-button" onClick={onClose}>
            <md-icon>close</md-icon>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <label>
              <span>Patient Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Patient Name"
                required
              />
            </label>
            <label>
              <span>Target Hospital / Facility</span>
              <select value={toFacility} onChange={(e) => setToFacility(e.target.value)}>
                <option value="District Hospital East">District Hospital East (Tertiary)</option>
                <option value="Regional Medical College">Regional Medical College Hospital</option>
                <option value="PHC West 02">PHC West 02</option>
              </select>
            </label>
            <label>
              <span>Referral Reason & Diagnosis</span>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </label>
          </div>
          <div className="modal-footer">
            <button type="button" className="outline-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button" style={{ fontWeight: 600 }} disabled={loading}>
              {loading ? 'Creating...' : 'Create Referral'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
