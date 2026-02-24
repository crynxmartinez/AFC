import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, AlertTriangle } from 'lucide-react'
import { contestsApi } from '@/lib/api'
import { formatDate, getContestStatus } from '@/lib/utils'
import { useToastStore } from '@/stores/toastStore'

type Contest = {
  id: string
  title: string
  description: string
  status: string
  startDate: string
  endDate: string
  thumbnailUrl: string | null
  createdAt: string
  entryCount?: number
  prizePool?: number
  prizePoolDistributed?: boolean
}

export default function AdminContests() {
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const toast = useToastStore()

  useEffect(() => {
    fetchContests()
  }, [])

  const fetchContests = async () => {
    try {
      const response: any = await contestsApi.list()
      const data = response.data?.contests || response.contests || response.data || []

      // Get entry counts and calculate actual status based on dates
      const contestsWithCounts = await Promise.all(
        (data || []).map(async (contest: any) => {
          let entryCount = 0
          try {
            const entriesRes: any = await contestsApi.getEntries(contest.id)
            entryCount = entriesRes.data?.length || entriesRes.entries?.length || 0
          } catch (e) { /* ignore */ }

          // Calculate actual status based on dates
          const calculatedStatus = getContestStatus(contest.startDate, contest.endDate)
          
          // If database status is 'voting', keep it (manual override)
          // Otherwise use calculated status
          const actualStatus = contest.status === 'voting' ? 'voting' : calculatedStatus

          return {
            ...contest,
            status: actualStatus,
            entryCount,
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
      await contestsApi.delete(id)

      setContests(contests.filter((c) => c.id !== id))
      toast.success('Contest deleted')
    } catch (error: any) {
      toast.error('Failed to delete contest: ' + error.message)
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await contestsApi.update(id, { status: newStatus })

      setContests(contests.map((c) => (c.id === id ? { ...c, status: newStatus } : c)))
      toast.success('Status updated')
    } catch (error: any) {
      toast.error('Failed to update status: ' + error.message)
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
                  <p className="text-sm text-text-secondary mb-3 line-clamp-2 whitespace-pre-line">{contest.description}</p>
                  <div className="flex gap-6 text-sm text-text-secondary">
                    <span>{contest.entryCount || 0} entries</span>
                    <span>Start: {formatDate(contest.startDate)}</span>
                    <span>End: {formatDate(contest.endDate)}</span>
                  </div>
                </div>
                {contest.thumbnailUrl && (
                  <img
                    src={contest.thumbnailUrl}
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
                {contest.status === 'ended' && !contest.prizePoolDistributed && (
                  <Link
                    to={`/admin/contests/finalize/${contest.id}`}
                    className="px-4 py-2 bg-success hover:bg-success/80 rounded-lg text-sm font-medium transition-colors"
                  >
                    🏆 Finalize Winners
                  </Link>
                )}
                <button
                  onClick={() => setDeleteConfirmId(contest.id)}
                  className="px-4 py-2 bg-error/20 hover:bg-error/30 text-error rounded-lg text-sm font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl border border-border max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-error/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-error" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Delete Contest?</h3>
                <p className="text-sm text-text-secondary">This will also delete all entries</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 bg-background hover:bg-border rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteContest(deleteConfirmId)}
                className="flex-1 px-4 py-2 bg-error hover:bg-error/80 rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
