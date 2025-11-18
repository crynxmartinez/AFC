import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatTimeAgo(date: string | Date): string {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return formatDate(date)
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

// Calculate contest status based on dates
export function getContestStatus(startDate: string, endDate: string): 'draft' | 'active' | 'voting' | 'ended' {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  // Calculate voting phase start (3 days before end)
  const votingStart = new Date(end)
  votingStart.setDate(votingStart.getDate() - 3)
  
  // Before start date
  if (now < start) {
    return 'draft'
  }
  
  // After end date
  if (now > end) {
    return 'ended'
  }
  
  // In voting phase (last 3 days)
  if (now >= votingStart) {
    return 'voting'
  }
  
  // Active (accepting entries)
  return 'active'
}

// Get time remaining until phase change
export function getPhaseTimeRemaining(startDate: string, endDate: string): string {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)
  const votingStart = new Date(end)
  votingStart.setDate(votingStart.getDate() - 3)
  
  const status = getContestStatus(startDate, endDate)
  
  let targetDate: Date
  let phase: string
  
  if (status === 'draft') {
    targetDate = start
    phase = 'Starts in'
  } else if (status === 'active') {
    targetDate = votingStart
    phase = 'Voting starts in'
  } else if (status === 'voting') {
    targetDate = end
    phase = 'Ends in'
  } else {
    return 'Ended'
  }
  
  const diff = targetDate.getTime() - now.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (days > 0) return `${phase} ${days} day${days > 1 ? 's' : ''}`
  if (hours > 0) return `${phase} ${hours} hour${hours > 1 ? 's' : ''}`
  return `${phase} soon`
}
