import { useParams } from 'react-router-dom'

export default function ContestDetailPage() {
  const { id } = useParams()

  return (
    <div>
      <div className="bg-surface rounded-lg p-8 mb-6">
        <h1 className="text-4xl font-bold mb-4">Summer Art Contest 2025</h1>
        <p className="text-text-secondary text-lg mb-6">
          Show us your best summer-themed digital artwork and compete for amazing prizes!
        </p>
        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-text-secondary">Entries:</span>
            <span className="font-semibold ml-2">45</span>
          </div>
          <div>
            <span className="text-text-secondary">Total Votes:</span>
            <span className="font-semibold ml-2">1,234</span>
          </div>
          <div>
            <span className="text-text-secondary">Ends in:</span>
            <span className="font-semibold ml-2 text-primary">5 days</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-surface rounded-lg overflow-hidden border border-border">
            <div className="aspect-square bg-background flex items-center justify-center">
              <p className="text-text-secondary">Entry {i}</p>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">@artist{i}</span>
                <span className="text-sm text-text-secondary">🔥 {i * 23} votes</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
