import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getPusher, battleChannel, PUSHER_EVENTS } from '@/lib/pusher'
import { AGENTS, getAgentSystemPrompt } from '@/lib/agents'
import { extractConfidence, cleanMessageContent } from '@/lib/utils'
import type { AgentId } from '@/types'

// Fallback responses — used when API is unavailable
const FALLBACKS: Record<AgentId, { content: string; confidence: number }[]> = {
  quant: [
    { content: "Running base rate analysis: historical data shows a 41% probability over comparable timeframes. Adjusting for current macro conditions, I'm not moving far from that number. The evidence just isn't there for a higher conviction call.", confidence: 41 },
    { content: "Three comparable precedents. Average outcome rate: 38%. Volatility adjusted estimate: 44%. My confidence interval is ±15 points — this is not a high-conviction trade for anyone using actual data.", confidence: 44 },
  ],
  chaos: [
    { content: "The consensus is already pricing this outcome in. That's exactly when you fade it. Everyone's looking left while the black swan flies in from the right. I'm going hard contrarian here — the crowd is always wrong at inflection points.", confidence: 82 },
    { content: "Nobody's talking about the real risk vector here. While analysts debate the base case, the system-level shock is building in the background. This resolves violently, and not the way the consensus expects.", confidence: 76 },
  ],
  optimist: [
    { content: "Look at the underlying trend. Technology is real, adoption is accelerating, and the macro tailwinds are undeniable. People consistently underestimate momentum at this stage of the cycle. I'm fully bullish and I won't apologize for it.", confidence: 87 },
    { content: "Every major breakthrough looked impossible until it happened. The early believers always look crazy — right up until they don't. This is exactly that moment. The fundamentals support a strong yes.", confidence: 83 },
  ],
  skeptic: [
    { content: "I'd love to see the actual evidence here rather than vibes and extrapolated hope. What's the mechanism? What are the verifiable precedents? Until someone shows me the data, I'm holding my skepticism at maximum.", confidence: 24 },
    { content: "The base case is always that things change slower than predicted. Show me the proof. Point to the specific factors that make this time different. Without that, I cannot in good conscience assign high probability to this.", confidence: 28 },
  ],
  historian: [
    { content: "We've seen this exact setup before — 1999, 2008, 2017. The configuration of signals is nearly identical. History doesn't repeat, but it rhymes loudly. The rhyme scheme here is pointing at a very specific outcome.", confidence: 56 },
    { content: "Looking back at comparable inflection points over 50 years: bullish outcome 58% of the time, but timing was off by 12-18 months on average. The pattern is clear. The timing is the only variable left.", confidence: 52 },
  ],
  analyst: [
    { content: "Balancing the competing arguments: the bull case has merit but depends on 2-3 assumptions holding simultaneously. The bear case is structurally more sound but ignores momentum factors. Net assessment: 57% probability, moderate confidence.", confidence: 57 },
    { content: "Scenario A (bullish): 40% probability. Scenario B (neutral/delayed): 35%. Scenario C (bearish): 25%. Weighted probability: 58% for the event occurring within the stated timeframe. I lean yes, but with real hedges.", confidence: 58 },
  ],
}

function getRandomFallback(agentId: AgentId) {
  const options = FALLBACKS[agentId]
  return options[Math.floor(Math.random() * options.length)]
}

export async function POST(req: NextRequest) {
  let body: any = {}

  try {
    body = await req.json()
    const { battleId, agentId, topic, context, round } = body

    if (!agentId || !topic) {
      return NextResponse.json(getRandomFallback('analyst'))
    }

    const agent = AGENTS[agentId as AgentId]
    if (!agent) return NextResponse.json(getRandomFallback('analyst'))

    const systemPrompt = getAgentSystemPrompt(agentId as AgentId, topic, context || '')

    // ── Try Groq first ────────────────────────────────
    if (process.env.GROQ_API_KEY) {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          max_tokens: 180,
          temperature: 0.9,
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: `Give your argument about: "${topic}". Be vivid and in character. End your response with exactly: CONFIDENCE: [number]`
            },
          ],
        }),
      })

      if (groqRes.ok) {
        const groqData = await groqRes.json()
        const raw = groqData.choices?.[0]?.message?.content || ''
        const confidence = extractConfidence(raw)
        const content = cleanMessageContent(raw)

        await persistAndBroadcast(battleId, agentId, content, confidence, round)
        return NextResponse.json({ content, confidence, agentId, round })
      }
    }

    // ── Try OpenAI fallback ───────────────────────────
    if (process.env.OPENAI_API_KEY) {
      const { default: OpenAI } = await import('openai')
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 180,
        temperature: 0.9,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Argue about: "${topic}". Stay in character. End with CONFIDENCE: [0-100]` },
        ],
      })
      const raw = completion.choices[0]?.message?.content || ''
      const confidence = extractConfidence(raw)
      const content = cleanMessageContent(raw)

      await persistAndBroadcast(battleId, agentId, content, confidence, round)
      return NextResponse.json({ content, confidence, agentId, round })
    }

    // ── No API key — use rich fallbacks ──────────────
    const fallback = getRandomFallback(agentId as AgentId)
    await persistAndBroadcast(battleId, agentId, fallback.content, fallback.confidence, round)
    return NextResponse.json({ ...fallback, agentId, round })

  } catch (err: any) {
    console.error('message route error:', err?.message || err)
    const agentId = (body?.agentId || 'analyst') as AgentId
    return NextResponse.json(getRandomFallback(agentId))
  }
}

async function persistAndBroadcast(
  battleId: string,
  agentId: string,
  content: string,
  confidence: number,
  round: number
) {
  // Persist to Supabase (non-blocking, non-fatal)
  try {
    const supabase = createServerClient()
    await supabase.from('battle_messages').insert({
      battle_id: battleId,
      agent_id: agentId,
      content,
      confidence,
      round: round || 1,
    })
  } catch {}

  // Pusher broadcast (non-blocking, non-fatal)
  try {
    const pusher = getPusher()
    await pusher.trigger(battleChannel(battleId), PUSHER_EVENTS.NEW_MESSAGE, {
      message: { agent_id: agentId, content, confidence, round },
      confidence_update: { [agentId]: confidence },
    })
  } catch {}
}
