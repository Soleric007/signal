'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AGENT_LIST } from '@/lib/agents'

export default function AgentsShowcase() {
  const [active, setActive] = useState(0)
  const agent = AGENT_LIST[active]

  return (
    <section className="relative z-10 py-20 px-4 overflow-hidden">
      {/* Background accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${agent.color}08 0%, transparent 70%)`,
          transition: 'background 0.5s ease',
        }}
      />

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-medium text-signal-accent uppercase tracking-widest mb-2">
            Meet The Analysts
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-signal-text">
            6 AI Personalities.
            <span className="text-gradient-accent"> Infinite Opinions.</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Agent tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {AGENT_LIST.map((a, i) => (
              <button
                key={a.id}
                onClick={() => setActive(i)}
                className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                  i === active
                    ? 'border-opacity-60 bg-opacity-10'
                    : 'border-signal-border bg-signal-card hover:border-signal-muted'
                }`}
                style={i === active ? {
                  borderColor: `${a.color}60`,
                  background: `${a.color}10`,
                } : {}}
              >
                <div className="text-2xl mb-1.5">{a.emoji}</div>
                <div className="text-xs font-display font-semibold text-signal-text leading-tight">{a.name}</div>
                <div className="text-xs text-signal-sub mt-0.5">{a.title}</div>
              </button>
            ))}
          </div>

          {/* Agent detail */}
          <AnimatePresence mode="wait">
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="signal-card p-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ background: agent.bgColor, border: `1px solid ${agent.color}30` }}
                >
                  {agent.emoji}
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-signal-text">{agent.name}</h3>
                  <span className="text-sm font-medium" style={{ color: agent.color }}>{agent.title}</span>
                </div>
              </div>

              <p className="text-signal-sub text-sm leading-relaxed mb-4">{agent.personality}</p>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-xs text-signal-sub font-medium min-w-16">Style</span>
                  <span className="text-xs text-signal-text">{agent.style}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs text-signal-sub font-medium min-w-16">Bias</span>
                  <span className="text-xs text-signal-text">{agent.bias}</span>
                </div>
              </div>

              {/* Sample quote */}
              <div
                className="mt-4 p-3 rounded-lg text-xs italic text-signal-sub border"
                style={{
                  borderColor: `${agent.color}20`,
                  background: `${agent.color}08`,
                }}
              >
                {getSampleQuote(agent.id)}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

function getSampleQuote(id: string): string {
  const quotes: Record<string, string> = {
    quant: '"Historical data shows 73% of bull cycles end within 18 months. Current cycle is at month 14. Probability of continuation: 31%."',
    chaos: '"Everyone\'s watching the Fed. Nobody\'s watching the $2T in commercial real estate. That\'s where the next shock comes from."',
    optimist: '"The technology is real, the adoption is accelerating, and we\'re still in the early innings. This is a generational opportunity."',
    skeptic: '"What evidence do we actually have? A few data points and a lot of hope. I\'m not convinced. Show me the receipts."',
    historian: '"In 1999, everyone said \'this time is different.\' In 2008, they said it again. The patterns don\'t lie."',
    analyst: '"Scenario A: 40% probability. Scenario B: 35%. Scenario C: 25%. On balance, I\'d lean toward A, but not without serious hedges."',
  }
  return quotes[id] || ''
}
