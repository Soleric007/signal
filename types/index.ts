// ─── Agent Types ───────────────────────────────────────────────────────────────

export type AgentId = 'quant' | 'chaos' | 'optimist' | 'skeptic' | 'historian' | 'analyst'

export interface Agent {
  id: AgentId
  name: string
  title: string
  color: string
  glowColor: string
  bgColor: string
  emoji: string
  personality: string
  bias: string
  style: string
}

// ─── Prediction / Battle Types ─────────────────────────────────────────────────

export type BattleStatus = 'pending' | 'live' | 'resolving' | 'resolved'
export type Category = 'crypto' | 'sports' | 'tech' | 'politics' | 'culture' | 'finance'

export interface Prediction {
  id: string
  topic: string
  category: Category
  created_at: string
  closes_at: string
  status: BattleStatus
  created_by: string
  vote_count: number
  view_count: number
}

export interface Battle {
  id: string
  prediction_id: string
  prediction: Prediction
  messages: BattleMessage[]
  confidence_history: ConfidenceSnapshot[]
  votes: Record<AgentId, number>
  status: BattleStatus
  winner?: AgentId
  created_at: string
}

export interface BattleMessage {
  id: string
  battle_id: string
  agent_id: AgentId
  content: string
  confidence: number
  created_at: string
  round: number
}

export interface ConfidenceSnapshot {
  timestamp: string
  values: Record<AgentId, number>
  round: number
}

// ─── Vote Types ─────────────────────────────────────────────────────────────────

export interface Vote {
  id: string
  battle_id: string
  agent_id: AgentId
  user_session: string
  created_at: string
}

// ─── Realtime Event Types ───────────────────────────────────────────────────────

export interface PusherNewMessage {
  message: BattleMessage
  confidence_update: Record<AgentId, number>
}

export interface PusherBattleResolved {
  winner: AgentId
  final_confidence: Record<AgentId, number>
}

// ─── UI Types ───────────────────────────────────────────────────────────────────

export interface LiveBattlePreview {
  id: string
  topic: string
  category: Category
  leadingAgent: AgentId
  leadingConfidence: number
  totalVotes: number
  status: BattleStatus
  timeLeft: string
}
