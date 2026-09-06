'use client'

import React from 'react'
import { Referral } from '@/lib/api'
import { LoadingBuffer } from '@/components/dashboard/loading-buffer'

interface HwReferralsViewProps {
  referrals: Referral[]
  loading: boolean
}

export function HwReferralsView({ referrals, loading }: HwReferralsViewProps) {
  return (
    <div>
      <div className="section-heading">
        <div>
          <h2>Referrals Initiated</h2>
          <p>Patients referred to Primary Health Centre or District Hospital.</p>
        </div>
      </div>

      {loading && referrals.length === 0 ? (
        <LoadingBuffer
          title="Loading Referrals..."
          subtitle="Fetching field referral records from MongoDB"
          icon="swap_horiz"
          style={{ marginTop: 20 }}
        />
      ) : referrals.length === 0 ? (
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
          <md-icon style={{ fontSize: 36, color: '#94a3b8', marginBottom: 8 }}>swap_horiz</md-icon>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>No referrals initiated</p>
        </div>
      ) : (
        <div className="table-card" style={{ marginTop: 18, border: '1.5px solid #cbd5e1', borderRadius: 12 }}>
          <div
            className="table-header"
            style={{
              display: 'grid',
              gridTemplateColumns: '120px 1.5fr 1.5fr 2fr 110px',
              padding: '10px 16px',
              background: '#f8fafc',
              fontSize: '13px',
              fontWeight: 600,
              color: '#334155',
            }}
          >
            <span>Patient ID</span>
            <span>Patient Name</span>
            <span>Target Facility</span>
            <span>Referral Reason</span>
            <span>Status</span>
          </div>
          {referrals.map((r) => (
            <div
              className="patient-row"
              key={r.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 1.5fr 1.5fr 2fr 110px',
                alignItems: 'center',
                padding: '12px 16px',
              }}
            >
              <strong style={{ color: '#2563eb', fontWeight: 500 }}>{r.patient_id}</strong>
              <strong style={{ fontSize: 14, color: '#0f172a' }}>{r.patient_name}</strong>
              <span style={{ fontSize: 13, color: '#0284c7', fontWeight: 500 }}>{r.to_facility}</span>
              <span style={{ fontSize: 12, color: '#475569' }}>{r.reason}</span>
              <span className="status pending">
                <i />
                {r.status || 'Active'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
