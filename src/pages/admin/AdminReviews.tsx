export default function AdminReviews() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Review Submissions</h1>

      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex gap-6">
              <div className="w-48 h-48 bg-background rounded-lg flex items-center justify-center flex-shrink-0">
                <p className="text-text-secondary">Entry Preview</p>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">Entry by @artist{i}</h3>
                    <p className="text-text-secondary text-sm">Contest: Summer Art Contest 2025</p>
                    <p className="text-text-secondary text-sm">Submitted: 2 hours ago</p>
                  </div>
                  <span className="px-3 py-1 bg-warning/20 text-warning rounded-full text-xs font-semibold">
                    Pending Review
                  </span>
                </div>

                <div className="mb-4">
                  <div className="text-sm font-medium mb-2">Phases Submitted:</div>
                  <div className="flex gap-2">
                    {['Sketch', 'Line Art', 'Base Colors', 'Final'].map((phase, idx) => (
                      <div key={idx} className="px-3 py-1 bg-success/20 text-success rounded text-xs font-semibold">
                        {phase} ✓
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="px-6 py-2 bg-success hover:bg-success/80 rounded-lg font-semibold transition-colors">
                    Approve
                  </button>
                  <button className="px-6 py-2 bg-error hover:bg-error/80 rounded-lg font-semibold transition-colors">
                    Reject
                  </button>
                  <button className="px-6 py-2 bg-background hover:bg-border rounded-lg font-semibold transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
