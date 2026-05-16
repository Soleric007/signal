'use client'

import { SEEDED_BATTLES, CATEGORY_CONFIG } from '@/lib/agents'

const TICKER_ITEMS = [
  '⚡ Bitcoin $150k battle: 72% YES · 2.8k votes',
  '🔥 AI replaces devs: Skeptic vs Optimist at 61% · 5.6k votes',
  '💥 Apple AI Glasses: Historian leads at 54% · 1.9k votes',
  '🌪️ Chaos Trader predicts black swan event: 89% confidence',
  '📊 Quant says recession 43% likely in 2025',
  '🚀 Optimist leads 6 battles today with 80%+ confidence',
  '📜 Historian draws parallel to 2017 crypto cycle',
  '🔍 Skeptic challenges every single consensus position',
]

export default function LiveBattlesTicker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS]

  return (
    <div className="relative overflow-hidden border-y border-signal-border bg-signal-surface/50 py-2.5">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-signal-surface/50 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-signal-surface/50 to-transparent pointer-events-none" />

      <div className="ticker-wrap">
        <div className="ticker-inner">
          {doubled.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-6 mx-8 text-xs text-signal-sub whitespace-nowrap">
              {item}
              <span className="w-1 h-1 rounded-full bg-signal-muted inline-block" />
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
