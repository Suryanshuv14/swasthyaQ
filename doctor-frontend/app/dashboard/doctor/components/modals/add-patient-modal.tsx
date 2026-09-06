'use client'

import React, { useState } from 'react'

interface AddPatientModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (patient: {
    name: string
    age: number
    category: string
    symptoms: string[]
  }) => Promise<void>
  loading?: boolean
}

export function AddPatientModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}: AddPatientModalProps) {
  const [name, setName] = useState('')
  const [age, setAge] = useState('35')
  const [category, setCategory] = useState('General')
  const [symptoms, setSymptoms] = useState('Fever, Headache')

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit({
      name,
      age: parseInt(age, 10) || 30,
      category,
      symptoms: symptoms.split(',').map((s) => s.trim()).filter(Boolean),
    })
    setName('')
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Add Patient to OPD Queue</h2>
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
                placeholder="e.g. Rajesh Patil"
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
              <span>Symptom Category</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="General">General Outpatient</option>
                <option value="Chronic care">Chronic Care / Hypertension</option>
                <option value="Respiratory">Respiratory & Fever</option>
                <option value="Maternal care">Maternal & Ante-Natal Care</option>
              </select>
            </label>
            <label>
              <span>Symptoms (comma-separated)</span>
              <input
                type="text"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Fever, Headache"
                required
              />
            </label>
          </div>
          <div className="modal-footer">
            <button type="button" className="outline-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button" style={{ fontWeight: 600 }} disabled={loading}>
              {loading ? 'Adding...' : 'Add to Queue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
