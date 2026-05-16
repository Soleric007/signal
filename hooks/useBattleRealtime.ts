'use client'

import { useEffect, useRef } from 'react'
import PusherClient from 'pusher-js'
import { PUSHER_EVENTS } from '@/lib/pusher'
import type { BattleMessage, AgentId } from '@/types'

let pusherClient: PusherClient | null = null

function getPusherClient(): PusherClient {
  if (!pusherClient) {
    pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
      authEndpoint: '/api/pusher/auth',
    })
  }
  return pusherClient
}

interface UseBattleRealtimeOptions {
  battleId: string
  onNewMessage?: (message: BattleMessage, confidenceUpdate: Record<AgentId, number>) => void
  onConfidenceUpdate?: (update: Record<AgentId, number>) => void
  onBattleResolved?: (winner: AgentId, finalConfidence: Record<AgentId, number>) => void
  onUserVoted?: (agentId: AgentId) => void
  onAgentThinking?: (agentId: AgentId | null) => void
}

export function useBattleRealtime({
  battleId,
  onNewMessage,
  onConfidenceUpdate,
  onBattleResolved,
  onUserVoted,
  onAgentThinking,
}: UseBattleRealtimeOptions) {
  const channelRef = useRef<ReturnType<PusherClient['subscribe']> | null>(null)

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY || !battleId) return

    try {
      const pusher = getPusherClient()
      const channel = pusher.subscribe(`battle-${battleId}`)
      channelRef.current = channel

      channel.bind(PUSHER_EVENTS.NEW_MESSAGE, (data: {
        message: BattleMessage
        confidence_update: Record<AgentId, number>
      }) => {
        onNewMessage?.(data.message, data.confidence_update)
      })

      channel.bind(PUSHER_EVENTS.CONFIDENCE_UPDATE, (data: Record<AgentId, number>) => {
        onConfidenceUpdate?.(data)
      })

      channel.bind(PUSHER_EVENTS.BATTLE_RESOLVED, (data: {
        winner: AgentId
        final_confidence: Record<AgentId, number>
      }) => {
        onBattleResolved?.(data.winner, data.final_confidence)
      })

      channel.bind(PUSHER_EVENTS.USER_VOTED, (data: { agentId: AgentId }) => {
        onUserVoted?.(data.agentId)
      })

      channel.bind(PUSHER_EVENTS.AGENT_THINKING, (data: { agentId: AgentId | null }) => {
        onAgentThinking?.(data.agentId)
      })
    } catch (err) {
      console.warn('Pusher connection failed:', err)
    }

    return () => {
      channelRef.current?.unbind_all()
      try {
        getPusherClient().unsubscribe(`battle-${battleId}`)
      } catch {}
    }
  }, [battleId])
}
