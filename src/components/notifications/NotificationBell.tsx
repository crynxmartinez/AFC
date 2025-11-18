// @ts-nocheck
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { Bell, X } from 'lucide-react'
import { formatTimeAgo } from '@/lib/utils'
import { usePendingReviews } from '@/hooks/usePendingReviews'

type Notification = {
  id: string
  type: 'reaction' | 'comment' | 'artist_contest' | 'reply'
  content: string
  read: boolean
  created_at: string
  entry_id: string | null
  contest_id: string | null
  users: {
    username: string
    avatar_url: string | null
  } | null
}

export default function NotificationBell() {
  const { user, profile } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { pendingCount } = usePendingReviews()
  
  // Total badge count includes unread notifications + pending reviews for admins
  const totalBadgeCount = unreadCount + (profile?.role === 'admin' ? pendingCount : 0)

  useEffect(() => {
    if (user) {
      fetchNotifications()
      
      // Set up realtime subscription
      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchNotifications()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user])

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchNotifications = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      // Fetch actor data separately for each notification
      const notificationsWithActors = await Promise.all(
        (data || []).map(async (notification) => {
          if (notification.actor_id) {
            const { data: actorData } = await supabase
              .from('users')
              .select('username, avatar_url')
              .eq('id', notification.actor_id)
              .single()

            return { ...notification, users: actorData }
          }
          return { ...notification, users: null }
        })
      )

      setNotifications(notificationsWithActors)
      setUnreadCount(notificationsWithActors.filter(n => !n.read).length || 0)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) throw error

      // Update local state
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) throw error

      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error

      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === notificationId)
        return notification && !notification.read ? prev - 1 : prev
      })
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const getNotificationLink = (notification: Notification) => {
    if (notification.entry_id) {
      return `/entries/${notification.entry_id}`
    }
    if (notification.contest_id) {
      return `/contests/${notification.contest_id}`
    }
    return '#'
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reaction':
        return '❤️'
      case 'comment':
      case 'reply':
        return '💬'
      case 'artist_contest':
        return '🎨'
      default:
        return '🔔'
    }
  }

  if (!user) return null

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 hover:bg-surface rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {totalBadgeCount > 0 && (
          <span className="absolute top-0 right-0 bg-error text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {totalBadgeCount > 9 ? '9+' : totalBadgeCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-surface border border-border rounded-lg shadow-lg overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-bold text-lg">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={loading}
                className="text-sm text-primary hover:underline disabled:opacity-50"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Pending Reviews (Admin Only) */}
          {profile?.role === 'admin' && pendingCount > 0 && (
            <Link
              to="/admin/reviews"
              onClick={() => setShowDropdown(false)}
              className="block p-4 bg-warning/10 hover:bg-warning/20 border-b border-border transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">📋</div>
                <div className="flex-1">
                  <p className="font-semibold text-warning">
                    {pendingCount} {pendingCount === 1 ? 'Entry' : 'Entries'} Pending Review
                  </p>
                  <p className="text-xs text-text-secondary">Click to review submissions</p>
                </div>
              </div>
            </Link>
          )}

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative border-b border-border hover:bg-background transition-colors ${
                    !notification.read ? 'bg-primary/5' : ''
                  }`}
                >
                  <Link
                    to={getNotificationLink(notification)}
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification.id)
                      }
                      setShowDropdown(false)
                    }}
                    className="block p-4 pr-10"
                  >
                    <div className="flex gap-3">
                      {/* Actor Avatar */}
                      {notification.users?.avatar_url ? (
                        <img
                          src={notification.users.avatar_url}
                          alt={notification.users.username}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold flex-shrink-0">
                          {notification.users?.username?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-semibold">@{notification.users?.username}</span>{' '}
                              {notification.content}
                            </p>
                            <p className="text-xs text-text-secondary mt-1">
                              {formatTimeAgo(notification.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Unread Indicator */}
                      {!notification.read && (
                        <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                  </Link>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      deleteNotification(notification.id)
                    }}
                    className="absolute top-2 right-2 p-1 hover:bg-surface rounded transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4 text-text-secondary hover:text-error" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-border text-center">
              <Link
                to="/notifications"
                onClick={() => setShowDropdown(false)}
                className="text-sm text-primary hover:underline"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
