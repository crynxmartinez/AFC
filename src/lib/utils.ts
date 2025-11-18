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
export function getContestStatus(startDate: string, endDate: string): 'draft' | 'active' | 'ended' {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  // Before start date
  if (now < start) {
    return 'draft'
  }
  
  // After end date
  if (now > end) {
    return 'ended'
  }
  
  // Active (accepting entries and voting)
  return 'active'
}

// Get time remaining until contest ends
export function getPhaseTimeRemaining(startDate: string, endDate: string): string {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  const status = getContestStatus(startDate, endDate)
  
  if (status === 'draft') {
    const diff = start.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `Starts in ${days} day${days > 1 ? 's' : ''}`
    if (hours > 0) return `Starts in ${hours} hour${hours > 1 ? 's' : ''}`
    return 'Starting soon'
  }
  
  if (status === 'active') {
    const diff = end.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `Ends in ${days} day${days > 1 ? 's' : ''}`
    if (hours > 0) return `Ends in ${hours} hour${hours > 1 ? 's' : ''}`
    return 'Ending soon'
  }
  
  return 'Ended'
}
