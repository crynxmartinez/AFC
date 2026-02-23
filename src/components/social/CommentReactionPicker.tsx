// @ts-nocheck
import { useState, useRef, useEffect } from 'react'
import { commentReactionsApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

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
  commentId: string
  initialReaction?: ReactionType | null
  reactionCounts?: Record<string, number>
  onReactionChange?: () => void
}

export default function CommentReactionPicker({ 
  commentId, 
  initialReaction, 
  reactionCounts = {},
  onReactionChange 
}: Props) {
  const { user } = useAuthStore()
  const [showPicker, setShowPicker] = useState(false)
  const [userReaction, setUserReaction] = useState<ReactionType | null>(initialReaction || null)
  const [loading, setLoading] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setUserReaction(initialReaction || null)
  }, [initialReaction])

  useEffect(() => {
    // Close picker when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleReaction = async (reactionType: ReactionType) => {
    if (!user || loading) return
    
    setLoading(true)
    try {
      if (userReaction === reactionType) {
        // Remove reaction
        await commentReactionsApi.remove(commentId)
        setUserReaction(null)
      } else {
        // Add or update reaction
        await commentReactionsApi.add(commentId, reactionType)
        setUserReaction(reactionType)
      }
      
      setShowPicker(false)
      onReactionChange?.()
    } catch (error) {
      console.error('Error handling reaction:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUserReactionEmoji = () => {
    if (!userReaction) return '👍'
    return REACTIONS.find(r => r.type === userReaction)?.emoji || '👍'
  }

  const totalReactions = Object.values(reactionCounts).reduce((sum, count) => sum + count, 0)

  return (
    <div className="relative inline-block" ref={pickerRef}>
      {/* Reaction Button */}
      <button
        onClick={() => setShowPicker(!showPicker)}
        disabled={!user || loading}
        className={`flex items-center gap-1 text-sm transition-colors ${
          userReaction 
            ? 'text-primary font-semibold' 
            : 'text-text-secondary hover:text-primary'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <span className="text-base">{getUserReactionEmoji()}</span>
        {totalReactions > 0 && <span>{totalReactions}</span>}
      </button>

      {/* Reaction Picker Popup */}
      {showPicker && user && (
        <div className="absolute bottom-full left-0 mb-2 bg-surface border border-border rounded-lg shadow-lg p-2 flex gap-1 z-10">
          {REACTIONS.map((reaction) => (
            <button
              key={reaction.type}
              onClick={() => handleReaction(reaction.type)}
              className={`text-2xl hover:scale-125 transition-transform p-1 rounded ${
                userReaction === reaction.type ? 'bg-primary/20' : 'hover:bg-background'
              }`}
              title={reaction.label}
            >
              {reaction.emoji}
            </button>
          ))}
        </div>
      )}

      {/* Reaction Breakdown (tooltip on hover) */}
      {totalReactions > 0 && Object.keys(reactionCounts).length > 0 && (
        <div className="hidden group-hover:block absolute bottom-full left-0 mb-8 bg-surface border border-border rounded-lg shadow-lg p-2 text-xs whitespace-nowrap z-20">
          {Object.entries(reactionCounts).map(([type, count]) => {
            const reaction = REACTIONS.find(r => r.type === type)
            return (
              <div key={type} className="flex items-center gap-2">
                <span>{reaction?.emoji}</span>
                <span>{count}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
