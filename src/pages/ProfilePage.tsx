import { useParams } from 'react-router-dom'

export default function ProfilePage() {
  const { username } = useParams()

  return (
    <div>
      <div className="bg-surface rounded-lg p-8 mb-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-3xl font-bold">
            {username?.[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">@{username}</h1>
            <p className="text-text-secondary mb-4">Digital Artist | Level 5</p>
            <div className="flex gap-6 text-sm">
              <div>
                <span className="font-semibold">125</span>
                <span className="text-text-secondary ml-1">Followers</span>
              </div>
              <div>
                <span className="font-semibold">89</span>
                <span className="text-text-secondary ml-1">Following</span>
              </div>
              <div>
                <span className="font-semibold">12</span>
                <span className="text-text-secondary ml-1">Entries</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="aspect-square bg-surface rounded-lg border border-border flex items-center justify-center">
            <p className="text-text-secondary">Entry {i}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
