// @ts-nocheck - Supabase type inference issues
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { formatDate, formatNumber } from '@/lib/utils'
import { Trophy, Award, Calendar, MapPin, Link as LinkIcon, Instagram, Twitter, ExternalLink, Users, Briefcase, Globe, Tag } from 'lucide-react'
import FollowButton from '@/components/social/FollowButton'
import ProfileStats from '@/components/profile/ProfileStats'
import Achievements from '@/components/profile/Achievements'

type UserProfile = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  cover_photo_url: string | null
  bio: string | null
  xp: number
  level: number
  profile_title: string | null
  created_at: string
  instagram_url: string | null
  twitter_url: string | null
  portfolio_url: string | null
  location: string | null
  website: string | null
  skills: string[] | null
  specialties: string[] | null
  years_experience: number | null
  available_for_work: boolean
}

type Entry = {
  id: string
  contest_id: string
  phase_4_url: string | null
  created_at: string
  status: string
  contests: {
    title: string
    status: string
  }
  ranking?: number
  total_votes?: number
}

type Winner = {
  id: string
  contest_id: string
  placement: number
  prize_amount: number
  votes_received: number
  awarded_at: string
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
  const [achievements, setAchievements] = useState<any[]>([])
  const [winners, setWinners] = useState<Winner[]>([])
  const [stats, setStats] = useState({
    totalEntries: 0,
    totalWins: 0,
    totalVotes: 0,
    winRate: 0,
    followers: 0,
    following: 0,
    avgVotes: 0,
    bestRank: undefined as number | undefined
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'portfolio' | 'achievements' | 'wins'>('portfolio')

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

      // Fetch user's entries (ALL entries, not just approved)
      const { data: entriesData, error: entriesError } = await supabase
        .from('entries')
        .select('id, contest_id, title, description, phase_4_url, created_at, status')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })

      if (entriesError) throw entriesError
      
      console.log('Fetched entries for user:', userData.username, entriesData)
      
      // Fetch contest info separately for each entry
      const entriesWithContests = await Promise.all(
        (entriesData || []).map(async (entry: any) => {
          const { data: contestData } = await supabase
            .from('contests')
            .select('title, status')
            .eq('id', entry.contest_id)
            .single()
          
          return {
            ...entry,
            contests: contestData
          }
        })
      )

      // For each entry, calculate ranking based on votes
      const entriesWithRanking = await Promise.all(
        (entriesWithContests || []).map(async (entry: any) => {
          // Get vote count for this entry
          const { count: voteCount } = await supabase
            .from('reactions')
            .select('*', { count: 'exact', head: true })
            .eq('entry_id', entry.id)

          // Get all entries in the same contest with their vote counts
          const { data: contestEntries } = await supabase
            .from('entries')
            .select('id')
            .eq('contest_id', entry.contest_id)
            .eq('status', 'approved')

          // Calculate ranking
          let ranking = 1
          if (contestEntries && entry.status === 'approved') {
            for (const otherEntry of contestEntries) {
              const { count: otherVotes } = await supabase
                .from('reactions')
                .select('*', { count: 'exact', head: true })
                .eq('entry_id', otherEntry.id)
              
              if ((otherVotes || 0) > (voteCount || 0)) {
                ranking++
              }
            }
          }

          return {
            ...entry,
            total_votes: voteCount || 0,
            ranking: entry.status === 'approved' ? ranking : null,
          }
        })
      )

      setEntries(entriesWithRanking)

      // Fetch user's badges
      const { data: badgesData, error: badgesError } = await supabase
        .from('user_badges')
        .select('id, badge_name, badge_icon, earned_at')
        .eq('user_id', userData.id)
        .order('earned_at', { ascending: false})

      if (badgesError) throw badgesError
      setBadges(badgesData || [])

      // Fetch user's achievements
      const { data: achievementsData } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userData.id)
        .order('earned_at', { ascending: false })
      
      setAchievements(achievementsData || [])

      // Fetch user's contest wins
      const { data: winnersData, error: winnersError } = await supabase
        .from('contest_winners')
        .select('*')
        .eq('user_id', userData.id)
        .order('awarded_at', { ascending: false })

      if (winnersError) throw winnersError
      
      // Fetch contest titles separately
      const winnersWithContests = await Promise.all(
        (winnersData || []).map(async (winner: any) => {
          const { data: contestData } = await supabase
            .from('contests')
            .select('title')
            .eq('id', winner.contest_id)
            .single()
          return { ...winner, contests: contestData }
        })
      )
      
      setWinners(winnersWithContests)

      // Calculate stats
      const totalEntries = entriesData?.length || 0
      const contestsWon = winnersData?.length || 0
      const totalPrizeMoney = winnersData?.reduce((sum, win) => sum + win.prize_amount, 0) || 0

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

      // Get follower count
      const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userData.id)

      // Get following count
      const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userData.id)

      // Calculate win rate and avg votes
      const winRate = totalEntries > 0 ? (contestsWon / totalEntries) * 100 : 0
      const avgVotes = totalEntries > 0 ? totalReactions / totalEntries : 0

      setStats({
        totalEntries,
        totalWins: contestsWon,
        totalVotes: totalReactions,
        winRate,
        followers: followersCount || 0,
        following: followingCount || 0,
        avgVotes,
        bestRank: undefined
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
      {/* Cover Photo */}
      {profile.cover_photo_url && (
        <div className="h-48 md:h-64 rounded-lg overflow-hidden mb-6">
          <img
            src={profile.cover_photo_url}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-surface rounded-lg p-4 md:p-8 mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-primary"
              />
            ) : (
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary">
                <span className="text-3xl md:text-4xl font-bold text-primary">
                  {profile.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            {/* Level Badge */}
            <div className="absolute -bottom-2 -right-2 bg-primary text-white rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center font-bold border-4 border-surface text-sm md:text-base">
              {profile.level}
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold">{profile.display_name || profile.username}</h1>
              {profile.profile_title && (
                <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-semibold">
                  {profile.profile_title}
                </span>
              )}
            </div>
            <p className="text-text-secondary mb-1">@{profile.username}</p>

            {/* Follower/Following Stats */}
            <div className="flex items-center justify-center md:justify-start gap-4 text-sm mb-4">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-text-secondary" />
                <span className="font-semibold">{formatNumber(stats.followers)}</span>
                <span className="text-text-secondary">Followers</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold">{formatNumber(stats.following)}</span>
                <span className="text-text-secondary">Following</span>
              </div>
            </div>

            {/* Follow Button */}
            <div className="mb-4">
              <FollowButton 
                userId={profile.id} 
                username={profile.username}
                onFollowChange={fetchProfile}
              />
            </div>

            {profile.bio && (
              <p className="text-text-secondary mt-4 mb-4">{profile.bio}</p>
            )}

            {/* Social Links */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
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
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-background hover:bg-border rounded-lg text-sm transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  Website
                </a>
              )}
            </div>

            {/* Additional Info */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-text-secondary mb-4">
              {profile.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.years_experience && (
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span>{profile.years_experience} years experience</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Joined {formatDate(profile.created_at)}</span>
              </div>
            </div>

            {/* Skills & Specialties */}
            {(profile.skills?.length || profile.specialties?.length) && (
              <div className="mt-4">
                {profile.skills && profile.skills.length > 0 && (
                  <div className="mb-2">
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium flex items-center gap-1"
                        >
                          <Tag className="w-3 h-3" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {profile.specialties && profile.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profile.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-background border border-border rounded-full text-xs"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {profile.available_for_work && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-lg text-sm font-medium">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                Available for Work
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Profile Stats Cards */}
      <div className="mb-6">
        <ProfileStats stats={stats} />
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
          onClick={() => setActiveTab('achievements')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'achievements'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Achievements ({achievements.length})
        </button>
        <button
          onClick={() => setActiveTab('wins')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'wins'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          🏆 Wins ({winners.length})
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
                  <div className="relative">
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
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        entry.status === 'approved' 
                          ? 'bg-success/90 text-white' 
                          : entry.status === 'pending_review' || entry.status === 'pending'
                          ? 'bg-yellow-500/90 text-white'
                          : 'bg-red-500/90 text-white'
                      }`}>
                        {entry.status === 'pending_review' ? 'PENDING' : entry.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Ranking Badge (only for approved entries) */}
                    {entry.ranking && entry.status === 'approved' && (
                      <div className="absolute top-2 left-2">
                        <div className={`px-3 py-1 rounded-full font-bold text-white ${
                          entry.ranking === 1 
                            ? 'bg-yellow-500' 
                            : entry.ranking === 2
                            ? 'bg-gray-400'
                            : entry.ranking === 3
                            ? 'bg-amber-600'
                            : 'bg-primary'
                        }`}>
                          #{entry.ranking}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    {entry.title && (
                      <h3 className="font-bold mb-1 line-clamp-1">{entry.title}</h3>
                    )}
                    <p className="text-sm text-text-secondary mb-2 line-clamp-1">{entry.contests.title}</p>
                    <div className="flex items-center justify-between text-sm text-text-secondary">
                      <span>{formatDate(entry.created_at)}</span>
                      {entry.total_votes !== undefined && (
                        <span className="font-semibold text-primary">{entry.total_votes} votes</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'achievements' ? (
        <div>
          <Achievements achievements={achievements} />
        </div>
      ) : activeTab === 'badges' ? (
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
      ) : (
        <div>
          {winners.length === 0 ? (
            <div className="text-center py-12 bg-surface rounded-lg">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-text-secondary" />
              <h3 className="text-xl font-bold mb-2">No contest wins yet</h3>
              <p className="text-text-secondary">This user hasn't won any contests.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {winners.map((winner) => (
                <div
                  key={winner.id}
                  className="bg-surface rounded-lg p-6 border-2"
                  style={{
                    borderColor:
                      winner.placement === 1
                        ? '#FFD700'
                        : winner.placement === 2
                        ? '#C0C0C0'
                        : '#CD7F32',
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-5xl">
                        {winner.placement === 1 ? '🥇' : winner.placement === 2 ? '🥈' : '🥉'}
                      </div>
                      <div>
                        <Link
                          to={`/contests/${winner.contest_id}`}
                          className="text-xl font-bold hover:text-primary transition-colors"
                        >
                          {winner.contests.title}
                        </Link>
                        <p className="text-sm text-text-secondary">
                          {winner.placement === 1 ? '1st' : winner.placement === 2 ? '2nd' : '3rd'} Place
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        +{formatNumber(winner.prize_amount)} pts
                      </div>
                      <p className="text-sm text-text-secondary">Prize Money</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-text-secondary">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      <span>{winner.votes_received} votes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Won {formatDate(winner.awarded_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
