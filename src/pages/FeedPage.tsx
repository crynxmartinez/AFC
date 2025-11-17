export default function FeedPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Arena</h1>
      <p className="text-text-secondary mb-8">
        Activity from artists you follow
      </p>

      <div className="space-y-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold">
                A
              </div>
              <div>
                <h3 className="font-semibold">@artist{i}</h3>
                <p className="text-sm text-text-secondary">2 hours ago</p>
              </div>
            </div>
            <p className="mb-4">Submitted a new entry to Summer Art Contest 2025</p>
            <div className="aspect-video bg-background rounded-lg flex items-center justify-center">
              <p className="text-text-secondary">Entry Preview</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
