import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { Heart, MessageCircle, TrendingUp, Clock, UserPlus } from 'lucide-react'
import { formatTimeAgo } from '@/lib/utils'

type FeedEntry = {
  id: string
  phase_4_url: string
  created_at: string
  user_id: string
  contest_id: string
  status: string
  users: {
    username: string
    avatar_url: string | null
  }
  contests: {
    title: string
  }
  vote_count: number
  comment_count: number
}

type FilterType = 'latest' | 'popular' | 'week'

export default function FeedPage() {
  const { user } = useAuthStore()
  const [entries, setEntries] = useState<FeedEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('latest')
  const [followingCount, setFollowingCount] = useState(0)

  useEffect(() => {
    if (user) {
      fetchFeed()
      fetchFollowingCount()
    }
  }, [user, filter])

  const fetchFollowingCount = async () => {
    if (!user) return
    const { count } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', user.id)
    setFollowingCount(count || 0)
  }

  const fetchFeed = async () => {
    if (!user) return
    setLoading(true)
    try {
      // Get users I'm following
      const { data: followingData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)

      if (!followingData || followingData.length === 0) {
        setEntries([])
        setLoading(false)
        return
      }

      const followingIds = followingData.map((f: any) => f.following_id)

      // Get entries from followed artists
      let query = supabase
        .from('entries')
        .select('id, phase_4_url, created_at, user_id, contest_id, status')
        .in('user_id', followingIds)
        .eq('status', 'approved')

      // Apply filters
      if (filter === 'week') {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        query = query.gte('created_at', weekAgo.toISOString())
      }

      const { data: entriesData, error } = await query
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      // Fetch related data for each entry
      const entriesWithData = await Promise.all(
        (entriesData || []).map(async (entry: any) => {
          const [{ data: userData }, { data: contestData }, { count: voteCount }, { count: commentCount }] = await Promise.all([
            supabase.from('users').select('username, avatar_url').eq('id', entry.user_id).single(),
            supabase.from('contests').select('title').eq('id', entry.contest_id).single(),
            supabase.from('reactions').select('*', { count: 'exact', head: true }).eq('entry_id', entry.id),
            supabase.from('entry_comments').select('*', { count: 'exact', head: true }).eq('entry_id', entry.id)
          ])

          return {
            ...entry,
            users: userData,
            contests: contestData,
            vote_count: voteCount || 0,
            comment_count: commentCount || 0
          }
        })
      )

      // Sort by popularity if needed
      if (filter === 'popular') {
        entriesWithData.sort((a, b) => b.vote_count - a.vote_count)
      }

      setEntries(entriesWithData)
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
          Latest entries from {followingCount} {followingCount === 1 ? 'artist' : 'artists'} you follow
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
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
          onClick={() => setFilter('week')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            filter === 'week'
              ? 'bg-primary text-white'
              : 'bg-surface hover:bg-background'
          }`}
        >
          <Clock className="w-4 h-4" />
          This Week
        </button>
      </div>

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
            {followingCount === 0
              ? "You're not following any artists yet"
              : 'Artists you follow haven\'t submitted any entries'}
          </p>
          {followingCount === 0 && (
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
        <div className="space-y-6">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-surface rounded-lg border border-border overflow-hidden hover:border-primary transition-colors">
              {/* Artist Info */}
              <div className="p-4 flex items-center gap-3">
                <Link to={`/users/${entry.users.username}`}>
                  {entry.users.avatar_url ? (
                    <img
                      src={entry.users.avatar_url}
                      alt={entry.users.username}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold">
                      {entry.users.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>
                <div className="flex-1">
                  <Link
                    to={`/users/${entry.users.username}`}
                    className="font-semibold hover:text-primary transition-colors"
                  >
                    @{entry.users.username}
                  </Link>
                  <p className="text-sm text-text-secondary">
                    Submitted to <Link to={`/contests/${entry.contest_id}`} className="hover:text-primary">{entry.contests.title}</Link> • {formatTimeAgo(entry.created_at)}
                  </p>
                </div>
              </div>

              {/* Entry Image */}
              <Link to={`/entries/${entry.id}`}>
                <img
                  src={entry.phase_4_url}
                  alt="Entry"
                  className="w-full aspect-video object-cover hover:opacity-90 transition-opacity"
                />
              </Link>

              {/* Stats */}
              <div className="p-4 flex items-center gap-4 text-text-secondary">
                <div className="flex items-center gap-1">
                  <Heart className="w-5 h-5" />
                  <span>{entry.vote_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-5 h-5" />
                  <span>{entry.comment_count}</span>
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
