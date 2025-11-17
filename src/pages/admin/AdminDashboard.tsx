export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface rounded-lg p-6 border border-border">
          <div className="text-text-secondary text-sm mb-2">Total Users</div>
          <div className="text-3xl font-bold">1,234</div>
          <div className="text-success text-sm mt-2">+12% from last month</div>
        </div>
        <div className="bg-surface rounded-lg p-6 border border-border">
          <div className="text-text-secondary text-sm mb-2">Active Contests</div>
          <div className="text-3xl font-bold">8</div>
          <div className="text-text-secondary text-sm mt-2">3 ending soon</div>
        </div>
        <div className="bg-surface rounded-lg p-6 border border-border">
          <div className="text-text-secondary text-sm mb-2">Total Revenue</div>
          <div className="text-3xl font-bold">₱45,678</div>
          <div className="text-success text-sm mt-2">+23% from last month</div>
        </div>
        <div className="bg-surface rounded-lg p-6 border border-border">
          <div className="text-text-secondary text-sm mb-2">Pending Reviews</div>
          <div className="text-3xl font-bold">15</div>
          <div className="text-warning text-sm mt-2">Needs attention</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-xl font-bold mb-4">Recent Contests</h2>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-background rounded-lg">
                <div>
                  <div className="font-semibold">Summer Art Contest {i}</div>
                  <div className="text-sm text-text-secondary">45 entries • 1,234 votes</div>
                </div>
                <div className="text-sm text-primary">Active</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-background rounded-lg">
                <div>
                  <div className="font-semibold">@user{i}</div>
                  <div className="text-sm text-text-secondary">Purchased 115 points</div>
                </div>
                <div className="text-sm font-semibold text-success">₱100</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
