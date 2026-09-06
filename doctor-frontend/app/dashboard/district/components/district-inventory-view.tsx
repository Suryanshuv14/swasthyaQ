'use client'

import React, { useState } from 'react'

interface MedicineStockItem {
  id: string
  name: string
  category: string
  facility: string
  quantity: number
  unit: string
  status: 'In Stock' | 'Low Stock' | 'Critical'
  minRequired: number
}

const INVENTORY_DATA: MedicineStockItem[] = [
  { id: 'MED-01', name: 'Paracetamol 500mg', category: 'Analgesics', facility: 'PHC North 01', quantity: 4500, unit: 'tablets', status: 'In Stock', minRequired: 1000 },
  { id: 'MED-02', name: 'Amoxicillin 500mg', category: 'Antibiotics', facility: 'PHC North 01', quantity: 320, unit: 'tablets', status: 'Low Stock', minRequired: 500 },
  { id: 'MED-03', name: 'Amlodipine 5mg', category: 'Cardiovascular', facility: 'PHC North 01', quantity: 45, unit: 'tablets', status: 'Critical', minRequired: 300 },
  { id: 'MED-04', name: 'ORS Packets', category: 'Electrolytes', facility: 'PHC West 02', quantity: 1200, unit: 'packets', status: 'In Stock', minRequired: 400 },
  { id: 'MED-05', name: 'Metformin 500mg', category: 'Diabetes Care', facility: 'PHC West 02', quantity: 240, unit: 'tablets', status: 'Low Stock', minRequired: 600 },
  { id: 'MED-06', name: 'Insulin Regular 40IU', category: 'Injectables', facility: 'District Hospital East', quantity: 850, unit: 'vials', status: 'In Stock', minRequired: 200 },
  { id: 'MED-07', name: 'Cetirizine 10mg', category: 'Antihistamines', facility: 'Sub-Centre Rampur', quantity: 60, unit: 'tablets', status: 'Critical', minRequired: 250 },
]

export function DistrictInventoryView() {
  const [filter, setFilter] = useState<'All' | 'Low Stock' | 'Critical'>('All')
  const [search, setSearch] = useState('')

  const filtered = INVENTORY_DATA.filter((item) => {
    if (filter === 'Low Stock' && item.status !== 'Low Stock') return false
    if (filter === 'Critical' && item.status !== 'Critical') return false
    if (search.trim()) {
      const q = search.toLowerCase()
      return (
        item.name.toLowerCase().includes(q) ||
        item.facility.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      )
    }
    return true
  })

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
          <h2 style={{ fontSize: '20px', fontWeight: 500 }}>District Medicine Stock & Logistics</h2>
          <p style={{ margin: '4px 0 0', color: '#64748b' }}>
            Real-time formulary stock levels, critical shortage alerts, and replenishment requests.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', padding: 3, borderRadius: 8 }}>
            {(['All', 'Low Stock', 'Critical'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: filter === tab ? '#ffffff' : 'transparent',
                  color: filter === tab ? '#2563eb' : '#64748b',
                  boxShadow: filter === tab ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search medicine or facility..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              width: 220,
              fontSize: 13,
            }}
          />
        </div>
      </div>

      <div className="table-card" style={{ marginTop: 18, border: '1.5px solid #cbd5e1', borderRadius: 12 }}>
        <div
          className="table-header"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1.2fr 1.5fr 1fr 1fr 120px',
            padding: '10px 16px',
            background: '#f8fafc',
            fontSize: '13px',
            fontWeight: 600,
            color: '#334155',
          }}
        >
          <span>Medicine Name</span>
          <span>Category</span>
          <span>Facility</span>
          <span>Stock Level</span>
          <span>Min Required</span>
          <span>Status</span>
        </div>
        {filtered.map((item) => (
          <div
            className="patient-row"
            key={item.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '1.5fr 1.2fr 1.5fr 1fr 1fr 120px',
              alignItems: 'center',
              padding: '12px 16px',
            }}
          >
            <div>
              <strong style={{ fontSize: 14, color: '#0f172a' }}>{item.name}</strong>
              <small style={{ display: 'block', fontSize: 11, color: '#64748b' }}>{item.id}</small>
            </div>
            <span style={{ fontSize: 13, color: '#475569' }}>{item.category}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{item.facility}</span>
            <strong
              style={{
                fontSize: 13,
                color: item.status === 'Critical' ? '#dc2626' : item.status === 'Low Stock' ? '#d97706' : '#16a34a',
              }}
            >
              {item.quantity.toLocaleString()} {item.unit}
            </strong>
            <span style={{ fontSize: 12, color: '#64748b' }}>{item.minRequired.toLocaleString()} {item.unit}</span>
            <span
              className={`status ${
                item.status === 'In Stock' ? 'done' : item.status === 'Low Stock' ? 'pending' : 'risk-high-pill'
              }`}
            >
              <i />
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
