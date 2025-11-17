import { Link, useLocation } from 'react-router-dom'
import { Home, Flame, PlusCircle, Trophy, User } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { cn } from '../../lib/utils'

export default function MobileNav() {
  const location = useLocation()
  const { profile } = useAuthStore()

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Flame, label: 'Active', path: '/contests/active' },
    { icon: PlusCircle, label: 'Submit', path: '/submit' },
    { icon: Trophy, label: 'Winners', path: '/winners' },
    { icon: User, label: 'Profile', path: profile ? `/profile/${profile.username}` : '/login' },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-border z-50">
      <div className="h-full flex items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors',
                isActive ? 'text-primary' : 'text-text-secondary'
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
