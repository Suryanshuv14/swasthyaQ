'use client'

import React, { useMemo, useState } from 'react'
import { Patient, User } from '@/lib/api'
import { LoadingBuffer } from '@/components/dashboard/loading-buffer'

interface DoctorRecordsViewProps {
  user: User
  patientDirectory: Patient[]
  patientsLoading: boolean
  onOpenPatient: (patient: Patient) => void
  onAssignFollowup: (patient: Patient) => void
}

export function DoctorRecordsView({
  user,
  patientDirectory,
  patientsLoading,
  onOpenPatient,
  onAssignFollowup,
}: DoctorRecordsViewProps) {
  const [patientSearch, setPatientSearch] = useState('')

  const filteredDirectory = useMemo(() => {
    if (!patientSearch.trim()) return patientDirectory
    const q = patientSearch.toLowerCase()
    return patientDirectory.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.patient_id?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
    )
  }, [patientDirectory, patientSearch])

  return (
    <div className="content-wrap">
      <div className="section-heading">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 500 }}>Patient Records & History</h2>
          <p style={{ margin: '4px 0 0', color: '#64748b' }}>
            Facility patient registry for {user.facility_id || 'PHC-NORTH-01'}.
          </p>
        </div>
        <input
          type="text"
          placeholder="Search patient name, ID, or category..."
          value={patientSearch}
          onChange={(e) => setPatientSearch(e.target.value)}
          style={{
            padding: '9px 14px',
            borderRadius: 8,
            border: '1px solid #cbd5e1',
            width: 300,
            fontSize: 13,
          }}
        />
      </div>

      {patientsLoading && patientDirectory.length === 0 ? (
        <LoadingBuffer
          title="Loading Patient Records..."
          subtitle="Retrieving patient profiles from MongoDB"
          icon="folder_shared"
          style={{ marginTop: 20 }}
        />
      ) : (
        <div className="table-card" style={{ marginTop: 20 }}>
          <div
            className="table-header"
            style={{
              display: 'grid',
              gridTemplateColumns: '110px 1.8fr 1fr 1.2fr 240px',
              padding: '10px 16px',
              background: '#f8fafc',
              fontSize: '13px',
              fontWeight: 600,
              color: '#334155',
            }}
          >
            <span>Patient ID</span>
            <span>Patient Name</span>
            <span>Age</span>
            <span>Category</span>
            <span style={{ textAlign: 'right' }}>Actions</span>
          </div>
          {filteredDirectory.map((p) => (
            <div
              className="patient-row"
              key={p.id || p.patient_id}
              onClick={() => onOpenPatient(p)}
              style={{
                display: 'grid',
                gridTemplateColumns: '110px 1.8fr 1fr 1.2fr 240px',
                alignItems: 'center',
                padding: '11px 16px',
                cursor: 'pointer',
              }}
            >
              <strong style={{ fontWeight: 500, color: '#2563eb' }}>{p.patient_id}</strong>
              <div>
                <strong style={{ fontSize: 14, fontWeight: 500, color: '#0f172a' }}>{p.name}</strong>
              </div>
              <span style={{ fontWeight: 500 }}>{p.age} yrs</span>
              <div>
                <span className={`tag ${p.categoryClass}`}>{p.category}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  className="primary-button"
                  style={{ padding: '6px 12px', fontSize: 12, fontWeight: 500 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onOpenPatient(p)
                  }}
                >
                  <md-icon style={{ fontSize: 16 }}>visibility</md-icon> Details
                </button>
                <button
                  className="outline-button"
                  style={{ padding: '6px 12px', fontSize: 12, fontWeight: 500 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onAssignFollowup(p)
                  }}
                >
                  Follow-Up
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
