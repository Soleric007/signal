import { NextRequest, NextResponse } from 'next/server'
import { getPusher } from '@/lib/pusher'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const params = new URLSearchParams(body)
    const socketId = params.get('socket_id')!
    const channelName = params.get('channel_name')!

    const pusher = getPusher()
    const authResponse = pusher.authorizeChannel(socketId, channelName)

    return NextResponse.json(authResponse)
  } catch (err) {
    return NextResponse.json({ error: 'Auth failed' }, { status: 403 })
  }
}
