'use client'

import React, { useState } from 'react'

interface FacilityItem {
  id: string
  name: string
  type: 'PHC' | 'CHC' | 'Sub-Centre' | 'District Hospital'
  doctorsOnDuty: number
  opdLoadToday: number
  capacityPercent: number
  status: 'Operational' | 'High Load' | 'Critical Shortage'
}

const FACILITIES_DATA: FacilityItem[] = [
  { id: 'FAC-01', name: 'PHC North 01', type: 'PHC', doctorsOnDuty: 3, opdLoadToday: 142, capacityPercent: 78, status: 'Operational' },
  { id: 'FAC-02', name: 'PHC West 02', type: 'PHC', doctorsOnDuty: 2, opdLoadToday: 198, capacityPercent: 95, status: 'High Load' },
  { id: 'FAC-03', name: 'Sub-Centre Rampur', type: 'Sub-Centre', doctorsOnDuty: 1, opdLoadToday: 64, capacityPercent: 55, status: 'Operational' },
  { id: 'FAC-04', name: 'Sub-Centre Bilaspur', type: 'Sub-Centre', doctorsOnDuty: 1, opdLoadToday: 82, capacityPercent: 80, status: 'Operational' },
  { id: 'FAC-05', name: 'District Hospital East', type: 'District Hospital', doctorsOnDuty: 14, opdLoadToday: 620, capacityPercent: 92, status: 'High Load' },
  { id: 'FAC-06', name: 'CHC Chandrapur', type: 'CHC', doctorsOnDuty: 4, opdLoadToday: 210, capacityPercent: 72, status: 'Operational' },
]

export function DistrictFacilitiesView() {
  const [search, setSearch] = useState('')

  const filtered = FACILITIES_DATA.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.type.toLowerCase().includes(search.toLowerCase()) ||
    f.id.toLowerCase().includes(search.toLowerCase())
  )

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
          <h2 style={{ fontSize: '20px', fontWeight: 500 }}>Healthcare Facility Network</h2>
          <p style={{ margin: '4px 0 0', color: '#64748b' }}>
            Primary, community, and secondary healthcare centres across the northern district.
          </p>
        </div>
        <input
          type="text"
          placeholder="Search facility name or type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '9px 14px',
            borderRadius: 8,
            border: '1px solid #cbd5e1',
            width: 280,
            fontSize: 13,
          }}
        />
      </div>

      <div className="table-card" style={{ marginTop: 18, border: '1.5px solid #cbd5e1', borderRadius: 12 }}>
        <div
          className="table-header"
          style={{
            display: 'grid',
            gridTemplateColumns: '110px 2fr 1.2fr 1.2fr 1.2fr 140px',
            padding: '10px 16px',
            background: '#f8fafc',
            fontSize: '13px',
            fontWeight: 600,
            color: '#334155',
          }}
        >
          <span>Facility ID</span>
          <span>Facility Name</span>
          <span>Type</span>
          <span>Doctors on Duty</span>
          <span>OPD Load Today</span>
          <span>Status</span>
        </div>
        {filtered.map((f) => (
          <div
            className="patient-row"
            key={f.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '110px 2fr 1.2fr 1.2fr 1.2fr 140px',
              alignItems: 'center',
              padding: '12px 16px',
            }}
          >
            <strong style={{ color: '#2563eb', fontWeight: 500 }}>{f.id}</strong>
            <strong style={{ fontSize: 14, color: '#0f172a' }}>{f.name}</strong>
            <span style={{ fontSize: 13, color: '#475569' }}>{f.type}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>
              {f.doctorsOnDuty} Doctors
            </span>
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                {f.opdLoadToday} Patients
              </span>
              <small style={{ display: 'block', fontSize: 11, color: '#64748b' }}>
                {f.capacityPercent}% capacity
              </small>
            </div>
            <span
              className={`status ${
                f.status === 'Operational' ? 'done' : f.status === 'High Load' ? 'pending' : 'risk-high-pill'
              }`}
            >
              <i />
              {f.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
