import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'

export default function AdminContests() {
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

      <div className="space-y-4">
        {[
          { id: 1, title: 'Summer Art Contest 2025', status: 'active', entries: 45, votes: 1234 },
          { id: 2, title: 'Winter Wonderland', status: 'draft', entries: 0, votes: 0 },
          { id: 3, title: 'Spring Bloom', status: 'ended', entries: 67, votes: 2345 },
        ].map((contest) => (
          <div key={contest.id} className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold">{contest.title}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      contest.status === 'active'
                        ? 'bg-success/20 text-success'
                        : contest.status === 'draft'
                        ? 'bg-warning/20 text-warning'
                        : 'bg-text-secondary/20 text-text-secondary'
                    }`}
                  >
                    {contest.status}
                  </span>
                </div>
                <div className="flex gap-6 text-sm text-text-secondary">
                  <span>{contest.entries} entries</span>
                  <span>{contest.votes} votes</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-background hover:bg-border rounded-lg text-sm font-medium transition-colors">
                  Edit
                </button>
                <button className="px-4 py-2 bg-error/20 hover:bg-error/30 text-error rounded-lg text-sm font-medium transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
