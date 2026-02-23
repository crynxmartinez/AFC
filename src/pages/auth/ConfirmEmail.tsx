import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'

export default function ConfirmEmail() {
  const navigate = useNavigate()

  useEffect(() => {
    // No email verification - redirect to login
    setTimeout(() => navigate('/login'), 2000)
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="bg-surface rounded-lg p-8 shadow-lg text-center max-w-md">
        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold mb-4">Account Created!</h2>
        <p className="text-text-secondary mb-6">
          Your account has been created successfully. Redirecting to login...
        </p>
      </div>
    </div>
  )
}
