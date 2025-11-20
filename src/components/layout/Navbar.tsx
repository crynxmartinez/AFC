import { Link, useNavigate } from 'react-router-dom'
import { Search, User, LogOut, Settings } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useState } from 'react'
import NotificationBell from '../notifications/NotificationBell'

export default function Navbar() {
  const { user, profile, signOut } = useAuthStore()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-surface border-b border-border z-50">
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-primary">
          AFC
        </Link>

        {/* Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <button
            onClick={() => navigate('/search')}
            className="relative w-full text-left"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <div className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-text-secondary hover:border-primary transition-colors">
              Search contests, artists...
            </div>
          </button>
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
              <NotificationBell />

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
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
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-lg shadow-lg py-2 z-20">
                      <Link
                        to={`/users/${profile?.username}`}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-background transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        <User className="w-5 h-5" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-2 hover:bg-background transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        <Settings className="w-5 h-5" />
                        <span>Settings</span>
                      </Link>
                      {profile?.role === 'admin' && (
                        <Link
                          to="/admin/contests"
                          className="flex items-center gap-3 px-4 py-2 hover:bg-background transition-colors border-t border-border"
                          onClick={() => setShowDropdown(false)}
                        >
                          <span className="text-primary font-semibold">Admin Panel</span>
                        </Link>
                      )}
                      <hr className="my-2 border-border" />
                      <button
                        onClick={async () => {
                          try {
                            setShowDropdown(false)
                            await signOut()
                            // Force navigation and reload
                            window.location.href = '/'
                          } catch (error) {
                            console.error('Logout error:', error)
                            // Even if there's an error, try to redirect
                            window.location.href = '/'
                          }
                        }}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-background transition-colors w-full text-left text-error"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
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
