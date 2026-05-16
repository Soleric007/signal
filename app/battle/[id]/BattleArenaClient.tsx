'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  TrendingUp, Users, Share2, Zap, CheckCircle2,
  Brain, Flame, BarChart3, Shield, BookOpen, Scale
} from 'lucide-react'
import { AGENTS, AGENT_LIST } from '@/lib/agents'
import { formatNumber, getSessionId } from '@/lib/utils'
import type { AgentId, BattleMessage } from '@/types'

const DEMO_TOPICS: Record<string, string> = {
  'battle-1': 'Will Bitcoin hit $150k before September 2025?',
  'battle-2': 'Will Apple release AI glasses in 2025?',
  'battle-3': 'Will AI replace junior developers by 2027?',
  'battle-4': 'Will Elon Musk leave X/Twitter by end of 2025?',
  'battle-5': 'Will a major US bank collapse in 2025?',
  'battle-6': 'Will GPT-5 be released before summer 2025?',
}

// Icon map replacing emojis
const AGENT_ICONS: Record<AgentId, React.ElementType> = {
  quant: BarChart3,
  chaos: Flame,
  optimist: Zap,
  skeptic: Shield,
  historian: BookOpen,
  analyst: Scale,
}

type ChartPoint = { round: number } & Record<string, number>

const INIT: Record<AgentId, number> = {
  quant: 55, chaos: 75, optimist: 80, skeptic: 30, historian: 50, analyst: 58
}

