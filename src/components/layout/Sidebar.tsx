import { Link, useLocation } from 'react-router-dom'
import { Home, Flame, Trophy, Users, PlusCircle, LayoutDashboard, FileText, UserCog, Award, TrendingUp, Rss, MessageSquare } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { cn } from '../../lib/utils'
import XPProgressBar from '../xp/XPProgressBar'
import { usePendingReviews } from '../../hooks/usePendingReviews'
import { useContactMessages } from '../../hooks/useContactMessages'

export default function Sidebar() {
  const location = useLocation()
  const { profile } = useAuthStore()
  const isAdmin = profile?.role === 'admin'
  const { pendingCount } = usePendingReviews()
  const { unreadCount } = useContactMessages()

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Rss, label: 'My Feed', path: '/feed' },
    { icon: Flame, label: 'Active Contests', path: '/contests/active' },
    { icon: Trophy, label: 'Winners', path: '/winners' },
    { icon: TrendingUp, label: 'Leaderboard', path: '/leaderboard' },
    { icon: Users, label: 'Artists', path: '/artists' },
    { icon: PlusCircle, label: 'Submit Entry', path: '/contests/active' },
  ]

  const adminItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: FileText, label: 'Contests', path: '/admin/contests' },
    { icon: FileText, label: 'Reviews', path: '/admin/reviews' },
    { icon: MessageSquare, label: 'Messages', path: '/admin/messages' },
    { icon: UserCog, label: 'Users', path: '/admin/users' },
    { icon: Award, label: 'XP System', path: '/admin/xp-system' },
  ]

  return (
    <aside className="hidden md:block fixed left-0 top-16 bottom-0 w-64 bg-surface border-r border-border flex flex-col">
      {/* Scrollable Navigation */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-6">
        {/* Main Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary text-white'
                    : 'hover:bg-background text-text-secondary hover:text-text-primary'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Admin Section */}
        {isAdmin && (
          <div>
            <div className="px-4 py-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Admin
            </div>
            <nav className="space-y-1">
              {adminItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                const showReviewBadge = item.path === '/admin/reviews' && pendingCount > 0
                const showMessageBadge = item.path === '/admin/messages' && unreadCount > 0
                const badgeCount = showReviewBadge ? pendingCount : showMessageBadge ? unreadCount : 0
                const showBadge = showReviewBadge || showMessageBadge
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative',
                      isActive
                        ? 'bg-primary text-white'
                        : 'hover:bg-background text-text-secondary hover:text-text-primary'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {showBadge && (
                      <span className="ml-auto bg-error text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {badgeCount}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </div>

      {/* XP Progress - Fixed at bottom */}
      {profile && (
        <div className="flex-shrink-0 p-4 border-t border-border bg-surface">
          <XPProgressBar />
        </div>
      )}
    </aside>
  )
}
