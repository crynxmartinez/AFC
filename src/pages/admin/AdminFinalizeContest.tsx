// @ts-nocheck
import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Trophy, Medal, Award, ArrowLeft, AlertCircle } from 'lucide-react'

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

type Contest = {
  id: string
  title: string
  description: string
  status: string
  prize_pool: number
  prize_pool_distributed: boolean
}

export default function AdminFinalizeContest() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [contest, setContest] = useState<Contest | null>(null)
  const [topEntries, setTopEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [finalizing, setFinalizing] = useState(false)

  useEffect(() => {
    if (id) {
      fetchContestAndEntries()
    }
  }, [id])

  const fetchContestAndEntries = async () => {
    try {
      // Fetch contest
      const { data: contestData, error: contestError } = await supabase
        .from('contests')
        .select('*')
        .eq('id', id)
        .single()

      if (contestError) throw contestError
      setContest(contestData)

      // Fetch top entries with vote counts
      const { data: entriesData, error: entriesError } = await supabase
        .from('entries')
        .select('id, user_id, phase_4_url')
        .eq('contest_id', id)
        .eq('status', 'approved')

      if (entriesError) throw entriesError

      // Fetch user data and count votes for each entry
      const entriesWithVotes = await Promise.all(
        (entriesData || []).map(async (entry: any) => {
          const { data: userData } = await supabase
            .from('users')
            .select('username, avatar_url')
            .eq('id', entry.user_id)
            .single()
          const { count } = await supabase
            .from('reactions')
            .select('*', { count: 'exact', head: true })
            .eq('entry_id', entry.id)

          return {
            ...entry,
            users: userData,
            vote_count: count || 0,
          }
        })
      )

      // Sort by votes and get top 3
      const sorted = entriesWithVotes.sort((a, b) => b.vote_count - a.vote_count)
      setTopEntries(sorted.slice(0, 3))
    } catch (error) {
      console.error('Error fetching data:', error)
      alert('Failed to load contest data')
    } finally {
      setLoading(false)
    }
  }

  const finalizeContest = async () => {
    if (!contest || !id) return

    if (!confirm('Are you sure you want to finalize this contest? This will distribute prizes to the top 3 winners and cannot be undone.')) {
      return
    }

    setFinalizing(true)

    try {
      // Call the SQL function to finalize contest
      const { data, error } = await supabase.rpc('finalize_contest_and_select_winners', {
        p_contest_id: id,
      })

      if (error) throw error

      if (data && data.length > 0) {
        const result = data[0]
        if (result.success) {
          alert(`✅ Contest finalized successfully!\n\n🥇 1st Place: ${result.prize_1st} pts\n🥈 2nd Place: ${result.prize_2nd} pts\n🥉 3rd Place: ${result.prize_3rd} pts\n\nTotal Prize Pool: ${result.total_prize_pool} pts`)
          navigate('/admin/contests')
        } else {
          alert(`❌ Error: ${result.message}`)
        }
      }
    } catch (error) {
      console.error('Error finalizing contest:', error)
      alert('Failed to finalize contest. Please try again.')
    } finally {
      setFinalizing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading contest data...</p>
        </div>
      </div>
    )
  }

  if (!contest) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Contest not found</h2>
        <Link to="/admin/contests" className="text-primary hover:underline">
          Back to Contests
        </Link>
      </div>
    )
  }

  // Check by DATE instead of status
  const contestEnded = new Date(contest.end_date) < new Date()
  
  if (!contestEnded) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-warning/20 border border-warning rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-warning mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Contest Not Ended</h2>
          <p className="text-text-secondary mb-4">
            This contest's end date ({new Date(contest.end_date).toLocaleDateString()}) has not passed yet.
          </p>
          <Link
            to="/admin/contests"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Contests
          </Link>
        </div>
      </div>
    )
  }

  if (contest.prize_pool_distributed) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-success/20 border border-success rounded-lg p-6 text-center">
          <Trophy className="w-12 h-12 text-success mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Already Finalized</h2>
          <p className="text-text-secondary mb-4">
            This contest has already been finalized and prizes have been distributed.
          </p>
          <Link
            to="/admin/contests"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Contests
          </Link>
        </div>
      </div>
    )
  }

  // Calculate prize pool from top 3 entries' reactions
  const totalReactions = topEntries.reduce((sum, entry) => sum + entry.vote_count, 0)
  const prizePool = totalReactions
  
  const prize1st = Math.floor(prizePool * 0.5)
  const prize2nd = Math.floor(prizePool * 0.2)
  const prize3rd = Math.floor(prizePool * 0.1)
  const remaining = prizePool - prize1st - prize2nd - prize3rd

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        to="/admin/contests"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Contests
      </Link>

      <div className="bg-surface rounded-lg p-6 mb-6 border border-border">
        <h1 className="text-3xl font-bold mb-2">{contest.title}</h1>
        <p className="text-text-secondary mb-4">{contest.description}</p>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            <span className="font-semibold">Prize Pool: {prizePool} pts (from {totalReactions} reactions)</span>
          </div>
          <div className="text-text-secondary">
            Status: <span className="text-error font-semibold">Ended</span>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-lg p-6 mb-6 border border-border">
        <h2 className="text-2xl font-bold mb-4">Prize Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-primary/10 border border-primary rounded-lg p-4 text-center">
            <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary">{prize1st} pts</div>
            <div className="text-sm text-text-secondary">1st Place (50%)</div>
          </div>
          <div className="bg-secondary/10 border border-secondary rounded-lg p-4 text-center">
            <Medal className="w-8 h-8 text-secondary mx-auto mb-2" />
            <div className="text-2xl font-bold text-secondary">{prize2nd} pts</div>
            <div className="text-sm text-text-secondary">2nd Place (20%)</div>
          </div>
          <div className="bg-warning/10 border border-warning rounded-lg p-4 text-center">
            <Award className="w-8 h-8 text-warning mx-auto mb-2" />
            <div className="text-2xl font-bold text-warning">{prize3rd} pts</div>
            <div className="text-sm text-text-secondary">3rd Place (10%)</div>
          </div>
          <div className="bg-background border border-border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-text-secondary">{remaining} pts</div>
            <div className="text-sm text-text-secondary">Remaining (20%)</div>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-lg p-6 mb-6 border border-border">
        <h2 className="text-2xl font-bold mb-4">Top 3 Entries</h2>
        {topEntries.length === 0 ? (
          <p className="text-text-secondary text-center py-8">No approved entries found</p>
        ) : (
          <div className="space-y-4">
            {topEntries.map((entry, index) => (
              <div
                key={entry.id}
                className="flex items-center gap-4 p-4 bg-background rounded-lg border-2"
                style={{
                  borderColor:
                    index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32',
                }}
              >
                <div className="text-4xl">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                </div>
                {entry.phase_4_url && (
                  <img
                    src={entry.phase_4_url}
                    alt="Entry"
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {entry.users.avatar_url ? (
                      <img
                        src={entry.users.avatar_url}
                        alt={entry.users.username}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs">
                        {entry.users.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-semibold">@{entry.users.username}</span>
                  </div>
                  <div className="text-sm text-text-secondary">
                    {entry.vote_count} votes
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {index === 0 ? prize1st : index === 1 ? prize2nd : prize3rd} pts
                  </div>
                  <div className="text-sm text-text-secondary">
                    {index === 0 ? '50%' : index === 1 ? '20%' : '10%'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-warning/20 border border-warning rounded-lg p-4 mb-6">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold mb-1">⚠️ Warning: This action cannot be undone!</p>
            <p className="text-text-secondary">
              Finalizing this contest will:
            </p>
            <ul className="list-disc list-inside text-text-secondary mt-2 space-y-1">
              <li>Award prize points to the top 3 winners</li>
              <li>Award XP to the winners (200/150/100 XP)</li>
              <li>Mark the contest as finalized</li>
              <li>Record winners in the database</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={finalizeContest}
          disabled={finalizing || topEntries.length === 0}
          className="flex-1 px-6 py-3 bg-success hover:bg-success/80 disabled:bg-success/50 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {finalizing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Finalizing...
            </>
          ) : (
            <>
              <Trophy className="w-5 h-5" />
              Finalize Contest & Distribute Prizes
            </>
          )}
        </button>
        <Link
          to="/admin/contests"
          className="px-6 py-3 bg-background hover:bg-border rounded-lg font-semibold transition-colors"
        >
          Cancel
        </Link>
      </div>
    </div>
  )
}
