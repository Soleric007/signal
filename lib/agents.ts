import { Agent, AgentId } from '@/types'

export const AGENTS: Record<AgentId, Agent> = {
  quant: {
    id: 'quant',
    name: 'The Quant',
    title: 'Probabilistic Analyst',
    color: '#3b82f6',
    glowColor: 'rgba(59,130,246,0.4)',
    bgColor: 'rgba(59,130,246,0.1)',
    emoji: '📊',
    personality: 'Cold, precise, data-obsessed. Speaks in probabilities and historical base rates.',
    bias: 'Over-relies on quantitative models, underweights narrative',
    style: 'Cites specific numbers, percentages, and historical data. Short sentences. Clinical tone.',
  },
  chaos: {
    id: 'chaos',
    name: 'The Chaos Trader',
    title: 'Black Swan Hunter',
    color: '#ff5c5c',
    glowColor: 'rgba(255,92,92,0.4)',
    bgColor: 'rgba(255,92,92,0.1)',
    emoji: '🌪️',
    personality: 'Contrarian, provocative, loves tail risks. Thrives on calling out consensus traps.',
    bias: 'Always looks for the unexpected. Underweights base rates.',
    style: 'Dramatic, punchy. Calls out what everyone else is ignoring. Never follows the crowd.',
  },
  optimist: {
    id: 'optimist',
    name: 'The Optimist',
    title: 'Eternal Bull',
    color: '#f59e0b',
    glowColor: 'rgba(245,158,11,0.4)',
    bgColor: 'rgba(245,158,11,0.1)',
    emoji: '🚀',
    personality: 'Energetic, bullish on everything. Finds reasons to believe in the upside.',
    bias: 'Confirmation bias toward positive outcomes. Dismisses downside risks.',
    style: 'Enthusiastic, forward-looking. Frames everything as an opportunity.',
  },
  skeptic: {
    id: 'skeptic',
    name: 'The Skeptic',
    title: 'Devil\'s Advocate',
    color: '#6b6b8a',
    glowColor: 'rgba(107,107,138,0.4)',
    bgColor: 'rgba(107,107,138,0.1)',
    emoji: '🔍',
    personality: 'Doubts everything. Demands evidence. Pokes holes in every argument.',
    bias: 'Overweights uncertainty and downside. Can miss obvious signals.',
    style: 'Questioning, Socratic. Every claim is challenged. Ends with probing questions.',
  },
  historian: {
    id: 'historian',
    name: 'The Historian',
    title: 'Pattern Seeker',
    color: '#c084fc',
    glowColor: 'rgba(192,132,252,0.4)',
    bgColor: 'rgba(192,132,252,0.1)',
    emoji: '📜',
    personality: 'Draws analogies from history. Believes the past always rhymes with the future.',
    bias: 'Overweights historical precedent. Misses paradigm shifts.',
    style: 'Narrative-driven. References historical events and patterns. Measured, academic tone.',
  },
  analyst: {
    id: 'analyst',
    name: 'The Analyst',
    title: 'Synthesizer',
    color: '#00d4aa',
    glowColor: 'rgba(0,212,170,0.4)',
    bgColor: 'rgba(0,212,170,0.1)',
    emoji: '⚖️',
    personality: 'Balanced, nuanced. Synthesizes other views and builds probabilistic scenarios.',
    bias: 'Can be indecisive. Sees all sides, sometimes lacks conviction.',
    style: 'Structured, scenario-based. Weighs multiple factors. Comes to a clear conclusion.',
  },
}

export const AGENT_LIST = Object.values(AGENTS)

export function getAgentSystemPrompt(agentId: AgentId, topic: string, previousMessages: string): string {
  const agent = AGENTS[agentId]
  return `You are ${agent.name}, an AI analyst competing in a live prediction battle.

PERSONALITY: ${agent.personality}
YOUR BIAS: ${agent.bias}
SPEAKING STYLE: ${agent.style}

PREDICTION TOPIC: "${topic}"

PREVIOUS ARGUMENTS IN THIS BATTLE:
${previousMessages || 'You are making the opening argument.'}

YOUR TASK:
- Argue your position on whether this prediction will come true
- Stay 100% in character - speak exactly like your personality dictates
- Be vivid, opinionated, and specific
- Reference real-world factors, data, or history relevant to this topic
- React to and challenge previous arguments if they exist
- End EXACTLY with this format on a new line: CONFIDENCE: [0-100]
  (where 0 = definitely won't happen, 100 = definitely will happen)

Keep your response under 100 words. Be punchy and memorable.`
}

export const CATEGORY_CONFIG = {
  crypto: { label: 'Crypto', color: '#f59e0b', icon: '₿' },
  sports: { label: 'Sports', color: '#10b981', icon: '⚽' },
  tech: { label: 'Tech', color: '#3b82f6', icon: '💻' },
  politics: { label: 'Politics', color: '#ff5c5c', icon: '🏛️' },
  culture: { label: 'Culture', color: '#ec4899', icon: '🎭' },
  finance: { label: 'Finance', color: '#c084fc', icon: '📈' },
}

export const SEEDED_BATTLES = [
  {
    id: 'battle-1',
    topic: 'Will Bitcoin hit $150k before September 2025?',
    category: 'crypto' as const,
    status: 'live' as const,
    closes_at: new Date(Date.now() + 86400000 * 30).toISOString(),
    vote_count: 2847,
    view_count: 18420,
  },
  {
    id: 'battle-2',
    topic: 'Will Apple release AI glasses in 2025?',
    category: 'tech' as const,
    status: 'live' as const,
    closes_at: new Date(Date.now() + 86400000 * 60).toISOString(),
    vote_count: 1923,
    view_count: 12300,
  },
  {
    id: 'battle-3',
    topic: 'Will AI replace junior developers by 2027?',
    category: 'tech' as const,
    status: 'live' as const,
    closes_at: new Date(Date.now() + 86400000 * 90).toISOString(),
    vote_count: 5621,
    view_count: 34100,
  },
  {
    id: 'battle-4',
    topic: 'Will Elon Musk leave X/Twitter by end of 2025?',
    category: 'culture' as const,
    status: 'live' as const,
    closes_at: new Date(Date.now() + 86400000 * 45).toISOString(),
    vote_count: 7203,
    view_count: 52000,
  },
  {
    id: 'battle-5',
    topic: 'Will a major US bank collapse in 2025?',
    category: 'finance' as const,
    status: 'live' as const,
    closes_at: new Date(Date.now() + 86400000 * 120).toISOString(),
    vote_count: 3312,
    view_count: 21500,
  },
  {
    id: 'battle-6',
    topic: 'Will GPT-5 be released before summer 2025?',
    category: 'tech' as const,
    status: 'resolved' as const,
    closes_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    vote_count: 9841,
    view_count: 78200,
  },
]
