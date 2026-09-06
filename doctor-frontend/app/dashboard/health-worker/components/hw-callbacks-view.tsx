'use client'

import React from 'react'
import { Patient } from '@/lib/api'
import { LoadingBuffer } from '@/components/dashboard/loading-buffer'

interface HwCallbacksViewProps {
  callbacks: Patient[]
  loading: boolean
}

export function HwCallbacksView({ callbacks, loading }: HwCallbacksViewProps) {
  return (
    <div>
      <div className="section-heading">
        <div>
          <h2>Voice AI Telephony Callbacks Queue</h2>
          <p>Patients who called IVR helpline requesting human healthcare contact.</p>
        </div>
      </div>

      {loading && callbacks.length === 0 ? (
        <LoadingBuffer
          title="Loading Callback Requests..."
          subtitle="Fetching AI telephony triage records from MongoDB"
          icon="phone_callback"
          style={{ marginTop: 20 }}
        />
      ) : callbacks.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            marginTop: 18,
            color: '#64748b',
          }}
        >
          <md-icon style={{ fontSize: 36, color: '#94a3b8', marginBottom: 8 }}>task_alt</md-icon>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>No pending callback requests!</p>
        </div>
      ) : (
        <div className="table-card" style={{ marginTop: 18, border: '1.5px solid #cbd5e1', borderRadius: 12 }}>
          <div
            className="table-header"
            style={{
              display: 'grid',
              gridTemplateColumns: '120px 1.8fr 1.2fr 2fr 160px',
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
            <span>Reported Symptoms</span>
            <span style={{ textAlign: 'right' }}>Action</span>
          </div>
          {callbacks.map((p) => (
            <div
              className="patient-row"
              key={p.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 1.8fr 1.2fr 2fr 160px',
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
                  onClick={() => alert(`Initiating outgoing call to ${p.name}...`)}
                >
                  <md-icon style={{ fontSize: 16 }}>call</md-icon> Call Patient
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
