'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, TrendingUp, Clock, Flame } from 'lucide-react'
import BattleCard from '@/components/shared/BattleCard'
import { SEEDED_BATTLES, CATEGORY_CONFIG } from '@/lib/agents'
import type { AgentId, Category } from '@/types'

const ALL_BATTLES = [
  { ...SEEDED_BATTLES[0], leadingAgent: 'optimist' as AgentId, leadingConfidence: 71 },
  { ...SEEDED_BATTLES[1], leadingAgent: 'quant' as AgentId, leadingConfidence: 54 },
  { ...SEEDED_BATTLES[2], leadingAgent: 'chaos' as AgentId, leadingConfidence: 67 },
  { ...SEEDED_BATTLES[3], leadingAgent: 'historian' as AgentId, leadingConfidence: 38 },
  { ...SEEDED_BATTLES[4], leadingAgent: 'skeptic' as AgentId, leadingConfidence: 43 },
  { ...SEEDED_BATTLES[5], leadingAgent: 'analyst' as AgentId, leadingConfidence: 61 },
]

const SORT_OPTIONS = [
  { id: 'hot', label: 'Hot', icon: Flame },
  { id: 'new', label: 'New', icon: Clock },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
]

export default function ExploreClient() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<Category | 'all'>('all')
  const [sort, setSort] = useState('hot')

  const filtered = useMemo(() => {
    let results = ALL_BATTLES
    if (category !== 'all') results = results.filter(b => b.category === category)
    if (search) results = results.filter(b => b.topic.toLowerCase().includes(search.toLowerCase()))
    if (sort === 'hot') results = [...results].sort((a, b) => b.vote_count - a.vote_count)
    if (sort === 'new') results = [...results].sort((a, b) => new Date(b.closes_at).getTime() - new Date(a.closes_at).getTime())
    return results
  }, [search, category, sort])

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-3xl md:text-4xl font-bold text-signal-text mb-2">
          The Arena
        </h1>
        <p className="text-signal-sub">Browse all active prediction battles</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3 mb-8"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-signal-sub" />
          <input
            type="text"
            placeholder="Search battles..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="signal-input pl-10"
          />
        </div>

        {/* Sort */}
        <div className="flex gap-1 bg-signal-surface rounded-lg p-1 border border-signal-border">
          {SORT_OPTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSort(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                sort === id
                  ? 'bg-signal-card text-signal-text'
                  : 'text-signal-sub hover:text-signal-text'
              }`}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Category pills */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex gap-2 flex-wrap mb-8"
      >
        <button
          onClick={() => setCategory('all')}
          className={`signal-badge transition-all ${
            category === 'all'
              ? 'bg-signal-accent text-white'
              : 'bg-signal-surface border border-signal-border text-signal-sub hover:text-signal-text'
          }`}
        >
          All
        </button>
        {Object.entries(CATEGORY_CONFIG).map(([cat, config]) => (
          <button
            key={cat}
            onClick={() => setCategory(cat as Category)}
            className="signal-badge border transition-all"
            style={category === cat ? {
              background: `${config.color}20`,
              color: config.color,
              borderColor: `${config.color}40`,
            } : {
              background: 'rgba(13,13,20,0.5)',
              color: '#6b6b8a',
              borderColor: '#1e1e2e',
            }}
          >
            {config.icon} {config.label}
          </button>
        ))}
      </motion.div>

      {/* Results count */}
      <p className="text-xs text-signal-sub mb-4">
        {filtered.length} battle{filtered.length !== 1 ? 's' : ''} found
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((battle, i) => (
            <BattleCard key={battle.id} {...battle} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">⚔️</div>
          <p className="text-signal-sub">No battles found. Try a different filter.</p>
        </div>
      )}
    </div>
  )
}
