import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { entriesApi, commentsApi, contestsApi, usersApi } from '@/lib/api'
import ReactionPicker from '@/components/social/ReactionPicker'
import Comments from '@/components/social/Comments'
import ShareButton from '@/components/social/ShareButton'
import { Heart, MessageCircle, Share2 } from 'lucide-react'
import type { ContestCategory } from '@/types/contest'
import { getPhasesForCategory } from '@/constants/phases'

type Entry = {
  id: string
  userId: string
  contestId: string
  title: string | null
  description: string | null
  phase1Url: string | null
  phase2Url: string | null
  phase3Url: string | null
  phase4Url: string | null
  voteCount: number
  shareCount: number
  commentCount: number
  finalRank: number | null
  status: string
  users: {
    username: string
    displayName: string | null
    avatarUrl: string | null
    level: number
  }
  contests: {
    title: string
    category: ContestCategory
  }
}

export default function EntryDetailPage() {
  const { id } = useParams()
  const [entry, setEntry] = useState<Entry | null>(null)
  const [selectedPhase, setSelectedPhase] = useState(4)
  const [loading, setLoading] = useState(true)
  const [commentCount, setCommentCount] = useState(0)

  useEffect(() => {
    if (id) {
      fetchEntry()
    }
  }, [id])

  const fetchEntry = async () => {
    if (!id) return
    try {
      const response: any = await entriesApi.get(id)
      const data = response.entry
      setEntry(data)
      const entryRaw = data as any
      
      // Fetch related data separately
      const userResponse: any = await usersApi.getById(entryRaw.userId)
      const userData = userResponse.user
      const contestResponse: any = await contestsApi.get(entryRaw.contestId)
      const contestData = contestResponse.contest
      const reactionsResponse: any = await entriesApi.getReactions(entryRaw.id)
      const reactionCount = reactionsResponse.reactions?.length || 0
      const commentsResponse: any = await commentsApi.list(entryRaw.id)
      const commentCount = commentsResponse.comments?.length || 0
      
      const entryData = {
        ...entryRaw,
        voteCount: reactionCount || 0,
        commentCount: commentCount || 0,
        users: userData,
        contests: contestData
      }
      
      setEntry(entryData)
      
      // Set initial phase to the highest available
      if (entryData.phase4Url) setSelectedPhase(4)
      else if (entryData.phase3Url) setSelectedPhase(3)
      else if (entryData.phase2Url) setSelectedPhase(2)
      else setSelectedPhase(1)
    } catch (error) {
      console.error('Error fetching entry:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPhaseUrl = (phaseNum: number) => {
    if (!entry) return null
    switch (phaseNum) {
      case 1: return entry.phase1Url
      case 2: return entry.phase2Url
      case 3: return entry.phase3Url
      case 4: return entry.phase4Url
      default: return null
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading entry...</div>
  }

  if (!entry) {
    return <div className="text-center py-12">Entry not found</div>
  }

  // Get phase configurations based on contest category
  const category = (entry.contests.category || 'art') as ContestCategory
  const phaseConfigs = getPhasesForCategory(category)
  
  // Build phases array with actual URLs
  const phases = phaseConfigs.map((config) => ({
    num: config.number,
    label: config.name,
    url: getPhaseUrl(config.number)
  })).filter(phase => phase.url) // Only show phases that have been uploaded

  const entryUrl = `${window.location.origin}/entries/${entry.id}`
  const entryTitle = entry.title || `Entry by ${entry.users.displayName || entry.users.username}`
  const entryDescription = entry.description || `Check out this amazing artwork in ${entry.contests.title}!`
  const entryImage = entry.phase4Url || entry.phase3Url || entry.phase2Url || entry.phase1Url || ''

  return (
    <>
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{entryTitle} - Arena for Creatives</title>
        <meta name="description" content={entryDescription} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={entryUrl} />
        <meta property="og:title" content={entryTitle} />
        <meta property="og:description" content={entryDescription} />
        <meta property="og:image" content={entryImage} />
        <meta property="og:image:secure_url" content={entryImage} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={entryTitle} />
        <meta property="og:site_name" content="Arena for Creatives" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={entryUrl} />
        <meta name="twitter:title" content={entryTitle} />
        <meta name="twitter:description" content={entryDescription} />
        <meta name="twitter:image" content={entryImage} />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="aspect-square bg-surface rounded-lg border border-border flex items-center justify-center mb-4 overflow-hidden">
            {getPhaseUrl(selectedPhase) ? (
              <img
                src={getPhaseUrl(selectedPhase) || ''}
                alt={`Phase ${selectedPhase}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <p className="text-text-secondary">No image for this phase</p>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-center mb-3">4-Step Art Process</p>
            <div className="grid grid-cols-4 gap-2">
              {phases.map((phase) => (
                <button
                  key={phase.num}
                  onClick={() => phase.url && setSelectedPhase(phase.num)}
                  disabled={!phase.url}
                  className={`aspect-square rounded border transition-all ${
                    phase.url
                      ? selectedPhase === phase.num
                        ? 'border-primary bg-primary/10 ring-2 ring-primary'
                        : 'border-border bg-surface hover:border-primary/50'
                      : 'border-border bg-background opacity-50 cursor-not-allowed'
                  } flex flex-col items-center justify-center text-xs font-medium overflow-hidden relative`}
                >
                  {phase.url ? (
                    <>
                      <img src={phase.url} alt={phase.label} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs py-1 text-center">
                        {phase.label}
                      </div>
                    </>
                  ) : (
                    <span className="text-text-secondary text-center px-1">{phase.label}</span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-text-secondary text-center mt-2">
              <span className="font-semibold">Viewing:</span> {phases[selectedPhase - 1].label}
            </p>
          </div>
        </div>

        <div>
          {/* Title and Description */}
          {entry.title && (
            <h1 className="text-3xl font-bold mb-3">{entry.title}</h1>
          )}
          
          {entry.description && (
            <p className="text-text-secondary mb-6 leading-relaxed">{entry.description}</p>
          )}

          <Link
            to={`/users/${entry.users.username}`}
            className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity"
          >
            {entry.users.avatarUrl ? (
              <img
                src={entry.users.avatarUrl}
                alt={entry.users.username}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center font-bold">
                {entry.users.username[0].toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="font-semibold">@{entry.users.username}</h3>
              <p className="text-sm text-text-secondary">Level {entry.users.level}</p>
            </div>
          </Link>

          <p className="text-text-secondary mb-4">
            Contest: <Link to={`/contests/${entry.contestId}`} className="text-primary hover:underline">{entry.contests.title}</Link>
          </p>

          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${
              entry.status === 'approved'
                ? 'bg-success/20 text-success'
                : entry.status === 'pending_review'
                ? 'bg-warning/20 text-warning'
                : 'bg-error/20 text-error'
            }`}
          >
            {entry.status.replace('_', ' ').toUpperCase()}
          </span>

          {/* Stats Bar */}
          <div className="flex items-center gap-4 text-sm text-text-secondary mb-6 pb-4 border-b border-border">
            <div className="flex items-center gap-1.5">
              <Heart className="w-4 h-4" />
              <span>{entry.voteCount} votes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4" />
              <span>{commentCount} comments</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Share2 className="w-4 h-4" />
              <span>{entry.shareCount || 0} shares</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-start justify-between gap-3 mb-6">
            {/* Reaction Picker */}
            {entry.status === 'approved' && (
              <ReactionPicker entryId={entry.id} />
            )}
            
            {/* Share Button */}
            <ShareButton 
              entry={entry}
              variant="button"
              showCount={false}
              shareCount={entry.shareCount || 0}
              onShareComplete={fetchEntry}
            />
          </div>

          {/* Stats */}
          <div className="bg-surface rounded-lg p-4 mb-6">
            {entry.finalRank && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Current Rank</span>
                <span className="font-semibold text-lg text-primary">#{entry.finalRank}</span>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div>
            <Comments entryId={entry.id} entryOwnerId={entry.userId} onCommentCountChange={setCommentCount} />
          </div>
        </div>
      </div>
      </div>
    </>
  )
}
