'use client'

import React from 'react'
import { Patient } from '@/lib/api'
import { LoadingBuffer } from '@/components/dashboard/loading-buffer'

interface HwHighRiskViewProps {
  patients: Patient[]
  loading: boolean
}

export function HwHighRiskView({ patients, loading }: HwHighRiskViewProps) {
  return (
    <div>
      <div className="section-heading">
        <div>
          <h2>High-Risk Patient Cohort</h2>
          <p>Maternal, severe hypertension, elderly-alone, and high-urgency community cases.</p>
        </div>
      </div>

      {loading && patients.length === 0 ? (
        <LoadingBuffer
          title="Loading High-Risk Patients..."
          subtitle="Filtering high-urgency health records from MongoDB"
          icon="warning"
          style={{ marginTop: 20 }}
        />
      ) : (
        <div className="table-card" style={{ marginTop: 18, border: '1.5px solid #cbd5e1', borderRadius: 12 }}>
          <div
            className="table-header"
            style={{
              display: 'grid',
              gridTemplateColumns: '120px 1.8fr 1.2fr 2fr 180px',
              padding: '10px 16px',
              background: '#f8fafc',
              fontSize: '13px',
              fontWeight: 600,
              color: '#334155',
            }}
          >
            <span>Patient ID</span>
            <span>Patient Name</span>
            <span>Category</span>
            <span>Primary Symptoms</span>
            <span style={{ textAlign: 'right' }}>Action</span>
          </div>
          {patients.map((p) => (
            <div
              className="patient-row"
              key={p.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 1.8fr 1.2fr 2fr 180px',
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
              <span style={{ fontSize: 12, color: '#334155' }}>{p.symptoms.join(', ')}</span>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="primary-button"
                  style={{
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 500,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                  onClick={() => alert(`Field visit scheduled for ${p.name} (${p.patient_id})`)}
                >
                  <md-icon style={{ fontSize: 16 }}>phone</md-icon> Field Visit / Call
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
