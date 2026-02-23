// @ts-nocheck - Supabase type inference issues
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi, entriesApi } from '@/lib/api'
import { formatTimeAgo } from '@/lib/utils'
import { Check, X } from 'lucide-react'
import { useToastStore } from '@/stores/toastStore'

type Entry = {
  id: string
  user_id: string
  contest_id: string
  phase_1_url: string | null
  phase_2_url: string | null
  phase_3_url: string | null
  phase_4_url: string | null
  status: string
  submitted_at: string
  users: {
    username: string
    avatar_url: string | null
  }
  contests: {
    title: string
  }
}

export default function AdminReviews() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending_review' | 'all'>('pending_review')
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const toast = useToastStore()

  useEffect(() => {
    fetchEntries()
  }, [filter])

  const fetchEntries = async () => {
    try {
      const response: any = await adminApi.getPendingEntries()
      const data = response.entries || []

      if (filter === 'pending_review') {
        query = query.eq('status', 'pending_review')
      }

      const { data, error } = await query

      if (error) throw error
      
      // Fetch related data separately
      const entriesWithData = await Promise.all(
        (data || []).map(async (entry: any) => {
          const [{ data: userData }, { data: contestData }] = await Promise.all([
            supabase.from('users').select('username, avatar_url').eq('id', entry.user_id).single(),
            supabase.from('contests').select('title').eq('id', entry.contest_id).single()
          ])
          return {
            ...entry,
            users: userData,
            contests: contestData
          }
        })
      )
      
      setEntries(entriesWithData || [])
    } catch (error) {
      console.error('Error fetching entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const approveEntry = async (id: string) => {
    try {
      await adminApi.reviewEntry(id, 'approved', null)

      if (error) throw error

      setEntries(entries.filter((e) => e.id !== id))
      toast.success('Entry approved!')
      
      // Dispatch event to update sidebar badge
      window.dispatchEvent(new CustomEvent('pending-reviews-updated'))
    } catch (error: any) {
      toast.error('Failed to approve: ' + error.message)
    }
  }

  const rejectEntry = async (id: string) => {
    if (!rejectionReason.trim()) {
      toast.warning('Please provide a rejection reason')
      return
    }

    try {
      await adminApi.reviewEntry(id, 'rejected', rejectionReason)

      if (error) throw error

      setEntries(entries.filter((e) => e.id !== id))
      setRejectingId(null)
      setRejectionReason('')
      toast.success('Entry rejected')
      
      // Dispatch event to update sidebar badge
      window.dispatchEvent(new CustomEvent('pending-reviews-updated'))
    } catch (error: any) {
      toast.error('Failed to reject: ' + error.message)
    }
  }

  const getPhaseCount = (entry: Entry) => {
    let count = 0
    if (entry.phase_1_url) count++
    if (entry.phase_2_url) count++
    if (entry.phase_3_url) count++
    if (entry.phase_4_url) count++
    return count
  }

  if (loading) {
    return <div className="text-center py-12">Loading entries...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Review Submissions</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-4 py-2 bg-surface border border-border rounded-lg"
        >
          <option value="pending_review">Pending Review</option>
          <option value="all">All Entries</option>
        </select>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-lg border border-border">
          <p className="text-text-secondary">No entries to review</p>
        </div>
      ) : (
        <div className="space-y-6">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-surface rounded-lg p-6 border border-border">
              <div className="flex gap-6">
                <div className="w-48 h-48 bg-background rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {entry.phase_4_url || entry.phase_3_url || entry.phase_2_url || entry.phase_1_url ? (
                    <img
                      src={entry.phase_4_url || entry.phase_3_url || entry.phase_2_url || entry.phase_1_url || ''}
                      alt="Entry"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <p className="text-text-secondary">No preview</p>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-1">
                        Entry by @{entry.users.username}
                      </h3>
                      <p className="text-text-secondary text-sm">Contest: {entry.contests.title}</p>
                      <p className="text-text-secondary text-sm">
                        Submitted: {formatTimeAgo(entry.submitted_at)}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        entry.status === 'pending_review'
                          ? 'bg-warning/20 text-warning'
                          : entry.status === 'approved'
                          ? 'bg-success/20 text-success'
                          : 'bg-error/20 text-error'
                      }`}
                    >
                      {entry.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm font-medium mb-2">
                      Phases Submitted: {getPhaseCount(entry)}/4
                    </div>
                    <div className="flex gap-2">
                      {[
                        { label: 'Sketch', url: entry.phase_1_url },
                        { label: 'Line Art', url: entry.phase_2_url },
                        { label: 'Base Colors', url: entry.phase_3_url },
                        { label: 'Final', url: entry.phase_4_url },
                      ].map((phase, idx) => (
                        <div
                          key={idx}
                          className={`px-3 py-1 rounded text-xs font-semibold ${
                            phase.url
                              ? 'bg-success/20 text-success'
                              : 'bg-text-secondary/20 text-text-secondary'
                          }`}
                        >
                          {phase.label} {phase.url && '✓'}
                        </div>
                      ))}
                    </div>
                  </div>

                  {rejectingId === entry.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Reason for rejection..."
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
                        rows={2}
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => rejectEntry(entry.id)}
                          className="px-6 py-2 bg-error hover:bg-error/80 rounded-lg font-semibold transition-colors"
                        >
                          Confirm Reject
                        </button>
                        <button
                          onClick={() => {
                            setRejectingId(null)
                            setRejectionReason('')
                          }}
                          className="px-6 py-2 bg-background hover:bg-border rounded-lg font-semibold transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      {entry.status === 'pending_review' && (
                        <>
                          <button
                            onClick={() => approveEntry(entry.id)}
                            className="flex items-center gap-2 px-6 py-2 bg-success hover:bg-success/80 rounded-lg font-semibold transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectingId(entry.id)}
                            className="flex items-center gap-2 px-6 py-2 bg-error hover:bg-error/80 rounded-lg font-semibold transition-colors"
                          >
                            <X className="w-4 h-4" />
                            Reject
                          </button>
                        </>
                      )}
                      <Link
                        to={`/entries/${entry.id}`}
                        className="px-6 py-2 bg-background hover:bg-border rounded-lg font-semibold transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
