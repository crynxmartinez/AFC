// @ts-nocheck
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { notificationsApi, usersApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { Bell, X, Heart, MessageCircle, Trophy, UserPlus, AlertTriangle } from 'lucide-react'
import { useToastStore } from '@/stores/toastStore'
import { formatTimeAgo } from '@/lib/utils'
import { usePendingReviews } from '@/hooks/usePendingReviews'

type Notification = {
  id: string
  type: 'reaction' | 'comment' | 'artist_contest' | 'reply' | 'follow'
  content: string
  read: boolean
  created_at: string
  entry_id: string | null
  contest_id: string | null
  link: string | null
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
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { pendingCount } = usePendingReviews()
  const toast = useToastStore()
  
  // Total badge count includes unread notifications + pending reviews for admins
  const totalBadgeCount = unreadCount + (profile?.role === 'admin' ? pendingCount : 0)

  // Use user.id to prevent refetch on auth state changes
  const userId = user?.id

  useEffect(() => {
    if (userId) {
      fetchNotifications()
      
      // Poll for new notifications every 60 seconds
      const interval = setInterval(() => {
        fetchNotifications()
      }, 60000)

      return () => {
        clearInterval(interval)
      }
    }
  }, [userId])

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
      const response: any = await notificationsApi.list()
      const data = response.notifications || []

      // Fetch actor data separately for each notification
      const notificationsWithActors = await Promise.all(
        data.map(async (notification: any) => {
          if (notification.actorId) {
            const userResponse: any = await usersApi.get(notification.actorId)
            const actorData = userResponse.user
            return { ...notification, users: actorData }
          }
          return { ...notification, users: null }
        })
      )

      setNotifications(notificationsWithActors)
      setUnreadCount(notificationsWithActors.filter((n: any) => !n.read).length || 0)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationsApi.markAsRead(notificationId)

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
      await notificationsApi.markAllAsRead()

      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearAllNotifications = async () => {
    if (!user) return

    setShowClearConfirm(false)
    setLoading(true)
    try {
      await notificationsApi.deleteAll()

      setNotifications([])
      setUnreadCount(0)
      toast.success('All notifications cleared')
    } catch (error) {
      console.error('Error clearing notifications:', error)
      toast.error('Failed to clear notifications')
    } finally {
      setLoading(false)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationsApi.delete(notificationId)

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
    if (notification.link) {
      return notification.link
    }
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
        return <Heart className="w-4 h-4 text-error" />
      case 'comment':
      case 'reply':
        return <MessageCircle className="w-4 h-4 text-primary" />
      case 'artist_contest':
        return <Trophy className="w-4 h-4 text-warning" />
      case 'follow':
        return <UserPlus className="w-4 h-4 text-success" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const filteredNotifications = notifications

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
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">Notifications</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    disabled={loading}
                    className="text-sm text-primary hover:underline disabled:opacity-50"
                  >
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    disabled={loading}
                    className="text-sm text-error hover:underline disabled:opacity-50"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
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
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{notifications.length === 0 ? 'No notifications yet' : 'No notifications in this category'}</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
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
                          <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
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

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
          <div className="bg-surface rounded-xl border border-border max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-error/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-error" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Clear All Notifications?</h3>
                <p className="text-sm text-text-secondary">This cannot be undone</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 bg-background hover:bg-border rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={clearAllNotifications}
                className="flex-1 px-4 py-2 bg-error hover:bg-error/80 rounded-lg font-medium transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
