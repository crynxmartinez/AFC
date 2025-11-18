// @ts-nocheck - Supabase type inference issues
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'

type Contest = {
  id: string
  title: string
  description: string
  status: string
  start_date: string
  end_date: string
  thumbnail_url: string | null
  created_at: string
  entry_count?: number
  prize_pool?: number
  prize_pool_distributed?: boolean
}

export default function AdminContests() {
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContests()
  }, [])

  const fetchContests = async () => {
    try {
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Get entry counts separately
      const contestsWithCounts = await Promise.all(
        (data || []).map(async (contest: any) => {
          const { count } = await supabase
            .from('entries')
            .select('*', { count: 'exact', head: true })
            .eq('contest_id', contest.id)

          return {
            ...contest,
            entry_count: count || 0,
          }
        })
      )

      setContests(contestsWithCounts)
    } catch (error) {
      console.error('Error fetching contests:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteContest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contest?')) return

    try {
      const { error } = await supabase
        .from('contests')
        .delete()
        .eq('id', id)

      if (error) throw error

      setContests(contests.filter((c) => c.id !== id))
    } catch (error: any) {
      alert('Failed to delete contest: ' + error.message)
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('contests')
        .update({ status: newStatus } as any)
        .eq('id', id)

      if (error) throw error

      setContests(contests.map((c) => (c.id === id ? { ...c, status: newStatus } : c)))
    } catch (error: any) {
      alert('Failed to update status: ' + error.message)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading contests...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Manage Contests</h1>
        <Link
          to="/admin/contests/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover rounded-lg font-semibold transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Contest
        </Link>
      </div>

      {contests.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-lg border border-border">
          <p className="text-text-secondary mb-4">No contests yet</p>
          <Link
            to="/admin/contests/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover rounded-lg font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Your First Contest
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {contests.map((contest) => (
            <div key={contest.id} className="bg-surface rounded-lg p-6 border border-border">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{contest.title}</h3>
                    <select
                      value={contest.status}
                      onChange={(e) => updateStatus(contest.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold bg-transparent border-2 cursor-pointer ${
                        contest.status === 'active'
                          ? 'border-success text-success'
                          : contest.status === 'draft'
                          ? 'border-warning text-warning'
                          : contest.status === 'voting'
                          ? 'border-secondary text-secondary'
                          : 'border-text-secondary text-text-secondary'
                      }`}
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="voting">Voting</option>
                      <option value="ended">Ended</option>
                    </select>
                  </div>
                  <p className="text-sm text-text-secondary mb-3 line-clamp-2">{contest.description}</p>
                  <div className="flex gap-6 text-sm text-text-secondary">
                    <span>{contest.entry_count || 0} entries</span>
                    <span>Start: {formatDate(contest.start_date)}</span>
                    <span>End: {formatDate(contest.end_date)}</span>
                  </div>
                </div>
                {contest.thumbnail_url && (
                  <img
                    src={contest.thumbnail_url}
                    alt={contest.title}
                    className="w-24 h-24 object-cover rounded-lg ml-4"
                  />
                )}
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/contests/${contest.id}`}
                  className="px-4 py-2 bg-background hover:bg-border rounded-lg text-sm font-medium transition-colors"
                >
                  View
                </Link>
                <Link
                  to={`/admin/contests/edit/${contest.id}`}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover rounded-lg text-sm font-medium transition-colors"
                >
                  Edit
                </Link>
                {contest.status === 'ended' && !contest.prize_pool_distributed && (
                  <Link
                    to={`/admin/contests/finalize/${contest.id}`}
                    className="px-4 py-2 bg-success hover:bg-success/80 rounded-lg text-sm font-medium transition-colors"
                  >
                    🏆 Finalize Winners
                  </Link>
                )}
                <button
                  onClick={() => deleteContest(contest.id)}
                  className="px-4 py-2 bg-error/20 hover:bg-error/30 text-error rounded-lg text-sm font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
