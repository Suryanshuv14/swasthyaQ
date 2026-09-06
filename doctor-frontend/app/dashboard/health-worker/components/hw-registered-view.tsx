'use client'

import React from 'react'
import { Patient, User } from '@/lib/api'
import { LoadingBuffer } from '@/components/dashboard/loading-buffer'

interface HwRegisteredViewProps {
  user: User
  patients: Patient[]
  loading: boolean
}

export function HwRegisteredView({ user, patients, loading }: HwRegisteredViewProps) {
  return (
    <div>
      <div className="section-heading">
        <div>
          <h2>Field Registered Patients</h2>
          <p>Community healthcare patients registered at {user.facility_id || 'PHC-NORTH-01'}.</p>
        </div>
      </div>

      {loading && patients.length === 0 ? (
        <LoadingBuffer
          title="Loading Field Patient Records..."
          subtitle="Fetching community registration data from MongoDB"
          icon="sync"
          style={{ marginTop: 20 }}
        />
      ) : (
        <div className="table-card" style={{ marginTop: 18, border: '1.5px solid #cbd5e1', borderRadius: 12 }}>
          <div
            className="table-header"
            style={{
              display: 'grid',
              gridTemplateColumns: '120px 2fr 1.2fr 1.2fr 1.2fr',
              padding: '10px 16px',
              background: '#f8fafc',
              fontSize: '13px',
              fontWeight: 600,
              color: '#334155',
            }}
          >
            <span>Patient ID</span>
            <span>Name & Age</span>
            <span>Category</span>
            <span>Risk Level</span>
            <span>Callback Flag</span>
          </div>
          {patients.map((p) => (
            <div
              className="patient-row"
              key={p.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 2fr 1.2fr 1.2fr 1.2fr',
                alignItems: 'center',
                padding: '12px 16px',
              }}
            >
              <strong style={{ color: '#2563eb', fontWeight: 500 }}>{p.patient_id}</strong>
              <div>
                <strong style={{ fontSize: 14, color: '#0f172a' }}>{p.name}</strong>
                <span style={{ display: 'block', fontSize: 11, color: '#64748b' }}>{p.age} yrs</span>
              </div>
              <div>
                <span className={`tag ${p.categoryClass}`}>{p.category}</span>
              </div>
              <div>
                {p.risk_level === 'high' ? (
                  <span className="risk-high-pill">HIGH RISK</span>
                ) : (
                  <span style={{ fontSize: 12, color: '#64748b' }}>Low Risk</span>
                )}
              </div>
              <div>
                {p.needs_human_callback ? (
                  <span className="callback-pill">Needs Callback</span>
                ) : (
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>—</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
