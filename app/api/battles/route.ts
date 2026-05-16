import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')    // 'live' | 'resolved' | null (all)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

    const supabase = createServerClient()

    let query = supabase
      .from('predictions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    // Filter by status only if explicitly passed
    if (status) query = query.eq('status', status)

    // Filter by category only if explicitly passed and not 'all'
    if (category && category !== 'all') query = query.eq('category', category)

    const { data, error } = await query

    if (error) {
      console.error('Supabase GET battles error:', error)
      return NextResponse.json([])
    }

    return NextResponse.json(data || [])
  } catch (err) {
    console.error('GET /api/battles error:', err)
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { topic, category } = body

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
        vote_count: 0,
        view_count: 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase POST battle error:', error)
      // Return a usable fallback so UI doesn't break
      return NextResponse.json({
        id: 'local-' + Date.now(),
        topic: topic.trim(),
        category: category || 'tech',
        status: 'live',
      })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('POST /api/battles error:', err)
    return NextResponse.json({
      id: 'local-' + Date.now(),
      topic: 'Battle',
      status: 'live',
    })
  }
}
