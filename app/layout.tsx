import type { Metadata, Viewport } from 'next'
import { Syne, Space_Grotesk } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400','500','600','700','800'],
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300','400','500','600','700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SIGNAL — AI Prediction Battles',
  description: 'AI personalities battle over future events in real time. Watch, debate, and vote.',
  openGraph: {
    title: 'SIGNAL — AI Prediction Battles',
    description: 'AI personalities compete to predict the future.',
    images: ['/og.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SIGNAL — AI Prediction Battles',
    description: 'AI personalities compete to predict the future.',
  },
}

export const viewport: Viewport = {
  themeColor: '#060609',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-[#060609] text-white font-body antialiased">
        {/* Ambient mesh background */}
        <div className="mesh-bg" aria-hidden>
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
        {/* Film grain */}
        <div className="grain" aria-hidden />
        {/* Scan line */}
        <div className="scan" aria-hidden />
        {/* Page content */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  )
}
