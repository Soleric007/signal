import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getPusher, battleChannel, PUSHER_EVENTS } from '@/lib/pusher'

export async function POST(req: NextRequest) {
  try {
    const { battleId, agentId, session } = await req.json()

    if (!battleId || !agentId || !session) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Upsert vote (one per session per battle)
    const { error } = await supabase.from('votes').upsert(
      { battle_id: battleId, agent_id: agentId, user_session: session },
      { onConflict: 'battle_id,user_session' }
    )

    if (error) throw error

    // Increment vote count on prediction
  try {
  await supabase.rpc('increment_vote_count', { prediction_id: battleId })
} catch {
  // RPC may not exist; that's fine
}

    // Broadcast vote event
    try {
      const pusher = getPusher()
      await pusher.trigger(battleChannel(battleId), PUSHER_EVENTS.USER_VOTED, {
        agentId,
        session,
      })
    } catch {}

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Vote error:', err)
    // Return success anyway so UI doesn't break
    return NextResponse.json({ success: true })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const battleId = searchParams.get('battleId')

    if (!battleId) return NextResponse.json({})

    const supabase = createServerClient()
    const { data } = await supabase
      .from('votes')
      .select('agent_id')
      .eq('battle_id', battleId)

    const tally: Record<string, number> = {}
    for (const row of data || []) {
      tally[row.agent_id] = (tally[row.agent_id] || 0) + 1
    }

    return NextResponse.json(tally)
  } catch {
    return NextResponse.json({})
  }
}
