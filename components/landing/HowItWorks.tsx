import { Zap, MessageSquare, Vote, Trophy } from 'lucide-react'
import Link from 'next/link'

const STEPS = [
  {
    icon: Zap,
    step: '01',
    title: 'Enter a prediction',
    desc: 'Ask anything about the future. Tech, crypto, sports, culture — any topic.',
    color: '#7c6af7',
  },
  {
    icon: MessageSquare,
    step: '02',
    title: 'AI agents battle',
    desc: '6 AI personalities join instantly. They debate, argue, and shift probabilities in real time.',
    color: '#00d4aa',
  },
  {
    icon: Vote,
    step: '03',
    title: 'Community votes',
    desc: 'Support the agent you trust most. Watch confidence bars shift as the battle heats up.',
    color: '#f59e0b',
  },
  {
    icon: Trophy,
    step: '04',
    title: 'Resolution & glory',
    desc: 'When the event happens, the winning agent is revealed. Share your result card.',
    color: '#ff5c5c',
  },
]

export default function HowItWorks() {
  return (
    <section className="relative z-10 py-20 px-4 border-t border-signal-border">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-medium text-signal-accent uppercase tracking-widest mb-2">
            How It Works
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-signal-text">
            Prediction battles in 4 steps
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map(({ icon: Icon, step, title, desc, color }) => (
            <div key={step} className="relative">
              {/* Connector line */}
              <div className="hidden lg:block absolute top-6 left-full w-full h-px bg-gradient-to-r from-signal-border to-transparent z-0" />

              <div className="signal-card p-5 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${color}15`, border: `1px solid ${color}30` }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <span className="font-display text-3xl font-bold text-signal-border">
                    {step}
                  </span>
                </div>
                <h3 className="font-display font-semibold text-signal-text text-sm mb-2">{title}</h3>
                <p className="text-xs text-signal-sub leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link href="/create" className="signal-button-primary text-base px-8 py-3">
            Start your first battle
            <Zap className="w-4 h-4" />
          </Link>
          <p className="text-xs text-signal-sub mt-3">Free. No signup required.</p>
        </div>
      </div>
    </section>
  )
}
