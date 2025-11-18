import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuthStore()
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let loginEmail = emailOrUsername

      // Check if input is username (no @ symbol)
      if (!emailOrUsername.includes('@')) {
        // Look up email by username
        const { data: userData, error: lookupError } = await supabase
          .from('users')
          .select('email')
          .eq('username', emailOrUsername)
          .single()

        if (lookupError || !userData) {
          throw new Error('Username not found')
        }

        loginEmail = (userData as { email: string }).email
      }

      await signIn(loginEmail, password)
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface rounded-lg p-8 shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Log In</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-error/10 border border-error rounded-lg text-error text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="emailOrUsername" className="block text-sm font-medium mb-2">
            Email or Username
          </label>
          <input
            id="emailOrUsername"
            type="text"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            required
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
            placeholder="your@email.com or username"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary hover:bg-primary-hover rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in...' : 'Log In'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Don't have an account?{' '}
        <Link to="/signup" className="text-primary hover:underline font-medium">
          Sign up
        </Link>
      </p>
    </div>
  )
}
