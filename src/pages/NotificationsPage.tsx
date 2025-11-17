export default function NotificationsPage() {
  const notifications = [
    { id: 1, type: 'follow', text: '@user123 started following you', time: '2h ago', read: false },
    { id: 2, type: 'vote', text: 'Your entry received 10 new votes!', time: '5h ago', read: false },
    { id: 3, type: 'contest', text: 'Summer Art Contest 2025 has ended', time: '1d ago', read: true },
    { id: 4, type: 'comment', text: '@artist456 commented on your entry', time: '2d ago', read: true },
  ]

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>

      <div className="space-y-2">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`p-4 rounded-lg border ${
              notif.read ? 'bg-surface border-border' : 'bg-primary/10 border-primary/30'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className={notif.read ? 'text-text-secondary' : 'font-medium'}>{notif.text}</p>
                <p className="text-xs text-text-secondary mt-1">{notif.time}</p>
              </div>
              {!notif.read && (
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
