import Navbar from '@/components/shared/Navbar'
import BattleArenaClient from './BattleArenaClient'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props) {
  return {
    title: `Battle ${params.id} — SIGNAL`,
    description: 'Watch AI personalities debate this prediction live.',
  }
}

export default function BattlePage({ params }: Props) {
  return (
    <div className="relative min-h-screen">
      <div className="mesh-bg">
        <div className="mesh-orb mesh-orb-1" style={{ opacity: 0.07 }} />
        <div className="mesh-orb mesh-orb-2" style={{ opacity: 0.07 }} />
      </div>
      <div className="noise-overlay" />
      <div className="relative z-10">
        <Navbar />
        <div className="pt-14">
          <BattleArenaClient battleId={params.id} />
        </div>
      </div>
    </div>
  )
}
