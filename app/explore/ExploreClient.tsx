'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Flame, Clock, TrendingUp, Plus } from 'lucide-react'
import Link from 'next/link'
import BattleCard from '@/components/shared/BattleCard'
import { CATEGORY_CONFIG } from '@/lib/agents'
import type { AgentId, Category } from '@/types'

// Shape returned from /api/battles
interface ApiBattle {
  id: string
  topic: string
  category: Category
  status: 'live' | 'resolved' | 'pending'
  closes_at: string
  vote_count: number
  view_count: number
}

const SORT_OPTIONS = [
  { id: 'hot', label: 'Hot', icon: Flame },
  { id: 'new', label: 'New', icon: Clock },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
]

// Rotate through agents for display — purely visual
const LEADING_AGENTS: AgentId[] = ['optimist', 'quant', 'chaos', 'historian', 'skeptic', 'analyst']
const LEADING_CONFS = [71, 54, 67, 52, 43, 61]

export default function ExploreClient() {
  const [battles, setBattles] = useState<ApiBattle[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<Category | 'all'>('all')
  const [sort, setSort] = useState('hot')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        // Load both live and resolved
        const [liveRes, resolvedRes] = await Promise.all([
          fetch('/api/battles?status=live&limit=50'),
          fetch('/api/battles?status=resolved&limit=20'),
        ])
        const live = await liveRes.json()
        const resolved = await resolvedRes.json()
        setBattles([...(Array.isArray(live) ? live : []), ...(Array.isArray(resolved) ? resolved : [])])
      } catch (e) {
        console.error('Load battles error:', e)
      }
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let r = [...battles]
    if (category !== 'all') r = r.filter(b => b.category === category)
    if (search) r = r.filter(b => b.topic.toLowerCase().includes(search.toLowerCase()))
    if (sort === 'hot') r.sort((a, b) => b.vote_count - a.vote_count)
    if (sort === 'new') r.sort((a, b) => new Date(b.closes_at).getTime() - new Date(a.closes_at).getTime())
    if (sort === 'trending') r.sort((a, b) => b.view_count - a.view_count)
    return r
  }, [battles, category, search, sort])

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-end justify-between mb-8 gap-4">
        <div>
          <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-1">Arena</p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white">All Battles</h1>
          <p className="text-white/35 text-sm mt-1">{battles.length} total · {battles.filter(b => b.status === 'live').length} live</p>
        </div>
        <Link href="/create" className="btn-primary text-sm whitespace-nowrap">
          <Plus className="w-4 h-4" />
          New Battle
        </Link>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input type="text" placeholder="Search battles..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-transparent pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none" />
        </div>
        <div className="flex gap-1 rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {SORT_OPTIONS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setSort(id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: sort === id ? 'rgba(255,255,255,0.1)' : 'transparent', color: sort === id ? '#fff' : 'rgba(255,255,255,0.35)' }}>
              <Icon className="w-3 h-3" />{label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Category pills */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}
        className="flex gap-2 flex-wrap mb-8">
        <button onClick={() => setCategory('all')}
          className="pill border transition-all text-xs"
          style={{ background: category === 'all' ? 'rgba(124,106,247,0.2)' : 'rgba(255,255,255,0.03)', color: category === 'all' ? '#a78bfa' : 'rgba(255,255,255,0.35)', borderColor: category === 'all' ? 'rgba(124,106,247,0.4)' : 'rgba(255,255,255,0.07)' }}>
          All
        </button>
        {Object.entries(CATEGORY_CONFIG).map(([cat, cfg]) => (
          <button key={cat} onClick={() => setCategory(cat as Category)}
            className="pill border transition-all text-xs"
            style={{
              background: category === cat ? `${cfg.color}18` : 'rgba(255,255,255,0.03)',
              color: category === cat ? cfg.color : 'rgba(255,255,255,0.35)',
              borderColor: category === cat ? `${cfg.color}40` : 'rgba(255,255,255,0.07)',
            }}>
            {cfg.icon} {cfg.label}
          </button>
        ))}
      </motion.div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 rounded-2xl shimmer" style={{ border: '1px solid rgba(255,255,255,0.05)' }} />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <>
          <p className="text-xs text-white/25 mb-4">{filtered.length} battle{filtered.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((battle, i) => (
              <BattleCard
                key={battle.id}
                id={battle.id}
                topic={battle.topic}
                category={battle.category}
                status={battle.status}
                closes_at={battle.closes_at}
                vote_count={battle.vote_count}
                view_count={battle.view_count}
                leadingAgent={LEADING_AGENTS[i % LEADING_AGENTS.length]}
                leadingConfidence={LEADING_CONFS[i % LEADING_CONFS.length]}
                index={i}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-24">
          <div className="text-4xl mb-3">⚔️</div>
          <p className="text-white/30 text-sm mb-4">
            {battles.length === 0 ? 'No battles yet. Start the first one!' : 'No battles match your filters.'}
          </p>
          <Link href="/create" className="btn-primary text-sm">Create First Battle</Link>
        </div>
      )}
    </div>
  )
}
