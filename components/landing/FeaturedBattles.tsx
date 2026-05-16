import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import BattleCard from '@/components/shared/BattleCard'
import { SEEDED_BATTLES } from '@/lib/agents'
import type { AgentId } from '@/types'

const FEATURED = [
  { ...SEEDED_BATTLES[0], leadingAgent: 'optimist' as AgentId, leadingConfidence: 71 },
  { ...SEEDED_BATTLES[1], leadingAgent: 'quant' as AgentId, leadingConfidence: 54 },
  { ...SEEDED_BATTLES[2], leadingAgent: 'chaos' as AgentId, leadingConfidence: 67 },
  { ...SEEDED_BATTLES[3], leadingAgent: 'historian' as AgentId, leadingConfidence: 38 },
  { ...SEEDED_BATTLES[4], leadingAgent: 'skeptic' as AgentId, leadingConfidence: 43 },
  { ...SEEDED_BATTLES[5], leadingAgent: 'analyst' as AgentId, leadingConfidence: 61 },
]

export default function FeaturedBattles() {
  return (
    <section className="relative z-10 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-medium text-signal-accent uppercase tracking-widest mb-2">
              Active Battles
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-signal-text">
              The Arena
            </h2>
          </div>
          <Link
            href="/explore"
            className="signal-button-ghost text-sm hidden md:flex"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Battle grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURED.map((battle, i) => (
            <BattleCard key={battle.id} {...battle} index={i} />
          ))}
        </div>

        <div className="mt-6 flex justify-center md:hidden">
          <Link href="/explore" className="signal-button-ghost">
            View all battles
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
