import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimeLeft(closesAt: string): string {
  try {
    return formatDistanceToNow(new Date(closesAt), { addSuffix: false })
  } catch {
    return 'Unknown'
  }
}

export function formatDate(date: string): string {
  return format(new Date(date), 'MMM d, yyyy')
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toString()
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return 'server'
  let id = localStorage.getItem('signal_session')
  if (!id) {
    id = Math.random().toString(36).substring(2) + Date.now().toString(36)
    localStorage.setItem('signal_session', id)
  }
  return id
}

export function extractConfidence(text: string): number {
  const match = text.match(/CONFIDENCE:\s*(\d+)/i)
  if (match) return Math.min(100, Math.max(0, parseInt(match[1])))
  return 50
}

export function cleanMessageContent(text: string): string {
  return text.replace(/CONFIDENCE:\s*\d+/gi, '').trim()
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Generate a color-safe agent gradient for backgrounds
export function agentGradient(color: string, opacity = 0.15): string {
  return `radial-gradient(circle at center, ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`
}
