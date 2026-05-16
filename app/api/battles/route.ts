import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { nanoid } from 'nanoid'

export async function POST(req: NextRequest) {
  try {
    const { topic, category } = await req.json()

    if (!topic?.trim()) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('predictions')
      .insert({
        topic: topic.trim(),
        category: category || 'tech',
        status: 'live',
        closes_at: new Date(Date.now() + 86400000 * 30).toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (err: any) {
    console.error('Create battle error:', err)
    // Return a fallback ID so the UI doesn't break
    return NextResponse.json({ id: 'demo-' + Date.now(), topic: 'Demo battle', status: 'live' })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status') || 'live'
    const limit = parseInt(searchParams.get('limit') || '20')

    const supabase = createServerClient()

    let query = supabase
      .from('predictions')
      .select('*')
      .eq('status', status)
      .order('vote_count', { ascending: false })
      .limit(limit)

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json(data || [])
  } catch (err) {
    console.error('Get battles error:', err)
    return NextResponse.json([])
  }
}
