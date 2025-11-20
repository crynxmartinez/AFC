import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Check if we have hash params (from email link)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const type = hashParams.get('type')

        // Also check query params
        const token = searchParams.get('token')
        const queryType = searchParams.get('type')

        // If we have access token in hash, user is already verified
        if (accessToken && type === 'signup') {
          setStatus('success')
          setMessage('Your email has been verified successfully!')
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login')
          }, 3000)
          return
        }

        // Otherwise, try to verify with token
        if (!token || queryType !== 'signup') {
          setStatus('error')
          setMessage('Invalid verification link')
          return
        }

        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'email'
        })

        if (error) {
          setStatus('error')
          setMessage(error.message || 'Verification failed. The link may have expired.')
        } else {
          setStatus('success')
          setMessage('Your email has been verified successfully!')
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login')
          }, 3000)
        }
      } catch (error) {
        console.error('Confirmation error:', error)
        setStatus('error')
        setMessage('An unexpected error occurred')
      }
    }

    confirmEmail()
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-surface rounded-lg border border-border p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
            <h1 className="text-2xl font-bold mb-2">Verifying Your Email</h1>
            <p className="text-text-secondary">Please wait while we confirm your email address...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-success" />
            <h1 className="text-2xl font-bold mb-2 text-success">Email Verified!</h1>
            <p className="text-text-secondary mb-6">{message}</p>
            <p className="text-sm text-text-secondary">Redirecting to login page...</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
            >
              Go to Login Now
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 mx-auto mb-4 text-error" />
            <h1 className="text-2xl font-bold mb-2 text-error">Verification Failed</h1>
            <p className="text-text-secondary mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/signup')}
                className="w-full px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
              >
                Sign Up Again
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full px-6 py-2 bg-surface hover:bg-background border border-border rounded-lg transition-colors"
              >
                Back to Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
