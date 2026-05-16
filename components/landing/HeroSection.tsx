'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Zap, TrendingUp, Brain, Flame, BarChart3, Shield, BookOpen, Scale } from 'lucide-react'
import { AGENT_LIST } from '@/lib/agents'
import type { AgentId } from '@/types'

const AGENT_ICONS: Record<AgentId, React.ElementType> = {
  quant: BarChart3, chaos: Flame, optimist: Zap,
  skeptic: Shield, historian: BookOpen, analyst: Scale,
}

const ROTATING_TOPICS = [
  'Bitcoin hit $200k?',
  'AI replace programmers?',
  'Apple release AR glasses?',
  'US recession in 2025?',
  'Musk leave X/Twitter?',
]

const LIVE_STATS = [
  { label: 'Active Battles', value: '847', color: '#7c6af7' },
  { label: 'Votes Today', value: '124k', color: '#00d4aa' },
  { label: 'AI Arguments', value: '5.2k', color: '#f59e0b' },
]

export default function HeroSection() {
  const [topicIdx, setTopicIdx] = useState(0)
  const [input, setInput] = useState('')

  useEffect(() => {
    const t = setInterval(() => setTopicIdx(i => (i + 1) % ROTATING_TOPICS.length), 2800)
    return () => clearInterval(t)
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-16 pb-12 overflow-hidden">

      {/* Grid background */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(124,106,247,0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(124,106,247,0.04) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto">

        {/* ── Live pill ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full"
            style={{
              background: 'rgba(74,222,128,0.08)',
              border: '1px solid rgba(74,222,128,0.2)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" style={{ boxShadow: '0 0 6px #4ade80' }} />
            <span className="text-xs font-semibold text-green-400 tracking-widest">847 BATTLES LIVE</span>
          </div>
        </motion.div>

        {/* ── Hero headline ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="font-display font-extrabold leading-none tracking-tight mb-4"
            style={{ fontSize: 'clamp(3.2rem, 9vw, 8rem)' }}
          >
            <span className="block" style={{
              background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              THE FUTURE
            </span>
            <span className="block" style={{
              background: 'linear-gradient(135deg, #7c6af7 0%, #00d4aa 60%, #f59e0b 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              IS A DEBATE
            </span>
          </h1>
          <p className="text-white/50 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
            6 AI analysts battle over your predictions in real time.
            Watch them argue. Pick your side.
          </p>
        </motion.div>

        {/* ── Input ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="max-w-2xl mx-auto mb-10"
        >
          <div className="relative" style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            backdropFilter: 'blur(20px)',
          }}>
            {/* Gradient border glow */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(124,106,247,0.3), rgba(0,212,170,0.2))',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                padding: '1px',
                borderRadius: '16px',
              }}
            />
            <div className="flex items-center">
              <div className="flex-1 relative px-5 py-4">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && input.trim())
                      window.location.href = `/create?q=${encodeURIComponent(input)}`
                  }}
                  className="w-full bg-transparent text-white placeholder-transparent focus:outline-none text-base"
                  placeholder="Will..."
                />
                {!input && (
                  <div className="absolute inset-0 flex items-center px-5 pointer-events-none">
                    <span className="text-white/30 text-base">Will&nbsp;</span>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={topicIdx}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.25 }}
                        className="text-white/30 text-base"
                      >
                        {ROTATING_TOPICS[topicIdx]}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                )}
              </div>
              <Link
                href={input.trim() ? `/create?q=${encodeURIComponent(input)}` : '/create'}
                className="m-2 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                style={{
                  background: 'linear-gradient(135deg, #7c6af7, #6057e8)',
                  boxShadow: '0 0 20px rgba(124,106,247,0.4)',
                }}
              >
                Battle
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Quick topic pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            {['₿ Bitcoin $200k?', '🤖 AI kills jobs?', '📱 Apple AR?', '📉 Recession?'].map(t => (
              <button
                key={t}
                onClick={() => window.location.href = `/create?q=${encodeURIComponent('Will ' + t.replace(/^.\s/, ''))}`}
                className="px-3 py-1.5 text-xs rounded-full text-white/40 hover:text-white/70 transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                {t}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Bento grid ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="grid grid-cols-12 gap-3 max-w-4xl mx-auto"
        >
          {/* Live stats row */}
          {LIVE_STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.08 }}
              className="col-span-4 bento-tile text-center py-4"
            >
              <p className="font-display text-2xl font-extrabold" style={{ color: s.color }}>
                {s.value}
              </p>
              <p className="text-xs text-white/30 mt-0.5">{s.label}</p>
            </motion.div>
          ))}

          {/* Live battle preview — hero tile */}
          <div className="col-span-8 bento-tile p-4">
            <LiveBattlePreview />
          </div>

          {/* Agent avatars tile */}
          <div className="col-span-4 bento-tile p-4 flex flex-col justify-between">
            <p className="text-xs text-white/40 font-semibold mb-3">6 AI Analysts</p>
            <div className="grid grid-cols-3 gap-2">
              {AGENT_LIST.map((agent) => {
                const Icon = AGENT_ICONS[agent.id]
                return (
                  <div key={agent.id}
                    className="aspect-square rounded-xl flex items-center justify-center"
                    style={{ background: `${agent.color}15`, border: `1px solid ${agent.color}25` }}
                    title={agent.name}
                  >
                    <Icon className="w-4 h-4" style={{ color: agent.color }} />
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-white/25 mt-3 leading-relaxed">
              Each with a unique personality, bias, and reasoning style
            </p>
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        .bento-tile {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          backdrop-filter: blur(16px);
        }
        .bento-tile:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.1);
        }
      `}</style>
    </section>
  )
}

// ── Live preview card ──────────────────────────────────────────────────────────
function LiveBattlePreview() {
  const [confidence, setConfidence] = useState({ optimist: 84, quant: 47, chaos: 71, skeptic: 29 })

  useEffect(() => {
    const t = setInterval(() => {
      setConfidence(prev => ({
        optimist: clamp(prev.optimist + rand(-3, 3), 70, 95),
        quant: clamp(prev.quant + rand(-4, 4), 35, 60),
        chaos: clamp(prev.chaos + rand(-5, 5), 60, 85),
        skeptic: clamp(prev.skeptic + rand(-3, 3), 18, 42),
      }))
    }, 1800)
    return () => clearInterval(t)
  }, [])

  const agents = [
    { id: 'optimist' as AgentId, label: 'Optimist', val: confidence.optimist, color: '#f59e0b', Icon: Zap },
    { id: 'chaos' as AgentId, label: 'Chaos', val: confidence.chaos, color: '#ff5c5c', Icon: Flame },
    { id: 'quant' as AgentId, label: 'Quant', val: confidence.quant, color: '#3b82f6', Icon: BarChart3 },
    { id: 'skeptic' as AgentId, label: 'Skeptic', val: confidence.skeptic, color: '#6b6b8a', Icon: Shield },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" style={{ boxShadow: '0 0 4px #4ade80' }} />
          <span className="text-xs font-bold text-green-400">LIVE</span>
        </div>
        <span className="text-xs text-white/30">Will Bitcoin hit $200k before 2026?</span>
      </div>
      <div className="space-y-2.5">
        {agents.map(({ id, label, val, color, Icon }) => (
          <div key={id}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Icon className="w-3 h-3" style={{ color }} />
                <span className="text-xs text-white/60">{label}</span>
              </div>
              <motion.span
                key={val}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-xs font-bold font-display"
                style={{ color }}
              >
                {val}%
              </motion.span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <motion.div
                className="h-full rounded-full"
                animate={{ width: `${val}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ background: `linear-gradient(90deg, ${color}70, ${color})`, boxShadow: `0 0 6px ${color}60` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function clamp(n: number, min: number, max: number) { return Math.min(max, Math.max(min, n)) }
function rand(min: number, max: number) { return Math.random() * (max - min) + min }
