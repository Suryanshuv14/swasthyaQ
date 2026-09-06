'use client'

import React from 'react'
import { User } from '@/lib/api'

interface DoctorSettingsViewProps {
  user: User
  doctorName: string
  doctorDept: string
  doctorInitials: string
  profileName: string
  setProfileName: (val: string) => void
  profileEmail: string
  setProfileEmail: (val: string) => void
  profilePhone: string
  setProfilePhone: (val: string) => void
  profileAvatar: string
  setProfileAvatar: (val: string) => void
  profileDepartment: string
  setProfileDepartment: (val: string) => void
  profileRegNo: string
  setProfileRegNo: (val: string) => void
  profileQualification: string
  setProfileQualification: (val: string) => void
  profileExperience: string
  setProfileExperience: (val: string) => void
  profileRoom: string
  setProfileRoom: (val: string) => void
  profileOpdDays: string[]
  setProfileOpdDays: (days: string[]) => void
  profileShiftMorning: string
  setProfileShiftMorning: (val: string) => void
  profileShiftEvening: string
  setProfileShiftEvening: (val: string) => void
  profileMaxTokens: string
  setProfileMaxTokens: (val: string) => void
  profileStatus: 'available' | 'on_rounds' | 'off_duty'
  setProfileStatus: (val: 'available' | 'on_rounds' | 'off_duty') => void
  profileEmergencyAlerts: boolean
  setProfileEmergencyAlerts: (val: boolean) => void
  profileRxValidity: string
  setProfileRxValidity: (val: string) => void
  settingsSubTab: 'personal' | 'schedule'
  setSettingsSubTab: (tab: 'personal' | 'schedule') => void
  doctorGender: 'Male' | 'Female' | 'Other'
  setDoctorGender: (g: 'Male' | 'Female' | 'Other') => void
  currPassword: string
  setCurrPassword: (val: string) => void
  newPassword: string
  setNewPassword: (val: string) => void
  confirmPassword: string
  setConfirmPassword: (val: string) => void
  profileSaving: boolean
  profileSuccessMsg: string
  profileErrorMsg: string
  onSaveProfile: (e: React.FormEvent) => Promise<void>
  onDiscardChanges: () => void
  onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onQuickStatusChange: (status: 'available' | 'on_rounds' | 'off_duty') => void
  onLogout: () => void
}

export function DoctorSettingsView({
  user,
  doctorName,
  doctorDept,
  doctorInitials,
  profileName,
  setProfileName,
  profileEmail,
  setProfileEmail,
  profilePhone,
  setProfilePhone,
  profileAvatar,
  profileDepartment,
  setProfileDepartment,
  profileRegNo,
  setProfileRegNo,
  profileQualification,
  setProfileQualification,
  profileExperience,
  setProfileExperience,
  profileRoom,
  setProfileRoom,
  profileOpdDays,
  setProfileOpdDays,
  profileShiftMorning,
  setProfileShiftMorning,
  profileShiftEvening,
  setProfileShiftEvening,
  profileMaxTokens,
  setProfileMaxTokens,
  profileStatus,
  profileEmergencyAlerts,
  setProfileEmergencyAlerts,
  profileRxValidity,
  setProfileRxValidity,
  settingsSubTab,
  setSettingsSubTab,
  doctorGender,
  setDoctorGender,
  currPassword,
  setCurrPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  profileSaving,
  profileSuccessMsg,
  profileErrorMsg,
  onSaveProfile,
  onDiscardChanges,
  onAvatarUpload,
  onQuickStatusChange,
  onLogout,
}: DoctorSettingsViewProps) {
  function handleDayToggle(day: string) {
    if (profileOpdDays.includes(day)) {
      if (profileOpdDays.length > 1) {
        setProfileOpdDays(profileOpdDays.filter((d) => d !== day))
      }
    } else {
      setProfileOpdDays([...profileOpdDays, day])
    }
  }

  return (
    <div className="content-wrap">
      <div className="settings-screen-wrap">
        {/* LEFT PROFILE & SUB-NAVIGATION CARD */}
        <aside className="settings-profile-card">
          <div className="settings-avatar-wrap">
            {profileAvatar ? (
              <img src={profileAvatar} alt={doctorName} className="settings-avatar-img" />
            ) : (
              <div className="settings-avatar-placeholder">{doctorInitials}</div>
            )}
            <label className="settings-edit-badge" title="Change Profile Picture">
              <md-icon style={{ fontSize: 16 }}>edit</md-icon>
              <input type="file" accept="image/*" onChange={onAvatarUpload} style={{ display: 'none' }} />
            </label>
          </div>

          <h3 className="settings-profile-name">{profileName || doctorName}</h3>
          <p className="settings-profile-role">{profileDepartment || doctorDept}</p>

          <nav className="settings-nav-list">
            <button
              type="button"
              className={`settings-nav-item ${settingsSubTab === 'personal' ? 'active' : ''}`}
              onClick={() => setSettingsSubTab('personal')}
            >
              <md-icon>person</md-icon>
              <span>Personal Information</span>
            </button>

            <button
              type="button"
              className={`settings-nav-item ${settingsSubTab === 'schedule' ? 'active' : ''}`}
              onClick={() => setSettingsSubTab('schedule')}
            >
              <md-icon>schedule</md-icon>
              <span>Chamber & OPD Schedule</span>
            </button>

            <div className="settings-nav-divider" />

            <button
              type="button"
              className="settings-nav-item"
              onClick={onLogout}
              style={{ color: '#dc2626' }}
            >
              <md-icon style={{ color: '#dc2626' }}>logout</md-icon>
              <span>Log Out</span>
            </button>
          </nav>
        </aside>

        {/* RIGHT FORM CONTENT CARD */}
        <section className="settings-content-card">
          {/* NOTIFICATIONS */}
          {profileSuccessMsg && (
            <div
              style={{
                background: '#dcfce7',
                border: '1px solid #86efac',
                color: '#15803d',
                padding: '10px 14px',
                borderRadius: 8,
                marginBottom: 18,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <md-icon style={{ fontSize: 18 }}>check_circle</md-icon>
              <span>{profileSuccessMsg}</span>
            </div>
          )}
          {profileErrorMsg && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fca5a5',
                color: '#dc2626',
                padding: '10px 14px',
                borderRadius: 8,
                marginBottom: 18,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <md-icon style={{ fontSize: 18 }}>error</md-icon>
              <span>{profileErrorMsg}</span>
            </div>
          )}

          {/* SUBTAB 1: PERSONAL INFORMATION & CREDENTIALS */}
          {settingsSubTab === 'personal' && (
            <form onSubmit={onSaveProfile}>
              <div className="settings-card-header">
                <h2 className="settings-section-title">Personal Information</h2>
              </div>

              {/* GENDER / TITLE RADIO SELECTOR */}
              <div className="settings-radio-group">
                <label className="settings-radio-option" onClick={() => setDoctorGender('Male')}>
                  <span className={`settings-radio-dot ${doctorGender === 'Male' ? 'checked' : ''}`} />
                  <span>Male</span>
                </label>
                <label className="settings-radio-option" onClick={() => setDoctorGender('Female')}>
                  <span className={`settings-radio-dot ${doctorGender === 'Female' ? 'checked' : ''}`} />
                  <span>Female</span>
                </label>
                <label className="settings-radio-option" onClick={() => setDoctorGender('Other')}>
                  <span className={`settings-radio-dot ${doctorGender === 'Other' ? 'checked' : ''}`} />
                  <span>Other</span>
                </label>
              </div>

              <div className="settings-grid-2">
                <div className="settings-form-group">
                  <label className="settings-label">Doctor Full Name</label>
                  <input
                    type="text"
                    className="settings-input"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Dr. Ananya Sharma"
                    required
                  />
                </div>
                <div className="settings-form-group">
                  <label className="settings-label">Medical Registration No.</label>
                  <input
                    type="text"
                    className="settings-input"
                    value={profileRegNo}
                    onChange={(e) => setProfileRegNo(e.target.value)}
                    placeholder="MH-20481"
                    required
                  />
                </div>
              </div>

              <div className="settings-grid-1">
                <div className="settings-form-group">
                  <label className="settings-label">Email Address</label>
                  <div className="input-verified-wrap">
                    <input
                      type="email"
                      className="settings-input"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      placeholder="doctor@swasthyaq.com"
                      required
                    />
                    <span className="verified-badge">
                      <md-icon>check_circle</md-icon> Verified
                    </span>
                  </div>
                </div>
              </div>

              <div className="settings-grid-1">
                <div className="settings-form-group">
                  <label className="settings-label">Chamber / Hospital Address</label>
                  <input
                    type="text"
                    className="settings-input"
                    value={`${user.facility_id || 'PHC-NORTH-01'} · Primary Health Centre, Room #03`}
                    readOnly
                    style={{ color: '#475569', cursor: 'not-allowed' }}
                  />
                </div>
              </div>

              <div className="settings-grid-2">
                <div className="settings-form-group">
                  <label className="settings-label">Phone Number</label>
                  <input
                    type="text"
                    className="settings-input"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="settings-form-group">
                  <label className="settings-label">Experience (Years)</label>
                  <input
                    type="number"
                    className="settings-input"
                    value={profileExperience}
                    onChange={(e) => setProfileExperience(e.target.value)}
                    placeholder="8"
                  />
                </div>
              </div>

              <div className="settings-grid-2">
                <div className="settings-form-group">
                  <label className="settings-label">Department / Specialization</label>
                  <input
                    type="text"
                    className="settings-input"
                    value={profileDepartment}
                    onChange={(e) => setProfileDepartment(e.target.value)}
                    placeholder="General Medicine & OPD"
                  />
                </div>
                <div className="settings-form-group">
                  <label className="settings-label">Medical Qualifications</label>
                  <input
                    type="text"
                    className="settings-input"
                    value={profileQualification}
                    onChange={(e) => setProfileQualification(e.target.value)}
                    placeholder="MBBS, MD (Medicine)"
                  />
                </div>
              </div>

              {/* ACCOUNT SECURITY & PASSWORD SECTION */}
              <div style={{ margin: '22px 0 14px', borderTop: '1px solid #e2e8f0', paddingTop: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <md-icon style={{ color: '#2563eb', fontSize: 18 }}>lock</md-icon>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: 0 }}>
                    Account Password & Security
                  </h3>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                  Leave fields blank to keep current password, or enter credentials to update password.
                </p>
              </div>

              <div className="settings-grid-1">
                <div className="settings-form-group">
                  <label className="settings-label">Current Password</label>
                  <input
                    type="password"
                    className="settings-input"
                    value={currPassword}
                    onChange={(e) => setCurrPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <div className="settings-grid-2">
                <div className="settings-form-group">
                  <label className="settings-label">New Password (min 6 characters)</label>
                  <input
                    type="password"
                    className="settings-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
                <div className="settings-form-group">
                  <label className="settings-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="settings-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="settings-actions-bar">
                <button
                  type="button"
                  className="settings-btn-discard"
                  onClick={onDiscardChanges}
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="settings-btn-save"
                  disabled={profileSaving}
                >
                  <md-icon>{profileSaving ? 'hourglass_empty' : 'check'}</md-icon>
                  {profileSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {/* SUBTAB 2: CHAMBER & OPD SCHEDULE */}
          {settingsSubTab === 'schedule' && (
            <form onSubmit={onSaveProfile}>
              <div className="settings-card-header">
                <h2 className="settings-section-title">Chamber & OPD Schedule</h2>
              </div>

              {/* LIVE OPD STATUS */}
              <div
                style={{
                  marginBottom: 22,
                  background: '#f8fafc',
                  padding: '12px 16px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                  Live Chamber Status:
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => onQuickStatusChange('available')}
                    style={{
                      border: profileStatus === 'available' ? '1.5px solid #86efac' : '1px solid #cbd5e1',
                      background: profileStatus === 'available' ? '#dcfce7' : '#ffffff',
                      color: profileStatus === 'available' ? '#15803d' : '#64748b',
                      padding: '6px 14px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a' }} />
                    In Chamber
                  </button>
                  <button
                    type="button"
                    onClick={() => onQuickStatusChange('on_rounds')}
                    style={{
                      border: profileStatus === 'on_rounds' ? '1.5px solid #fde68a' : '1px solid #cbd5e1',
                      background: profileStatus === 'on_rounds' ? '#fef3c7' : '#ffffff',
                      color: profileStatus === 'on_rounds' ? '#b45309' : '#64748b',
                      padding: '6px 14px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#d97706' }} />
                    On Rounds
                  </button>
                  <button
                    type="button"
                    onClick={() => onQuickStatusChange('off_duty')}
                    style={{
                      border: profileStatus === 'off_duty' ? '1.5px solid #fca5a5' : '1px solid #cbd5e1',
                      background: profileStatus === 'off_duty' ? '#fee2e2' : '#ffffff',
                      color: profileStatus === 'off_duty' ? '#b91c1c' : '#64748b',
                      padding: '6px 14px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#dc2626' }} />
                    Off Duty
                  </button>
                </div>
              </div>

              {/* ACTIVE OPD DAYS */}
              <div style={{ marginBottom: 20 }}>
                <label className="settings-label" style={{ marginBottom: 8 }}>
                  Active OPD Consultation Days
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                    const active = profileOpdDays.includes(day)
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(day)}
                        style={{
                          border: active ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                          background: active ? '#eff6ff' : '#ffffff',
                          color: active ? '#1d4ed8' : '#64748b',
                          fontWeight: active ? 600 : 500,
                          fontSize: 12.5,
                          padding: '8px 16px',
                          borderRadius: 10,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="settings-grid-2">
                <div className="settings-form-group">
                  <label className="settings-label">Morning Shift Timing</label>
                  <input
                    type="text"
                    className="settings-input"
                    value={profileShiftMorning}
                    onChange={(e) => setProfileShiftMorning(e.target.value)}
                    placeholder="09:00 AM - 01:00 PM"
                  />
                </div>
                <div className="settings-form-group">
                  <label className="settings-label">Evening Shift Timing</label>
                  <input
                    type="text"
                    className="settings-input"
                    value={profileShiftEvening}
                    onChange={(e) => setProfileShiftEvening(e.target.value)}
                    placeholder="04:00 PM - 07:00 PM"
                  />
                </div>
              </div>

              <div className="settings-grid-2">
                <div className="settings-form-group">
                  <label className="settings-label">Assigned OPD Chamber Room</label>
                  <input
                    type="text"
                    className="settings-input"
                    value={profileRoom}
                    onChange={(e) => setProfileRoom(e.target.value)}
                    placeholder="Room #03 - Doctor Chamber"
                  />
                </div>
                <div className="settings-form-group">
                  <label className="settings-label">Max Token Quota per Shift</label>
                  <input
                    type="number"
                    className="settings-input"
                    value={profileMaxTokens}
                    onChange={(e) => setProfileMaxTokens(e.target.value)}
                    placeholder="40"
                  />
                </div>
              </div>

              <div className="settings-grid-2">
                <div className="settings-form-group">
                  <label className="settings-label">Default Prescription Validity</label>
                  <select
                    className="settings-select"
                    value={profileRxValidity}
                    onChange={(e) => setProfileRxValidity(e.target.value)}
                  >
                    <option value="3">3 Days (Acute Illness / SOS)</option>
                    <option value="5">5 Days (Standard Antibiotic Course)</option>
                    <option value="7">7 Days (Standard OPD Routine)</option>
                    <option value="14">14 Days (Extended Recovery)</option>
                    <option value="30">30 Days (Chronic Care / Diabetes)</option>
                  </select>
                </div>
                <div className="settings-form-group" style={{ justifyContent: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginTop: 16 }}>
                    <input
                      type="checkbox"
                      checked={profileEmergencyAlerts}
                      onChange={(e) => setProfileEmergencyAlerts(e.target.checked)}
                      style={{ width: 18, height: 18, accentColor: '#2563eb' }}
                    />
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>
                      Enable High-Priority Audio & Banner Alerts
                    </span>
                  </label>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="settings-actions-bar">
                <button
                  type="button"
                  className="settings-btn-discard"
                  onClick={onDiscardChanges}
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="settings-btn-save"
                  disabled={profileSaving}
                >
                  <md-icon>{profileSaving ? 'hourglass_empty' : 'check'}</md-icon>
                  {profileSaving ? 'Saving...' : 'Save Schedule'}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}
