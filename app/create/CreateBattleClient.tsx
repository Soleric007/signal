'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Zap, CheckCircle, BarChart3, Flame, Shield, BookOpen, Scale } from 'lucide-react'
import { AGENT_LIST, CATEGORY_CONFIG } from '@/lib/agents'
import type { AgentId, Category } from '@/types'

const AGENT_ICONS: Record<AgentId, React.ElementType> = {
  quant: BarChart3, chaos: Flame, optimist: Zap,
  skeptic: Shield, historian: BookOpen, analyst: Scale,
}

type Step = 'input' | 'summoning' | 'ready'

function CreateInner() {
  const router = useRouter()
  const params = useSearchParams()
  const [topic, setTopic] = useState(params.get('q') || '')
  const [category, setCategory] = useState<Category>('tech')
  const [step, setStep] = useState<Step>('input')
  const [summoned, setSummoned] = useState<number[]>([])
  const [battleId, setBattleId] = useState('')

  async function handleCreate() {
    if (!topic.trim()) return
    setStep('summoning')

    // Stagger agent summoning animations
    for (let i = 0; i < AGENT_LIST.length; i++) {
      await sleep(400 + i * 280)
      setSummoned(p => [...p, i])
    }

    try {
      const res = await fetch('/api/battles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, category }),
      })
      const data = await res.json()
      setBattleId(data.id || 'demo-' + Date.now())
    } catch {
      setBattleId('demo-' + Date.now())
    }

    await sleep(800)
    setStep('ready')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-xl">
        <AnimatePresence mode="wait">

          {/* ── Input step ── */}
          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: [0.22,1,0.36,1] }}
            >
              <div className="text-center mb-10">
                <h1 className="font-display text-4xl md:text-5xl font-extrabold text-white mb-3 leading-tight">
                  Start a Battle
                </h1>
                <p className="text-white/40 text-base">
                  6 AI analysts will debate your prediction in real time
                </p>
              </div>

              <div
                className="p-6 rounded-2xl"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(24px)',
                }}
              >
                {/* Topic */}
                <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
                  Your prediction
                </label>
                <textarea
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="Will AI replace junior developers by 2027?"
                  rows={3}
                  autoFocus
                  className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-violet-500/50 resize-none transition-colors leading-relaxed"
                  onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleCreate() }}
                />
                <p className="text-xs text-white/20 mt-1.5">⌘ + Enter to start</p>

                {/* Category */}
                <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mt-5 mb-2">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(CATEGORY_CONFIG).map(([cat, cfg]) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat as Category)}
                      className="pill text-xs border transition-all"
                      style={category === cat ? {
                        background: `${cfg.color}18`,
                        color: cfg.color,
                        borderColor: `${cfg.color}40`,
                      } : {
                        background: 'rgba(255,255,255,0.03)',
                        color: 'rgba(255,255,255,0.35)',
                        borderColor: 'rgba(255,255,255,0.08)',
                      }}
                    >
                      {cfg.icon} {cfg.label}
                    </button>
                  ))}
                </div>

                {/* Agents preview */}
                <div
                  className="mt-5 p-4 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <p className="text-xs text-white/30 mb-3">Joining this battle:</p>
                  <div className="flex flex-wrap gap-2">
                    {AGENT_LIST.map(a => {
                      const Icon = AGENT_ICONS[a.id]
                      return (
                        <div
                          key={a.id}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
                          style={{
                            background: `${a.color}10`,
                            color: a.color,
                            border: `1px solid ${a.color}25`,
                          }}
                        >
                          <Icon className="w-3 h-3" />
                          {a.name.replace('The ', '')}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <button
                  onClick={handleCreate}
                  disabled={!topic.trim()}
                  className="btn-primary w-full mt-5 py-3.5 text-sm justify-center disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                  Summon the Analysts
                  <Zap className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Summoning step ── */}
          {step === 'summoning' && (
            <motion.div
              key="summoning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.h2
                className="font-display text-3xl font-extrabold text-white mb-2"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                Summoning Analysts...
              </motion.h2>
              <p className="text-white/30 text-sm mb-10 max-w-sm mx-auto line-clamp-2">{topic}</p>

              <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                {AGENT_LIST.map((agent, i) => {
                  const Icon = AGENT_ICONS[agent.id]
                  const isSummoned = summoned.includes(i)
                  return (
                    <AnimatePresence key={agent.id}>
                      {isSummoned ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.6, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                          className="p-4 rounded-2xl flex flex-col items-center gap-2"
                          style={{
                            background: `${agent.color}10`,
                            border: `1px solid ${agent.color}30`,
                          }}
                        >
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{
                              background: `${agent.color}20`,
                              boxShadow: `0 0 16px ${agent.color}30`,
                            }}
                          >
                            <Icon className="w-5 h-5" style={{ color: agent.color }} />
                          </div>
                          <p className="text-xs font-bold text-white/80 leading-tight text-center">
                            {agent.name.replace('The ', '')}
                          </p>
                          <div className="flex gap-0.5">
                            {[0,1,2].map(j => (
                              <span
                                key={j}
                                className="dot-pulse"
                                style={{ background: agent.color, animationDelay: `${j * 0.18}s` }}
                              />
                            ))}
                          </div>
                        </motion.div>
                      ) : (
                        <div className="p-4 rounded-2xl flex flex-col items-center gap-2 opacity-15"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                          <div className="w-10 h-10 rounded-xl shimmer" />
                          <div className="w-12 h-2.5 rounded shimmer" />
                        </div>
                      )}
                    </AnimatePresence>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ── Ready step ── */}
          {step === 'ready' && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22,1,0.36,1] }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 16 }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(124,106,247,0.15)', border: '1px solid rgba(124,106,247,0.35)', boxShadow: '0 0 32px rgba(124,106,247,0.3)' }}
              >
                <CheckCircle className="w-8 h-8 text-violet-400" />
              </motion.div>

              <h2 className="font-display text-3xl font-extrabold text-white mb-2">
                Battle is live!
              </h2>
              <p className="text-white/40 text-sm mb-8">
                All 6 analysts are ready. The debate begins now.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => router.push(`/battle/${battleId}`)}
                  className="btn-primary text-sm px-8 py-3"
                >
                  Enter the Arena
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setTopic(''); setSummoned([]); setBattleId(''); setStep('input') }}
                  className="btn-ghost text-sm px-8 py-3"
                >
                  New Battle
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function CreateBattleClient() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white/30">Loading...</div>}>
      <CreateInner />
    </Suspense>
  )
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }
