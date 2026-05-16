'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, BarChart2, Trophy, Plus, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/explore', label: 'Explore', icon: BarChart2 },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
]

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(6,6,9,0.85)' : 'transparent',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
          backdropFilter: scrolled ? 'blur(24px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-7 h-7 flex items-center justify-center rounded-lg transition-all"
              style={{ background: 'rgba(124,106,247,0.15)', border: '1px solid rgba(124,106,247,0.3)' }}
            >
              <Zap className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <span className="font-display font-bold text-sm tracking-tight text-white">
              SIGNAL
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  pathname === href
                    ? 'bg-white/8 text-white'
                    : 'text-white/45 hover:text-white/80 hover:bg-white/5'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            ))}
          </div>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-2">
            <Link href="/create" className="btn-primary h-8 px-4 text-xs hidden md:flex">
              <Plus className="w-3.5 h-3.5" />
              New Battle
            </Link>
            <button
              className="md:hidden p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all"
              onClick={() => setOpen(v => !v)}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed top-14 inset-x-0 z-40 p-4 md:hidden"
            style={{
              background: 'rgba(6,6,9,0.96)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(24px)',
            }}
          >
            <div className="flex flex-col gap-1">
              {NAV.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
              <Link
                href="/create"
                onClick={() => setOpen(false)}
                className="btn-primary mt-2 justify-center"
              >
                <Plus className="w-4 h-4" />
                New Battle
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
