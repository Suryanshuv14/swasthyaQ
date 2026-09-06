'use client'

import React, { useMemo, useState } from 'react'
import { Patient, Medicine, PrescriptionRecord } from '@/lib/api'

export const COMMON_MEDICINES = [
  { name: 'Paracetamol 500mg', dose: '1 tablet after meals', duration: '5 days' },
  { name: 'Dolo 650mg', dose: '1 tablet SOS for fever', duration: '3 days' },
  { name: 'Amoxicillin 500mg', dose: '1 capsule twice daily after meals', duration: '5 days' },
  { name: 'Azithromycin 500mg', dose: '1 tablet once daily before food', duration: '3 days' },
  { name: 'Pantoprazole 40mg', dose: '1 tablet before breakfast', duration: '7 days' },
  { name: 'Cetirizine 10mg', dose: '1 tablet at bedtime', duration: '5 days' },
  { name: 'Metformin 500mg', dose: '1 tablet twice daily with meals', duration: '30 days' },
  { name: 'Amlodipine 5mg', dose: '1 tablet once daily in morning', duration: '30 days' },
  { name: 'Ibuprofen 400mg', dose: '1 tablet twice daily after meals', duration: '3 days' },
  { name: 'ORS Packets', dose: '1 packet in 1 litre water daily', duration: '3 days' },
  { name: 'Vitamin C + Zinc', dose: '1 tablet once daily', duration: '10 days' },
  { name: 'Ranitidine 150mg', dose: '1 tablet twice daily before meals', duration: '7 days' },
  { name: 'Ciprofloxacin 500mg', dose: '1 tablet twice daily', duration: '5 days' },
  { name: 'Domperidone 10mg', dose: '1 tablet 15 min before meals', duration: '5 days' },
  { name: 'Combiflam', dose: '1 tablet after meals', duration: '3 days' },
]

interface DoctorConsultationViewProps {
  patient: Patient
  doctorName: string
  prescriptionRecords: PrescriptionRecord[]
  medicines: Medicine[]
  notes: string
  sent: boolean
  loading: boolean
  onUpdateMedicines: React.Dispatch<React.SetStateAction<Medicine[]>>
  onUpdateNotes: (notes: string) => void
  onBackToQueue: () => void
  onCompleteConsultation?: () => Promise<void> | void
  onAssignFollowup: () => void
  onAssignReferral: () => void
  onSendPharmacy: () => Promise<void>
  onDone: () => void
}

export function DoctorConsultationView({
  patient,
  doctorName,
  prescriptionRecords,
  medicines,
  notes,
  sent,
  loading,
  onUpdateMedicines,
  onUpdateNotes,
  onBackToQueue,
  onCompleteConsultation,
  onAssignFollowup,
  onAssignReferral,
  onSendPharmacy,
  onDone,
}: DoctorConsultationViewProps) {
  const [subView, setSubView] = useState<'consultation' | 'prescription' | 'preview'>('consultation')

  function updateMedicine(index: number, key: keyof Medicine, value: string) {
    onUpdateMedicines((all) =>
      all.map((m, idx) => (idx === index ? { ...m, [key]: value } : m))
    )
  }

  function addMedicine() {
    onUpdateMedicines((all) => [...all, { name: '', dose: '', duration: '' }])
  }

  function removeMedicine(index: number) {
    onUpdateMedicines((all) => all.filter((_, idx) => idx !== index))
  }

  if (subView === 'consultation') {
    return (
      <ConsultationStep
        patient={patient}
        prescriptionRecords={prescriptionRecords}
        notes={notes}
        loading={loading}
        onUpdateNotes={onUpdateNotes}
        onBack={onBackToQueue}
        onCompleteConsultation={onCompleteConsultation}
        onPrescription={() => setSubView('prescription')}
        onFollowup={onAssignFollowup}
        onReferral={onAssignReferral}
      />
    )
  }

  if (subView === 'prescription') {
    return (
      <PrescriptionStep
        patient={patient}
        medicines={medicines}
        notes={notes}
        setNotes={onUpdateNotes}
        updateMedicine={updateMedicine}
        addMedicine={addMedicine}
        removeMedicine={removeMedicine}
        onBack={() => setSubView('consultation')}
        onGenerate={() => setSubView('preview')}
      />
    )
  }

  return (
    <PreviewStep
      patient={patient}
      doctorName={doctorName}
      medicines={medicines}
      notes={notes}
      sent={sent}
      loading={loading}
      onBack={() => setSubView('prescription')}
      onSend={onSendPharmacy}
      onDone={onDone}
    />
  )
}

