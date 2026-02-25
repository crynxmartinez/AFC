import { useEffect, useState } from 'react'
import { Copy, Users, Gift, CheckCircle, Clock } from 'lucide-react'
import { useToastStore } from '@/stores/toastStore'

type ReferralStats = {
  referralCode: string
  totalReferrals: number
  completedReferrals: number
  totalBonusXp: number
  referrals: Array<{
    id: string
    status: string
    bonusXpAwarded: number
    createdAt: string
    completedAt: string | null
    referred: {
      username: string
      displayName: string | null
      avatarUrl: string | null
      createdAt: string
    }
  }>
}

export default function ReferralsPage() {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const toast = useToastStore()

  useEffect(() => {
    fetchReferralStats()
  }, [])

  const fetchReferralStats = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/referrals', {
        credentials: 'include',
      })
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching referral stats:', error)
      toast.error('Failed to load referral stats')
    } finally {
      setLoading(false)
    }
  }

  const copyReferralLink = () => {
    if (!stats) return
    const referralLink = `${window.location.origin}/signup?ref=${stats.referralCode}`
    navigator.clipboard.writeText(referralLink)
    toast.success('Referral link copied to clipboard!')
  }

  const copyReferralCode = () => {
    if (!stats) return
    navigator.clipboard.writeText(stats.referralCode)
    toast.success('Referral code copied!')
  }

  if (loading) {
    return <div className="text-center py-12">Loading referral stats...</div>
  }

  if (!stats) {
    return <div className="text-center py-12">Failed to load referral stats</div>
  }

  const referralLink = `${window.location.origin}/signup?ref=${stats.referralCode}`

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Referral Program</h1>
        <p className="text-text-secondary">
          Invite friends and earn bonus XP for each successful referral!
        </p>
      </div>

      {/* Referral Link Card */}
      <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl p-6 border border-primary/30">
        <div className="flex items-center gap-3 mb-4">
          <Gift className="w-8 h-8 text-primary" />
          <div>
            <h2 className="text-xl font-bold">Your Referral Link</h2>
            <p className="text-sm text-text-secondary">Share this link to earn 100 XP per referral</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 px-4 py-3 bg-surface border border-border rounded-lg text-sm"
            />
            <button
              onClick={copyReferralLink}
              className="px-6 py-3 bg-primary hover:bg-primary-hover rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Link
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={stats.referralCode}
              readOnly
              className="flex-1 px-4 py-3 bg-surface border border-border rounded-lg text-sm font-mono"
            />
            <button
              onClick={copyReferralCode}
              className="px-6 py-3 bg-secondary hover:bg-secondary/80 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Code
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-primary" />
            <div className="text-3xl font-bold">{stats.totalReferrals}</div>
          </div>
          <div className="text-sm text-text-secondary">Total Referrals</div>
        </div>

        <div className="bg-surface rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-success" />
            <div className="text-3xl font-bold">{stats.completedReferrals}</div>
          </div>
          <div className="text-sm text-text-secondary">Completed Referrals</div>
        </div>

        <div className="bg-surface rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <Gift className="w-8 h-8 text-secondary" />
            <div className="text-3xl font-bold">{stats.totalBonusXp}</div>
          </div>
          <div className="text-sm text-text-secondary">Total Bonus XP</div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-surface rounded-lg p-6 border border-border">
        <h2 className="text-xl font-bold mb-4">How It Works</h2>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary flex-shrink-0">
              1
            </div>
            <div>
              <div className="font-semibold">Share Your Link</div>
              <div className="text-sm text-text-secondary">
                Send your unique referral link to friends
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary flex-shrink-0">
              2
            </div>
            <div>
              <div className="font-semibold">They Sign Up</div>
              <div className="text-sm text-text-secondary">
                Your friend creates an account using your referral code
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary flex-shrink-0">
              3
            </div>
            <div>
              <div className="font-semibold">Earn Bonus XP</div>
              <div className="text-sm text-text-secondary">
                Get 100 XP when they complete their first contest entry
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Referral History */}
      <div className="bg-surface rounded-lg p-6 border border-border">
        <h2 className="text-xl font-bold mb-4">Referral History</h2>
        {stats.referrals.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No referrals yet. Start sharing your link!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.referrals.map((referral) => (
              <div
                key={referral.id}
                className="flex items-center gap-4 p-4 bg-background rounded-lg"
              >
                {referral.referred.avatarUrl ? (
                  <img
                    src={referral.referred.avatarUrl}
                    alt={referral.referred.username}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                    {referral.referred.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-semibold">
                    {referral.referred.displayName || referral.referred.username}
                  </div>
                  <div className="text-sm text-text-secondary">
                    @{referral.referred.username}
                  </div>
                </div>
                <div className="text-right">
                  {referral.status === 'completed' ? (
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">+{referral.bonusXpAwarded} XP</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-warning">
                      <Clock className="w-5 h-5" />
                      <span className="text-sm">Pending</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
