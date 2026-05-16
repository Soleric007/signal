import Pusher from 'pusher'

let pusherInstance: Pusher | null = null

export function getPusher(): Pusher {
  if (!pusherInstance) {
    pusherInstance = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
      useTLS: true,
    })
  }
  return pusherInstance
}

export const PUSHER_EVENTS = {
  NEW_MESSAGE: 'new-message',
  CONFIDENCE_UPDATE: 'confidence-update',
  AGENT_THINKING: 'agent-thinking',
  BATTLE_RESOLVED: 'battle-resolved',
  USER_VOTED: 'user-voted',
}

export function battleChannel(battleId: string): string {
  return `battle-${battleId}`
}