/* --------------------------------------------------------------------------
   STEP 1: CONSULTATION TRIAGE & CLINICAL NOTES
   -------------------------------------------------------------------------- */
function ConsultationStep({
  patient,
  prescriptionRecords,
  notes,
  loading,
  onUpdateNotes,
  onBack,
  onCompleteConsultation,
  onPrescription,
  onFollowup,
  onReferral,
}: {
  patient: Patient
  prescriptionRecords: PrescriptionRecord[]
  notes: string
  loading?: boolean
  onUpdateNotes?: (s: string) => void
  onBack: () => void
  onCompleteConsultation?: () => Promise<void> | void
  onPrescription: () => void
  onFollowup: () => void
  onReferral: () => void
}) {
  const patientRx = useMemo(() => {
    return prescriptionRecords.filter(
      (rx) =>
        rx.patient_name?.toLowerCase() === patient.name?.toLowerCase() ||
        rx.appointment_id === patient.id
    )
  }, [prescriptionRecords, patient])

  return (
    <div className="flow-wrap" style={{ maxWidth: 1320, margin: '0 auto', padding: '12px 32px 48px', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 12 }}>
        <button
          type="button"
          className="back-button"
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            color: '#2563eb',
            padding: '4px 0',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <md-icon style={{ fontSize: 18 }}>arrow_back</md-icon> Return to Queue
        </button>
      </div>

      <div className="flow-grid" style={{ marginTop: 0, gap: 24 }}>
        {/* LEFT COLUMN: PATIENT INFO & HISTORY */}
        <div>
          <div className="flow-title">
            <span className="status consulting">
              <i /> Consultation Active
            </span>
            <span className="token-badge large" style={{ fontWeight: 500 }}>
              {patient.token}
            </span>
          </div>
          <h2 className="flow-heading" style={{ fontSize: 22, fontWeight: 500, margin: '4px 0 2px' }}>
            {patient.name}
          </h2>
          <p
            className="flow-subtitle"
            style={{
              margin: '0 0 12px',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexWrap: 'wrap',
            }}
          >
            <span>
              Patient ID: <strong>{patient.patient_id}</strong>
            </span>
            <span>·</span>
            <span>{patient.age} yrs</span>
            <span>·</span>
            <span>
              Category: <strong>{patient.category}</strong>
            </span>
            <span>·</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              Source:{' '}
              {patient.source === 'ai_call' ? (
                <strong style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <md-icon style={{ fontSize: 13, color: '#2563eb' }}>call</md-icon> Telephony Call
                </strong>
              ) : (
                <strong style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <md-icon style={{ fontSize: 13, color: '#64748b' }}>edit_note</md-icon> Staff Manual
                </strong>
              )}
            </span>
          </p>

          {/* AI / Field Symptom Summary */}
          <div className="consult-card symptom-summary-card" style={{ marginTop: 0, padding: '14px 16px' }}>
            <div className="card-header-with-icon" style={{ marginBottom: 10 }}>
              <md-icon style={{ fontSize: 20 }}>medical_information</md-icon>
              <h3 style={{ fontWeight: 500, fontSize: 14, margin: 0 }}>AI Triage & Reported Symptoms</h3>
            </div>
            <ul className="symptom-list" style={{ gap: 6 }}>
              {patient.symptoms.map((s) => (
                <li key={s} style={{ fontSize: 12 }}>
                  <md-icon style={{ fontSize: 15 }}>check_circle</md-icon>
                  <span style={{ fontWeight: 500 }}>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Past Prescription & Medical History */}
          <div className="consult-card" style={{ marginTop: 10, padding: '14px 16px' }}>
            <div
              className="card-header-with-icon"
              style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}
            >
              <md-icon style={{ color: '#0284c7', fontSize: 20 }}>history_edu</md-icon>
              <h3 style={{ fontWeight: 500, margin: 0, fontSize: 14 }}>Prescription & Clinical History</h3>
            </div>
            {patientRx.length > 0 ? (
              <div style={{ display: 'grid', gap: 10 }}>
                {patientRx.map((rx) => (
                  <div
                    key={rx.id}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      padding: 10,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#0369a1' }}>
                        Issued by {rx.doctor_name}
                      </span>
                      <small style={{ color: '#64748b' }}>
                        {new Date(rx.created_at).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </small>
                    </div>
                    <ul style={{ paddingLeft: 0, margin: 0, listStyle: 'none' }}>
                      {rx.medicines.map((m, idx) => (
                        <li
                          key={idx}
                          style={{
                            fontSize: 12,
                            color: '#1e293b',
                            marginBottom: 3,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <md-icon style={{ fontSize: 14, color: '#0284c7' }}>medication</md-icon>
                          <span>
                            <strong>{m.name}</strong> — {m.dose} ({m.duration})
                          </span>
                        </li>
                      ))}
                    </ul>
                    {rx.notes && (
                      <p
                        style={{
                          margin: '6px 0 0',
                          fontSize: 11,
                          color: '#475569',
                          background: '#ffffff',
                          padding: '4px 8px',
                          borderRadius: 5,
                          border: '1px solid #f1f5f9',
                        }}
                      >
                        <strong>Notes:</strong> {rx.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                No prior digital prescriptions on file for this patient. Prepared medicines will be logged here
                upon completion.
              </p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIONS & DOCTOR NOTES */}
        <aside className="next-card" style={{ marginTop: 0, padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <md-icon style={{ color: '#2563eb', fontSize: 22 }}>edit_note</md-icon>
            <h3 style={{ fontWeight: 500, margin: 0, fontSize: 15 }}>Consultation & Actions</h3>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 500,
                color: '#334155',
                marginBottom: 6,
              }}
            >
              Doctor's Clinical Notes
            </label>
            <textarea
              rows={4}
              placeholder="Record physical examination findings, vitals observations, primary diagnosis, and advice..."
              style={{
                width: '100%',
                fontSize: 12,
                padding: 9,
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                resize: 'vertical',
              }}
              value={notes}
              onChange={(e) => onUpdateNotes && onUpdateNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            <button
              className="primary-button wide"
              style={{ fontWeight: 500, padding: '9px 14px', fontSize: 12 }}
              onClick={onPrescription}
            >
              Write Digital Prescriptions <md-icon>arrow_forward</md-icon>
            </button>
            {onCompleteConsultation && (
              <button
                className="outline-button wide"
                style={{
                  fontWeight: 500,
                  color: '#15803d',
                  borderColor: '#bbf7d0',
                  padding: '8px 12px',
                  fontSize: 12,
                }}
                onClick={onCompleteConsultation}
                disabled={loading}
              >
                <md-icon style={{ color: '#15803d' }}>check_circle</md-icon> {loading ? 'Saving...' : 'Save Notes & Complete'}
              </button>
            )}
            <button
              className="outline-button wide"
              style={{ fontWeight: 500, padding: '8px 12px', fontSize: 12 }}
              onClick={onFollowup}
            >
              <md-icon>event</md-icon> Assign ASHA Follow-Up
            </button>
            <button
              className="outline-button wide"
              style={{
                fontWeight: 500,
                color: '#0369a1',
                borderColor: '#bae6fd',
                padding: '8px 12px',
                fontSize: 12,
              }}
              onClick={onReferral}
            >
              <md-icon>swap_horiz</md-icon> Create Referral
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}

/* --------------------------------------------------------------------------
   STEP 2: DIGITAL PRESCRIPTION BUILDER
   -------------------------------------------------------------------------- */
function PrescriptionStep({
  patient,
  medicines,
  notes,
  setNotes,
  updateMedicine,
  addMedicine,
  removeMedicine,
  onBack,
  onGenerate,
}: {
  patient: Patient
  medicines: Medicine[]
  notes: string
  setNotes: (s: string) => void
  updateMedicine: (i: number, k: keyof Medicine, v: string) => void
  addMedicine: () => void
  removeMedicine: (i: number) => void
  onBack: () => void
  onGenerate: () => void
}) {
  return (
    <div className="flow-wrap" style={{ maxWidth: 1320, margin: '0 auto', padding: '12px 32px 48px', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 12 }}>
        <button
          type="button"
          className="back-button"
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            color: '#2563eb',
            padding: '4px 0',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <md-icon style={{ fontSize: 18 }}>arrow_back</md-icon> Back to Consultation
        </button>
      </div>
      <div className="prescription-card">
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Digital Prescription Builder</h2>
        <p style={{ margin: '4px 0 20px', color: '#64748b' }}>
          Patient: <strong>{patient.name}</strong> ({patient.patient_id})
        </p>

        {medicines.map((m, i) => (
          <MedicineInputRow
            key={i}
            m={m}
            i={i}
            updateMedicine={updateMedicine}
            removeMedicine={removeMedicine}
          />
        ))}

        <button
          className="outline-button"
          onClick={addMedicine}
          style={{ marginBottom: 24, fontWeight: 600 }}
        >
          + Add Medicine Row
        </button>

        <label style={{ display: 'block', marginBottom: 24, fontWeight: 600, fontSize: 13 }}>
          Doctor Notes & Instructions
          <textarea
            rows={3}
            style={{ marginTop: 6 }}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>

        <button className="primary-button wide" style={{ fontWeight: 600 }} onClick={onGenerate}>
          Preview & Save Prescription <md-icon>arrow_forward</md-icon>
        </button>
      </div>
    </div>
  )
}

function MedicineInputRow({
  m,
  i,
  updateMedicine,
  removeMedicine,
}: {
  m: Medicine
  i: number
  updateMedicine: (i: number, k: keyof Medicine, v: string) => void
  removeMedicine: (i: number) => void
}) {
  const [showSuggestions, setShowSuggestions] = useState(false)

  const filtered = useMemo(() => {
    if (!m.name.trim()) return []
    return COMMON_MEDICINES.filter((item) =>
      item.name.toLowerCase().includes(m.name.toLowerCase())
    )
  }, [m.name])

  function selectMed(item: (typeof COMMON_MEDICINES)[0]) {
    updateMedicine(i, 'name', item.name)
    updateMedicine(i, 'dose', item.dose)
    updateMedicine(i, 'duration', item.duration)
    setShowSuggestions(false)
  }

  return (
    <div
      className="medicine-row"
      style={{
        display: 'grid',
        gridTemplateColumns: '2fr 2fr 1fr auto',
        gap: 12,
        marginBottom: 14,
        position: 'relative',
      }}
    >
      <div className="med-autocomplete-wrap">
        <input
          type="text"
          placeholder="Type medicine name (e.g. Paracetamol, Dolo, Amoxicillin)..."
          value={m.name}
          onFocus={() => setShowSuggestions(true)}
          onChange={(e) => {
            updateMedicine(i, 'name', e.target.value)
            setShowSuggestions(true)
          }}
        />
        {showSuggestions && filtered.length > 0 && (
          <ul className="med-suggestions-list">
            {filtered.map((item, idx) => (
              <li
                key={idx}
                className="med-suggestion-item"
                onMouseDown={() => selectMed(item)}
              >
                <md-icon style={{ fontSize: 16, color: '#2563eb' }}>medication</md-icon>
                <div>
                  <strong>{item.name}</strong>
                  <span style={{ display: 'block', fontSize: 11, color: '#64748b' }}>
                    Suggested: {item.dose} ({item.duration})
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <input
        type="text"
        placeholder="Dosage (e.g. 1 tab after meals)"
        value={m.dose}
        onChange={(e) => updateMedicine(i, 'dose', e.target.value)}
      />
      <input
        type="text"
        placeholder="Duration (e.g. 5 days)"
        value={m.duration}
        onChange={(e) => updateMedicine(i, 'duration', e.target.value)}
      />
      <button className="delete-button" onClick={() => removeMedicine(i)}>
        <md-icon>delete</md-icon>
      </button>
    </div>
  )
}

/* --------------------------------------------------------------------------
   STEP 3: PRINTABLE PREVIEW & SAVE
   -------------------------------------------------------------------------- */
function PreviewStep({
  patient,
  doctorName,
  medicines,
  notes,
  sent,
  loading,
  onBack,
  onSend,
  onDone,
}: {
  patient: Patient
  doctorName: string
  medicines: Medicine[]
  notes: string
  sent: boolean
  loading: boolean
  onBack: () => void
  onSend: () => void
  onDone?: () => void
}) {
  const printDate = useMemo(() => {
    return new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }, [])

  return (
    <div className="flow-wrap" style={{ maxWidth: 1320, margin: '0 auto', padding: '12px 32px 48px', boxSizing: 'border-box' }}>
      <div
        className="no-print"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 14,
        }}
      >
        <button
          type="button"
          className="back-button"
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            color: '#2563eb',
            padding: '4px 0',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            margin: 0,
          }}
        >
          <md-icon style={{ fontSize: 18 }}>arrow_back</md-icon> Edit Prescription
        </button>
        <button
          type="button"
          className="outline-button"
          style={{
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
          onClick={() => window.print()}
        >
          <md-icon style={{ fontSize: 18 }}>print</md-icon> Print Receipt
        </button>
      </div>

      <div
        className="prescription-paper printable-receipt"
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: '24px 28px',
          boxShadow: '0 4px 15px rgba(15, 23, 42, 0.05)',
        }}
      >
        {/* HEADER */}
        <div
          className="paper-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '2px solid #0f172a',
            paddingBottom: 14,
            marginBottom: 16,
          }}
        >
          <div>
            <span
              style={{
                fontSize: 11,
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
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '0 0 2px' }}>
              SWASTHYAQ DIGITAL RX & RECEIPT
            </h1>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
              Primary Health Centre (PHC North 01) · Facility Code: PHC-26133
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <strong style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', display: 'block' }}>
              {doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`}
            </strong>
            <span style={{ fontSize: 11, color: '#475569', display: 'block' }}>Medical Reg: MH-20481</span>
            <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>
              Dept: General OPD & Primary Care
            </span>
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
            padding: '8px 14px',
            marginBottom: 16,
            fontSize: 12,
            color: '#475569',
          }}
        >
          <div>
            <strong>Receipt / Rx No:</strong>{' '}
            <span style={{ fontFamily: 'monospace', color: '#0f172a', fontWeight: 600 }}>
              RX-{patient.patient_id || 'PAT'}-{patient.token || '01'}
            </span>
          </div>
          <div>
            <strong>Date & Time:</strong> {printDate}
          </div>
          <div>
            <strong>OPD Room:</strong> Room #3 (Doctor Chamber)
          </div>
        </div>

        {/* PATIENT PROFILE CARD */}
        <div
          className="paper-patient"
          style={{
            margin: '0 0 16px',
            padding: 14,
            background: '#f1f5f9',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
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
                Patient Name & Demographics
              </span>
              <strong style={{ fontSize: 15, color: '#0f172a' }}>{patient.name}</strong>
              <span style={{ fontSize: 12, color: '#475569', display: 'block', marginTop: 2 }}>
                Age: {patient.age} yrs · ID: <strong>{patient.patient_id || patient.id}</strong>
              </span>
            </div>
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
                Token & Department
              </span>
              <span className="token-badge" style={{ fontWeight: 600, display: 'inline-block', marginTop: 2 }}>
                {patient.token}
              </span>
              <span style={{ fontSize: 11, color: '#475569', display: 'block', marginTop: 2 }}>
                {patient.category}
              </span>
            </div>
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
                Source & Priority
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  marginTop: 2,
                }}
              >
                {patient.source === 'ai_call' ? (
                  <>
                    <md-icon style={{ fontSize: 14, color: '#2563eb' }}>call</md-icon>
                    <span>Voice AI Bot</span>
                  </>
                ) : (
                  <>
                    <md-icon style={{ fontSize: 14, color: '#64748b' }}>edit_note</md-icon>
                    <span>OPD Desk</span>
                  </>
                )}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: patient.risk_level === 'high' ? '#dc2626' : '#16a34a',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  marginTop: 2,
                }}
              >
                {patient.risk_level === 'high' ? (
                  <>
                    <md-icon style={{ fontSize: 13, color: '#dc2626' }}>warning</md-icon>
                    <span>High Priority</span>
                  </>
                ) : (
                  <>
                    <md-icon style={{ fontSize: 13, color: '#16a34a' }}>check_circle</md-icon>
                    <span>Standard Care</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {patient.symptoms && patient.symptoms.length > 0 && (
            <div
              style={{
                marginTop: 10,
                paddingTop: 8,
                borderTop: '1px solid #e2e8f0',
                fontSize: 12,
                color: '#334155',
              }}
            >
              <strong>Chief Complaints / Symptoms:</strong> {patient.symptoms.join(', ')}
            </div>
          )}
        </div>

        {/* PRESCRIPTION MEDICINES (Rx) */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#2563eb', fontFamily: 'serif' }}>℞</span>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', margin: 0 }}>
              Prescribed Medicines & Dosages
            </h3>
          </div>

          <div style={{ border: '1px solid #cbd5e1', borderRadius: 8, overflow: 'hidden' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '40px 2.2fr 2fr 1fr',
                padding: '8px 12px',
                background: '#f8fafc',
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
            {medicines.map((m, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 2.2fr 2fr 1fr',
                  padding: '9px 12px',
                  borderTop: i === 0 ? 'none' : '1px solid #f1f5f9',
                  fontSize: 12,
                  color: '#1e293b',
                  alignItems: 'center',
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
        </div>

        {/* CLINICAL NOTES & ADVICE */}
        {notes && (
          <div
            style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 8,
              padding: '12px 14px',
              marginBottom: 16,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#1d4ed8',
                display: 'block',
                textTransform: 'uppercase',
                marginBottom: 4,
              }}
            >
              Doctor's Advice & Clinical Instructions
            </span>
            <p style={{ margin: 0, fontSize: 13, color: '#1e3a8a', lineHeight: 1.5 }}>
              {notes}
            </p>
          </div>
        )}

        {/* VERIFICATION & OFFICIAL FOOTER */}
        <div
          style={{
            borderTop: '1px dashed #cbd5e1',
            paddingTop: 14,
            marginTop: 14,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                color: '#15803d',
                background: '#f0fdf4',
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid #bbf7d0',
                maxWidth: 420,
              }}
            >
              <md-icon style={{ fontSize: 16 }}>verified</md-icon>
              <span>Digitally verified prescription synced to PHC Pharmacy & ABDM health locker.</span>
            </div>
            <span style={{ display: 'block', fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
              Computer generated receipt · Valid at all National Health Mission PHC dispensaries.
            </span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                borderBottom: '1px solid #0f172a',
                width: 160,
                marginBottom: 4,
                height: 28,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontFamily: 'cursive', fontSize: 14, color: '#1e40af' }}>
                {doctorName}
              </span>
            </div>
            <strong style={{ fontSize: 11, color: '#0f172a', display: 'block' }}>
              Authorized Practitioner
            </strong>
            <span style={{ fontSize: 10, color: '#64748b' }}>Reg. No. MH-20481</span>
          </div>
        </div>

        {/* ACTION BUTTONS (HIDDEN IN PRINT) */}
        <div className="send-card no-print" style={{ marginTop: 24, textAlign: 'center' }}>
          {sent ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
              <div
                className="success-banner"
                style={{
                  width: '100%',
                  background: '#dcfce7',
                  color: '#15803d',
                  padding: 14,
                  borderRadius: 8,
                  fontWeight: 500,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <md-icon style={{ fontSize: 18 }}>check_circle</md-icon>
                <span>Prescription saved to MongoDB Atlas & dispatched! Patient marked DONE.</span>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', width: '100%' }}>
                <button
                  type="button"
                  className="primary-button"
                  style={{
                    fontWeight: 600,
                    padding: '10px 22px',
                    fontSize: 13,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                  onClick={() => window.print()}
                >
                  <md-icon style={{ fontSize: 18 }}>print</md-icon> Print Receipt / Prescription
                </button>
                {onDone && (
                  <button
                    type="button"
                    className="outline-button"
                    style={{
                      fontWeight: 500,
                      padding: '10px 20px',
                      fontSize: 13,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                    onClick={onDone}
                  >
                    <md-icon style={{ fontSize: 18 }}>done_all</md-icon> Back to Patient Queue
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                type="button"
                className="outline-button"
                style={{
                  fontWeight: 500,
                  padding: '10px 18px',
                  fontSize: 13,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
                onClick={() => window.print()}
              >
                <md-icon style={{ fontSize: 18 }}>print</md-icon> Print Preview
              </button>
              <button
                type="button"
                className="primary-button"
                style={{ fontWeight: 600, padding: '10px 24px', fontSize: 13 }}
                onClick={onSend}
                disabled={loading}
              >
                {loading ? 'Saving to Database...' : 'Save & Dispatch Prescription'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
