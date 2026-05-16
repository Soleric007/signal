import Link from 'next/link'
import { Zap } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-signal-border py-10 px-4 mt-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-signal-accent" />
          <span className="font-display font-bold text-sm text-signal-text">SIGNAL</span>
        </Link>

        <div className="flex items-center gap-6 text-xs text-signal-sub">
          <Link href="/explore" className="hover:text-signal-text transition-colors">Explore</Link>
          <Link href="/leaderboard" className="hover:text-signal-text transition-colors">Leaderboard</Link>
          <Link href="/create" className="hover:text-signal-text transition-colors">Create Battle</Link>
        </div>

        <p className="text-xs text-signal-sub">
          Built for Mantle Turing Test Hackathon 2026
        </p>
      </div>
    </footer>
  )
}
