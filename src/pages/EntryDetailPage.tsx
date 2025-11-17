import { useParams } from 'react-router-dom'

export default function EntryDetailPage() {
  const { id: _id } = useParams()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="aspect-square bg-surface rounded-lg border border-border flex items-center justify-center mb-4">
            <p className="text-text-secondary">Artwork Image</p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {['Sketch', 'Line Art', 'Base Colors', 'Final'].map((phase, i) => (
              <div key={i} className="aspect-square bg-surface rounded border border-border flex items-center justify-center text-xs">
                {phase}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center font-bold">
              A
            </div>
            <div>
              <h3 className="font-semibold">@artistname</h3>
              <p className="text-sm text-text-secondary">Level 5 • 234 followers</p>
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-2">Summer Vibes</h1>
          <p className="text-text-secondary mb-6">
            Contest: Summer Art Contest 2025
          </p>

          <button className="w-full py-3 bg-primary hover:bg-primary-hover rounded-lg font-semibold mb-4 transition-colors">
            🔥 Vote (1 point)
          </button>

          <div className="bg-surface rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Total Votes</span>
              <span className="font-semibold text-lg">234</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Current Rank</span>
              <span className="font-semibold text-lg text-primary">#3</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Comments</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-surface rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">@user{i}</span>
                    <span className="text-xs text-text-secondary">2h ago</span>
                  </div>
                  <p className="text-sm">Amazing work! Love the colors 🔥</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
