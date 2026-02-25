import { useEffect, useState } from 'react'
import { DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'

type Withdrawal = {
  id: string
  amount: number
  pointsDeducted: number
  paymentMethod: string
  paymentDetails: string
  status: string
  requestedAt: string
  processedAt: string | null
  adminNotes: string | null
  transactionId: string | null
}

export default function WithdrawalsPage() {
  const { profile } = useAuthStore()
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'gcash'>('paypal')
  const [paymentDetails, setPaymentDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const toast = useToastStore()

  useEffect(() => {
    fetchWithdrawals()
  }, [])

  const fetchWithdrawals = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/withdrawals', {
        credentials: 'include',
      })
      const data = await response.json()
      setWithdrawals(data.withdrawals || [])
    } catch (error) {
      console.error('Error fetching withdrawals:', error)
      toast.error('Failed to load withdrawals')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const amountNum = parseInt(amount)
    if (isNaN(amountNum) || amountNum < 500) {
      toast.error('Minimum withdrawal amount is 500 points')
      return
    }

    if (!profile || profile.pointsBalance < amountNum) {
      toast.error('Insufficient points balance')
      return
    }

    if (!paymentDetails.trim()) {
      toast.error('Please enter your payment details')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount: amountNum,
          paymentMethod,
          paymentDetails: paymentDetails.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit withdrawal request')
      }

      toast.success('Withdrawal request submitted successfully!')
      setShowRequestModal(false)
      setAmount('')
      setPaymentDetails('')
      fetchWithdrawals()
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit withdrawal request')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-success" />
      case 'pending':
        return <Clock className="w-5 h-5 text-warning" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-error" />
      default:
        return <AlertCircle className="w-5 h-5 text-text-secondary" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-success'
      case 'pending':
        return 'text-warning'
      case 'rejected':
        return 'text-error'
      default:
        return 'text-text-secondary'
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading withdrawals...</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Withdrawals</h1>
          <p className="text-text-secondary">
            Request to withdraw your points balance
          </p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="px-6 py-3 bg-primary hover:bg-primary-hover rounded-lg font-semibold transition-colors"
        >
          Request Withdrawal
        </button>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl p-6 border border-primary/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-text-secondary mb-1">Available Balance</div>
            <div className="text-4xl font-bold">{profile?.pointsBalance || 0} pts</div>
            <div className="text-sm text-text-secondary mt-2">
              Minimum withdrawal: 500 points
            </div>
          </div>
          <DollarSign className="w-16 h-16 text-primary opacity-50" />
        </div>
      </div>

      {/* Withdrawal History */}
      <div className="bg-surface rounded-lg p-6 border border-border">
        <h2 className="text-xl font-bold mb-4">Withdrawal History</h2>
        {withdrawals.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No withdrawal requests yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {withdrawals.map((withdrawal) => (
              <div
                key={withdrawal.id}
                className="flex items-center gap-4 p-4 bg-background rounded-lg"
              >
                <div className="flex-shrink-0">
                  {getStatusIcon(withdrawal.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-semibold">{withdrawal.amount} points</div>
                    <div className={`text-sm font-semibold capitalize ${getStatusColor(withdrawal.status)}`}>
                      {withdrawal.status}
                    </div>
                  </div>
                  <div className="text-sm text-text-secondary">
                    {withdrawal.paymentMethod.toUpperCase()}: {withdrawal.paymentDetails}
                  </div>
                  <div className="text-xs text-text-secondary mt-1">
                    Requested: {new Date(withdrawal.requestedAt).toLocaleDateString()}
                  </div>
                  {withdrawal.adminNotes && (
                    <div className="text-xs text-warning mt-1">
                      Note: {withdrawal.adminNotes}
                    </div>
                  )}
                  {withdrawal.transactionId && (
                    <div className="text-xs text-success mt-1">
                      Transaction ID: {withdrawal.transactionId}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl border border-border max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Request Withdrawal</h2>
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Amount (points)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="500"
                  max={profile?.pointsBalance || 0}
                  placeholder="Minimum 500 points"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
                  required
                />
                <div className="text-xs text-text-secondary mt-1">
                  Available: {profile?.pointsBalance || 0} points
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`px-4 py-3 rounded-lg border-2 font-medium transition-colors ${
                      paymentMethod === 'paypal'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    PayPal
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('gcash')}
                    className={`px-4 py-3 rounded-lg border-2 font-medium transition-colors ${
                      paymentMethod === 'gcash'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    GCash
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {paymentMethod === 'paypal' ? 'PayPal Email' : 'GCash Number'}
                </label>
                <input
                  type="text"
                  value={paymentDetails}
                  onChange={(e) => setPaymentDetails(e.target.value)}
                  placeholder={
                    paymentMethod === 'paypal'
                      ? 'your.email@example.com'
                      : '09XXXXXXXXX'
                  }
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-text-secondary">
                    Withdrawal requests are processed within 3-5 business days. Points will be deducted immediately upon submission.
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-4 py-2 bg-background hover:bg-border rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary-hover rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
