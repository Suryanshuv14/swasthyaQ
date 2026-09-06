'use client'

import React from 'react'
import { DistrictStats } from '@/lib/api'
import { StatCard } from '@/components/dashboard/stat-card'

interface DistrictOverviewViewProps {
  stats: DistrictStats | null
}

export function DistrictOverviewView({ stats }: DistrictOverviewViewProps) {
  const referralFlow = stats?.referral_flow || [
    { facility: 'PHC North 01', inflow: 42, outflow: 18 },
    { facility: 'PHC West 02', inflow: 38, outflow: 25 },
    { facility: 'Sub-Centre Rampur', inflow: 12, outflow: 30 },
    { facility: 'District Hospital East', inflow: 85, outflow: 5 },
  ]

  const diseaseTrends = stats?.disease_trends || [
    { category: 'General Outpatient', cases: 640 },
    { category: 'Respiratory & Cold', cases: 380 },
    { category: 'Maternal & Child Care', cases: 210 },
    { category: 'Hypertension & Cardiac', cases: 120 },
    { category: 'Diabetes & Endocrine', cases: 70 },
  ]

  const medicineStock = stats?.medicine_stock || [
    { facility: 'PHC North 01', medicine: 'Paracetamol 500mg', status: 'In Stock', level: 'green', quantity: '4,500 tabs' },
    { facility: 'PHC North 01', medicine: 'Amoxicillin 500mg', status: 'Low Stock', level: 'yellow', quantity: '320 tabs' },
    { facility: 'PHC North 01', medicine: 'Amlodipine 5mg', status: 'Critical', level: 'red', quantity: '45 tabs' },
    { facility: 'PHC West 02', medicine: 'ORS Packets', status: 'In Stock', level: 'green', quantity: '1,200 units' },
    { facility: 'District Hospital East', medicine: 'Insulin Regular 40IU', status: 'In Stock', level: 'green', quantity: '850 vials' },
  ]

  return (
    <div className="content-wrap">
      {/* TOP METRIC CARDS */}
      <section className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
        <StatCard
          icon="groups"
          iconColorClass="soft-blue"
          title="Total OPD Load Today"
          value={stats?.total_opd_load || 1420}
          trendText="Across 14 Facilities"
        />

        <StatCard
          icon="health_and_safety"
          iconColorClass="soft-green"
          title="Avg Doctor Availability"
          value={`${stats?.avg_doctor_availability || 88}%`}
          trendText="Optimal Duty Roster"
        />

        <StatCard
          icon="schedule"
          iconColorClass="soft-orange"
          title="Avg Wait Time"
          value={`${stats?.avg_wait_minutes || 14} min`}
          trendText="Target < 20 min"
          trendClass="trend neutral"
        />

        <StatCard
          icon="swap_horiz"
          iconColorClass="soft-purple"
          title="Active Referrals"
          value={stats?.active_referrals || 34}
          trendText="Secondary/Tertiary"
          trendClass="trend neutral"
        />
      </section>

      {/* ANALYTICS GRID */}
      <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 18 }}>
        {/* REFERRAL FLOW */}
        <div className="analytics-card" style={{ background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: 12, padding: '20px 22px', boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', marginBottom: 14 }}>
            Referral Inflow / Outflow per Facility
          </h3>
          <div className="table-card" style={{ border: '1px solid #e2e8f0', borderRadius: 8 }}>
            <div className="table-header" style={{ gridTemplateColumns: '2fr 1fr 1fr', background: '#f8fafc', padding: '9px 14px', fontSize: 12, fontWeight: 600 }}>
              <span>Facility Name</span>
              <span>Inflow</span>
              <span>Outflow</span>
            </div>
            {referralFlow.map((f, i) => (
              <div className="patient-row" key={i} style={{ gridTemplateColumns: '2fr 1fr 1fr', padding: '10px 14px' }}>
                <strong style={{ fontSize: 13, color: '#0f172a' }}>{f.facility}</strong>
                <span style={{ color: '#16a34a', fontWeight: 600, fontSize: 13 }}>+{f.inflow}</span>
                <span style={{ color: '#dc2626', fontWeight: 600, fontSize: 13 }}>-{f.outflow}</span>
              </div>
            ))}
          </div>
        </div>

        {/* DISEASE TRENDS BAR CHART */}
        <div className="analytics-card" style={{ background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: 12, padding: '20px 22px', boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', marginBottom: 14 }}>
            Regional Symptom & Disease Trends (14-Day)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {diseaseTrends.map((item, idx) => {
              const pct = Math.round((item.cases / 700) * 100)
              return (
                <div className="bar-chart-row" key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="bar-chart-label" style={{ width: 140, fontSize: 12, color: '#475569', fontWeight: 500 }}>
                    {item.category}
                  </span>
                  <div className="bar-chart-track" style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                    <div className="bar-chart-fill" style={{ width: `${pct}%`, height: '100%', background: '#2563eb', borderRadius: 4 }} />
                  </div>
                  <strong style={{ width: 45, textAlign: 'right', fontSize: 12, color: '#0f172a' }}>{item.cases}</strong>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* MEDICINE AVAILABILITY STOCK GRID */}
      <div className="analytics-card" style={{ marginTop: 18, background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: 12, padding: '20px 22px', boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', marginBottom: 14 }}>
          Medicine Availability Stock Status per Facility
        </h3>
        <div className="stock-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
          {medicineStock.map((m, i) => (
            <div
              className="stock-item"
              key={i}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '12px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <strong style={{ fontSize: 13, color: '#0f172a', display: 'block' }}>{m.facility}</strong>
                <span style={{ fontSize: 12, color: '#64748b' }}>{m.medicine}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{m.quantity}</span>
                <span className={`stock-badge ${m.level}`}>{m.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
