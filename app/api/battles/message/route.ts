import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getPusher, battleChannel, PUSHER_EVENTS } from '@/lib/pusher'
import { AGENTS } from '@/lib/agents'
import { extractConfidence, cleanMessageContent } from '@/lib/utils'
import type { AgentId } from '@/types'

// Per-agent system prompts - strong personality, forced to debate the exact topic
function buildSystemPrompt(agentId: AgentId, topic: string, context: string): string {
  const voices: Record<AgentId, string> = {
    quant: `You are The Quant. You are a cold, data-obsessed probabilistic analyst.
PERSONALITY: You cite specific numbers, base rates, and historical statistics. You are clinical and precise. You never speculate without data.
STYLE: Short punchy sentences. Lead with a specific statistic. Be direct and slightly dismissive of non-quantitative reasoning.
BIAS: You underestimate narrative momentum and sometimes miss qualitative factors.`,

    chaos: `You are The Chaos Trader. You are a provocative contrarian who hunts black swans.
PERSONALITY: You love pointing out what everyone else is missing. You distrust consensus. You think the crowd is always wrong at inflection points.
STYLE: Bold, dramatic, punchy. Use phrases like "Nobody's talking about..." or "While everyone looks at X, the real move is...". Be provocative.
BIAS: You sometimes cry wolf on tail risks that don't materialise.`,

    optimist: `You are The Optimist. You are relentlessly bullish and forward-looking.
PERSONALITY: You see opportunity everywhere. You believe in technology, human progress, and upside momentum. You think bears always underestimate adoption curves.
STYLE: Energetic, enthusiastic. Use phrases like "This is exactly the moment..." or "The fundamentals are undeniable...". Be convincing and positive.
BIAS: You dismiss downside risks too easily.`,

    skeptic: `You are The Skeptic. You are the devil's advocate who questions everything.
PERSONALITY: You demand evidence. You poke holes in every argument. You think extraordinary claims require extraordinary proof.
STYLE: Questioning, Socratic. Challenge specific claims made by others. Ask "But where's the evidence for...?". Be intellectually aggressive.
BIAS: You sometimes miss clear signals because you demand too much proof.`,

    historian: `You are The Historian. You find patterns by looking at historical precedent.
PERSONALITY: You believe history always rhymes. You draw analogies to past events and cycles. You think patterns repeat.
STYLE: Reference specific historical events or time periods. Use phrases like "We saw this exact setup in [year]..." or "This is identical to the [event]...". Be measured but confident.
BIAS: You can over-fit to historical analogies and miss genuine paradigm shifts.`,

    analyst: `You are The Analyst. You are a balanced synthesizer who weighs all scenarios.
PERSONALITY: You build explicit probability scenarios. You acknowledge both sides but reach a clear conclusion. You are the voice of measured reason.
STYLE: Structure your argument as weighted scenarios (e.g. "Bull case: X at 40%... Bear case: Y at 30%..."). Be precise about your final probability.
BIAS: You can be indecisive and hedge too much.`,
  }

  const previousDebate = context
    ? `\nPREVIOUS ARGUMENTS IN THIS BATTLE:\n${context}\n\nReact to and challenge the previous arguments where relevant. Don't just repeat what others said.`
    : '\nYou are making the OPENING ARGUMENT. Set the tone for the debate.'

  return `${voices[agentId]}

THE PREDICTION TO DEBATE: "${topic}"
${previousDebate}

YOUR TASK:
- Argue specifically about THIS prediction topic - "${topic}"
- Be vivid, specific, and opinionated about THIS exact question
- Reference real-world factors, data, or history DIRECTLY relevant to this topic
- Keep your response to 80-120 words
- At the very end, on a new line, write exactly: CONFIDENCE: [number between 0-100]
  (0 = definitely will NOT happen, 100 = definitely WILL happen)
- Do NOT add any explanation after the CONFIDENCE line

Stay 100% in character. Make this debate interesting.`
}

