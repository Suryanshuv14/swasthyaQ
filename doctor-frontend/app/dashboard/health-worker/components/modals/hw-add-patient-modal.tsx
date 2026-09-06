'use client'

import React, { useState } from 'react'

interface HwAddPatientModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (patient: {
    name: string
    age: number
    category: string
    symptoms: string[]
    risk_level: 'low' | 'high'
    needs_human_callback: boolean
  }) => Promise<void>
  loading?: boolean
}

export function HwAddPatientModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}: HwAddPatientModalProps) {
  const [name, setName] = useState('')
  const [age, setAge] = useState('32')
  const [category, setCategory] = useState('Maternal care')
  const [symptoms, setSymptoms] = useState('High blood pressure, ANC follow-up')
  const [riskLevel, setRiskLevel] = useState<'low' | 'high'>('high')
  const [needsCallback, setNeedsCallback] = useState(true)

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit({
      name,
      age: parseInt(age, 10) || 30,
      category,
      symptoms: symptoms.split(',').map((s) => s.trim()).filter(Boolean),
      risk_level: riskLevel,
      needs_human_callback: needsCallback,
    })
    setName('')
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Field Patient Registration</h2>
          <button className="close-button" onClick={onClose}>
            <md-icon>close</md-icon>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <label>
              <span>Patient Full Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Meera Devi"
                required
              />
            </label>
            <label>
              <span>Age (Years)</span>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
            </label>
            <label>
              <span>Healthcare Category</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Maternal care">Maternal & Child Care (ANC/PNC)</option>
                <option value="Chronic care">Chronic Care (Hypertension / Diabetes)</option>
                <option value="Elderly care">Elderly & Palliative Care</option>
                <option value="General">General Health Visit</option>
              </select>
            </label>
            <label>
              <span>Observed Symptoms (comma-separated)</span>
              <input
                type="text"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="High blood pressure, swelling"
                required
              />
            </label>
            <label>
              <span>Risk Classification</span>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value as 'low' | 'high')}
              >
                <option value="low">Standard / Low Risk</option>
                <option value="high">High Risk / Urgent Care Required</option>
              </select>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginTop: 10 }}>
              <input
                type="checkbox"
                checked={needsCallback}
                onChange={(e) => setNeedsCallback(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#2563eb' }}
              />
              <span style={{ fontSize: 13, color: '#334155' }}>
                Flag for doctor telephony callback
              </span>
            </label>
          </div>
          <div className="modal-footer">
            <button type="button" className="outline-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button" style={{ fontWeight: 600 }} disabled={loading}>
              {loading ? 'Registering...' : 'Register Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
