import { Suspense } from 'react'
import Navbar from '@/components/shared/Navbar'
import ExploreClient from './ExploreClient'

export const metadata = {
  title: 'Explore Battles — SIGNAL',
}

export default function ExplorePage() {
  return (
    <div className="relative min-h-screen">
      <div className="mesh-bg">
        <div className="mesh-orb mesh-orb-1" style={{ opacity: 0.06 }} />
        <div className="mesh-orb mesh-orb-2" style={{ opacity: 0.06 }} />
      </div>
      <div className="relative z-10">
        <Navbar />
        <div className="pt-14">
          <ExploreClient />
        </div>
      </div>
    </div>
  )
}
