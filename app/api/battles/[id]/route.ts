import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  try {
    const supabase = createServerClient()

    // Fetch battle, messages, and votes in parallel
    const [battleRes, messagesRes, votesRes] = await Promise.all([
      supabase
        .from('predictions')
        .select('*')
        .eq('id', id)
        .single(),
      supabase
        .from('battle_messages')
        .select('*')
        .eq('battle_id', id)
        .order('created_at', { ascending: true }),
      supabase
        .from('votes')
        .select('agent_id')
        .eq('battle_id', id),
    ])

    // Increment view count (fire and forget)
    supabase
      .from('predictions')
      .update({ view_count: (battleRes.data?.view_count || 0) + 1 })
      .eq('id', id)
      .then(() => {})

    if (battleRes.error) {
      console.error('Get battle error:', battleRes.error)
      return NextResponse.json({ battle: null, messages: [], votes: {} }, { status: 404 })
    }

    // Tally votes per agent
    const voteTally: Record<string, number> = {}
    for (const v of votesRes.data || []) {
      voteTally[v.agent_id] = (voteTally[v.agent_id] || 0) + 1
    }

    return NextResponse.json({
      battle: battleRes.data,
      messages: messagesRes.data || [],
      votes: voteTally,
    })
  } catch (err) {
    console.error('GET /api/battles/[id] error:', err)
    return NextResponse.json({ battle: null, messages: [], votes: {} })
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
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    console.error('PATCH /api/battles/[id] error:', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
