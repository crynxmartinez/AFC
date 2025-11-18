// @ts-nocheck - Supabase type inference issues
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { formatDate, formatNumber } from '@/lib/utils'
import { Trophy, Award, Calendar, MapPin, Link as LinkIcon, Instagram, Twitter, ExternalLink } from 'lucide-react'

type UserProfile = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  xp: number
  level: number
  profile_title: string | null
  created_at: string
  instagram_url: string | null
  twitter_url: string | null
  portfolio_url: string | null
}

type Entry = {
  id: string
  contest_id: string
  phase_4_url: string | null
  created_at: string
  status: string
  contests: {
    title: string
  }
}

type Badge = {
  id: string
  badge_name: string
  badge_icon: string
  earned_at: string
}

export default function UserProfilePage() {
  const { username } = useParams()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [stats, setStats] = useState({
    totalEntries: 0,
    contestsWon: 0,
    totalReactions: 0,
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'portfolio' | 'badges'>('portfolio')

  useEffect(() => {
    if (username) {
      fetchProfile()
    }
  }, [username])

  const fetchProfile = async () => {
    try {
      // Fetch user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single()

      if (userError) throw userError
      setProfile(userData)

      // Fetch user's entries
      const { data: entriesData, error: entriesError } = await supabase
        .from('entries')
        .select('id, contest_id, phase_4_url, created_at, status, contests(title)')
        .eq('user_id', userData.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (entriesError) throw entriesError
      setEntries(entriesData || [])

      // Fetch user's badges
      const { data: badgesData, error: badgesError } = await supabase
        .from('user_badges')
        .select('id, badge_name, badge_icon, earned_at')
        .eq('user_id', userData.id)
        .order('earned_at', { ascending: false })

      if (badgesError) throw badgesError
      setBadges(badgesData || [])

      // Calculate stats
      const totalEntries = entriesData?.length || 0

      // Get total reactions across all entries
      let totalReactions = 0
      if (entriesData && entriesData.length > 0) {
        for (const entry of entriesData) {
          const { count } = await supabase
            .from('reactions')
            .select('*', { count: 'exact', head: true })
            .eq('entry_id', entry.id)
          totalReactions += count || 0
        }
      }

      // TODO: Calculate contests won (need to implement winner tracking)
      const contestsWon = 0

      setStats({
        totalEntries,
        contestsWon,
        totalReactions,
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading profile...</div>
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">User not found</h2>
        <p className="text-text-secondary">This user doesn't exist or has been removed.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Profile Header */}
      <div className="bg-surface rounded-lg p-8 mb-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className="w-32 h-32 rounded-full object-cover border-4 border-primary"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary">
                <span className="text-4xl font-bold text-primary">
                  {profile.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            {/* Level Badge */}
            <div className="absolute -bottom-2 -right-2 bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center font-bold border-4 border-surface">
              {profile.level}
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{profile.display_name || profile.username}</h1>
              {profile.profile_title && (
                <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-semibold">
                  {profile.profile_title}
                </span>
              )}
            </div>
            <p className="text-text-secondary mb-1">@{profile.username}</p>

            {profile.bio && (
              <p className="text-text-secondary mt-4 mb-4">{profile.bio}</p>
            )}

            {/* Social Links */}
            <div className="flex gap-3 mb-4">
              {profile.instagram_url && (
                <a
                  href={profile.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-background hover:bg-border rounded-lg text-sm transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                  Instagram
                </a>
              )}
              {profile.twitter_url && (
                <a
                  href={profile.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-background hover:bg-border rounded-lg text-sm transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </a>
              )}
              {profile.portfolio_url && (
                <a
                  href={profile.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-background hover:bg-border rounded-lg text-sm transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Portfolio
                </a>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Calendar className="w-4 h-4" />
              <span>Joined {formatDate(profile.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">{profile.level}</div>
            <div className="text-sm text-text-secondary">Level</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">{formatNumber(profile.xp)}</div>
            <div className="text-sm text-text-secondary">Total XP</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">{stats.totalEntries}</div>
            <div className="text-sm text-text-secondary">Entries</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">{stats.totalReactions}</div>
            <div className="text-sm text-text-secondary">Reactions</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'portfolio'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Portfolio ({entries.length})
        </button>
        <button
          onClick={() => setActiveTab('badges')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'badges'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Badges ({badges.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'portfolio' ? (
        <div>
          {entries.length === 0 ? (
            <div className="text-center py-12 bg-surface rounded-lg">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-text-secondary" />
              <h3 className="text-xl font-bold mb-2">No entries yet</h3>
              <p className="text-text-secondary">This user hasn't submitted any contest entries.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {entries.map((entry) => (
                <Link
                  key={entry.id}
                  to={`/entries/${entry.id}`}
                  className="bg-surface rounded-lg overflow-hidden border border-border hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/20"
                >
                  {entry.phase_4_url ? (
                    <img
                      src={entry.phase_4_url}
                      alt="Entry"
                      className="w-full aspect-square object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-background flex items-center justify-center">
                      <Trophy className="w-16 h-16 text-text-secondary" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold mb-1 line-clamp-1">{entry.contests.title}</h3>
                    <p className="text-sm text-text-secondary">{formatDate(entry.created_at)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {badges.length === 0 ? (
            <div className="text-center py-12 bg-surface rounded-lg">
              <Award className="w-16 h-16 mx-auto mb-4 text-text-secondary" />
              <h3 className="text-xl font-bold mb-2">No badges yet</h3>
              <p className="text-text-secondary">This user hasn't earned any badges.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="bg-surface rounded-lg p-6 text-center border border-border hover:border-primary transition-colors"
                >
                  <div className="text-5xl mb-3">{badge.badge_icon}</div>
                  <h3 className="font-semibold mb-1">{badge.badge_name}</h3>
                  <p className="text-xs text-text-secondary">
                    Earned {formatDate(badge.earned_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
