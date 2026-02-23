/**
 * Award XP to a user for a specific action
 */
export async function awardXP(
  userId: string,
  actionType: string,
  referenceId?: string,
  description?: string
): Promise<{
  success: boolean
  xpGained?: number
  newTotalXP?: number
  newLevel?: number
  leveledUp?: boolean
  error?: string
}> {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/xp/award`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId, actionType, referenceId, description }),
    })
    
    if (!response.ok) {
      return { success: false, error: 'Failed to award XP' }
    }
    
    const result = await response.json()
    
    return {
      success: result.success,
      xpGained: result.xpAwarded,
      newLevel: result.newLevel,
      leveledUp: result.newLevel !== undefined,
    }
  } catch (error: any) {
    console.error('Error awarding XP:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Get user's level progress
 */
export async function getLevelProgress(userId: string): Promise<{
  currentLevel: number
  currentXP: number
  currentLevelXP: number
  nextLevelXP: number
  xpToNextLevel: number
  progressPercentage: number
} | null> {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/xp/progress/${userId}`, {
      credentials: 'include',
    })
    
    if (!response.ok) return null
    
    const progress = await response.json()
    
    if (!progress) return null

    return {
      currentLevel: progress.user.level,
      currentXP: progress.user.xp,
      currentLevelXP: progress.currentLevel?.xpRequired || 0,
      nextLevelXP: progress.nextLevel?.xpRequired || 0,
      xpToNextLevel: progress.xpToNextLevel,
      progressPercentage: progress.progressPercentage,
    }
  } catch (error) {
    console.error('Error getting level progress:', error)
    return null
  }
}

/**
 * Get user's badges
 */
export async function getUserBadges(userId: string) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}/badges`, {
      credentials: 'include',
    })
    
    if (!response.ok) return []
    
    const data = await response.json()
    return data.badges || []
  } catch (error) {
    console.error('Error getting user badges:', error)
    return []
  }
}

/**
 * Get user's XP history
 */
export async function getXPHistory(userId: string, limit = 20) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}/xp-history?limit=${limit}`, {
      credentials: 'include',
    })
    
    if (!response.ok) return []
    
    const data = await response.json()
    return data.history || []
  } catch (error) {
    console.error('Error getting XP history:', error)
    return []
  }
}

/**
 * Calculate level from XP
 */
export function calculateLevel(xp: number): number {
  // Linear progression: Level = floor(XP / 100) + 1
  return Math.floor(xp / 100) + 1
}

/**
 * Calculate XP required for a level
 */
export function calculateXPForLevel(level: number): number {
  // Linear progression: XP = (Level - 1) * 100
  return (level - 1) * 100
}

/**
 * Get level title
 */
export function getLevelTitle(level: number): string {
  if (level <= 4) return 'Beginner'
  if (level <= 9) return 'Apprentice'
  if (level <= 19) return 'Artist'
  if (level <= 29) return 'Expert Artist'
  if (level <= 49) return 'Master Artist'
  return 'Legend'
}

/**
 * Format XP number
 */
export function formatXP(xp: number): string {
  if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`
  return xp.toString()
}
