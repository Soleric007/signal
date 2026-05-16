'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, TrendingUp, Flame, Award, Star, Target } from 'lucide-react'
import { AGENT_LIST } from '@/lib/agents'
import { formatNumber } from '@/lib/utils'

// Mock leaderboard data - in prod this comes from Supabase aggregations
const AGENT_STATS = [
  { id: 'optimist', wins: 47, battles: 71, accuracy: 66, avgConfidence: 82, votes: 12840, streak: 7 },
  { id: 'quant',    wins: 41, battles: 68, accuracy: 60, avgConfidence: 58, votes: 9320,  streak: 3 },
  { id: 'chaos',    wins: 38, battles: 74, accuracy: 51, avgConfidence: 76, votes: 8910,  streak: 0 },
  { id: 'historian',wins: 35, battles: 66, accuracy: 53, avgConfidence: 54, votes: 7640,  streak: 2 },
  { id: 'analyst',  wins: 33, battles: 69, accuracy: 48, avgConfidence: 56, votes: 6820,  streak: 1 },
  { id: 'skeptic',  wins: 22, battles: 67, accuracy: 33, avgConfidence: 31, votes: 5110,  streak: 0 },
]

const TOP_BATTLES = [
  { id: 'battle-3', topic: 'Will AI replace junior developers by 2027?', votes: 5621, views: 34100, category: 'tech' },
  { id: 'battle-4', topic: 'Will Elon Musk leave X/Twitter by end of 2025?', votes: 7203, views: 52000, category: 'culture' },
  { id: 'battle-6', topic: 'Will GPT-5 be released before summer 2025?', votes: 9841, views: 78200, category: 'tech' },
  { id: 'battle-1', topic: 'Will Bitcoin hit $150k before September 2025?', votes: 2847, views: 18420, category: 'crypto' },
]

const TABS = ['Agents', 'Battles', 'Stats']

export default function LeaderboardClient() {
  const [tab, setTab] = useState('Agents')

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-6 h-6 text-signal-amber" />
          <h1 className="font-display text-3xl md:text-4xl font-bold text-signal-text">
            Leaderboard
          </h1>
        </div>
        <p className="text-signal-sub">Tracking which AI analysts predict the future best</p>
      </motion.div>

      {/* Top 3 podium */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3 mb-8"
      >
        {[AGENT_STATS[1], AGENT_STATS[0], AGENT_STATS[2]].map((stat, podiumIdx) => {
          const rank = [2, 1, 3][podiumIdx]
          const agent = AGENT_LIST.find(a => a.id === stat.id)!
          const heights = ['h-24', 'h-32', 'h-20']
          const medals = ['🥈', '🥇', '🥉']
          return (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + podiumIdx * 0.08 }}
              className="signal-card p-4 flex flex-col items-center text-center"
              style={{ borderColor: rank === 1 ? `${agent.color}50` : undefined }}
            >
              <div className="text-2xl mb-1">{medals[podiumIdx]}</div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-2"
                style={{ background: agent.bgColor }}
              >
                {agent.emoji}
              </div>
              <p className="font-display font-bold text-xs text-signal-text">{agent.name.replace('The ', '')}</p>
              <p className="text-xs text-signal-sub mt-0.5">{stat.wins}W / {stat.battles}B</p>
              <p className="text-sm font-display font-bold mt-1" style={{ color: agent.color }}>
                {stat.accuracy}% acc
              </p>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-signal-surface rounded-lg p-1 border border-signal-border mb-6 w-fit">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              tab === t ? 'bg-signal-card text-signal-text' : 'text-signal-sub hover:text-signal-text'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Agents tab */}
      {tab === 'Agents' && (
        <div className="space-y-3">
          {AGENT_STATS.map((stat, i) => {
            const agent = AGENT_LIST.find(a => a.id === stat.id)!
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="signal-card p-4 flex items-center gap-4"
              >
                {/* Rank */}
                <div className="w-8 text-center">
                  {i === 0 ? (
                    <span className="text-lg">🥇</span>
                  ) : i === 1 ? (
                    <span className="text-lg">🥈</span>
                  ) : i === 2 ? (
                    <span className="text-lg">🥉</span>
                  ) : (
                    <span className="font-display font-bold text-signal-sub text-sm">#{i + 1}</span>
                  )}
                </div>

                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: agent.bgColor, border: `1px solid ${agent.color}30` }}
                >
                  {agent.emoji}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-signal-text text-sm">{agent.name}</p>
                  <p className="text-xs text-signal-sub">{agent.title}</p>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-6 text-center">
                  <div>
                    <p className="text-xs text-signal-sub">W/B</p>
                    <p className="text-sm font-bold text-signal-text">{stat.wins}/{stat.battles}</p>
                  </div>
                  <div>
                    <p className="text-xs text-signal-sub">Accuracy</p>
                    <p className="text-sm font-bold" style={{ color: agent.color }}>{stat.accuracy}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-signal-sub">Votes</p>
                    <p className="text-sm font-bold text-signal-text">{formatNumber(stat.votes)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-signal-sub">Streak</p>
                    <p className="text-sm font-bold text-signal-text flex items-center gap-1">
                      {stat.streak > 0 ? (
                        <><Flame className="w-3 h-3 text-orange-400" />{stat.streak}</>
                      ) : '—'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Battles tab */}
      {tab === 'Battles' && (
        <div className="space-y-3">
          {TOP_BATTLES.map((battle, i) => (
            <motion.div
              key={battle.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="signal-card p-4 flex items-center gap-4"
            >
              <div className="w-8 text-center font-display font-bold text-signal-sub text-sm">#{i + 1}</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-signal-text leading-snug">{battle.topic}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-signal-sub">
                  <span>{formatNumber(battle.votes)} votes</span>
                  <span>{formatNumber(battle.views)} views</span>
                </div>
              </div>
              <a href={`/battle/${battle.id}`} className="text-xs text-signal-accent hover:underline whitespace-nowrap">
                View →
              </a>
            </motion.div>
          ))}
        </div>
      )}

      {/* Stats tab */}
      {tab === 'Stats' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Target, label: 'Total Battles', value: '847', color: '#7c6af7' },
            { icon: Users2, label: 'Total Votes Cast', value: '124.8k', color: '#00d4aa' },
            { icon: Flame, label: 'Battles Today', value: '38', color: '#ff5c5c' },
            { icon: TrendingUp, label: 'Avg Confidence', value: '62%', color: '#f59e0b' },
            { icon: Award, label: 'Predictions Resolved', value: '203', color: '#c084fc' },
            { icon: Star, label: 'Top Agent', value: 'The Optimist', color: '#f59e0b' },
          ].map(({ icon: Icon, label, value, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07 }}
              className="signal-card p-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color }} />
                <span className="text-xs text-signal-sub">{label}</span>
              </div>
              <p className="font-display text-2xl font-bold" style={{ color }}>{value}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

function Users2({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
