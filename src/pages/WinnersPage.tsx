import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { contestsApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Trophy, Medal, Award, Share2, ExternalLink } from 'lucide-react'
import { useToastStore } from '@/stores/toastStore'

type Winner = {
  id: string
  title: string
  artworkUrl: string
  artist: {
    username: string
    avatarUrl: string | null
  }
  votes: number
  rank: number
}

type Contest = {
  id: string
  title: string
  description: string
  thumbnailUrl: string | null
  endDate: string
  winners: Winner[]
  hasSponsor: boolean
  sponsorName: string | null
  sponsorLogoUrl: string | null
  sponsorPrizeAmount: number | null
}

export default function WinnersPage() {
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)
  const toast = useToastStore()

  useEffect(() => {
    fetchWinners()
  }, [])

  const fetchWinners = async () => {
    try {
      // Fetch ended contests
      const contestsResponse: any = await contestsApi.list('ended')
      const contestsData = contestsResponse.data?.contests || contestsResponse.contests || contestsResponse.data || []

      // For each contest, fetch winners via API
      const contestsWithWinners = await Promise.all(
        contestsData.map(async (contest: any) => {
          try {
            const winnersRes: any = await contestsApi.getContestWinners(contest.id)
            const winnersData = winnersRes.data?.winners || winnersRes.winners || winnersRes.data || []

            const winners = winnersData.slice(0, 3).map((w: any, index: number) => ({
              id: w.entryId || w.id,
              title: w.title || w.entryTitle || 'Untitled',
              artworkUrl: w.phase4Url || w.phase3Url || w.phase2Url || w.phase1Url || w.artworkUrl || '',
              artist: {
                username: w.username || w.artist?.username || 'Unknown',
                avatarUrl: w.avatarUrl || w.artist?.avatarUrl || null,
              },
              votes: w.votesReceived || w.votes || 0,
              rank: w.placement || index + 1,
            }))

            return { ...contest, winners }
          } catch (err) {
            // If no winners endpoint, try entries endpoint
            try {
              const entriesRes: any = await contestsApi.getEntries(contest.id)
              const entries = entriesRes.data?.entries || entriesRes.entries || entriesRes.data || []
              
              const winners = entries.slice(0, 3).map((entry: any, index: number) => ({
                id: entry.id,
                title: entry.title || 'Untitled',
                artworkUrl: entry.phase4Url || entry.phase3Url || entry.phase2Url || entry.phase1Url || '',
                artist: {
                  username: entry.user?.username || entry.username || 'Unknown',
                  avatarUrl: entry.user?.avatarUrl || entry.avatarUrl || null,
                },
                votes: entry.reactionCount || entry.voteCount || 0,
                rank: index + 1,
              }))

              return { ...contest, winners }
            } catch {
              return { ...contest, winners: [] }
            }
          }
        })
      )

      setContests(contestsWithWinners)
    } catch (error) {
      console.error('Error fetching winners:', error)
    } finally {
      setLoading(false)
    }
  }

  const shareToSocial = (contest: Contest, winner: Winner, platform: string) => {
    const url = `${window.location.origin}/entries/${winner.id}`
    const text = `🏆 ${winner.artist.username} won "${contest.title}" on Arena for Creatives!`

    let shareUrl = ''
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        break
      case 'copy':
        navigator.clipboard.writeText(url)
        toast.success('Link copied to clipboard!')
        return
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-orange-600" />
      default:
        return null
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'border-yellow-500 bg-yellow-500/10'
      case 2:
        return 'border-gray-400 bg-gray-400/10'
      case 3:
        return 'border-orange-600 bg-orange-600/10'
      default:
        return 'border-border'
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading winners...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">🏆 Hall of Fame</h1>
        <p className="text-text-secondary text-lg">
          Celebrating the best artists and their winning creations
        </p>
      </div>

      {contests.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-lg border border-border">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-text-secondary" />
          <h2 className="text-2xl font-bold mb-2">No Winners Yet</h2>
          <p className="text-text-secondary">Winners will appear here once contests end!</p>
        </div>
      ) : (
        <div className="space-y-12">
          {contests.map((contest) => (
            <div key={contest.id} className="bg-surface rounded-lg border border-border overflow-hidden">
              {/* Contest Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-start gap-4">
                  {contest.thumbnailUrl && (
                    <img
                      src={contest.thumbnailUrl}
                      alt={contest.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{contest.title}</h2>
                    
                    {/* Sponsor Badge */}
                    {contest.hasSponsor && contest.sponsorName && (
                      <div className="flex items-center gap-2 mb-2 p-2 bg-primary/10 rounded border border-primary/30 inline-flex">
                        {contest.sponsorLogoUrl && (
                          <img 
                            src={contest.sponsorLogoUrl} 
                            alt={contest.sponsorName}
                            className="h-5 w-auto object-contain"
                          />
                        )}
                        <div>
                          <span className="text-xs text-text-secondary">Sponsored by </span>
                          <span className="text-sm font-semibold text-primary">{contest.sponsorName}</span>
                        </div>
                        {contest.sponsorPrizeAmount && contest.sponsorPrizeAmount > 0 && (
                          <span className="text-xs font-bold text-success ml-2">
                            +₱{contest.sponsorPrizeAmount.toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <p className="text-text-secondary mb-2">{contest.description}</p>
                    <p className="text-sm text-text-secondary">
                      Ended: {formatDate(contest.endDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Winners */}
              {contest.winners.length === 0 ? (
                <div className="p-6 text-center text-text-secondary">
                  No entries for this contest
                </div>
              ) : (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {contest.winners.map((winner) => (
                      <div
                        key={winner.id}
                        className={`relative rounded-lg border-2 overflow-hidden ${getRankColor(winner.rank)}`}
                      >
                        {/* Rank Badge */}
                        <div className="absolute top-3 left-3 z-10 bg-background/90 backdrop-blur-sm rounded-full p-2">
                          {getRankIcon(winner.rank)}
                        </div>

                        {/* Share Button */}
                        <div className="absolute top-3 right-3 z-10">
                          <div className="relative group">
                            <button className="bg-background/90 backdrop-blur-sm rounded-full p-2 hover:bg-primary transition-colors">
                              <Share2 className="w-5 h-5" />
                            </button>
                            
                            {/* Share Dropdown */}
                            <div className="hidden group-hover:block absolute right-0 mt-2 bg-surface border border-border rounded-lg shadow-lg py-2 w-40">
                              <button
                                onClick={() => shareToSocial(contest, winner, 'twitter')}
                                className="w-full px-4 py-2 text-left hover:bg-background transition-colors text-sm"
                              >
                                Share on Twitter
                              </button>
                              <button
                                onClick={() => shareToSocial(contest, winner, 'facebook')}
                                className="w-full px-4 py-2 text-left hover:bg-background transition-colors text-sm"
                              >
                                Share on Facebook
                              </button>
                              <button
                                onClick={() => shareToSocial(contest, winner, 'linkedin')}
                                className="w-full px-4 py-2 text-left hover:bg-background transition-colors text-sm"
                              >
                                Share on LinkedIn
                              </button>
                              <button
                                onClick={() => shareToSocial(contest, winner, 'copy')}
                                className="w-full px-4 py-2 text-left hover:bg-background transition-colors text-sm"
                              >
                                Copy Link
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Artwork */}
                        <Link to={`/entries/${winner.id}`}>
                          <div className="aspect-square bg-background overflow-hidden">
                            <img
                              src={winner.artworkUrl}
                              alt={winner.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        </Link>

                        {/* Info */}
                        <div className="p-4">
                          <Link to={`/entries/${winner.id}`} className="group">
                            <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                              {winner.title}
                              <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </h3>
                          </Link>
                          
                          <Link
                            to={`/users/${winner.artist.username}`}
                            className="flex items-center gap-2 mb-3 hover:text-primary transition-colors"
                          >
                            {winner.artist.avatarUrl ? (
                              <img
                                src={winner.artist.avatarUrl}
                                alt={winner.artist.username}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold">
                                {winner.artist.username[0].toUpperCase()}
                              </div>
                            )}
                            <span className="font-medium">@{winner.artist.username}</span>
                          </Link>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-text-secondary">{winner.votes} reactions</span>
                            <span className="font-semibold text-primary">
                              {winner.rank === 1 ? '🥇 1st Place' : winner.rank === 2 ? '🥈 2nd Place' : '🥉 3rd Place'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
