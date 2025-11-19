// @ts-nocheck
import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import WhoReactedModal from './WhoReactedModal'
import { awardXP } from '@/lib/xp'

type ReactionType = 'like' | 'love' | 'wow' | 'sad' | 'angry' | 'celebrate'

const REACTIONS = [
  { type: 'like' as ReactionType, emoji: '👍', label: 'Like' },
  { type: 'love' as ReactionType, emoji: '❤️', label: 'Love' },
  { type: 'wow' as ReactionType, emoji: '😮', label: 'Wow' },
  { type: 'sad' as ReactionType, emoji: '😢', label: 'Sad' },
  { type: 'angry' as ReactionType, emoji: '😡', label: 'Angry' },
  { type: 'celebrate' as ReactionType, emoji: '🎉', label: 'Celebrate' },
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
      const { data: reactions, error } = await supabase
        .from('reactions')
        .select('*')
        .eq('entry_id', entryId)

      if (error) throw error

      // Count reactions by type
      const counts: Record<string, number> = {}
      let total = 0
      
      reactions?.forEach((reaction) => {
        counts[reaction.reaction_type] = (counts[reaction.reaction_type] || 0) + 1
        total++
        
        // Check if current user reacted
        if (user && reaction.user_id === user.id) {
          setUserReaction(reaction.reaction_type)
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
      alert('Please login to react')
      return
    }

    setLoading(true)
    setShowPicker(false)

    try {
      if (userReaction === reactionType) {
        // Remove reaction - refund 1 point
        const { error: deleteError } = await supabase
          .from('reactions')
          .delete()
          .eq('entry_id', entryId)
          .eq('user_id', user.id)

        if (deleteError) throw deleteError

        // Refund 1 point to user
        await supabase.rpc('add_points', {
          user_id_param: user.id,
          amount: 1
        })

        setUserReaction(null)
      } else if (userReaction) {
        // Update existing reaction (no point cost, just changing reaction type)
        const { error } = await supabase
          .from('reactions')
          .update({ reaction_type: reactionType })
          .eq('entry_id', entryId)
          .eq('user_id', user.id)

        if (error) throw error
        setUserReaction(reactionType)
      } else {
        // Add new reaction - costs 1 point
        // First check if user has enough points
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('points_balance')
          .eq('id', user.id)
          .single()

        if (userError) throw userError

        if (!userData || userData.points_balance < 1) {
          alert('You need at least 1 point to vote! Earn points by participating in contests.')
          setLoading(false)
          return
        }

        // Deduct 1 point from user
        const { data: deductResult } = await supabase.rpc('deduct_points', {
          user_id_param: user.id,
          amount: 1
        })

        if (!deductResult) {
          alert('Failed to deduct points. Please try again.')
          setLoading(false)
          return
        }

        // Add reaction
        const { error: insertError } = await supabase
          .from('reactions')
          .insert({
            entry_id: entryId,
            user_id: user.id,
            reaction_type: reactionType,
          })

        if (insertError) {
          // Refund point if reaction insert fails
          await supabase.rpc('add_points', {
            user_id_param: user.id,
            amount: 1
          })
          throw insertError
        }

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
      alert('Failed to react. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const createReactionNotification = async (reactionType: ReactionType) => {
    try {
      // Get entry owner and title
      const { data: entry } = await supabase
        .from('entries')
        .select('user_id, title')
        .eq('id', entryId)
        .single()

      if (!entry || entry.user_id === user?.id) return // Don't notify self

      // Check if owner wants reaction notifications
      const { data: owner } = await supabase
        .from('users')
        .select('notify_reactions')
        .eq('id', entry.user_id)
        .single()

      if (!owner?.notify_reactions) return

      // Create notification
      const reactionEmoji = REACTIONS.find(r => r.type === reactionType)?.emoji || '👍'
      const entryTitle = entry.title || 'your entry'
      await supabase.from('notifications').insert({
        user_id: entry.user_id,
        type: 'reaction',
        actor_id: user?.id,
        entry_id: entryId,
        content: `reacted ${reactionEmoji} to "${entryTitle}"`,
      })

      // Award XP to entry owner
      await awardXP(entry.user_id, 'get_reaction', entryId, `Received ${reactionEmoji} reaction`)
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
