// @ts-nocheck - Supabase type inference issues
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { formatNumber } from '@/lib/utils'
import { Trophy, Award, TrendingUp, Crown, Medal } from 'lucide-react'

type LeaderboardUser = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  xp: number
  level: number
  profile_title: string | null
  total_entries?: number
  total_reactions?: number
}

export default function LeaderboardPage() {
  const [topUsers, setTopUsers] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'all-time' | 'monthly' | 'weekly'>('all-time')

  useEffect(() => {
    fetchLeaderboard()
  }, [timeframe])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      // Fetch top users by XP
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, username, display_name, avatar_url, xp, level, profile_title')
        .order('xp', { ascending: false })
        .limit(50)

      if (usersError) throw usersError

      // For each user, get their entry count and total reactions
      const usersWithStats = await Promise.all(
        (usersData || []).map(async (user: any) => {
          // Get entry count
          const { count: entryCount } = await supabase
            .from('entries')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'approved')

          // Get total reactions across all entries
          const { data: entries } = await supabase
            .from('entries')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'approved')

          let totalReactions = 0
          if (entries && entries.length > 0) {
            for (const entry of entries) {
              const { count } = await supabase
                .from('reactions')
                .select('*', { count: 'exact', head: true })
                .eq('entry_id', entry.id)
              totalReactions += count || 0
            }
          }

          return {
            ...user,
            total_entries: entryCount || 0,
            total_reactions: totalReactions,
          }
        })
      )

      setTopUsers(usersWithStats)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />
      default:
        return <span className="text-text-secondary font-bold">#{rank}</span>
    }
  }

  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/50'
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50'
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/50'
      default:
        return 'bg-surface border-border'
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading leaderboard...</div>
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold">Leaderboard</h1>
        </div>
        <p className="text-text-secondary text-lg">
          Top artists ranked by XP and achievements
        </p>
      </div>

      {/* Timeframe Filter */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setTimeframe('all-time')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            timeframe === 'all-time'
              ? 'bg-primary text-white'
              : 'bg-surface hover:bg-border'
          }`}
        >
          All Time
        </button>
        <button
          onClick={() => setTimeframe('monthly')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            timeframe === 'monthly'
              ? 'bg-primary text-white'
              : 'bg-surface hover:bg-border'
          }`}
          disabled
        >
          This Month (Coming Soon)
        </button>
        <button
          onClick={() => setTimeframe('weekly')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            timeframe === 'weekly'
              ? 'bg-primary text-white'
              : 'bg-surface hover:bg-border'
          }`}
          disabled
        >
          This Week (Coming Soon)
        </button>
      </div>

      {/* Top 3 Podium */}
      {topUsers.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* 2nd Place */}
          <div className="flex flex-col items-center pt-8">
            <Link
              to={`/users/${topUsers[1].username}`}
              className="flex flex-col items-center group"
            >
              <div className="relative mb-3">
                {topUsers[1].avatar_url ? (
                  <img
                    src={topUsers[1].avatar_url}
                    alt={topUsers[1].username}
                    className="w-20 h-20 rounded-full object-cover border-4 border-gray-400 group-hover:scale-110 transition-transform"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-400/20 flex items-center justify-center border-4 border-gray-400">
                    <span className="text-2xl font-bold">
                      {topUsers[1].username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 bg-gray-400 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                  2
                </div>
              </div>
              <h3 className="font-bold text-center mb-1 group-hover:text-primary transition-colors">
                {topUsers[1].display_name || topUsers[1].username}
              </h3>
              <p className="text-sm text-text-secondary mb-2">Level {topUsers[1].level}</p>
              <p className="text-lg font-bold text-primary">{formatNumber(topUsers[1].xp)} XP</p>
            </Link>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center">
            <Link
              to={`/users/${topUsers[0].username}`}
              className="flex flex-col items-center group"
            >
              <Crown className="w-8 h-8 text-yellow-500 mb-2 animate-pulse" />
              <div className="relative mb-3">
                {topUsers[0].avatar_url ? (
                  <img
                    src={topUsers[0].avatar_url}
                    alt={topUsers[0].username}
                    className="w-24 h-24 rounded-full object-cover border-4 border-yellow-500 group-hover:scale-110 transition-transform"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-yellow-500/20 flex items-center justify-center border-4 border-yellow-500">
                    <span className="text-3xl font-bold">
                      {topUsers[0].username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                  1
                </div>
              </div>
              <h3 className="font-bold text-lg text-center mb-1 group-hover:text-primary transition-colors">
                {topUsers[0].display_name || topUsers[0].username}
              </h3>
              <p className="text-sm text-text-secondary mb-2">Level {topUsers[0].level}</p>
              <p className="text-xl font-bold text-primary">{formatNumber(topUsers[0].xp)} XP</p>
            </Link>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center pt-8">
            <Link
              to={`/users/${topUsers[2].username}`}
              className="flex flex-col items-center group"
            >
              <div className="relative mb-3">
                {topUsers[2].avatar_url ? (
                  <img
                    src={topUsers[2].avatar_url}
                    alt={topUsers[2].username}
                    className="w-20 h-20 rounded-full object-cover border-4 border-amber-600 group-hover:scale-110 transition-transform"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-amber-600/20 flex items-center justify-center border-4 border-amber-600">
                    <span className="text-2xl font-bold">
                      {topUsers[2].username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                  3
                </div>
              </div>
              <h3 className="font-bold text-center mb-1 group-hover:text-primary transition-colors">
                {topUsers[2].display_name || topUsers[2].username}
              </h3>
              <p className="text-sm text-text-secondary mb-2">Level {topUsers[2].level}</p>
              <p className="text-lg font-bold text-primary">{formatNumber(topUsers[2].xp)} XP</p>
            </Link>
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      <div className="space-y-2">
        {topUsers.map((user, index) => {
          const rank = index + 1
          return (
            <Link
              key={user.id}
              to={`/users/${user.username}`}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:scale-[1.02] ${getRankBgColor(
                rank
              )}`}
            >
              {/* Rank */}
              <div className="w-12 flex items-center justify-center">
                {getRankIcon(rank)}
              </div>

              {/* Avatar */}
              <div className="relative">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  {user.level}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold">{user.display_name || user.username}</h3>
                  {user.profile_title && (
                    <span className="px-2 py-0.5 bg-primary/20 text-primary rounded text-xs font-semibold">
                      {user.profile_title}
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-secondary">@{user.username}</p>
              </div>

              {/* Stats */}
              <div className="flex gap-6 text-sm">
                <div className="text-center">
                  <div className="font-bold text-primary">{formatNumber(user.xp)}</div>
                  <div className="text-text-secondary text-xs">XP</div>
                </div>
                <div className="text-center">
                  <div className="font-bold">{user.total_entries}</div>
                  <div className="text-text-secondary text-xs">Entries</div>
                </div>
                <div className="text-center">
                  <div className="font-bold">{user.total_reactions}</div>
                  <div className="text-text-secondary text-xs">Reactions</div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {topUsers.length === 0 && (
        <div className="text-center py-12 bg-surface rounded-lg">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-text-secondary" />
          <h3 className="text-xl font-bold mb-2">No rankings yet</h3>
          <p className="text-text-secondary">Be the first to earn XP and climb the leaderboard!</p>
        </div>
      )}
    </div>
  )
}
