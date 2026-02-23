import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Heart, MessageCircle, TrendingUp, Clock, UserPlus, Trophy, Sparkles } from 'lucide-react'
import { formatTimeAgo } from '@/lib/utils'
import { feedApi, contestsApi, usersApi } from '@/lib/api'

type FeedEntry = {
  id: string
  title: string | null
  description: string | null
  phase4Url: string
  createdAt: string
  lastActivityAt: string
  userId: string
  contestId: string
  status: string
  user: {
    username: string
    avatarUrl: string | null
  }
  contest: {
    title: string
    status: string
  }
  voteCount: number
  commentCount: number
}

type FilterType = 'latest' | 'popular' | 'following'
type TimeRange = 7 | 30 | 90 | 365

type WinnerAnnouncement = {
  contestId: string
  contestTitle: string
  finalizedAt: string
  winners: {
    placement: number
    username: string
    avatarUrl: string | null
    prizeAmount: number
    entryImage: string | null
  }[]
}

export default function FeedPage() {
  const { user } = useAuthStore()
  const [entries, setEntries] = useState<FeedEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('latest')
  const [timeRange, setTimeRange] = useState<TimeRange>(7)
  const [followingCount, setFollowingCount] = useState(0)
  const [announcements, setAnnouncements] = useState<WinnerAnnouncement[]>([])

  const userId = user?.id

  useEffect(() => {
    if (userId) {
      fetchFeed()
      fetchFollowingCount()
      fetchWinnerAnnouncements()
    }
  }, [userId, filter, timeRange])

  const fetchFollowingCount = async () => {
    if (!user) return
    try {
      const response: any = await usersApi.getFollowing(user.id)
      setFollowingCount(response.following?.length || 0)
    } catch (error) {
      console.error('Error fetching following count:', error)
    }
  }

  const fetchWinnerAnnouncements = async () => {
    try {
      const response: any = await contestsApi.getRecentWinners(7)
      setAnnouncements(response.announcements || [])
    } catch (error) {
      console.error('Error fetching announcements:', error)
    }
  }

  const fetchFeed = async () => {
    if (!user) return
    setLoading(true)
    try {
      const response: any = await feedApi.getFeed(filter, timeRange)
      setEntries(response.entries || [])
    } catch (error) {
      console.error('Error fetching feed:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">My Feed</h1>
        <p className="text-text-secondary">Please login to see your feed</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">My Feed</h1>
        <p className="text-text-secondary">
          {filter === 'latest'
            ? 'Discover the latest artwork from active contests'
            : filter === 'popular'
            ? 'Discover the most popular art from active contests'
            : `Latest entries from ${followingCount} ${followingCount === 1 ? 'artist' : 'artists'} you follow`
          }
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Feed Type Filters */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('latest')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              filter === 'latest'
                ? 'bg-primary text-white'
                : 'bg-surface hover:bg-background'
            }`}
          >
            <Clock className="w-4 h-4" />
            Latest
          </button>
          <button
            onClick={() => setFilter('popular')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              filter === 'popular'
                ? 'bg-primary text-white'
                : 'bg-surface hover:bg-background'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Popular
          </button>
          <button
            onClick={() => setFilter('following')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              filter === 'following'
                ? 'bg-primary text-white'
                : 'bg-surface hover:bg-background'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Followed Users
          </button>
        </div>

        {/* Time Range Filters (only for Popular and Following) */}
        {filter !== 'latest' && (
          <div className="flex gap-2 sm:ml-auto">
            <button
              onClick={() => setTimeRange(7)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                timeRange === 7
                  ? 'bg-primary text-white'
                  : 'bg-surface hover:bg-background'
              }`}
            >
              7 days
            </button>
            <button
              onClick={() => setTimeRange(30)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                timeRange === 30
                  ? 'bg-primary text-white'
                  : 'bg-surface hover:bg-background'
              }`}
            >
              30 days
            </button>
            <button
              onClick={() => setTimeRange(90)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                timeRange === 90
                  ? 'bg-primary text-white'
                  : 'bg-surface hover:bg-background'
              }`}
            >
              90 days
            </button>
            <button
              onClick={() => setTimeRange(365)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                timeRange === 365
                  ? 'bg-primary text-white'
                  : 'bg-surface hover:bg-background'
              }`}
            >
              1 year
            </button>
          </div>
        )}
      </div>

      {/* Winner Announcements */}
      {filter === 'latest' && announcements.length > 0 && (
        <div className="max-w-2xl mx-auto mb-8 space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.contestId}
              className="bg-gradient-to-r from-primary/20 via-warning/10 to-primary/20 rounded-xl border-2 border-primary/50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 flex items-center gap-3 border-b border-primary/30">
                <div className="w-12 h-12 rounded-full bg-primary/30 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-warning" />
                    <span className="font-bold text-primary">Contest Winners Announced!</span>
                  </div>
                  <p className="text-sm text-text-secondary">
                    <Link to={`/contests/${announcement.contestId}`} className="hover:text-primary font-semibold">
                      {announcement.contestTitle}
                    </Link>
                    {' • '}{formatTimeAgo(announcement.finalizedAt)}
                  </p>
                </div>
              </div>

              {/* Winners */}
              <div className="p-4">
                <div className="grid grid-cols-3 gap-4">
                  {announcement.winners.map((winner) => (
                    <Link
                      key={winner.placement}
                      to={`/users/${winner.username}`}
                      className="flex flex-col items-center group"
                    >
                      {/* Entry Image */}
                      {winner.entryImage && (
                        <div className="w-full aspect-square rounded-lg overflow-hidden mb-3 border-2 border-transparent group-hover:border-primary transition-colors">
                          <img
                            src={winner.entryImage}
                            alt={`${winner.username}'s entry`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Placement Badge */}
                      <div className={`text-2xl mb-1 ${
                        winner.placement === 1 ? 'animate-bounce' : ''
                      }`}>
                        {winner.placement === 1 ? '🥇' : winner.placement === 2 ? '🥈' : '🥉'}
                      </div>
                      
                      {/* Avatar & Name */}
                      <div className="flex items-center gap-2 mb-1">
                        {winner.avatarUrl ? (
                          <img
                            src={winner.avatarUrl}
                            alt={winner.username}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold">
                            {winner.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-semibold text-sm group-hover:text-primary transition-colors">
                          @{winner.username}
                        </span>
                      </div>
                      
                      {/* Prize */}
                      <div className={`text-sm font-bold ${
                        winner.placement === 1 ? 'text-yellow-500' :
                        winner.placement === 2 ? 'text-gray-400' : 'text-amber-600'
                      }`}>
                        +{winner.prizeAmount} pts
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* View Contest Link */}
              <div className="px-4 pb-4">
                <Link
                  to={`/contests/${announcement.contestId}`}
                  className="block w-full py-2 text-center bg-primary/20 hover:bg-primary/30 rounded-lg text-primary font-semibold transition-colors"
                >
                  View Contest Results →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-text-secondary mt-4">Loading feed...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && entries.length === 0 && (
        <div className="text-center py-12 bg-surface rounded-lg border border-border">
          <UserPlus className="w-16 h-16 mx-auto mb-4 text-text-secondary" />
          <h3 className="text-xl font-bold mb-2">No entries yet</h3>
          <p className="text-text-secondary mb-4">
            {filter === 'following' && followingCount === 0
              ? "You're not following any artists yet"
              : filter === 'following'
              ? `Artists you follow haven't submitted any entries in the last ${timeRange} days`
              : 'No entries found in active contests'}
          </p>
          {filter === 'following' && followingCount === 0 && (
            <Link
              to="/artists"
              className="inline-block px-6 py-3 bg-primary hover:bg-primary-hover rounded-lg transition-colors"
            >
              Discover Artists
            </Link>
          )}
        </div>
      )}

      {/* Feed Entries */}
      {!loading && entries.length > 0 && (
        <div className="max-w-2xl mx-auto space-y-6">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-surface rounded-lg border border-border overflow-hidden hover:border-primary transition-colors">
              {/* Artist Info */}
              <div className="p-4 flex items-center gap-3">
                <Link to={`/users/${entry.user.username}`}>
                  {entry.user.avatarUrl ? (
                    <img
                      src={entry.user.avatarUrl}
                      alt={entry.user.username}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold">
                      {entry.user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>
                <div className="flex-1">
                  <Link
                    to={`/users/${entry.user.username}`}
                    className="font-semibold hover:text-primary transition-colors"
                  >
                    @{entry.user.username}
                  </Link>
                  <p className="text-sm text-text-secondary">
                    Submitted to <Link to={`/contests/${entry.contestId}`} className="hover:text-primary">{entry.contest.title}</Link> • 
                    {filter === 'latest' && entry.lastActivityAt !== entry.createdAt
                      ? `Active ${formatTimeAgo(entry.lastActivityAt)}`
                      : formatTimeAgo(entry.createdAt)
                    }
                  </p>
                </div>
              </div>

              {/* Entry Image */}
              <Link to={`/entries/${entry.id}`} className="block">
                <div className="flex justify-center bg-black/20">
                  <img
                    src={entry.phase4Url}
                    alt={entry.title || "Entry"}
                    className="max-h-[500px] w-auto max-w-full object-contain hover:opacity-90 transition-opacity"
                  />
                </div>
              </Link>

              {/* Title and Description */}
              {(entry.title || entry.description) && (
                <div className="px-4 pt-4">
                  {entry.title && (
                    <h3 className="font-bold text-lg mb-1">
                      <Link to={`/entries/${entry.id}`} className="hover:text-primary transition-colors">
                        {entry.title}
                      </Link>
                    </h3>
                  )}
                  {entry.description && (
                    <p className="text-text-secondary text-sm line-clamp-2">
                      {entry.description}
                    </p>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="p-4 flex items-center gap-4 text-text-secondary">
                <div className="flex items-center gap-1">
                  <Heart className="w-5 h-5" />
                  <span>{entry.voteCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-5 h-5" />
                  <span>{entry.commentCount}</span>
                </div>
                <Link
                  to={`/entries/${entry.id}`}
                  className="ml-auto text-primary hover:underline"
                >
                  View Entry
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
