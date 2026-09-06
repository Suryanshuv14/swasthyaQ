'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'

export type PatientTab = 'home' | 'appointments' | 'medicines' | 'notifications'

interface NavItem {
  id: PatientTab
  href: string
  icon: string
  labelKey: 'navHome' | 'navAppointments' | 'navMedicines' | 'navNotifications'
  badge?: number | boolean
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', href: '/home', icon: 'home', labelKey: 'navHome' },
  { id: 'appointments', href: '/appointments', icon: 'calendar_today', labelKey: 'navAppointments' },
  { id: 'medicines', href: '/medicines', icon: 'medication', labelKey: 'navMedicines' },
  { id: 'notifications', href: '/notifications', icon: 'notifications', labelKey: 'navNotifications', badge: 2 },
]

export function BottomNav() {
  const pathname = usePathname()
  const { t } = useLanguage()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-xl border-t border-outline-variant/30 shadow-[0_-2px_12px_rgba(0,0,0,0.04)] pb-safe">
      <div className="max-w-md mx-auto h-16 px-2 flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === '/home' && pathname === '/') ||
            (item.id === 'medicines' && pathname === '/prescriptions') ||
            pathname.startsWith(item.href)

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition-all duration-150 select-none ${
                isActive
                  ? 'text-primary font-bold'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              <div
                className={`relative flex items-center justify-center w-12 h-7 rounded-full transition-all ${
                  isActive ? 'bg-secondary-container text-primary font-black scale-105 shadow-xs' : 'text-secondary'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={isActive ? { fontVariationSettings: "'FILL' 1, 'wght' 700" } : {}}
                >
                  {item.icon}
                </span>
                {item.badge && (
                  <span className="absolute -top-1 -right-0.5 w-4 h-4 rounded-full bg-error text-on-error text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {typeof item.badge === 'number' ? item.badge : ''}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-0.5 tracking-tight ${isActive ? 'font-bold text-primary' : 'font-medium'}`}>
                {t[item.labelKey]}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
