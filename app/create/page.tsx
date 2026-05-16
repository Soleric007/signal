import Navbar from '@/components/shared/Navbar'
import CreateBattleClient from './CreateBattleClient'

export const metadata = { title: 'New Battle — SIGNAL' }

export default function CreatePage() {
  return (
    <div className="relative min-h-screen">
      <div className="mesh-bg">
        <div className="mesh-orb mesh-orb-1" style={{ opacity: 0.08 }} />
      </div>
      <div className="noise-overlay" />
      <div className="relative z-10">
        <Navbar />
        <div className="pt-14">
          <CreateBattleClient />
        </div>
      </div>
    </div>
  )
}
