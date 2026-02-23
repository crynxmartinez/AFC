// @ts-nocheck
import { useState, useEffect, useRef } from 'react'
import { reactionsApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import WhoReactedModal from './WhoReactedModal'
import { awardXP } from '@/lib/xp'

type ReactionType = 'like' | 'love' | 'haha' | 'fire' | 'wow' | 'sad' | 'cry' | 'angry'

const REACTIONS = [
  { type: 'like' as ReactionType, emoji: '👍', label: 'Like' },
  { type: 'love' as ReactionType, emoji: '❤️', label: 'Love' },
  { type: 'haha' as ReactionType, emoji: '😂', label: 'Haha' },
  { type: 'fire' as ReactionType, emoji: '🔥', label: 'Fire' },
  { type: 'wow' as ReactionType, emoji: '😮', label: 'Wow' },
  { type: 'sad' as ReactionType, emoji: '😢', label: 'Sad' },
  { type: 'cry' as ReactionType, emoji: '😭', label: 'Cry' },
  { type: 'angry' as ReactionType, emoji: '😡', label: 'Angry' },
]

type Props = {
  entryId: string
  onReactionChange?: () => void
}

export default function ReactionPicker({ entryId, onReactionChange }: Props) {
  const { user } = useAuthStore()
  const [showPicker, setShowPicker] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null)
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({})
  const [totalReactions, setTotalReactions] = useState(0)
  const [loading, setLoading] = useState(false)
  const toast = useToastStore()
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchReactions()
    
    // Close picker when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [entryId])

  const fetchReactions = async () => {
    try {
      // Get all reactions for this entry
      const response: any = await reactionsApi.list(entryId)
      const reactions = response.reactions || []

      // Count reactions by type
      const counts: Record<string, number> = {}
      let total = 0
      
      reactions.forEach((reaction: any) => {
        counts[reaction.reactionType] = (counts[reaction.reactionType] || 0) + 1
        total++
        
        // Check if current user reacted
        if (user && reaction.userId === user.id) {
          setUserReaction(reaction.reactionType)
        }
      })

      setReactionCounts(counts)
      setTotalReactions(total)
    } catch (error) {
      console.error('Error fetching reactions:', error)
    }
  }

  const handleReaction = async (reactionType: ReactionType) => {
    if (!user) {
      toast.warning('Please login to react')
      return
    }

    setLoading(true)
    setShowPicker(false)

    try {
      if (userReaction === reactionType) {
        // Remove reaction
        await reactionsApi.remove(entryId)
        setUserReaction(null)
      } else {
        // Add or update reaction
        await reactionsApi.add(entryId, reactionType)
        setUserReaction(reactionType)
        
        // Create notification for entry owner
        await createReactionNotification(reactionType)
      }

      // Refresh counts
      await fetchReactions()
      
      // Refresh user profile to update points balance
      const { fetchProfile } = useAuthStore.getState()
      await fetchProfile()
      
      onReactionChange?.()
    } catch (error) {
      console.error('Error handling reaction:', error)
      toast.error('Failed to react. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const createReactionNotification = async (reactionType: ReactionType) => {
    try {
      // Notifications will be created by the API endpoint
      // XP will be awarded by the API endpoint
      // This function is now a placeholder for future client-side notification logic
    } catch (error) {
      console.error('Error creating notification:', error)
    }
  }

  const getUserReactionEmoji = () => {
    if (!userReaction) return '👍'
    return REACTIONS.find(r => r.type === userReaction)?.emoji || '👍'
  }

  return (
    <div className="relative" ref={pickerRef}>
      {/* Reaction Button */}
      <button
        onClick={() => setShowPicker(!showPicker)}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
          userReaction
            ? 'bg-primary/20 text-primary border-2 border-primary'
            : 'bg-surface border border-border hover:bg-background'
        }`}
      >
        <span className="text-xl">{getUserReactionEmoji()}</span>
        <span className="font-medium">{totalReactions > 0 ? totalReactions : 'React'}</span>
      </button>

      {/* Reaction Picker Popup */}
      {showPicker && (
        <div className="absolute bottom-full left-0 mb-2 bg-surface border border-border rounded-lg shadow-lg p-2 flex gap-1 z-50">
          {REACTIONS.map((reaction) => (
            <button
              key={reaction.type}
              onClick={() => handleReaction(reaction.type)}
              className="group relative p-2 hover:bg-background rounded-lg transition-all hover:scale-125"
              title={reaction.label}
            >
              <span className="text-2xl">{reaction.emoji}</span>
              {reactionCounts[reaction.type] > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {reactionCounts[reaction.type]}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Reaction Breakdown (optional tooltip) */}
      {totalReactions > 0 && (
        <div className="mt-1 text-xs text-text-secondary flex gap-2 flex-wrap">
          {Object.entries(reactionCounts).map(([type, count]) => {
            const reaction = REACTIONS.find(r => r.type === type)
            return (
              <span key={type} className="flex items-center gap-1">
                {reaction?.emoji} {count}
              </span>
            )
          })}
          <button
            onClick={() => setShowModal(true)}
            className="text-primary hover:underline ml-2"
          >
            See all
          </button>
        </div>
      )}

      {/* Who Reacted Modal */}
      {showModal && (
        <WhoReactedModal
          entryId={entryId}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
