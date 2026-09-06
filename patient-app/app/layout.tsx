import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Sans, Public_Sans } from 'next/font/google'
import { MaterialWebLoader } from '@/components/material-web-loader'
import './globals.css'

const fontSans = IBM_Plex_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const fontPublicSans = Public_Sans({
  weight: ['400', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-public-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SwasthyaQ | Rural Health by Voice',
  description: 'Public health delivery platform by voice, appointments, prescriptions and clinic queue tracking.',
}

export const viewport: Viewport = {
  themeColor: '#faf8ff',
  userScalable: false,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontPublicSans.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem("theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}` }} />
      </head>
      <body><MaterialWebLoader />{children}</body>
    </html>
  )
}
