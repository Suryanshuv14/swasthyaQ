'use client'

import React from 'react'
import Link from 'next/link'
import { BrandLogo } from './brand-logo'

interface TopHeaderProps {
  currentLang?: string
  onLanguageToggle?: () => void
  userAvatar?: string
  userName?: string
  logoSrc?: string
  showBack?: boolean
  backHref?: string
  onBack?: () => void
}

export function TopHeader({
  currentLang = 'hi',
  onLanguageToggle,
  userAvatar,
  userName = 'सुनीता देवी',
  logoSrc,
  showBack = false,
  backHref = '/home',
  onBack,
}: TopHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-outline-variant/30 pt-safe">
      <div className="max-w-md mx-auto h-16 px-margin-screen flex items-center justify-between">
        {showBack ? (
          <div className="flex items-center gap-3">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                aria-label="Go Back"
                className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined text-2xl">arrow_back</span>
              </button>
            ) : (
              <Link
                href={backHref}
                aria-label="Go Back"
                className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined text-2xl">arrow_back</span>
              </Link>
            )}
            <div className="flex items-center gap-2">
              <BrandLogo size={32} src={logoSrc} className="w-8 h-8" />
              <span className="font-headline-md text-headline-md text-on-surface font-bold leading-none">
                SwasthyaQ
              </span>
            </div>
          </div>
        ) : (
          <Link href="/home" className="flex items-center gap-2.5 active:opacity-85 transition-opacity">
            <BrandLogo size={36} src={logoSrc} className="w-9 h-9" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-headline-md text-[17px] text-on-surface font-bold leading-none">
                  SwasthyaQ
                </span>
                <span className="font-label-supporting text-[12px] text-primary font-semibold">
                  / स्वास्थ्य-Q
                </span>
              </div>
              <span className="font-label-supporting text-[10px] leading-tight text-secondary">
                Government Rural Tele-Clinic
              </span>
            </div>
          </Link>
        )}

        {/* Right Action: Language Toggle + Profile */}
        <div className="flex items-center gap-2">
          {onLanguageToggle ? (
            <button
              onClick={onLanguageToggle}
              aria-label="Change Language"
              className="h-9 px-3 rounded-full bg-surface-container hover:bg-secondary-container flex items-center justify-center font-label-supporting text-[12px] text-primary font-bold active:scale-95 transition-all shadow-xs"
              type="button"
            >
              {currentLang === 'hi' ? 'EN / English' : 'हिन्दी / Hindi'}
            </button>
          ) : (
            <Link
              href="/language-select"
              aria-label="Change Language"
              className="h-9 px-3 rounded-full bg-surface-container hover:bg-secondary-container flex items-center justify-center font-label-supporting text-[12px] text-primary font-bold active:scale-95 transition-all shadow-xs"
            >
              हिन्दी / EN
            </Link>
          )}

          <div className="relative">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-primary-container/20 shadow-xs"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-sm shadow-xs">
                {userName.charAt(0)}
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-tertiary ring-2 ring-surface flex items-center justify-center">
              <span className="material-symbols-outlined text-on-tertiary text-[7px] font-black" style={{ fontVariationSettings: "'FILL' 1" }}>
                check
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
