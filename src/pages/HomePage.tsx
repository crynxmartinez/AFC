export default function HomePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome to Arena for Creatives</h1>
        <p className="text-text-secondary text-lg">
          Where Filipino digital artists compete, showcase, and shine
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder cards */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-surface rounded-lg overflow-hidden border border-border">
            <div className="aspect-square bg-background flex items-center justify-center">
              <p className="text-text-secondary">Contest {i}</p>
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-2">Contest Title {i}</h3>
              <p className="text-sm text-text-secondary mb-3">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">45 entries</span>
                <span className="text-primary font-semibold">5 days left</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
