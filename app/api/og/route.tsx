import { NextRequest } from 'next/server'
import { ImageResponse } from 'next/og'
import { AGENTS } from '@/lib/agents'
import type { AgentId } from '@/types'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const topic = searchParams.get('topic') || 'AI Prediction Battle'
  const winner = (searchParams.get('winner') || 'analyst') as AgentId
  const confidence = searchParams.get('confidence') || '62'
  const agent = AGENTS[winner]

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#050508',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '-100px',
            width: '500px',
            height: '500px',
            background: `radial-gradient(circle, ${agent.color}30 0%, transparent 60%)`,
            borderRadius: '50%',
          }}
        />

        {/* SIGNAL branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#6b6b8a', letterSpacing: '0.1em' }}>
            ⚡ SIGNAL — AI PREDICTION BATTLES
          </div>
        </div>

        {/* Topic */}
        <div
          style={{
            fontSize: '42px',
            fontWeight: 800,
            color: '#e8e8f0',
            textAlign: 'center',
            lineHeight: 1.2,
            maxWidth: '900px',
            marginBottom: '40px',
          }}
        >
          {topic}
        </div>

        {/* Winner card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            padding: '20px 32px',
            background: `${agent.color}15`,
            border: `2px solid ${agent.color}40`,
            borderRadius: '16px',
          }}
        >
          <div style={{ fontSize: '48px' }}>{agent.emoji}</div>
          <div>
            <div style={{ fontSize: '14px', color: '#6b6b8a', marginBottom: '4px' }}>Leading prediction</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: agent.color }}>{agent.name}</div>
          </div>
          <div
            style={{
              marginLeft: '20px',
              paddingLeft: '20px',
              borderLeft: `1px solid ${agent.color}30`,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '52px', fontWeight: 900, color: agent.color }}>{confidence}%</div>
            <div style={{ fontSize: '12px', color: '#6b6b8a' }}>confidence</div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ marginTop: '32px', fontSize: '16px', color: '#6b6b8a' }}>
          signal.app · Join the battle and vote
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
