'use client'

import React, { useMemo, useState } from 'react'
import { PrescriptionRecord } from '@/lib/api'
import { LoadingBuffer } from '@/components/dashboard/loading-buffer'

interface DoctorPrescriptionsViewProps {
  prescriptionRecords: PrescriptionRecord[]
  rxLoading: boolean
  onSelectPrescription: (prescription: PrescriptionRecord) => void
}

export function DoctorPrescriptionsView({
  prescriptionRecords,
  rxLoading,
  onSelectPrescription,
}: DoctorPrescriptionsViewProps) {
  const [prescriptionSearch, setPrescriptionSearch] = useState('')

  const filteredPrescriptions = useMemo(() => {
    if (!prescriptionSearch.trim()) return prescriptionRecords
    const q = prescriptionSearch.toLowerCase()
    return prescriptionRecords.filter(
      (rx) =>
        rx.id.toLowerCase().includes(q) ||
        rx.patient_name?.toLowerCase().includes(q) ||
        rx.patient_id?.toLowerCase().includes(q) ||
        rx.token_no?.toLowerCase().includes(q) ||
        rx.medicines?.some((m) => m.name.toLowerCase().includes(q))
    )
  }, [prescriptionRecords, prescriptionSearch])

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
          <h2 style={{ fontSize: '20px', fontWeight: 500 }}>Issued Prescriptions</h2>
          <p style={{ margin: '4px 0 0', color: '#64748b' }}>
            Digital prescriptions dispatched to hospital pharmacy and MongoDB Atlas.
          </p>
        </div>
        <div style={{ position: 'relative', width: 320 }}>
          <input
            type="text"
            placeholder="Search Rx ID, Patient name, PAT ID, medicine..."
            value={prescriptionSearch}
            onChange={(e) => setPrescriptionSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 14px 9px 36px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontSize: 13,
            }}
          />
          <md-icon
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 18,
              color: '#94a3b8',
            }}
          >
            search
          </md-icon>
          {prescriptionSearch && (
            <button
              type="button"
              onClick={() => setPrescriptionSearch('')}
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                padding: 2,
              }}
              title="Clear search"
            >
              <md-icon style={{ fontSize: 16 }}>close</md-icon>
            </button>
          )}
        </div>
      </div>

      <div className="prescriptions-grid" style={{ display: 'grid', gap: 14 }}>
        {rxLoading && prescriptionRecords.length === 0 ? (
          <LoadingBuffer
            title="Loading Prescriptions Directory..."
            subtitle="Fetching digital prescription records from MongoDB"
            icon="receipt_long"
          />
        ) : filteredPrescriptions.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              color: '#64748b',
            }}
          >
            <md-icon style={{ fontSize: 36, color: '#94a3b8', marginBottom: 8 }}>search_off</md-icon>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
              No prescriptions found matching "{prescriptionSearch}"
            </p>
            <button
              type="button"
              className="text-button"
              onClick={() => setPrescriptionSearch('')}
              style={{ marginTop: 10, color: '#2563eb', cursor: 'pointer', fontWeight: 500 }}
            >
              Clear search filter
            </button>
          </div>
        ) : (
          filteredPrescriptions.map((rx) => (
            <div
              key={rx.id}
              className="rx-record-card"
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16,
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: '#eff6ff',
                    color: '#2563eb',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <md-icon style={{ fontSize: 24 }}>receipt_long</md-icon>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>
                      {rx.patient_name || 'Patient'}
                    </strong>
                    {rx.token_no && (
                      <span
                        className="token-badge"
                        style={{
                          background: '#2563eb',
                          color: '#ffffff',
                          fontWeight: 600,
                          padding: '1px 6px',
                          borderRadius: 4,
                          fontSize: 11,
                        }}
                      >
                        {rx.token_no}
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>
                      {new Date(rx.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                    {rx.medicines.map((m, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: 12,
                          background: '#f1f5f9',
                          color: '#334155',
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontWeight: 500,
                        }}
                      >
                        {m.name} · {m.dose}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  className="primary-button"
                  style={{
                    padding: '8px 16px',
                    fontSize: 12.5,
                    fontWeight: 500,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                  onClick={() => onSelectPrescription(rx)}
                >
                  <md-icon style={{ fontSize: 17 }}>visibility</md-icon> View Full Rx Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
