// @ts-nocheck
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { Heart, MessageCircle, Trophy, UserPlus, Bell } from 'lucide-react'
import { formatTimeAgo } from '@/lib/utils'

type Notification = {
  id: string
  type: 'reaction' | 'comment' | 'artist_contest' | 'reply' | 'follow'
  content: string
  read: boolean
  created_at: string
  link: string | null
}

export default function NotificationsPage() {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  const fetchNotifications = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true } as any)
        .eq('id', notificationId)

      if (error) throw error

      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reaction':
        return <Heart className="w-5 h-5 text-error" />
      case 'comment':
      case 'reply':
        return <MessageCircle className="w-5 h-5 text-primary" />
      case 'artist_contest':
        return <Trophy className="w-5 h-5 text-warning" />
      case 'follow':
        return <UserPlus className="w-5 h-5 text-success" />
      default:
        return <Bell className="w-5 h-5" />
    }
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Please login to view notifications</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Loading notifications...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>

      {notifications.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-lg border border-border">
          <Bell className="w-12 h-12 mx-auto mb-4 text-text-secondary opacity-50" />
          <p className="text-text-secondary">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <Link
              key={notif.id}
              to={notif.link || '#'}
              onClick={() => !notif.read && markAsRead(notif.id)}
              className={`block p-4 rounded-lg border transition-colors ${
                notif.read
                  ? 'bg-surface border-border hover:bg-background'
                  : 'bg-primary/10 border-primary/30 hover:bg-primary/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <p className={notif.read ? 'text-text-secondary' : 'font-medium'}>
                    {notif.content}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    {formatTimeAgo(notif.created_at)}
                  </p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
