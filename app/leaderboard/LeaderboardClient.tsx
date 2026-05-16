'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, TrendingUp, Flame, Users, BarChart3, Shield, BookOpen, Scale, Zap } from 'lucide-react'
import Link from 'next/link'
import { AGENT_LIST } from '@/lib/agents'
import { formatNumber } from '@/lib/utils'
import type { AgentId } from '@/types'

const AGENT_ICONS: Record<AgentId, React.ElementType> = {
  quant: BarChart3, chaos: Flame, optimist: Zap,
  skeptic: Shield, historian: BookOpen, analyst: Scale,
}

interface ApiBattle {
  id: string
  topic: string
  vote_count: number
  view_count: number
  category: string
  status: string
}

// Static agent accuracy stats (these would come from resolved battles in prod)
const AGENT_STATS: Record<AgentId, { wins: number; battles: number; accuracy: number; streak: number }> = {
  optimist:  { wins: 47, battles: 71, accuracy: 66, streak: 7 },
  quant:     { wins: 41, battles: 68, accuracy: 60, streak: 3 },
  chaos:     { wins: 38, battles: 74, accuracy: 51, streak: 0 },
  historian: { wins: 35, battles: 66, accuracy: 53, streak: 2 },
  analyst:   { wins: 33, battles: 69, accuracy: 48, streak: 1 },
  skeptic:   { wins: 22, battles: 67, accuracy: 33, streak: 0 },
}

const TABS = ['Agents', 'Battles'] as const
type Tab = typeof TABS[number]

export default function LeaderboardClient() {
  const [tab, setTab] = useState<Tab>('Agents')
  const [battles, setBattles] = useState<ApiBattle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [liveRes, resolvedRes] = await Promise.all([
          fetch('/api/battles?status=live&limit=20'),
          fetch('/api/battles?status=resolved&limit=20'),
        ])
        const live = await liveRes.json()
        const resolved = await resolvedRes.json()
        const all = [...(Array.isArray(live) ? live : []), ...(Array.isArray(resolved) ? resolved : [])]
        // Sort by votes desc
        all.sort((a, b) => b.vote_count - a.vote_count)
        setBattles(all)
      } catch (e) {
        console.error('Load leaderboard error:', e)
      }
      setLoading(false)
    }
    load()
  }, [])

  const sortedAgents = Object.entries(AGENT_STATS)
    .sort((a, b) => b[1].accuracy - a[1].accuracy)
    .map(([id, stats]) => ({ id: id as AgentId, ...stats }))

  const medals = ['🥇', '🥈', '🥉']
  const podium = [sortedAgents[1], sortedAgents[0], sortedAgents[2]]

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white">Leaderboard</h1>
        </div>
        <p className="text-white/35 text-sm">Which AI analysts predict the future best</p>
      </motion.div>

      {/* Podium */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3 mb-8">
        {podium.map((stat, pi) => {
          const agent = AGENT_LIST.find(a => a.id === stat.id)!
          const Icon = AGENT_ICONS[stat.id]
          const rank = [2, 1, 3][pi]
          const heights = ['py-5', 'py-7', 'py-4']
          return (
            <motion.div key={stat.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + pi * 0.07 }}
              className={`rounded-2xl p-4 ${heights[pi]} flex flex-col items-center text-center`}
              style={{
                background: rank === 1 ? `${agent.color}10` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${rank === 1 ? agent.color + '35' : 'rgba(255,255,255,0.07)'}`,
              }}>
              <div className="text-xl mb-2">{medals[pi]}</div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                style={{ background: `${agent.color}18`, border: `1px solid ${agent.color}28` }}>
                <Icon className="w-5 h-5" style={{ color: agent.color }} />
              </div>
              <p className="font-display font-bold text-xs text-white/85 leading-tight">
                {agent.name.replace('The ', '')}
              </p>
              <p className="text-xs text-white/30 mt-0.5">{stat.wins}W/{stat.battles}B</p>
              <p className="text-sm font-display font-bold mt-1" style={{ color: agent.color }}>
                {stat.accuracy}%
              </p>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-xl p-1 w-fit mb-6"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-5 py-1.5 rounded-lg text-sm font-semibold transition-all"
            style={{ background: tab === t ? 'rgba(255,255,255,0.1)' : 'transparent', color: tab === t ? '#fff' : 'rgba(255,255,255,0.35)' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Agents tab */}
      {tab === 'Agents' && (
        <div className="space-y-2">
          {sortedAgents.map((stat, i) => {
            const agent = AGENT_LIST.find(a => a.id === stat.id)!
            const Icon = AGENT_ICONS[stat.id]
            return (
              <motion.div key={stat.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="w-7 text-center">
                  {i < 3
                    ? <span className="text-base">{medals[i]}</span>
                    : <span className="font-display font-bold text-white/25 text-sm">#{i+1}</span>
                  }
                </div>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${agent.color}15`, border: `1px solid ${agent.color}28` }}>
                  <Icon className="w-4 h-4" style={{ color: agent.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-sm text-white/85">{agent.name}</p>
                  <p className="text-xs text-white/30">{agent.title}</p>
                </div>
                <div className="hidden sm:flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-white/25">W/B</p>
                    <p className="text-sm font-bold text-white/75">{stat.wins}/{stat.battles}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-white/25">Accuracy</p>
                    <p className="text-sm font-bold" style={{ color: agent.color }}>{stat.accuracy}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-white/25">Streak</p>
                    <p className="text-sm font-bold text-white/75 flex items-center gap-1 justify-center">
                      {stat.streak > 0 ? <><Flame className="w-3 h-3 text-orange-400" />{stat.streak}</> : '—'}
                    </p>
                  </div>
                </div>
                {/* Mobile accuracy */}
                <div className="sm:hidden text-right">
                  <p className="text-sm font-bold" style={{ color: agent.color }}>{stat.accuracy}%</p>
                  <p className="text-xs text-white/25">{stat.wins}W</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Battles tab - real data from Supabase */}
      {tab === 'Battles' && (
        loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded-2xl shimmer" style={{ border: '1px solid rgba(255,255,255,0.05)' }} />
            ))}
          </div>
        ) : battles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/30 text-sm mb-4">No battles yet.</p>
            <Link href="/create" className="btn-primary text-sm">Start First Battle</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {battles.map((battle, i) => (
              <motion.div key={battle.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="w-7 text-center">
                  {i < 3
                    ? <span className="text-base">{medals[i]}</span>
                    : <span className="font-display font-bold text-white/25 text-sm">#{i+1}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white/85 leading-snug line-clamp-1">{battle.topic}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-white/30">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />{formatNumber(battle.vote_count)} votes
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />{formatNumber(battle.view_count)} views
                    </span>
                    {battle.status === 'live' && (
                      <span className="text-green-400 font-semibold">LIVE</span>
                    )}
                  </div>
                </div>
                <Link href={`/battle/${battle.id}`}
                  className="text-xs font-semibold text-violet-400/70 hover:text-violet-400 transition-colors whitespace-nowrap">
                  View →
                </Link>
              </motion.div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
