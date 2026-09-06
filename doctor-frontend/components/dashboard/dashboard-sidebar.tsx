'use client'

import React from 'react'

export interface NavItem<T extends string = string> {
  id: T
  label: string
  icon: string
}

interface DashboardSidebarProps<T extends string = string> {
  collapsed: boolean
  onToggleCollapse: (collapsed: boolean) => void
  sectionTitle?: string
  navItems: NavItem<T>[]
  activeNav: T
  onNavChange: (nav: T) => void
  primaryButton?: {
    icon: string
    label: string
    onClick: () => void
  }
  user: {
    name: string
    roleTitle: string
    avatarUrl?: string
    statusDotColor?: string
    statusTitle?: string
    onProfileClick?: () => void
  }
  onLogout: () => void
}

export function DashboardSidebar<T extends string = string>({
  collapsed,
  onToggleCollapse,
  sectionTitle,
  navItems,
  activeNav,
  onNavChange,
  primaryButton,
  user,
  onLogout,
}: DashboardSidebarProps<T>) {
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 3)
    : 'U'

  return (
    <aside className={collapsed ? 'sidebar collapsed' : 'sidebar'}>
      {/* BRAND / LOGO MORPH HEADER */}
      <div className="brand-wrap">
        <div
          className="brand"
          style={{ cursor: collapsed ? 'pointer' : 'default' }}
          onClick={() => {
            if (collapsed) {
              onToggleCollapse(false)
              localStorage.setItem('swasthyaq_sidebar_collapsed', 'false')
            }
          }}
          title={collapsed ? 'Click to expand sidebar' : undefined}
        >
          <div className="brand-mark">
            <span className="brand-letter">S</span>
            <md-icon className="brand-panel-icon">dock_to_left</md-icon>
          </div>
          {!collapsed && <span>SwasthyaQ</span>}
        </div>

        {!collapsed && (
          <div className="sidebar-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              type="button"
              className="sidebar-icon-btn"
              onClick={() => {
                onToggleCollapse(true)
                localStorage.setItem('swasthyaq_sidebar_collapsed', 'true')
              }}
              title="Collapse sidebar"
            >
              <md-icon style={{ fontSize: 19 }}>dock_to_left</md-icon>
            </button>
          </div>
        )}
      </div>

      {/* OPTIONAL PRIMARY ACTION BUTTON */}
      {primaryButton && (
        <button
          type="button"
          className="sidebar-new-btn"
          onClick={primaryButton.onClick}
          title={collapsed ? primaryButton.label : undefined}
        >
          <md-icon>{primaryButton.icon}</md-icon>
          {!collapsed && <span>{primaryButton.label}</span>}
        </button>
      )}

      {/* SECTION TITLE */}
      {!collapsed && sectionTitle && <p className="nav-section-title">{sectionTitle}</p>}

      {/* NAVIGATION ITEMS */}
      <nav className="nav-list">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={activeNav === item.id ? 'nav-item active' : 'nav-item'}
            onClick={() => onNavChange(item.id)}
            title={collapsed ? item.label : undefined}
          >
            <md-icon>{item.icon}</md-icon>
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* USER PROFILE & LOGOUT FOOTER */}
      <div className="sidebar-bottom">
        <div
          className="sidebar-user-widget"
          onClick={user.onProfileClick}
          style={{
            cursor: user.onProfileClick ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
          title={user.onProfileClick ? `${user.name} — Click to Open Profile Settings` : user.name}
        >
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div className="sidebar-user-avatar">{initials}</div>
            )}
            {user.statusDotColor && (
              <span
                style={{
                  position: 'absolute',
                  bottom: -1,
                  right: -1,
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  background: user.statusDotColor,
                  border: '1.5px solid #ffffff',
                }}
                title={user.statusTitle}
              />
            )}
          </div>

          {!collapsed && (
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user.name}</span>
              <span className="sidebar-user-role">{user.roleTitle}</span>
            </div>
          )}

          {!collapsed && (
            <button
              type="button"
              className="sidebar-logout-btn"
              onClick={(e) => {
                e.stopPropagation()
                onLogout()
              }}
              title="Log Out"
            >
              <md-icon style={{ fontSize: 18 }}>logout</md-icon>
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
