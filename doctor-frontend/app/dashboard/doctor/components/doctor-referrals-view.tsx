'use client'

import React, { useMemo, useState } from 'react'
import { Referral } from '@/lib/api'
import { LoadingBuffer } from '@/components/dashboard/loading-buffer'

interface DoctorReferralsViewProps {
  referrals: Referral[]
  referralsLoading: boolean
  onOpenCreateReferralModal: () => void
}

export function DoctorReferralsView({
  referrals,
  referralsLoading,
  onOpenCreateReferralModal,
}: DoctorReferralsViewProps) {
  const [referralSearch, setReferralSearch] = useState('')

  const filteredReferrals = useMemo(() => {
    if (!referralSearch.trim()) return referrals
    const q = referralSearch.toLowerCase()
    return referrals.filter(
      (r) =>
        r.patient_name?.toLowerCase().includes(q) ||
        r.patient_id?.toLowerCase().includes(q) ||
        r.to_facility?.toLowerCase().includes(q) ||
        r.reason?.toLowerCase().includes(q)
    )
  }, [referrals, referralSearch])

  return (
    <div className="content-wrap">
      <div
        className="section-heading"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 14,
        }}
      >
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 500 }}>Outbound Facility Referrals</h2>
          <p style={{ margin: '4px 0 0', color: '#64748b' }}>
            Secondary & tertiary care escalations created from this consultation desk.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="text"
            placeholder="Search patient, hospital, reason..."
            value={referralSearch}
            onChange={(e) => setReferralSearch(e.target.value)}
            style={{
              padding: '9px 14px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              width: 260,
              fontSize: 13,
            }}
          />
          <button className="primary-button" onClick={onOpenCreateReferralModal}>
            <md-icon>add</md-icon> Create Referral
          </button>
        </div>
      </div>

      {referralsLoading && referrals.length === 0 ? (
        <LoadingBuffer
          title="Loading Facility Referrals..."
          subtitle="Fetching escalation records from MongoDB"
          icon="swap_horiz"
          style={{ marginTop: 20 }}
        />
      ) : filteredReferrals.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            marginTop: 20,
            color: '#64748b',
          }}
        >
          <md-icon style={{ fontSize: 36, color: '#94a3b8', marginBottom: 8 }}>swap_horiz</md-icon>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>No active referrals found</p>
        </div>
      ) : (
        <div className="table-card" style={{ marginTop: 20 }}>
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
          {filteredReferrals.map((r) => (
            <div
              className="patient-row"
              key={r.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 1.5fr 1.5fr 2fr 110px',
                alignItems: 'center',
                padding: '11px 16px',
              }}
            >
              <strong style={{ color: '#2563eb', fontWeight: 500 }}>{r.patient_id}</strong>
              <strong style={{ fontSize: 14, fontWeight: 500, color: '#0f172a' }}>{r.patient_name}</strong>
              <span style={{ fontSize: 13, color: '#0284c7', fontWeight: 500 }}>{r.to_facility}</span>
              <span style={{ fontSize: 12, color: '#475569' }}>{r.reason}</span>
              <span className="status pending">
                <i />
                {r.status || 'Initiated'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
