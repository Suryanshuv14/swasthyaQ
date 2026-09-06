'use client'

import React from 'react'
import { PrescriptionRecord } from '@/lib/api'

interface PrescriptionDetailModalProps {
  prescription: PrescriptionRecord | null
  onClose: () => void
}

export function PrescriptionDetailModal({
  prescription,
  onClose,
}: PrescriptionDetailModalProps) {
  if (!prescription) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card printable-prescription-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 680, padding: 0 }}
      >
        <div
          className="modal-header no-print"
          style={{ padding: '14px 18px', background: '#0f172a', color: '#ffffff' }}
        >
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 500, color: '#ffffff', margin: 0 }}>
              Official Digital Prescription #{prescription.id.slice(-6).toUpperCase()}
            </h2>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>
              Issued: {new Date(prescription.created_at).toLocaleString()}
            </span>
          </div>
          <button className="close-button" style={{ color: '#ffffff' }} onClick={onClose}>
            <md-icon>close</md-icon>
          </button>
        </div>

        <div className="modal-body" style={{ padding: 20 }}>
          <div
            className="prescription-paper printable-receipt"
            style={{ boxShadow: 'none', padding: 0, margin: 0, maxWidth: '100%' }}
          >
            {/* OFFICIAL RECEIPT HEADER */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '2px solid #0f172a',
                paddingBottom: 12,
                marginBottom: 14,
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    color: '#2563eb',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: 2,
                  }}
                >
                  National Health Mission · Govt of India
                </span>
                <strong style={{ fontSize: 18, color: '#0f172a', display: 'block', fontWeight: 700 }}>
                  SWASTHYAQ DIGITAL RX & RECEIPT
                </strong>
                <span style={{ fontSize: 11, color: '#64748b' }}>
                  Primary Health Centre (PHC North 01) · Facility Code: PHC-26133
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong style={{ fontSize: 13, color: '#0f172a', display: 'block', fontWeight: 600 }}>
                  {prescription.doctor_name.startsWith('Dr.')
                    ? prescription.doctor_name
                    : `Dr. ${prescription.doctor_name}`}
                </strong>
                <span style={{ fontSize: 11, color: '#64748b' }}>Medical Reg: MH-20481</span>
                <span style={{ fontSize: 11, color: '#64748b' }}>Dept: General Medicine & OPD</span>
              </div>
            </div>

            {/* METADATA BAR */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '8px 12px',
                marginBottom: 12,
                fontSize: 11,
                color: '#475569',
              }}
            >
              <div>
                <strong>Receipt / Rx No:</strong>{' '}
                <span style={{ fontFamily: 'monospace', color: '#0f172a', fontWeight: 600 }}>
                  RX-{prescription.patient_id || 'PAT'}-{prescription.token_no || '01'}
                </span>
              </div>
              <div>
                <strong>Date & Time:</strong>{' '}
                {new Date(prescription.created_at).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
              <div>
                <strong>OPD Room:</strong> Room #3 (Doctor Chamber)
              </div>
            </div>

            {/* PATIENT INFO */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: 12,
                marginBottom: 14,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: 10,
                    color: '#64748b',
                    display: 'block',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}
                >
                  PATIENT NAME & DETAILS
                </span>
                <strong style={{ fontSize: 14, color: '#0f172a' }}>
                  {prescription.patient_name || 'Registered Patient'}
                </strong>
                <span style={{ fontSize: 11, color: '#475569', display: 'block', marginTop: 2 }}>
                  Patient ID: {prescription.patient_id || 'PAT-REG-01'} · Age: {prescription.age || 35} yrs
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    fontSize: 10,
                    color: '#64748b',
                    display: 'block',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}
                >
                  TOKEN NO
                </span>
                <span className="token-badge" style={{ marginTop: 2, display: 'inline-block' }}>
                  {prescription.token_no || 'A-100'}
                </span>
              </div>
            </div>

            {/* MEDICINES TABLE */}
            <h4
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#0f172a',
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 700, color: '#2563eb', fontFamily: 'serif' }}>℞</span> Prescribed Medicines
            </h4>
            <div style={{ border: '1px solid #cbd5e1', borderRadius: 8, overflow: 'hidden', marginBottom: 14 }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '36px 2.2fr 2fr 1fr',
                  padding: '7px 10px',
                  background: '#f1f5f9',
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#334155',
                  borderBottom: '1px solid #cbd5e1',
                }}
              >
                <span>#</span>
                <span>Medicine Name</span>
                <span>Dosage & Directions</span>
                <span>Duration</span>
              </div>
              {prescription.medicines.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '36px 2.2fr 2fr 1fr',
                    padding: '8px 10px',
                    borderTop: i === 0 ? 'none' : '1px solid #f1f5f9',
                    fontSize: 12,
                    color: '#1e293b',
                    background: i % 2 === 0 ? '#ffffff' : '#fafafa',
                  }}
                >
                  <span style={{ color: '#64748b', fontSize: 11, fontWeight: 600 }}>{i + 1}</span>
                  <strong style={{ fontWeight: 600, color: '#0f172a' }}>{m.name}</strong>
                  <span>{m.dose}</span>
                  <span style={{ fontWeight: 500 }}>{m.duration}</span>
                </div>
              ))}
            </div>

            {/* DOCTOR NOTES / ADVICE */}
            {prescription.notes && (
              <div
                style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: 8,
                  padding: '10px 12px',
                  marginBottom: 14,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#1d4ed8',
                    display: 'block',
                    textTransform: 'uppercase',
                    marginBottom: 2,
                  }}
                >
                  Doctor's Advice & Instructions
                </span>
                <p style={{ margin: 0, fontSize: 12, color: '#1e3a8a', lineHeight: 1.4 }}>
                  {prescription.notes}
                </p>
              </div>
            )}

            {/* OFFICIAL FOOTER & SIGNATURE */}
            <div
              style={{
                borderTop: '1px dashed #cbd5e1',
                paddingTop: 12,
                marginTop: 12,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
              }}
            >
              <div>
                <span style={{ display: 'block', fontSize: 10, color: '#64748b' }}>
                  Official Computer-Generated Medical Receipt
                </span>
                <span style={{ display: 'block', fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
                  Valid at all National Health Mission dispensaries & PHC facilities.
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    borderBottom: '1px solid #0f172a',
                    width: 140,
                    marginBottom: 3,
                    height: 22,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontFamily: 'cursive', fontSize: 13, color: '#1e40af' }}>
                    {prescription.doctor_name}
                  </span>
                </div>
                <strong style={{ fontSize: 10, color: '#0f172a', display: 'block' }}>
                  Authorized Practitioner
                </strong>
                <span style={{ fontSize: 9.5, color: '#64748b' }}>Reg. No. MH-20481</span>
              </div>
            </div>
          </div>
        </div>

        <div
          className="modal-footer no-print"
          style={{ padding: '10px 18px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}
        >
          <button type="button" className="outline-button" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="primary-button"
            style={{ fontWeight: 500 }}
            onClick={() => window.print()}
          >
            <md-icon>print</md-icon> Print Receipt
          </button>
        </div>
      </div>
    </div>
  )
}
