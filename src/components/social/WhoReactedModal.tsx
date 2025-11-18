// @ts-nocheck
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { X, UserPlus, UserCheck } from 'lucide-react'

const REACTIONS = [
  { type: 'like', emoji: '👍' },
  { type: 'love', emoji: '❤️' },
  { type: 'wow', emoji: '😮' },
  { type: 'sad', emoji: '😢' },
  { type: 'angry', emoji: '😡' },
  { type: 'celebrate', emoji: '🎉' },
]

type Reaction = {
  id: string
  user_id: string
  reaction_type: string
  users: {
    id: string
    username: string
    avatar_url: string | null
  }
}

type Props = {
  entryId: string
  onClose: () => void
}

export default function WhoReactedModal({ entryId, onClose }: Props) {
  const { user } = useAuthStore()
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [following, setFollowing] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReactions()
    if (user) {
      fetchFollowing()
    }
  }, [entryId, user])

  const fetchReactions = async () => {
    try {
      const { data, error } = await supabase
        .from('reactions')
        .select(`
          *,
          users:user_id (id, username, avatar_url)
        `)
        .eq('entry_id', entryId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReactions(data || [])
    } catch (error) {
      console.error('Error fetching reactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFollowing = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)

      if (error) throw error
      
      const followingIds = new Set(data?.map(f => f.following_id) || [])
      setFollowing(followingIds)
    } catch (error) {
      console.error('Error fetching following:', error)
    }
  }

  const handleFollow = async (userId: string) => {
    if (!user) {
      alert('Please login to follow users')
      return
    }

    try {
      if (following.has(userId)) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId)

        if (error) throw error
        
        setFollowing(prev => {
          const newSet = new Set(prev)
          newSet.delete(userId)
          return newSet
        })
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: userId,
          })

        if (error) throw error
        
        setFollowing(prev => new Set(prev).add(userId))
      }
    } catch (error) {
      console.error('Error following/unfollowing:', error)
      alert('Failed to update follow status')
    }
  }

  const getReactionEmoji = (type: string) => {
    return REACTIONS.find(r => r.type === type)?.emoji || '👍'
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-xl font-bold">Reactions</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
          {loading ? (
            <div className="text-center py-8 text-text-secondary">Loading...</div>
          ) : reactions.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">No reactions yet</div>
          ) : (
            <div className="divide-y divide-border">
              {reactions.map((reaction) => (
                <div key={reaction.id} className="p-4 flex items-center gap-3 hover:bg-background transition-colors">
                  {/* Avatar */}
                  <Link to={`/profile/${reaction.users.username}`} className="flex-shrink-0">
                    {reaction.users.avatar_url ? (
                      <img
                        src={reaction.users.avatar_url}
                        alt={reaction.users.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                        {reaction.users.username[0].toUpperCase()}
                      </div>
                    )}
                  </Link>

                  {/* Username & Reaction */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/profile/${reaction.users.username}`}
                      className="font-semibold hover:text-primary transition-colors block truncate"
                    >
                      @{reaction.users.username}
                    </Link>
                    <span className="text-2xl">{getReactionEmoji(reaction.reaction_type)}</span>
                  </div>

                  {/* Follow Button */}
                  {user && user.id !== reaction.users.id && (
                    <button
                      onClick={() => handleFollow(reaction.users.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        following.has(reaction.users.id)
                          ? 'bg-surface border border-border hover:bg-background text-text-secondary'
                          : 'bg-primary text-white hover:bg-primary/80'
                      }`}
                    >
                      {following.has(reaction.users.id) ? (
                        <>
                          <UserCheck className="w-4 h-4" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Follow
                        </>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
