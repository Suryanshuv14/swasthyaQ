'use client'

import React from 'react'
import { FollowUp } from '@/lib/api'
import { LoadingBuffer } from '@/components/dashboard/loading-buffer'

interface HwFollowupsViewProps {
  followups: FollowUp[]
  loading: boolean
}

export function HwFollowupsView({ followups, loading }: HwFollowupsViewProps) {
  return (
    <div>
      <div className="section-heading">
        <div>
          <h2>Assigned Patient Follow-Ups</h2>
          <p>Home check-in visits and adherence tasks assigned by PHC Doctors.</p>
        </div>
      </div>

      {loading && followups.length === 0 ? (
        <LoadingBuffer
          title="Loading Follow-Ups..."
          subtitle="Fetching assigned tasks from MongoDB"
          icon="event_available"
          style={{ marginTop: 20 }}
        />
      ) : followups.length === 0 ? (
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
          <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>All assigned follow-ups up to date!</p>
        </div>
      ) : (
        <div className="table-card" style={{ marginTop: 18, border: '1.5px solid #cbd5e1', borderRadius: 12 }}>
          <div
            className="table-header"
            style={{
              display: 'grid',
              gridTemplateColumns: '120px 1.5fr 1.2fr 2fr 110px',
              padding: '10px 16px',
              background: '#f8fafc',
              fontSize: '13px',
              fontWeight: 600,
              color: '#334155',
            }}
          >
            <span>Patient ID</span>
            <span>Patient Name</span>
            <span>Due Date</span>
            <span>Clinical Instructions</span>
            <span>Status</span>
          </div>
          {followups.map((f) => (
            <div
              className="patient-row"
              key={f.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 1.5fr 1.2fr 2fr 110px',
                alignItems: 'center',
                padding: '12px 16px',
              }}
            >
              <strong style={{ color: '#2563eb', fontWeight: 500 }}>{f.patient_id}</strong>
              <strong style={{ fontSize: 14, color: '#0f172a' }}>{f.patient_name}</strong>
              <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>{f.due_date}</span>
              <span style={{ fontSize: 12, color: '#334155' }}>{f.notes}</span>
              <span className={`status ${f.status === 'completed' ? 'done' : 'pending'}`}>
                <i />
                {f.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
