'use client'

import React from 'react'
import { Patient, Referral } from '@/lib/api'
import { StatCard } from '@/components/dashboard/stat-card'
import { LoadingBuffer } from '@/components/dashboard/loading-buffer'
import { EmptyState } from '@/components/dashboard/empty-state'

interface DoctorQueueViewProps {
  patients: Patient[]
  referrals: Referral[]
  queueLoading: boolean
  onOpenPatient: (patient: Patient) => void
  onRefreshQueue: () => void
}

export function DoctorQueueView({
  patients,
  referrals,
  queueLoading,
  onOpenPatient,
  onRefreshQueue,
}: DoctorQueueViewProps) {
  const waitingPatients = patients.filter((p) => p.status === 'Waiting' || p.status === 'In consultation')
  const waitingCount = waitingPatients.length
  const nextPatient = waitingPatients[0] || null
  const highPriorityCount = patients.filter((p) => p.risk_level === 'high').length

  return (
    <div className="content-wrap">
      {/* 1ST: 4 METRIC STAT CARDS (PLACED AT TOP) */}
      <section
        className="stats-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '14px',
          marginBottom: '14px',
        }}
      >
        <StatCard
          icon="groups"
          iconColorClass="soft-blue"
          title="Today's Patients"
          value={patients.length + 12}
          trendText="OPD Load"
        />

        <StatCard
          icon="schedule"
          iconColorClass="soft-orange"
          title="Waiting Patients"
          value={waitingCount}
          trendText="In OPD Queue"
          trendClass="trend neutral"
        />

        <StatCard
          icon="priority_high"
          iconColorClass="soft-red"
          title="High Priority"
          value={highPriorityCount}
          trendText={highPriorityCount >= 1 ? 'Requires Care' : 'No Critical Cases'}
          isAlert={highPriorityCount >= 1}
        />

        <StatCard
          icon="swap_horiz"
          iconColorClass="soft-purple"
          title="Referrals"
          value={referrals.length}
          trendText="Active Referrals"
          trendClass="trend neutral"
        />
      </section>

      {/* 2ND: SLEEK HORIZONTAL CALLOUT BANNER FOR NEXT PATIENT */}
      <section
        className="primary-callout-banner"
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '12px 18px',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
        }}
      >
        <div className="callout-info">
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              color: '#64748b',
              textTransform: 'uppercase',
              display: 'block',
            }}
          >
            NEXT IN QUEUE
          </span>
          {nextPatient ? (
            <div className="callout-patient-detail" style={{ marginTop: '2px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 500, color: '#0f172a', margin: '0 0 4px' }}>
                {nextPatient.name}
              </h2>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                  fontSize: '12px',
                  color: '#475569',
                }}
              >
                <span
                  className="token-badge"
                  style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    fontWeight: 500,
                    padding: '2px 7px',
                    borderRadius: '5px',
                  }}
                >
                  {nextPatient.token}
                </span>
                <span style={{ color: '#cbd5e1' }}>•</span>
                <span style={{ fontWeight: 500 }}>{nextPatient.age} years old</span>
                <span style={{ color: '#cbd5e1' }}>•</span>
                <span className={`tag ${nextPatient.categoryClass}`}>{nextPatient.category}</span>
                <span style={{ color: '#cbd5e1' }}>•</span>
                <span style={{ color: '#64748b' }}>{nextPatient.relativeWaiting}</span>
              </div>
            </div>
          ) : (
            <h2 style={{ fontSize: '16px', margin: '2px 0 0', color: '#0f172a', fontWeight: 500 }}>
              All waiting patients seen
            </h2>
          )}
        </div>

        {nextPatient && (
          <div>
            <button
              className="primary-button callout-action-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 22px',
                fontSize: '14.5px',
                fontWeight: 600,
                lineHeight: 1.2,
                textAlign: 'center',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.22)',
                cursor: 'pointer',
              }}
              onClick={() => onOpenPatient(nextPatient)}
            >
              <md-icon style={{ fontSize: '20px', display: 'flex', alignItems: 'center' }}>
                person_add_alt_1
              </md-icon>
              <span style={{ display: 'inline-block' }}>Call Next Patient ({nextPatient.token})</span>
            </button>
          </div>
        )}
      </section>

      {/* 3RD: QUEUE TABLE SECTION */}
      <section className="queue-section">
        <div className="section-heading" style={{ marginBottom: '10px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 500, color: '#0f172a' }}>Live OPD Patient Queue</h2>
          <button
            className="outline-button"
            style={{ padding: '6px 12px', fontSize: '12px' }}
            onClick={onRefreshQueue}
            disabled={queueLoading}
          >
            <md-icon>refresh</md-icon> {queueLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {queueLoading && patients.length === 0 ? (
          <LoadingBuffer
            title="Loading OPD Patient Queue..."
            subtitle="Fetching live consultation tokens from MongoDB"
            icon="sync"
          />
        ) : patients.length === 0 ? (
          <EmptyState
            icon="task_alt"
            title="Queue Clear"
            description="No waiting patients currently in the OPD queue."
          />
        ) : (
          <div className="table-card">
            <div
              className="table-header"
              style={{
                display: 'grid',
                gridTemplateColumns: '110px 1.8fr 1.2fr 1fr 1fr 120px',
                padding: '10px 16px',
                background: '#f8fafc',
                fontSize: '13px',
                fontWeight: 600,
                color: '#334155',
              }}
            >
              <span>Token / ID</span>
              <span>Patient Name & Age</span>
              <span>Category</span>
              <span>Source</span>
              <span>Status</span>
              <span style={{ textAlign: 'right' }}>Action</span>
            </div>
            {patients.map((patient) => {
              const isNext = nextPatient && nextPatient.id === patient.id
              return (
                <div
                  className={isNext ? 'patient-row current' : 'patient-row'}
                  key={patient.id}
                  onClick={() => onOpenPatient(patient)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '110px 1.8fr 1.2fr 1fr 1fr 120px',
                    alignItems: 'center',
                    padding: '11px 16px',
                  }}
                >
                  <div className="token-cell">
                    <span className="token-badge" style={{ fontWeight: 500 }}>
                      {patient.token}
                    </span>
                    <small
                      style={{
                        display: 'block',
                        fontSize: '10px',
                        color: '#64748b',
                        marginTop: '2px',
                      }}
                    >
                      {patient.patient_id}
                    </small>
                  </div>
                  <div
                    className="patient-name-box"
                    style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
                  >
                    <strong style={{ fontSize: '14px', color: '#0f172a', fontWeight: 500 }}>
                      {patient.name}
                    </strong>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 400 }}>
                      {patient.age} years old
                    </span>
                  </div>
                  <div>
                    <span className={`tag ${patient.categoryClass}`}>{patient.category}</span>
                  </div>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#475569',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    {patient.source === 'ai_call' ? (
                      <>
                        <md-icon style={{ fontSize: 15, color: '#2563eb' }}>call</md-icon>
                        <span>Telephony Call</span>
                      </>
                    ) : (
                      <>
                        <md-icon style={{ fontSize: 15, color: '#64748b' }}>edit_note</md-icon>
                        <span>Staff Manual</span>
                      </>
                    )}
                  </span>
                  <span className={`status ${patient.statusClass}`}>
                    <i />
                    {patient.status}
                  </span>
                  <button
                    className="row-action"
                    style={{ justifyContent: 'flex-end', fontWeight: 500 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onOpenPatient(patient)
                    }}
                  >
                    Consult <md-icon>arrow_forward</md-icon>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
