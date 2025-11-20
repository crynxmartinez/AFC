import { Outlet, Link } from 'react-router-dom'
import { Palette } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import Footer from './Footer'

export default function LandingLayout() {
  const { user, profile } = useAuthStore()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Simple Top Navbar */}
      <nav className="sticky top-0 z-50 bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Palette className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">Arena for Creatives</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/about" className="text-text-secondary hover:text-primary transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-text-secondary hover:text-primary transition-colors">
              Contact
            </Link>
            <Link to="/privacy" className="text-text-secondary hover:text-primary transition-colors">
              Privacy
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {user && profile ? (
              <>
                <Link
                  to="/feed"
                  className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to={`/users/${profile.username}`}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
