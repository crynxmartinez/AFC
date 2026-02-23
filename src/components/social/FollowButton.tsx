// @ts-nocheck
import { useState, useEffect } from 'react'
import { followsApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { UserPlus, UserMinus } from 'lucide-react'
import { useToastStore } from '@/stores/toastStore'

type Props = {
  userId: string
  username: string
  onFollowChange?: () => void
  size?: 'sm' | 'md' | 'lg'
}

export default function FollowButton({ userId, username, onFollowChange, size = 'md' }: Props) {
  const { user } = useAuthStore()
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const toast = useToastStore()

  // Use currentUserId to prevent refetch on auth state changes
  const currentUserId = user?.id

  useEffect(() => {
    if (currentUserId && userId) {
      checkFollowStatus()
    }
  }, [currentUserId, userId])

  const checkFollowStatus = async () => {
    if (!user) return
    
    try {
      const response: any = await followsApi.check(userId)
      setIsFollowing(response.isFollowing || false)
    } catch (error) {
      console.error('Error checking follow status:', error)
    } finally {
      setChecking(false)
    }
  }

  const handleFollow = async () => {
    if (!user) {
      toast.warning('Please login to follow artists')
      return
    }

    if (user.id === userId) {
      toast.info("You can't follow yourself!")
      return
    }

    setLoading(true)

    try {
      if (isFollowing) {
        // Unfollow
        await followsApi.unfollow(userId)
        setIsFollowing(false)
      } else {
        // Follow
        await followsApi.follow(userId)
        setIsFollowing(true)
      }

      onFollowChange?.()
    } catch (error) {
      console.error('Error toggling follow:', error)
      toast.error('Failed to update follow status')
    } finally {
      setLoading(false)
    }
  }

  // Don't show button for own profile
  if (user?.id === userId) {
    return null
  }

  if (checking) {
    return (
      <button
        disabled
        className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-background text-text-secondary cursor-not-allowed ${
          size === 'sm' ? 'text-sm px-3 py-1.5' : size === 'lg' ? 'text-lg px-6 py-3' : ''
        }`}
      >
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-text-secondary"></div>
      </button>
    )
  }

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`flex items-center gap-2 rounded-lg font-semibold transition-colors ${
        isFollowing
          ? 'bg-background hover:bg-error/20 text-text-secondary hover:text-error border border-border'
          : 'bg-primary hover:bg-primary-hover text-white'
      } ${
        size === 'sm' ? 'text-sm px-3 py-1.5' : size === 'lg' ? 'text-lg px-6 py-3' : 'px-4 py-2'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          <span>{isFollowing ? 'Unfollowing...' : 'Following...'}</span>
        </>
      ) : isFollowing ? (
        <>
          <UserMinus className="w-4 h-4" />
          <span>Unfollow</span>
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          <span>Follow</span>
        </>
      )}
    </button>
  )
}
