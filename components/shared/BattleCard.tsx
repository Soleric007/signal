'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, Clock, TrendingUp, BarChart3, Flame, Zap, Shield, BookOpen, Scale } from 'lucide-react'
import { AGENTS, CATEGORY_CONFIG } from '@/lib/agents'
import { formatTimeLeft, formatNumber } from '@/lib/utils'
import type { AgentId, Category, BattleStatus } from '@/types'

const AGENT_ICONS: Record<AgentId, React.ElementType> = {
  quant: BarChart3, chaos: Flame, optimist: Zap,
  skeptic: Shield, historian: BookOpen, analyst: Scale,
}

interface Props {
  id: string
  topic: string
  category: Category
  status: BattleStatus
  closes_at: string
  vote_count: number
  view_count: number
  leadingAgent?: AgentId
  leadingConfidence?: number
  index?: number
}

export default function BattleCard({
  id, topic, category, status, closes_at,
  vote_count, leadingAgent = 'analyst',
  leadingConfidence = 62, index = 0,
}: Props) {
  const cat = CATEGORY_CONFIG[category]
  const agent = AGENTS[leadingAgent]
  const Icon = AGENT_ICONS[leadingAgent]
  const isLive = status === 'live'
  const isResolved = status === 'resolved'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22,1,0.36,1] }}
    >
      <Link href={`/battle/${id}`}>
        <div
          className="group relative overflow-hidden rounded-2xl p-5 cursor-pointer transition-all duration-300"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget
            el.style.background = 'rgba(255,255,255,0.05)'
            el.style.borderColor = `${agent.color}30`
            el.style.transform = 'translateY(-2px)'
            el.style.boxShadow = `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${agent.color}15`
          }}
          onMouseLeave={e => {
            const el = e.currentTarget
            el.style.background = 'rgba(255,255,255,0.03)'
            el.style.borderColor = 'rgba(255,255,255,0.07)'
            el.style.transform = 'translateY(0)'
            el.style.boxShadow = ''
          }}
        >
          {/* Ambient glow on hover */}
          <div
            className="absolute top-0 right-0 w-40 h-40 pointer-events-none rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `radial-gradient(circle, ${agent.color}12 0%, transparent 70%)`,
              transform: 'translate(30%, -30%)',
            }}
          />

          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span
                className="pill text-xs"
                style={{ background: `${cat.color}15`, color: cat.color, border: `1px solid ${cat.color}25` }}
              >
                {cat.icon} {cat.label}
              </span>
              {isLive && (
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" style={{ boxShadow: '0 0 4px #4ade80' }} />
                  <span className="text-xs font-bold text-green-400">LIVE</span>
                </div>
              )}
              {isResolved && (
                <span className="pill text-xs" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  RESOLVED
                </span>
              )}
            </div>
          </div>

          {/* Topic */}
          <h3 className="font-display font-bold text-white/90 text-sm leading-snug mb-4 line-clamp-2 group-hover:text-white transition-colors">
            {topic}
          </h3>

          {/* Leading agent */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center"
                  style={{ background: `${agent.color}15` }}
                >
                  <Icon className="w-3 h-3" style={{ color: agent.color }} />
                </div>
                <span className="text-xs font-semibold" style={{ color: agent.color }}>
                  {agent.name}
                </span>
                <span className="text-xs text-white/25">leading</span>
              </div>
              <span className="text-sm font-display font-bold" style={{ color: agent.color }}>
                {leadingConfidence}%
              </span>
            </div>
            <div className="conf-track">
              <motion.div
                className="conf-fill"
                initial={{ width: 0 }}
                animate={{ width: `${leadingConfidence}%` }}
                transition={{ delay: index * 0.06 + 0.3, duration: 0.9, ease: 'easeOut' }}
                style={{
                  background: `linear-gradient(90deg, ${agent.color}70, ${agent.color})`,
                  boxShadow: `0 0 8px ${agent.color}50`,
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 text-xs text-white/30">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {formatNumber(vote_count)}
            </span>
            {!isResolved && (
              <span className="flex items-center gap-1 ml-auto">
                <Clock className="w-3 h-3" />
                {formatTimeLeft(closes_at)}
              </span>
            )}
            <span className="ml-auto flex items-center gap-1 text-violet-400/60 group-hover:text-violet-400 transition-colors">
              <TrendingUp className="w-3 h-3" />
              View battle
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
