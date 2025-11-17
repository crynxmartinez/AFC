export default function AdminUsers() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">User Management</h1>

      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-background">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold">User</th>
              <th className="text-left px-6 py-4 text-sm font-semibold">Email</th>
              <th className="text-left px-6 py-4 text-sm font-semibold">Level</th>
              <th className="text-left px-6 py-4 text-sm font-semibold">Points</th>
              <th className="text-left px-6 py-4 text-sm font-semibold">Joined</th>
              <th className="text-left px-6 py-4 text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: 1, username: 'artist1', email: 'artist1@example.com', level: 5, points: 250, joined: '2024-01-15' },
              { id: 2, username: 'artist2', email: 'artist2@example.com', level: 3, points: 120, joined: '2024-02-20' },
              { id: 3, username: 'artist3', email: 'artist3@example.com', level: 8, points: 450, joined: '2023-12-10' },
            ].map((user) => (
              <tr key={user.id} className="border-t border-border">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold">
                      {user.username[0].toUpperCase()}
                    </div>
                    <span className="font-semibold">@{user.username}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-text-secondary">{user.email}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-primary/20 text-primary rounded text-sm font-semibold">
                    Level {user.level}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold">{user.points} pts</td>
                <td className="px-6 py-4 text-text-secondary">{user.joined}</td>
                <td className="px-6 py-4">
                  <button className="text-primary hover:underline text-sm font-medium">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
