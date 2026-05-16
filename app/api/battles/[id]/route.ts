import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { id } = params

    const [battleRes, messagesRes, snapshotsRes, votesRes] = await Promise.all([
      supabase.from('predictions').select('*').eq('id', id).single(),
      supabase.from('battle_messages').select('*').eq('battle_id', id).order('created_at'),
      supabase.from('confidence_snapshots').select('*').eq('battle_id', id).order('round'),
      supabase.from('votes').select('agent_id').eq('battle_id', id),
    ])

    if (battleRes.error) throw battleRes.error

    // Tally votes per agent
    const voteTally: Record<string, number> = {}
    for (const vote of votesRes.data || []) {
      voteTally[vote.agent_id] = (voteTally[vote.agent_id] || 0) + 1
    }

    return NextResponse.json({
      battle: battleRes.data,
      messages: messagesRes.data || [],
      confidence_history: snapshotsRes.data || [],
      votes: voteTally,
    })
  } catch (err) {
    console.error('Get battle error:', err)
    return NextResponse.json({ battle: null, messages: [], confidence_history: [], votes: {} })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const body = await req.json()

    const { data, error } = await supabase
      .from('predictions')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
