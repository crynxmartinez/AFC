import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { formatDate, formatNumber } from '@/lib/utils'

type Contest = {
  id: string
  title: string
  description: string
  status: string
  start_date: string
  end_date: string
  thumbnail_url: string | null
  has_sponsor: boolean
  sponsor_name: string | null
  sponsor_logo_url: string | null
  sponsor_prize_amount: number | null
  prize_pool: number
  prize_pool_distributed: boolean
  winner_1st_id: string | null
  winner_2nd_id: string | null
  winner_3rd_id: string | null
}

type Winner = {
  id: string
  entry_id: string
  user_id: string
  placement: number
  votes_received: number
  prize_amount: number
  users: {
    username: string
    avatar_url: string | null
  }
  entries: {
    phase_4_url: string | null
  }
}

type Entry = {
  id: string
  user_id: string
  title: string | null
  description: string | null
  phase_4_url: string | null
  vote_count: number
  users: {
    username: string
    avatar_url: string | null
  }
}

export default function ContestDetailPage() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const [contest, setContest] = useState<Contest | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [winners, setWinners] = useState<Winner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchContest()
      fetchEntries()
      fetchWinners()
    }
  }, [id])

  const fetchContest = async () => {
    if (!id) return
    try {
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setContest(data)
    } catch (error) {
      console.error('Error fetching contest:', error)
    }
  }

  const fetchEntries = async () => {
    if (!id) return
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('id, user_id, phase_4_url')
        .eq('contest_id', id)
        .eq('status', 'approved')

      if (error) throw error

      // Fetch user data separately and get reaction counts for each entry
      const entriesWithVotes = await Promise.all(
        (data || []).map(async (entry: any) => {
          const { data: userData } = await supabase
            .from('users')
            .select('username, avatar_url')
            .eq('id', entry.user_id)
            .single()
          const { count } = await supabase
            .from('reactions')
            .select('*', { count: 'exact', head: true })
            .eq('entry_id', entry.id)

          return { ...entry, users: userData, vote_count: count || 0 }
        })
      )

      // Sort by vote count
      entriesWithVotes.sort((a, b) => b.vote_count - a.vote_count)
      setEntries(entriesWithVotes)
    } catch (error) {
      console.error('Error fetching entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWinners = async () => {
    if (!id) return
    try {
      const { data, error } = await supabase
        .from('contest_winners')
        .select('*')
        .eq('contest_id', id)
        .order('placement', { ascending: true })

      if (error) throw error
      
      // Fetch related data separately
      const winnersWithData = await Promise.all(
        (data || []).map(async (winner: any) => {
          const [{ data: userData }, { data: entryData }] = await Promise.all([
            supabase.from('users').select('username, avatar_url').eq('id', winner.user_id).single(),
            supabase.from('entries').select('phase_4_url').eq('id', winner.entry_id).single()
          ])
          return { ...winner, users: userData, entries: entryData }
        })
      )
      
      setWinners(winnersWithData)
    } catch (error) {
      console.error('Error fetching winners:', error)
    }
  }

  const getTimeRemaining = () => {
    if (!contest) return ''
    const now = new Date()
    const end = new Date(contest.end_date)
    const diff = end.getTime() - now.getTime()
    
    if (diff < 0) return 'Ended'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`
    return `${hours} hour${hours > 1 ? 's' : ''}`
  }

  const canSubmit = () => {
    if (!user || !contest) return false
    const now = new Date()
    const start = new Date(contest.start_date)
    const end = new Date(contest.end_date)
    return contest.status === 'active' && now >= start && now <= end
  }

  if (loading) {
    return <div className="text-center py-12">Loading contest...</div>
  }

  if (!contest) {
    return <div className="text-center py-12">Contest not found</div>
  }

  return (
    <div>
      {contest.thumbnail_url && (
        <div className="mb-6 rounded-lg overflow-hidden">
          <img src={contest.thumbnail_url} alt={contest.title} className="w-full h-64 object-cover" />
        </div>
      )}

      <div className="bg-surface rounded-lg p-8 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{contest.title}</h1>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                contest.status === 'active'
                  ? 'bg-success/20 text-success'
                  : contest.status === 'voting'
                  ? 'bg-secondary/20 text-secondary'
                  : contest.status === 'ended'
                  ? 'bg-text-secondary/20 text-text-secondary'
                  : 'bg-warning/20 text-warning'
              }`}
            >
              {contest.status.toUpperCase()}
            </span>
          </div>
          {canSubmit() && (
            <Link
              to={`/contests/${id}/submit`}
              className="px-6 py-3 bg-primary hover:bg-primary-hover rounded-lg font-semibold transition-colors"
            >
              Submit Entry
            </Link>
          )}
        </div>

        <p className="text-text-secondary text-lg mb-6">{contest.description}</p>

        {/* Sponsor Section */}
        {contest.has_sponsor && contest.sponsor_name && (
          <div className="mb-6 p-4 bg-background rounded-lg border-2 border-primary/30">
            <div className="flex items-center gap-4">
              {contest.sponsor_logo_url && (
                <img 
                  src={contest.sponsor_logo_url} 
                  alt={contest.sponsor_name}
                  className="h-12 w-auto object-contain"
                />
              )}
              <div className="flex-1">
                <p className="text-sm text-text-secondary">Sponsored by</p>
                <p className="text-xl font-bold text-primary">{contest.sponsor_name}</p>
              </div>
              {contest.sponsor_prize_amount && contest.sponsor_prize_amount > 0 && (
                <div className="text-right">
                  <p className="text-sm text-text-secondary">Additional Prize</p>
                  <p className="text-2xl font-bold text-success">
                    ₱{contest.sponsor_prize_amount.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-8 text-sm">
          <div>
            <span className="text-text-secondary">Entries:</span>
            <span className="font-semibold ml-2">{entries.length}</span>
          </div>
          <div>
            <span className="text-text-secondary">Total Votes:</span>
            <span className="font-semibold ml-2">
              {formatNumber(entries.reduce((sum, e) => sum + e.vote_count, 0))}
            </span>
          </div>
          <div>
            <span className="text-text-secondary">Start:</span>
            <span className="font-semibold ml-2">{formatDate(contest.start_date)}</span>
          </div>
          <div>
            <span className="text-text-secondary">End:</span>
            <span className="font-semibold ml-2">{formatDate(contest.end_date)}</span>
          </div>
          <div>
            <span className="text-text-secondary">Time Remaining:</span>
            <span className="font-semibold ml-2 text-primary">{getTimeRemaining()}</span>
          </div>
        </div>
      </div>

      {/* Winners Section */}
      {contest.prize_pool_distributed && winners.length > 0 && (
        <div className="bg-surface rounded-lg p-6 mb-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">🏆 Contest Winners</h2>
            <div className="text-sm text-text-secondary">
              Prize Pool: <span className="font-bold text-primary">{contest.prize_pool} pts</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {winners.map((winner) => (
              <div
                key={winner.id}
                className="relative bg-background rounded-lg overflow-hidden border-2"
                style={{
                  borderColor:
                    winner.placement === 1
                      ? '#FFD700'
                      : winner.placement === 2
                      ? '#C0C0C0'
                      : '#CD7F32',
                }}
              >
                {/* Placement Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <div
                    className="text-4xl drop-shadow-lg"
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                    }}
                  >
                    {winner.placement === 1 ? '🥇' : winner.placement === 2 ? '🥈' : '🥉'}
                  </div>
                </div>

                {/* Entry Image */}
                <Link to={`/entries/${winner.entry_id}`}>
                  <div className="aspect-square bg-background flex items-center justify-center">
                    {winner.entries.phase_4_url ? (
                      <img
                        src={winner.entries.phase_4_url}
                        alt={`${winner.placement} place`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    ) : (
                      <p className="text-text-secondary">No image</p>
                    )}
                  </div>
                </Link>

                {/* Winner Info */}
                <div className="p-4">
                  <Link
                    to={`/users/${winner.users.username}`}
                    className="flex items-center gap-2 mb-2 hover:text-primary transition-colors"
                  >
                    {winner.users.avatar_url ? (
                      <img
                        src={winner.users.avatar_url}
                        alt={winner.users.username}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm">
                        {winner.users.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-semibold">@{winner.users.username}</span>
                  </Link>

                  <div className="flex items-center justify-between text-sm">
                    <div className="text-text-secondary">
                      {winner.votes_received} votes
                    </div>
                    <div className="font-bold text-primary">
                      +{winner.prize_amount} pts
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prize Pool Display (if contest ended but not finalized) */}
      {contest.status === 'ended' && !contest.prize_pool_distributed && contest.prize_pool > 0 && (
        <div className="bg-warning/20 border border-warning rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">⏳</div>
            <div>
              <p className="font-semibold">Contest Ended - Awaiting Finalization</p>
              <p className="text-sm text-text-secondary">
                Prize Pool: <span className="font-bold">{contest.prize_pool} pts</span> will be distributed to top 3 winners soon!
              </p>
            </div>
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-lg border border-border">
          <p className="text-text-secondary mb-4">No entries yet</p>
          {canSubmit() && (
            <Link
              to={`/contests/${id}/submit`}
              className="inline-block px-6 py-3 bg-primary hover:bg-primary-hover rounded-lg font-semibold transition-colors"
            >
              Be the First to Submit!
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map((entry) => (
            <Link
              key={entry.id}
              to={`/entries/${entry.id}`}
              className="bg-surface rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
            >
              <div className="aspect-square bg-background flex items-center justify-center">
                {entry.phase_4_url ? (
                  <img src={entry.phase_4_url} alt={entry.title || "Entry"} className="w-full h-full object-cover" />
                ) : (
                  <p className="text-text-secondary">No final artwork yet</p>
                )}
              </div>
              <div className="p-4">
                {entry.title && (
                  <h3 className="font-bold mb-2 line-clamp-1">{entry.title}</h3>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {entry.users.avatar_url && (
                      <img
                        src={entry.users.avatar_url}
                        alt={entry.users.username}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span className="font-semibold text-sm">@{entry.users.username}</span>
                  </div>
                  <span className="text-sm text-text-secondary">
                    🔥 {formatNumber(entry.vote_count)} votes
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
