import { Link } from 'react-router-dom'
import { Search, Bell, User } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

export default function Navbar() {
  const { user, profile } = useAuthStore()

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-surface border-b border-border z-50">
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-primary">
          AFC
        </Link>

        {/* Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              placeholder="Search contests, artists..."
              className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* Points Balance */}
              <Link
                to="/points"
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover rounded-lg transition-colors"
              >
                <span className="font-semibold">{profile?.points_balance || 0}</span>
                <span className="text-sm">pts</span>
              </Link>

              {/* Notifications */}
              <Link
                to="/notifications"
                className="p-2 hover:bg-background rounded-lg transition-colors relative"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
              </Link>

              {/* Profile */}
              <Link
                to={`/profile/${profile?.username}`}
                className="flex items-center gap-2 hover:bg-background rounded-lg p-2 transition-colors"
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                )}
                <span className="hidden md:block font-medium">{profile?.username}</span>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-sm font-medium bg-primary hover:bg-primary-hover rounded-lg transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
