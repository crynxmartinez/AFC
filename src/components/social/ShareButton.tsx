// @ts-nocheck
import { useState } from 'react'
import { Share2, Facebook, Twitter, Instagram, Linkedin, MessageCircle, Send, Link as LinkIcon, Download, X } from 'lucide-react'
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
        alert('🎉 +10 XP for sharing!')
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

  // Platform share handlers
  const handleFacebookShare = async () => {
    await trackShare('facebook')
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(entryUrl)}`
    window.open(shareUrl, '_blank', 'width=600,height=400')
    setShowModal(false)
  }

  const handleTwitterShare = async () => {
    await trackShare('twitter')
    const text = getShareText('twitter')
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(shareUrl, '_blank', 'width=600,height=400')
    setShowModal(false)
  }

  const handleLinkedInShare = async () => {
    await trackShare('linkedin')
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(entryUrl)}`
    window.open(shareUrl, '_blank', 'width=600,height=400')
    setShowModal(false)
  }

  const handlePinterestShare = async () => {
    await trackShare('pinterest')
    const shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(entryUrl)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(entryTitle)}`
    window.open(shareUrl, '_blank', 'width=600,height=400')
    setShowModal(false)
  }

  const handleWhatsAppShare = async () => {
    await trackShare('whatsapp')
    const text = getShareText('whatsapp')
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(shareUrl, '_blank')
    setShowModal(false)
  }

  const handleTelegramShare = async () => {
    await trackShare('telegram')
    const text = getShareText('telegram')
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(entryUrl)}&text=${encodeURIComponent(text)}`
    window.open(shareUrl, '_blank')
    setShowModal(false)
  }

  const handleInstagramShare = async () => {
    await trackShare('instagram')
    const text = getShareText('instagram')
    
    // Copy caption to clipboard
    navigator.clipboard.writeText(text)
    
    // Download image
    if (imageUrl) {
      const link = document.createElement('a')
      link.href = imageUrl
      link.download = `${entryTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.jpg`
      link.click()
    }
    
    alert('📸 Caption copied & image downloaded!\nShare on Instagram Stories or Feed')
    setShowModal(false)
  }

  const handleTikTokShare = async () => {
    await trackShare('tiktok')
    const text = getShareText('whatsapp')
    navigator.clipboard.writeText(text)
    alert('🎵 Link copied! Share on TikTok')
    setShowModal(false)
  }

  const handleCopyLink = async () => {
    await trackShare('copy_link')
    navigator.clipboard.writeText(entryUrl)
    alert('🔗 Link copied to clipboard!')
    setShowModal(false)
  }

  const handleDownload = async () => {
    await trackShare('download')
    if (imageUrl) {
      const link = document.createElement('a')
      link.href = imageUrl
      link.download = `${entryTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.jpg`
      link.click()
      alert('💾 Image downloaded!')
    }
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
              
              {/* Row 1 */}
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={handleFacebookShare}
                  className="flex flex-col items-center gap-2 p-3 hover:bg-background rounded-lg transition-colors"
                  disabled={isSharing}
                >
                  <div className="w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center">
                    <Facebook className="w-6 h-6 text-white" fill="white" />
                  </div>
                  <span className="text-xs">Facebook</span>
                </button>

                <button
                  onClick={handleTwitterShare}
                  className="flex flex-col items-center gap-2 p-3 hover:bg-background rounded-lg transition-colors"
                  disabled={isSharing}
                >
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                    <Twitter className="w-6 h-6 text-white" fill="white" />
                  </div>
                  <span className="text-xs">X</span>
                </button>

                <button
                  onClick={handleInstagramShare}
                  className="flex flex-col items-center gap-2 p-3 hover:bg-background rounded-lg transition-colors"
                  disabled={isSharing}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 rounded-full flex items-center justify-center">
                    <Instagram className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs">Instagram</span>
                </button>

                <button
                  onClick={handleTikTokShare}
                  className="flex flex-col items-center gap-2 p-3 hover:bg-background rounded-lg transition-colors"
                  disabled={isSharing}
                >
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">TT</span>
                  </div>
                  <span className="text-xs">TikTok</span>
                </button>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={handleLinkedInShare}
                  className="flex flex-col items-center gap-2 p-3 hover:bg-background rounded-lg transition-colors"
                  disabled={isSharing}
                >
                  <div className="w-12 h-12 bg-[#0A66C2] rounded-full flex items-center justify-center">
                    <Linkedin className="w-6 h-6 text-white" fill="white" />
                  </div>
                  <span className="text-xs">LinkedIn</span>
                </button>

                <button
                  onClick={handlePinterestShare}
                  className="flex flex-col items-center gap-2 p-3 hover:bg-background rounded-lg transition-colors"
                  disabled={isSharing}
                >
                  <div className="w-12 h-12 bg-[#E60023] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">P</span>
                  </div>
                  <span className="text-xs">Pinterest</span>
                </button>

                <button
                  onClick={handleWhatsAppShare}
                  className="flex flex-col items-center gap-2 p-3 hover:bg-background rounded-lg transition-colors"
                  disabled={isSharing}
                >
                  <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" fill="white" />
                  </div>
                  <span className="text-xs">WhatsApp</span>
                </button>

                <button
                  onClick={handleTelegramShare}
                  className="flex flex-col items-center gap-2 p-3 hover:bg-background rounded-lg transition-colors"
                  disabled={isSharing}
                >
                  <div className="w-12 h-12 bg-[#0088cc] rounded-full flex items-center justify-center">
                    <Send className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs">Telegram</span>
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-border"></div>

              {/* Copy & Download */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-background hover:bg-border rounded-lg transition-colors"
                  disabled={isSharing}
                >
                  <LinkIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">Copy Link</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-background hover:bg-border rounded-lg transition-colors"
                  disabled={isSharing}
                >
                  <Download className="w-5 h-5" />
                  <span className="text-sm font-medium">Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
