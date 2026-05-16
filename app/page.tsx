import Link from 'next/link'
import { Suspense } from 'react'
import Navbar from '@/components/shared/Navbar'
import HeroSection from '@/components/landing/HeroSection'
import LiveBattlesTicker from '@/components/landing/LiveBattlesTicker'
import FeaturedBattles from '@/components/landing/FeaturedBattles'
import AgentsShowcase from '@/components/landing/AgentsShowcase'
import HowItWorks from '@/components/landing/HowItWorks'
import Footer from '@/components/landing/Footer'

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      {/* Animated mesh background */}
      <div className="mesh-bg">
        <div className="mesh-orb mesh-orb-1" />
        <div className="mesh-orb mesh-orb-2" />
        <div className="mesh-orb mesh-orb-3" />
      </div>

      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Scan line */}
      <div className="scan-line" />

      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <LiveBattlesTicker />
        <FeaturedBattles />
        <AgentsShowcase />
        <HowItWorks />
        <Footer />
      </div>
    </div>
  )
}
