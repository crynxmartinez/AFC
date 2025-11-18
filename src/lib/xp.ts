import { supabase } from './supabase'

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
    const { data, error } = await supabase.rpc('award_xp', {
      p_user_id: userId,
      p_action_type: actionType,
      p_reference_id: referenceId || null,
      p_description: description || null,
    } as any)

    if (error) throw error

    const result = data?.[0] as any
    return {
      success: true,
      xpGained: result?.xp_gained,
      newTotalXP: result?.new_total_xp,
      newLevel: result?.new_level,
      leveledUp: result?.leveled_up,
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
    const { data, error } = await supabase.rpc('get_level_progress', {
      p_user_id: userId,
    } as any)

    if (error) throw error

    return (data as any)?.[0] || null
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
    const { data, error } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false })

    if (error) throw error
    return data || []
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
    const { data, error } = await supabase
      .from('xp_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
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
