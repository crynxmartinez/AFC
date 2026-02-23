// @ts-nocheck
import { useState } from 'react'
import { Share2, Facebook, X } from 'lucide-react'
import { useToastStore } from '@/stores/toastStore'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

interface ShareButtonProps {
  entry: {
    id: string
    title: string | null
    description: string | null
    phase_4_url: string | null
    user_id: string
    contest_id: string
    users: {
      username: string
      display_name: string | null
    }
    contests: {
      title: string
    }
  }
  variant?: 'button' | 'icon'
  showCount?: boolean
  shareCount?: number
  onShareComplete?: () => void
}

export default function ShareButton({ 
  entry, 
  variant = 'button', 
  showCount = false,
  shareCount = 0,
  onShareComplete 
}: ShareButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const { user } = useAuthStore()
  const toast = useToastStore()

  const entryUrl = `${window.location.origin}/entries/${entry.id}`
  const artistName = entry.users.display_name || entry.users.username
  const entryTitle = entry.title || 'Untitled Entry'
  const entryDescription = entry.description || ''
  const imageUrl = entry.phase_4_url || ''

  // Share text templates
  const getShareText = (platform: string) => {
    const baseText = `🎨 ${entryTitle}\nby ${artistName}\n\n${entryDescription.substring(0, 100)}${entryDescription.length > 100 ? '...' : ''}\n\nVote now: ${entryUrl}\n#ArenaForCreatives #ArtContest`
    
    switch (platform) {
      case 'twitter':
        return `🎨 ${entryTitle}\nby ${artistName}\n\nVote: ${entryUrl}\n#ArenaForCreatives`
      case 'instagram':
        return `🎨 ${entryTitle}\nby ${artistName}\n\n${entryDescription}\n\nVote on Arena for Creatives!\nLink in bio\n#ArenaForCreatives #ArtContest`
      case 'whatsapp':
      case 'telegram':
        return `🎨 Check out this artwork!\n\n${entryTitle}\nby ${artistName}\n\nVote: ${entryUrl}`
      default:
        return baseText
    }
  }

  // Track share and award XP
  const trackShare = async (platform: string) => {
    if (!user) return

    try {
      setIsSharing(true)

      // 1. Record the share
      const { error: shareError } = await supabase
        .from('shares')
        .insert({
          user_id: user.id,
          entry_id: entry.id,
          contest_id: entry.contest_id,
          platform: platform
        })

      if (shareError) throw shareError

      // 2. Check if user already claimed daily share XP
      const today = new Date().toISOString().split('T')[0]
      const { data: existingClaim } = await supabase
        .from('daily_xp_claims')
        .select('*')
        .eq('user_id', user.id)
        .eq('claim_type', 'share')
        .eq('claim_date', today)
        .single()

      // 3. Award XP if first share of the day
      if (!existingClaim) {
        // Award 10 XP
        const { error: xpError } = await supabase.rpc('award_xp', {
          user_uuid: user.id,
          xp_amount: 10,
          reason: 'Daily Share'
        })

        if (xpError) console.error('XP award error:', xpError)

        // Record the claim
        await supabase.from('daily_xp_claims').insert({
          user_id: user.id,
          claim_type: 'share',
          claim_date: today,
          xp_amount: 10,
          platform: platform
        })

        // Show notification
        toast.success('🎉 +10 XP for sharing!')
      }

      // 4. Update user share stats
      await supabase.rpc('update_user_share_stats', {
        user_uuid: user.id,
        share_date: today
      })

      // 5. Callback to refresh share count
      onShareComplete?.()

    } catch (error) {
      console.error('Share tracking error:', error)
    } finally {
      setIsSharing(false)
    }
  }

  // Facebook share handler
  const handleFacebookShare = async () => {
    await trackShare('facebook')
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(entryUrl)}`
    window.open(shareUrl, '_blank', 'width=600,height=400')
    setShowModal(false)
  }

  return (
    <>
      {/* Share Button */}
      {variant === 'button' ? (
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-border rounded-lg transition-colors"
          disabled={isSharing}
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
          {showCount && shareCount > 0 && (
            <span className="text-xs text-text-secondary">({shareCount})</span>
          )}
        </button>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          className="p-2 hover:bg-surface rounded-lg transition-colors"
          disabled={isSharing}
          title="Share"
        >
          <Share2 className="w-5 h-5" />
        </button>
      )}

      {/* Share Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg max-w-md w-full p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Share this entry</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-background rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Entry Preview */}
            <div className="mb-6 p-4 bg-background rounded-lg">
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={entryTitle}
                  className="w-full h-32 object-cover rounded mb-2"
                />
              )}
              <p className="font-semibold">{entryTitle}</p>
              <p className="text-sm text-text-secondary">by {artistName}</p>
            </div>

            {/* Share Platforms */}
            <div className="space-y-4">
              <p className="text-sm font-medium text-text-secondary">Share to:</p>
              
              {/* Facebook Only */}
              <button
                onClick={handleFacebookShare}
                className="w-full flex items-center justify-center gap-3 p-4 bg-[#1877F2] hover:bg-[#1565D8] rounded-lg transition-colors"
                disabled={isSharing}
              >
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <Facebook className="w-6 h-6 text-[#1877F2]" fill="#1877F2" />
                </div>
                <span className="text-white font-semibold text-lg">Share on Facebook</span>
              </button>
              
              <p className="text-xs text-text-secondary text-center">
                More platforms coming soon! 🚀
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
