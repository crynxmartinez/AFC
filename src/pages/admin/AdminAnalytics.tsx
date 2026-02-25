import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/api'
import { TrendingUp, Users, Trophy, Image as ImageIcon, ThumbsUp, AlertCircle } from 'lucide-react'

type Analytics = {
  totals: {
    users: number
    contests: number
    entries: number
    votes: number
  }
  growth: {
    users: number
    contests: number
    entries: number
    votes: number
  }
  contestsByStatus: Array<{ status: string; count: number }>
  entriesByStatus: Array<{ status: string; count: number }>
  topContestsByEntries: Array<{ id: string; title: string; entryCount: number }>
  topContestsByVotes: Array<{ id: string; title: string; voteCount: number }>
  userGrowth: Array<{ date: string; count: number }>
  entryGrowth: Array<{ date: string; count: number }>
  topUsers: Array<{
    id: string
    username: string
    displayName: string | null
    avatarUrl: string | null
    entryCount: number
  }>
  pendingReviews: number
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState(30)

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response: any = await adminApi.getAnalytics(timeRange)
      setAnalytics(response)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading analytics...</div>
  }

  if (!analytics) {
    return <div className="text-center py-12">Failed to load analytics</div>
  }

  const calculateGrowthPercentage = (current: number, growth: number) => {
    if (current === 0) return 0
    const previous = current - growth
    if (previous === 0) return 100
    return ((growth / previous) * 100).toFixed(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-text-secondary">Platform insights and statistics</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange(7)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === 7 ? 'bg-primary text-white' : 'bg-surface border border-border hover:border-primary'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeRange(30)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === 30 ? 'bg-primary text-white' : 'bg-surface border border-border hover:border-primary'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setTimeRange(90)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === 90 ? 'bg-primary text-white' : 'bg-surface border border-border hover:border-primary'
            }`}
          >
            90 Days
          </button>
        </div>
      </div>

      {/* Pending Reviews Alert */}
      {analytics.pendingReviews > 0 && (
        <div className="bg-warning/10 border border-warning rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-warning" />
          <div>
            <p className="font-semibold">Pending Reviews</p>
            <p className="text-sm text-text-secondary">
              {analytics.pendingReviews} entries waiting for review
            </p>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-primary" />
            <div className="text-right">
              <div className="text-2xl font-bold">{analytics.totals.users.toLocaleString()}</div>
              <div className="text-sm text-text-secondary">Total Users</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-success font-semibold">
              +{analytics.growth.users} ({calculateGrowthPercentage(analytics.totals.users, analytics.growth.users)}%)
            </span>
            <span className="text-text-secondary">last {timeRange} days</span>
          </div>
        </div>

        <div className="bg-surface rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <Trophy className="w-8 h-8 text-secondary" />
            <div className="text-right">
              <div className="text-2xl font-bold">{analytics.totals.contests.toLocaleString()}</div>
              <div className="text-sm text-text-secondary">Total Contests</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-success font-semibold">
              +{analytics.growth.contests} ({calculateGrowthPercentage(analytics.totals.contests, analytics.growth.contests)}%)
            </span>
            <span className="text-text-secondary">last {timeRange} days</span>
          </div>
        </div>

        <div className="bg-surface rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <ImageIcon className="w-8 h-8 text-success" />
            <div className="text-right">
              <div className="text-2xl font-bold">{analytics.totals.entries.toLocaleString()}</div>
              <div className="text-sm text-text-secondary">Total Entries</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-success font-semibold">
              +{analytics.growth.entries} ({calculateGrowthPercentage(analytics.totals.entries, analytics.growth.entries)}%)
            </span>
            <span className="text-text-secondary">last {timeRange} days</span>
          </div>
        </div>

        <div className="bg-surface rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <ThumbsUp className="w-8 h-8 text-error" />
            <div className="text-right">
              <div className="text-2xl font-bold">{analytics.totals.votes.toLocaleString()}</div>
              <div className="text-sm text-text-secondary">Total Votes</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-success font-semibold">
              +{analytics.growth.votes} ({calculateGrowthPercentage(analytics.totals.votes, analytics.growth.votes)}%)
            </span>
            <span className="text-text-secondary">last {timeRange} days</span>
          </div>
        </div>
      </div>

      {/* Status Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-xl font-bold mb-4">Contests by Status</h2>
          <div className="space-y-3">
            {analytics.contestsByStatus.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <span className="capitalize">{item.status.replace('_', ' ')}</span>
                <span className="font-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-xl font-bold mb-4">Entries by Status</h2>
          <div className="space-y-3">
            {analytics.entriesByStatus.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <span className="capitalize">{item.status.replace('_', ' ')}</span>
                <span className="font-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Contests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-xl font-bold mb-4">Top Contests by Entries</h2>
          <div className="space-y-3">
            {analytics.topContestsByEntries.map((contest, index) => (
              <div key={contest.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{contest.title}</div>
                </div>
                <div className="font-bold">{contest.entryCount} entries</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-xl font-bold mb-4">Top Contests by Votes</h2>
          <div className="space-y-3">
            {analytics.topContestsByVotes.map((contest, index) => (
              <div key={contest.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center font-bold text-secondary">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{contest.title}</div>
                </div>
                <div className="font-bold">{contest.voteCount} votes</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Users */}
      <div className="bg-surface rounded-lg p-6 border border-border">
        <h2 className="text-xl font-bold mb-4">Most Active Users</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics.topUsers.map((user, index) => (
            <div key={user.id} className="flex items-center gap-3 p-3 bg-background rounded-lg">
              <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center font-bold text-success">
                {index + 1}
              </div>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.username} className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{user.displayName || user.username}</div>
                <div className="text-sm text-text-secondary">@{user.username}</div>
              </div>
              <div className="font-bold">{user.entryCount} entries</div>
            </div>
          ))}
        </div>
      </div>

      {/* Growth Charts (Simple bar representation) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-xl font-bold mb-4">User Growth</h2>
          <div className="space-y-2">
            {analytics.userGrowth.slice(-7).map((day) => (
              <div key={day.date} className="flex items-center gap-3">
                <div className="text-sm text-text-secondary w-24">{day.date}</div>
                <div className="flex-1 bg-background rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full flex items-center justify-end pr-2"
                    style={{
                      width: `${Math.max((day.count / Math.max(...analytics.userGrowth.map(d => d.count))) * 100, 5)}%`,
                    }}
                  >
                    <span className="text-xs font-bold text-white">{day.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-xl font-bold mb-4">Entry Submissions</h2>
          <div className="space-y-2">
            {analytics.entryGrowth.slice(-7).map((day) => (
              <div key={day.date} className="flex items-center gap-3">
                <div className="text-sm text-text-secondary w-24">{day.date}</div>
                <div className="flex-1 bg-background rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-success h-full rounded-full flex items-center justify-end pr-2"
                    style={{
                      width: `${Math.max((day.count / Math.max(...analytics.entryGrowth.map(d => d.count))) * 100, 5)}%`,
                    }}
                  >
                    <span className="text-xs font-bold text-white">{day.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