export default function BattleArenaClient({ battleId }: { battleId: string }) {
  const [topic, setTopic] = useState(DEMO_TOPICS[battleId] || '')
  const [messages, setMessages] = useState<BattleMessage[]>([])
  const [confidence, setConfidence] = useState<Record<AgentId, number>>({ ...INIT })
  const [chartData, setChartData] = useState<ChartPoint[]>([{ round: 0, ...INIT }])
  const [votes, setVotes] = useState<Record<AgentId, number>>({
    quant: 128, chaos: 89, optimist: 203, skeptic: 67, historian: 95, analyst: 142
  })
  const [userVote, setUserVote] = useState<AgentId | null>(null)
  const [thinkingAgent, setThinkingAgent] = useState<AgentId | null>(null)
  const [round, setRound] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [voteCount, setVoteCount] = useState(724)
  const [activeTab, setActiveTab] = useState<'debate' | 'chart' | 'vote'>('debate')
  const feedRef = useRef<HTMLDivElement>(null)

  // Load topic from DB or URL
  useEffect(() => {
    if (!DEMO_TOPICS[battleId]) {
      fetch(`/api/battles/${battleId}`)
        .then(r => r.json())
        .then(d => { if (d.battle?.topic) setTopic(d.battle.topic) })
        .catch(() => {})
    }
    const timer = setTimeout(startBattle, 1200)
    return () => clearTimeout(timer)
  }, [battleId])

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight
    }
  }, [messages, thinkingAgent])

  async function startBattle() {
    if (isRunning) return
    setIsRunning(true)
    const order: AgentId[] = ['quant', 'optimist', 'chaos', 'skeptic', 'historian', 'analyst']
    for (let i = 0; i < order.length; i++) {
      await runTurn(order[i], i + 1)
      if (i < order.length - 1) await sleep(600)
    }
    setIsRunning(false)
  }

  async function runTurn(agentId: AgentId, r: number) {
    setThinkingAgent(agentId)
    await sleep(1000 + Math.random() * 800)
    const context = messages
      .map(m => `${AGENTS[m.agent_id].name}: ${m.content} [Confidence: ${m.confidence}%]`)
      .join('\n')
    try {
      const res = await fetch('/api/battles/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          battleId, agentId,
          topic: topic || DEMO_TOPICS[battleId] || 'AI prediction battle',
          context, round: r
        }),
      })
      const data = await res.json()
      addMsg(agentId, data.content, data.confidence, r)
    } catch {
      addMsg(agentId, getFallback(agentId).content, getFallback(agentId).confidence, r)
    }
    setThinkingAgent(null)
  }

  function addMsg(agentId: AgentId, content: string, conf: number, r: number) {
    const msg: BattleMessage = {
      id: `msg-${Date.now()}-${agentId}`,
      battle_id: battleId,
      agent_id: agentId,
      content,
      confidence: conf,
      round: r,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, msg])
    setConfidence(prev => {
      const updated = { ...prev, [agentId]: conf }
      setChartData(d => [...d, { round: r, ...updated }])
      return updated
    })
    setRound(r)
  }

  async function handleVote(agentId: AgentId) {
    if (userVote) return
    setUserVote(agentId)
    setVotes(v => ({ ...v, [agentId]: v[agentId] + 1 }))
    setVoteCount(c => c + 1)
    try {
      await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ battleId, agentId, session: getSessionId() }),
      })
    } catch {}
  }

  const sorted = [...AGENT_LIST].sort((a, b) => confidence[b.id] - confidence[a.id])
  const leader = sorted[0]
  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen px-4 py-6 max-w-7xl mx-auto">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="live-badge">
            <span className="live-dot-sm" />
            LIVE
          </span>
          <span className="text-xs text-white/40 font-mono">Round {round}/6</span>
          {isRunning && (
            <span className="text-xs text-white/40 font-mono animate-pulse">· AI thinking...</span>
          )}
        </div>

        <h1 className="font-display text-2xl md:text-4xl font-extrabold text-white leading-tight mb-3 max-w-3xl">
          {topic || <span className="text-white/30">Loading...</span>}
        </h1>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="glass-pill">
            <Users className="w-3 h-3 text-white/50" />
            <span className="text-xs text-white/60">{formatNumber(voteCount)} votes</span>
          </div>
          <div className="glass-pill" style={{ borderColor: `${leader.color}40` }}>
            <TrendingUp className="w-3 h-3" style={{ color: leader.color }} />
            <span className="text-xs font-semibold" style={{ color: leader.color }}>
              {leader.name} leading · {confidence[leader.id]}%
            </span>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="glass-pill ml-auto hover:border-white/20 transition-colors cursor-pointer"
          >
            <Share2 className="w-3 h-3 text-white/50" />
            <span className="text-xs text-white/50">Share</span>
          </button>
        </div>
      </div>

      {/* ── BENTO GRID LAYOUT ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* ── LEFT: Debate Feed (hero tile) ─────────────── */}
        <div className="lg:col-span-7 glass-card flex flex-col" style={{ minHeight: '70vh' }}>
          {/* Card header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-semibold text-white/80">Live Debate</span>
            </div>
            <span className="text-xs text-white/30 font-mono">{messages.length} arguments</span>
          </div>

          {/* Feed */}
          <div ref={feedRef} className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <MessageBubble key={msg.id} msg={msg} index={i} />
              ))}
            </AnimatePresence>

            {/* Thinking indicator */}
            <AnimatePresence>
              {thinkingAgent && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3"
                >
                  <AgentAvatar agentId={thinkingAgent} size="sm" />
                  <div className="glass-bubble px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: AGENTS[thinkingAgent].color }}
                          animate={{ scale: [0.5, 1, 0.5], opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {messages.length === 0 && !thinkingAgent && (
              <div className="flex flex-col items-center justify-center h-40 text-white/20">
                <Zap className="w-8 h-8 mb-2" />
                <p className="text-sm">Battle loading...</p>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN ─────────────────────────────── */}
        <div className="lg:col-span-5 flex flex-col gap-4">

          {/* Mobile tab switcher */}
          <div className="lg:hidden flex gap-1 glass-card p-1">
            {(['debate', 'chart', 'vote'] as const).map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                  activeTab === t ? 'bg-white/10 text-white' : 'text-white/40'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Confidence Chart */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-semibold text-white/80">Confidence Arc</span>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <defs>
                  {AGENT_LIST.map(a => (
                    <linearGradient key={a.id} id={`g-${a.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={a.color} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={a.color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <XAxis dataKey="round" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.2)' }} />
                <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.2)' }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(10,10,20,0.95)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    fontSize: '11px',
                    color: '#fff',
                  }}
                />
                {AGENT_LIST.map(a => (
                  <Area
                    key={a.id}
                    type="monotone"
                    dataKey={a.id}
                    stroke={a.color}
                    fill={`url(#g-${a.id})`}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 3, strokeWidth: 0 }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Agent rankings */}
          <div className="glass-card p-5 flex-1">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-semibold text-white/80">Rankings</span>
            </div>
            <div className="space-y-3">
              {sorted.map((agent, i) => {
                const Icon = AGENT_ICONS[agent.id]
                const conf = confidence[agent.id]
                return (
                  <div key={agent.id} className="group">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-xs text-white/25 font-mono w-4">
                        {i + 1}
                      </span>
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${agent.color}20`, border: `1px solid ${agent.color}30` }}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color: agent.color }} />
                      </div>
                      <span className="text-xs font-semibold text-white/80 flex-1">{agent.name}</span>
                      <motion.span
                        key={conf}
                        initial={{ scale: 1.3, color: agent.color }}
                        animate={{ scale: 1 }}
                        className="text-sm font-display font-bold"
                        style={{ color: agent.color }}
                      >
                        {conf}%
                      </motion.span>
                    </div>
                    <div className="ml-7 h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        animate={{ width: `${conf}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        style={{
                          background: `linear-gradient(90deg, ${agent.color}90, ${agent.color})`,
                          boxShadow: `0 0 8px ${agent.color}60`,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Vote card */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-semibold text-white/80">Who do you trust?</span>
            </div>
            <p className="text-xs text-white/30 mb-4">
              {userVote
                ? `✓ You voted for ${AGENTS[userVote].name}`
                : 'Cast your vote for the most convincing analyst'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {AGENT_LIST.map(agent => {
                const Icon = AGENT_ICONS[agent.id]
                const pct = Math.round((votes[agent.id] / totalVotes) * 100)
                const isVoted = userVote === agent.id
                return (
                  <button
                    key={agent.id}
                    onClick={() => handleVote(agent.id)}
                    disabled={!!userVote}
                    className="vote-btn group relative overflow-hidden"
                    style={{
                      borderColor: isVoted ? agent.color : 'rgba(255,255,255,0.06)',
                      background: isVoted ? `${agent.color}15` : 'rgba(255,255,255,0.02)',
                    }}
                  >
                    {/* Vote fill bar */}
                    {userVote && (
                      <motion.div
                        className="absolute inset-0 rounded-lg"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        style={{ background: `${agent.color}10`, left: 0, right: 'auto' }}
                      />
                    )}
                    <div className="relative flex items-center gap-2 p-2.5">
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: agent.color }} />
                      <span className="text-xs font-semibold text-white/70 truncate">
                        {agent.name.replace('The ', '')}
                      </span>
                      {userVote && (
                        <span className="ml-auto text-xs font-bold" style={{ color: agent.color }}>
                          {pct}%
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── CSS-in-JS Styles ─────────────────────────────── */}
      <style jsx global>{`
        .glass-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .glass-bubble {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
        }
        .glass-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 100px;
        }
        .live-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 10px;
          background: rgba(74,222,128,0.1);
          border: 1px solid rgba(74,222,128,0.25);
          border-radius: 100px;
          font-size: 11px;
          font-weight: 700;
          color: #4ade80;
          letter-spacing: 0.08em;
        }
        .live-dot-sm {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 6px #4ade8099;
          animation: pulse 2s infinite;
        }
        .vote-btn {
          border: 1px solid;
          border-radius: 12px;
          transition: all 0.15s ease;
          cursor: pointer;
          text-align: left;
        }
        .vote-btn:not(:disabled):hover {
          border-color: rgba(255,255,255,0.15) !important;
          background: rgba(255,255,255,0.05) !important;
          transform: translateY(-1px);
        }
        .vote-btn:disabled {
          cursor: default;
        }
        .scrollbar-thin::-webkit-scrollbar { width: 3px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>
    </div>
  )
}

// ── Message Bubble ──────────────────────────────────────────────────────────────
function MessageBubble({ msg, index }: { msg: BattleMessage; index: number }) {
  const agent = AGENTS[msg.agent_id]
  const Icon = AGENT_ICONS[msg.agent_id]
  const isEven = index % 2 === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-start gap-3"
    >
      <AgentAvatar agentId={msg.agent_id} size="sm" />
      <div className="flex-1 min-w-0">
        {/* Name row */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold" style={{ color: agent.color }}>
            {agent.name}
          </span>
          <span className="text-xs text-white/25">{agent.title}</span>
          <div className="ml-auto flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3" style={{ color: agent.color }} />
            <span className="text-xs font-display font-bold" style={{ color: agent.color }}>
              {msg.confidence}%
            </span>
          </div>
        </div>

        {/* Message bubble */}
        <div
          className="relative p-3.5 rounded-2xl rounded-tl-sm text-sm text-white/85 leading-relaxed"
          style={{
            background: `linear-gradient(135deg, ${agent.color}10 0%, rgba(255,255,255,0.03) 100%)`,
            border: `1px solid ${agent.color}20`,
          }}
        >
          {/* Glow dot */}
          <div
            className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full"
            style={{ background: agent.color, boxShadow: `0 0 6px ${agent.color}` }}
          />
          {msg.content}
        </div>

        {/* Confidence bar */}
        <div className="mt-2 h-px bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${msg.confidence}%` }}
            transition={{ delay: 0.3, duration: 0.7, ease: 'easeOut' }}
            className="h-full"
            style={{
              background: `linear-gradient(90deg, ${agent.color}50, ${agent.color})`,
              boxShadow: `0 0 6px ${agent.color}80`,
            }}
          />
        </div>
      </div>
    </motion.div>
  )
}

// ── Agent Avatar ────────────────────────────────────────────────────────────────
function AgentAvatar({ agentId, size = 'md' }: { agentId: AgentId; size?: 'sm' | 'md' }) {
  const agent = AGENTS[agentId]
  const Icon = AGENT_ICONS[agentId]
  const dim = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'
  const iconDim = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'

  return (
    <div
      className={`${dim} rounded-xl flex items-center justify-center flex-shrink-0`}
      style={{
        background: `radial-gradient(circle at 30% 30%, ${agent.color}30, ${agent.color}10)`,
        border: `1px solid ${agent.color}30`,
        boxShadow: `0 0 12px ${agent.color}20`,
      }}
    >
      <Icon className={iconDim} style={{ color: agent.color }} />
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

function getFallback(id: AgentId) {
  const map: Record<AgentId, { content: string; confidence: number }> = {
    quant:     { content: "Running base rate analysis: 44% probability accounting for macro conditions and historical precedent. The statistical edge is narrow here.", confidence: 44 },
    chaos:     { content: "Everyone's focused on the obvious signals. The real move comes from the blindspot nobody's watching. Fade consensus hard.", confidence: 79 },
    optimist:  { content: "The fundamentals are stronger than the skeptics admit. Adoption curves always surprise to the upside. Full conviction.", confidence: 84 },
    skeptic:   { content: "Where's the actual evidence? I see narrative and hope, not data. Extraordinary claims require extraordinary proof.", confidence: 27 },
    historian: { content: "This pattern has appeared three times in the last 30 years. Each time, the outcome rhymed. History is screaming right now.", confidence: 53 },
    analyst:   { content: "Scenario weighting: 40% bull, 35% base, 25% bear. Net probability lands at 58%. Slight lean yes, but hedges are warranted.", confidence: 58 },
  }
  return map[id]
}
