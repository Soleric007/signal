import Navbar from '@/components/shared/Navbar'
import LeaderboardClient from './LeaderboardClient'

export const metadata = { title: 'Leaderboard — SIGNAL' }

export default function LeaderboardPage() {
  return (
    <div className="relative min-h-screen">
      <div className="mesh-bg">
        <div className="mesh-orb mesh-orb-1" style={{ opacity: 0.06 }} />
        <div className="mesh-orb mesh-orb-2" style={{ opacity: 0.06 }} />
      </div>
      <div className="noise-overlay" />
      <div className="relative z-10">
        <Navbar />
        <div className="pt-14">
          <LeaderboardClient />
        </div>
      </div>
    </div>
  )
}
