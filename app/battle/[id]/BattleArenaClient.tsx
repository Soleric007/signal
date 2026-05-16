'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Users, Share2, Zap, CheckCircle2, Brain, Flame, BarChart3, Shield, BookOpen, Scale } from 'lucide-react'
import { AGENTS, AGENT_LIST } from '@/lib/agents'
import { formatNumber, getSessionId } from '@/lib/utils'
import type { AgentId, BattleMessage } from '@/types'

const AGENT_ICONS: Record<AgentId, React.ElementType> = {
  quant: BarChart3, chaos: Flame, optimist: Zap,
  skeptic: Shield, historian: BookOpen, analyst: Scale,
}

type ChartPoint = { round: number } & Record<string, number>
const INIT: Record<AgentId, number> = { quant: 50, chaos: 50, optimist: 50, skeptic: 50, historian: 50, analyst: 50 }

export default function BattleArenaClient({ battleId }: { battleId: string }) {
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<BattleMessage[]>([])
  const [confidence, setConfidence] = useState<Record<AgentId, number>>({ ...INIT })
  const [chartData, setChartData] = useState<ChartPoint[]>([{ round: 0, ...INIT }])
  const [votes, setVotes] = useState<Record<AgentId, number>>({ quant: 0, chaos: 0, optimist: 0, skeptic: 0, historian: 0, analyst: 0 })
  const [userVote, setUserVote] = useState<AgentId | null>(null)
  const [thinkingAgent, setThinkingAgent] = useState<AgentId | null>(null)
  const [round, setRound] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [voteCount, setVoteCount] = useState(0)
  const feedRef = useRef<HTMLDivElement>(null)
  const topicRef = useRef('')
  const messagesRef = useRef<BattleMessage[]>([])
  const hasStarted = useRef(false)

  useEffect(() => { topicRef.current = topic }, [topic])
  useEffect(() => { messagesRef.current = messages }, [messages])
  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight
  }, [messages, thinkingAgent])

  // Load real battle data from Supabase
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`/api/battles/${battleId}`)
        const data = await res.json()

        if (data.battle?.topic) {
          setTopic(data.battle.topic)
          topicRef.current = data.battle.topic
        }

        if (data.votes) {
          const tally: Record<AgentId, number> = { quant: 0, chaos: 0, optimist: 0, skeptic: 0, historian: 0, analyst: 0 }
          Object.entries(data.votes).forEach(([k, v]) => { tally[k as AgentId] = v as number })
          setVotes(tally)
          setVoteCount(Object.values(tally).reduce((a, b) => a + b, 0))
        }

        // If messages already exist (battle was resumed), load them
        if (data.messages?.length > 0) {
          setMessages(data.messages)
          messagesRef.current = data.messages
          const conf = { ...INIT }
          data.messages.forEach((m: BattleMessage) => { conf[m.agent_id] = m.confidence })
          setConfidence(conf)
          setRound(Math.max(...data.messages.map((m: BattleMessage) => m.round)))
          hasStarted.current = true
        }
      } catch (e) {
        console.error('Load battle error:', e)
      }
      setLoading(false)
    }
    load()
  }, [battleId])

  // Auto-start debate once topic loaded and no existing messages
  useEffect(() => {
    if (!loading && topicRef.current && messagesRef.current.length === 0 && !hasStarted.current) {
      hasStarted.current = true
      const t = setTimeout(startBattle, 700)
      return () => clearTimeout(t)
    }
  }, [loading])

  async function startBattle() {
    if (isRunning) return
    setIsRunning(true)
    const order: AgentId[] = ['quant', 'optimist', 'chaos', 'skeptic', 'historian', 'analyst']
    for (let i = 0; i < order.length; i++) {
      await runTurn(order[i], i + 1)
      if (i < order.length - 1) await sleep(500)
    }
    setIsRunning(false)
  }

  async function runTurn(agentId: AgentId, r: number) {
    setThinkingAgent(agentId)
    await sleep(900 + Math.random() * 700)

    const ctx = messagesRef.current
      .map(m => `${AGENTS[m.agent_id].name}: ${m.content} [Confidence: ${m.confidence}%]`)
      .join('\n')

    const t = topicRef.current
    if (!t) { setThinkingAgent(null); return }

    try {
      const res = await fetch('/api/battles/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ battleId, agentId, topic: t, context: ctx, round: r }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (!data.content) throw new Error('No content')
      addMsg(agentId, data.content, data.confidence ?? 50, r)
    } catch (err) {
      console.error(`${agentId} turn failed:`, err)
      const fb = FALLBACKS[agentId]
      addMsg(agentId, fb.content, fb.confidence, r)
    }
    setThinkingAgent(null)
  }

  function addMsg(agentId: AgentId, content: string, conf: number, r: number) {
    const msg: BattleMessage = {
      id: `${Date.now()}-${agentId}`,
      battle_id: battleId,
      agent_id: agentId,
      content,
      confidence: conf,
      round: r,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => { const u = [...prev, msg]; messagesRef.current = u; return u })
    setConfidence(prev => {
      const u = { ...prev, [agentId]: conf }
      setChartData(d => [...d, { round: r, ...u }])
      return u
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
          className="w-10 h-10 rounded-full border-2 border-violet-500/60 border-t-violet-400 mx-auto mb-4" />
        <p className="text-white/30 text-sm">Loading battle...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen px-4 py-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="live-badge"><span className="live-pulse" />LIVE</span>
          <span className="text-xs text-white/35 font-mono">Round {round}/6</span>
          {isRunning && <span className="text-xs text-white/25 animate-pulse">· AI debating...</span>}
        </div>
        <h1 className="font-display text-2xl md:text-4xl font-extrabold text-white leading-tight mb-3 max-w-3xl">
          {topic || '...'}
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="glass-pill">
            <Users className="w-3 h-3 text-white/35" />
            <span className="text-xs text-white/45">{formatNumber(voteCount)} votes</span>
          </div>
          {messages.length > 0 && (
            <div className="glass-pill" style={{ borderColor: `${leader.color}35` }}>
              <TrendingUp className="w-3 h-3" style={{ color: leader.color }} />
              <span className="text-xs font-semibold" style={{ color: leader.color }}>
                {leader.name} · {confidence[leader.id]}%
              </span>
            </div>
          )}
          <button onClick={() => {
            if (navigator.share) navigator.share({ title: 'SIGNAL Battle', url: window.location.href })
            else navigator.clipboard.writeText(window.location.href)
          }} className="glass-pill ml-auto cursor-pointer">
            <Share2 className="w-3 h-3 text-white/35" />
            <span className="text-xs text-white/35">Share</span>
          </button>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Debate feed */}
        <div className="lg:col-span-7 glass-card flex flex-col" style={{ minHeight: '70vh' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-semibold text-white/75">Live Debate</span>
            </div>
            <span className="text-xs text-white/25 font-mono">{messages.length}/6</span>
          </div>
          <div ref={feedRef} className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => <MessageBubble key={msg.id} msg={msg} />)}
            </AnimatePresence>
            <AnimatePresence>
              {thinkingAgent && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-3">
                  <AgentAvatar agentId={thinkingAgent} />
                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '10px 14px' }}>
                    <div className="flex items-center gap-1.5">
                      {[0,1,2].map(i => (
                        <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
                          style={{ background: AGENTS[thinkingAgent].color }}
                          animate={{ scale: [0.4, 1, 0.4], opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {messages.length === 0 && !thinkingAgent && (
              <div className="flex flex-col items-center justify-center h-48 text-white/15">
                <Zap className="w-8 h-8 mb-2" />
                <p className="text-sm">Summoning analysts...</p>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-5 flex flex-col gap-4">

          {/* Chart */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-semibold text-white/75">Confidence Arc</span>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <defs>
                  {AGENT_LIST.map(a => (
                    <linearGradient key={a.id} id={`grad-${a.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={a.color} stopOpacity={0.28} />
                      <stop offset="100%" stopColor={a.color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <XAxis dataKey="round" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.2)' }} />
                <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.2)' }} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: 'rgba(8,8,16,0.97)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 11, color: '#fff' }} />
                {AGENT_LIST.map(a => <Area key={a.id} type="monotone" dataKey={a.id} stroke={a.color} fill={`url(#grad-${a.id})`} strokeWidth={1.5} dot={false} />)}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Rankings */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-semibold text-white/75">Live Rankings</span>
            </div>
            <div className="space-y-3">
              {sorted.map((agent, i) => {
                const Icon = AGENT_ICONS[agent.id]
                const conf = confidence[agent.id]
                return (
                  <div key={agent.id}>
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className="text-xs text-white/20 w-3 font-mono">{i+1}</span>
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${agent.color}15`, border: `1px solid ${agent.color}25` }}>
                        <Icon className="w-3 h-3" style={{ color: agent.color }} />
                      </div>
                      <span className="text-xs font-semibold text-white/75 flex-1 truncate">{agent.name}</span>
                      <motion.span key={conf} initial={{ scale: 1.15 }} animate={{ scale: 1 }}
                        className="text-sm font-display font-bold" style={{ color: agent.color }}>
                        {conf}%
                      </motion.span>
                    </div>
                    <div className="ml-8 h-0.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full"
                        animate={{ width: `${conf}%` }} transition={{ duration: 0.9, ease: 'easeOut' }}
                        style={{ background: `linear-gradient(90deg, ${agent.color}60, ${agent.color})`, boxShadow: `0 0 6px ${agent.color}50` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Vote */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-semibold text-white/75">Who do you trust?</span>
            </div>
            <p className="text-xs text-white/30 mb-4">
              {userVote ? `✓ You backed ${AGENTS[userVote].name}` : 'Pick the most convincing analyst'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {AGENT_LIST.map(agent => {
                const Icon = AGENT_ICONS[agent.id]
                const pct = totalVotes > 0 ? Math.round((votes[agent.id] / totalVotes) * 100) : 0
                const voted = userVote === agent.id
                return (
                  <button key={agent.id} onClick={() => handleVote(agent.id)} disabled={!!userVote}
                    className="relative overflow-hidden rounded-xl border text-left transition-all duration-150"
                    style={{
                      borderColor: voted ? agent.color : 'rgba(255,255,255,0.07)',
                      background: voted ? `${agent.color}12` : 'rgba(255,255,255,0.02)',
                    }}>
                    {userVote && (
                      <motion.div className="absolute inset-y-0 left-0 rounded-xl"
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        style={{ background: `${agent.color}0e` }} />
                    )}
                    <div className="relative flex items-center gap-2 p-2.5">
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: agent.color }} />
                      <span className="text-xs font-semibold text-white/60 truncate">{agent.name.replace('The ', '')}</span>
                      {userVote && <span className="ml-auto text-xs font-bold" style={{ color: agent.color }}>{pct}%</span>}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .glass-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
        .glass-pill { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 100px; }
        .live-badge { display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; background: rgba(74,222,128,0.09); border: 1px solid rgba(74,222,128,0.22); border-radius: 100px; font-size: 11px; font-weight: 700; color: #4ade80; letter-spacing: .06em; }
        .live-pulse { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; box-shadow: 0 0 6px #4ade80; animation: pulse 2s infinite; display: inline-block; }
        .scrollbar-thin::-webkit-scrollbar { width: 3px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
      `}</style>
    </div>
  )
}

function MessageBubble({ msg }: { msg: BattleMessage }) {
  const agent = AGENTS[msg.agent_id]
  const Icon = AGENT_ICONS[msg.agent_id]
  return (
    <motion.div initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="flex items-start gap-3">
      <AgentAvatar agentId={msg.agent_id} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold" style={{ color: agent.color }}>{agent.name}</span>
          <span className="text-xs text-white/22">{agent.title}</span>
          <div className="ml-auto flex items-center gap-1">
            <TrendingUp className="w-2.5 h-2.5" style={{ color: agent.color }} />
            <span className="text-xs font-display font-bold" style={{ color: agent.color }}>{msg.confidence}%</span>
          </div>
        </div>
        <div className="relative p-3.5 rounded-2xl rounded-tl-sm text-sm text-white/82 leading-relaxed"
          style={{ background: `linear-gradient(135deg, ${agent.color}0e, rgba(255,255,255,0.025))`, border: `1px solid ${agent.color}18` }}>
          <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full"
            style={{ background: agent.color, boxShadow: `0 0 5px ${agent.color}` }} />
          {msg.content}
        </div>
        <div className="mt-1.5 h-px bg-white/5 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${msg.confidence}%` }}
            transition={{ delay: 0.2, duration: 0.7 }} className="h-full"
            style={{ background: `linear-gradient(90deg, ${agent.color}45, ${agent.color})`, boxShadow: `0 0 4px ${agent.color}60` }} />
        </div>
      </div>
    </motion.div>
  )
}

function AgentAvatar({ agentId }: { agentId: AgentId }) {
  const agent = AGENTS[agentId]
  const Icon = AGENT_ICONS[agentId]
  return (
    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: `radial-gradient(circle at 30% 30%, ${agent.color}25, ${agent.color}0a)`, border: `1px solid ${agent.color}25` }}>
      <Icon className="w-3.5 h-3.5" style={{ color: agent.color }} />
    </div>
  )
}

const FALLBACKS: Record<AgentId, { content: string; confidence: number }> = {
  quant:     { content: "Base rate analysis gives 44% probability. Historical precedent is mixed and the data isn't conclusive either way.", confidence: 44 },
  chaos:     { content: "Everyone is pricing this wrong. The crowd is focused on the obvious signal while the real move builds in the background.", confidence: 78 },
  optimist:  { content: "The fundamentals strongly support this. People always underestimate positive momentum at this exact stage.", confidence: 85 },
  skeptic:   { content: "I see speculation and hope, not evidence. Show me the data before I assign any real probability here.", confidence: 26 },
  historian: { content: "This pattern appeared three times in 30 years. Each time the outcome rhymed. History is speaking clearly.", confidence: 54 },
  analyst:   { content: "Bull 40%, neutral 35%, bear 25%. Weighted probability: 57%. Lean yes, but real uncertainty remains.", confidence: 57 },
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }
