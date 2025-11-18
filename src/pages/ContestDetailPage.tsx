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
}

type Entry = {
  id: string
  user_id: string
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchContest()
      fetchEntries()
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
        .select('id, user_id, phase_4_url, users(username, avatar_url)')
        .eq('contest_id', id)
        .eq('status', 'approved')

      if (error) throw error

      // Get reaction counts for each entry
      const entriesWithVotes = await Promise.all(
        (data || []).map(async (entry: any) => {
          const { count } = await supabase
            .from('reactions')
            .select('*', { count: 'exact', head: true })
            .eq('entry_id', entry.id)

          return { ...entry, vote_count: count || 0 }
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
                  <img src={entry.phase_4_url} alt="Entry" className="w-full h-full object-cover" />
                ) : (
                  <p className="text-text-secondary">No final artwork yet</p>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {entry.users.avatar_url && (
                      <img
                        src={entry.users.avatar_url}
                        alt={entry.users.username}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span className="font-semibold">@{entry.users.username}</span>
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
