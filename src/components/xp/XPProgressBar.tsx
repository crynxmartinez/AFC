import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { getLevelProgress, formatXP } from '@/lib/xp'
import { TrendingUp } from 'lucide-react'

export default function XPProgressBar() {
  const { user, profile } = useAuthStore()
  const [progress, setProgress] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Type assertion for new profile fields
  const extendedProfile = profile as any

  useEffect(() => {
    if (user?.id) {
      fetchProgress()
    }
  }, [user?.id, profile?.xp, profile?.level])

  const fetchProgress = async () => {
    if (!user?.id) return
    
    try {
      const data = await getLevelProgress(user.id)
      setProgress(data)
    } catch (error) {
      console.error('Error fetching XP progress:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="px-3 py-2 bg-surface rounded-lg border border-border">
        <div className="animate-pulse">
          <div className="h-4 bg-background rounded w-3/4 mb-2"></div>
          <div className="h-2 bg-background rounded"></div>
        </div>
      </div>
    )
  }

  // Use profile data as fallback if progress fetch fails
  const currentXp = progress?.current_xp ?? profile?.xp ?? 0
  const nextLevelXp = progress?.xp_for_next_level ?? ((profile?.level || 1) * 100)
  const percentage = progress?.progress_percentage ?? 0

  return (
    <div className="px-3 py-2 bg-surface rounded-lg border border-border">
      {/* Level and Title */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="font-bold text-base">Level {profile?.level || 1}</span>
          </div>
          <p className="text-xs text-text-secondary">{extendedProfile?.profile_title || 'Beginner'}</p>
        </div>
        {extendedProfile?.xp_multiplier && extendedProfile.xp_multiplier > 1 && (
          <div className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
            +{((extendedProfile.xp_multiplier - 1) * 100).toFixed(0)}% XP
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-1">
        <div className="w-full bg-background rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary to-primary-hover h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* XP Numbers */}
      <div className="flex justify-between text-xs text-text-secondary">
        <span>{formatXP(currentXp)} XP</span>
        <span>{percentage}%</span>
        <span>{formatXP(nextLevelXp)} XP</span>
      </div>
    </div>
  )
}