export async function POST(req: NextRequest) {
  let body: { battleId?: string; agentId?: AgentId; topic?: string; context?: string; round?: number } = {}

  try {
    body = await req.json()
    const { battleId, agentId, topic, context, round } = body

    if (!agentId || !topic) {
      return NextResponse.json({ error: 'Missing agentId or topic' }, { status: 400 })
    }

    const agent = AGENTS[agentId]
    if (!agent) return NextResponse.json({ error: 'Invalid agentId' }, { status: 400 })

    const systemPrompt = buildSystemPrompt(agentId, topic, context || '')

    let content = ''
    let confidence = 50

    // ── Try Groq ──────────────────────────────────────────
    if (process.env.GROQ_API_KEY) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',   // better model, still free
            max_tokens: 220,
            temperature: 0.88,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `Debate this prediction now: "${topic}". Give your argument and end with CONFIDENCE: [0-100].` },
            ],
          }),
        })

        if (groqRes.ok) {
          const groqData = await groqRes.json()
          const raw = groqData.choices?.[0]?.message?.content || ''
          if (raw.trim()) {
            confidence = extractConfidence(raw)
            content = cleanMessageContent(raw)
          }
        } else {
          const errText = await groqRes.text()
          console.warn('Groq error:', groqRes.status, errText)
        }
      } catch (err) {
        console.warn('Groq fetch failed:', err)
      }
    }

    // ── Try OpenAI fallback ────────────────────────────────
    if (!content && process.env.OPENAI_API_KEY) {
      try {
        const { default: OpenAI } = await import('openai')
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          max_tokens: 220,
          temperature: 0.88,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Debate: "${topic}". End with CONFIDENCE: [0-100].` },
          ],
        })
        const raw = completion.choices[0]?.message?.content || ''
        if (raw.trim()) {
          confidence = extractConfidence(raw)
          content = cleanMessageContent(raw)
        }
      } catch (err) {
        console.warn('OpenAI fallback failed:', err)
      }
    }

    // ── Last resort: rich fallbacks ────────────────────────
    if (!content) {
      const fb = RICH_FALLBACKS[agentId]
      content = fb.content
      confidence = fb.confidence
    }

    // Persist + broadcast (non-blocking)
    persistAndBroadcast(battleId || '', agentId, content, confidence, round || 1).catch(console.warn)

    return NextResponse.json({ content, confidence, agentId, round })

  } catch (err: any) {
    console.error('Message route error:', err?.message || err)
    const agentId = (body?.agentId || 'analyst') as AgentId
    const fb = RICH_FALLBACKS[agentId]
    return NextResponse.json({ ...fb, agentId, round: body?.round || 1 })
  }
}

async function persistAndBroadcast(
  battleId: string,
  agentId: string,
  content: string,
  confidence: number,
  round: number,
) {
  if (!battleId || battleId.startsWith('local-')) return

  try {
    const supabase = createServerClient()
    await supabase.from('battle_messages').insert({
      battle_id: battleId,
      agent_id: agentId,
      content,
      confidence,
      round,
    })
  } catch (e) {
    console.warn('DB persist failed:', e)
  }

  try {
    const pusher = getPusher()
    await pusher.trigger(battleChannel(battleId), PUSHER_EVENTS.NEW_MESSAGE, {
      message: { agent_id: agentId, content, confidence, round },
      confidence_update: { [agentId]: confidence },
    })
  } catch (e) {
    console.warn('Pusher broadcast failed:', e)
  }
}

// Rich fallbacks that actually sound like real debate, not placeholder text
const RICH_FALLBACKS: Record<AgentId, { content: string; confidence: number }> = {
  quant: {
    content: "Running the base rates: historically, events like this resolve YES roughly 38% of the time within the stated window. Current market pricing implies ~55%, which tells me there's a consensus overreach happening right now. I'm fading the optimism.",
    confidence: 38,
  },
  chaos: {
    content: "Everyone's focused on the obvious signals and completely ignoring the macro pressure building in the background. The consensus is pricing this as almost certain — which is exactly when you fade it. Contrarian positioning here is the only rational trade.",
    confidence: 73,
  },
  optimist: {
    content: "Look at the trajectory. The trend has been relentlessly positive and the underlying drivers are accelerating, not slowing. People have been calling the top of this move for months and been wrong every single time. I'm not making that mistake.",
    confidence: 86,
  },
  skeptic: {
    content: "I keep hearing confident predictions but I'm not seeing the evidence to back them up. What's the actual mechanism here? What changes between now and the resolution date? Until someone can answer those questions with data, I refuse to assign high probability.",
    confidence: 24,
  },
  historian: {
    content: "I've seen this exact configuration before — the sentiment, the timing, the macro backdrop. In 2017 and again in 2020, nearly identical setups played out the same way. History doesn't repeat, but if you've studied enough of it, the rhyme scheme becomes obvious.",
    confidence: 58,
  },
  analyst: {
    content: "Breaking this down: Bull scenario (40% probability) — momentum holds and we see resolution within the timeframe. Bear scenario (35%) — delayed or blocked by structural factors. Base case (25%) — partial resolution. Weighted: 57% likely YES, but I'd want hedges.",
    confidence: 57,
  },
}
