import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Trophy, DollarSign, AlertCircle, TrendingUp } from 'lucide-react'

type Contest = {
  id: string
  title: string
  status: string
  entry_count: number
  end_date: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeContests: 0,
    totalRevenue: 0,
    pendingReviews: 0
  })
  const [recentContests, setRecentContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch total users
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      // Fetch active contests
      const { count: contestsCount } = await supabase
        .from('contests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      // Fetch recent contests (without entry_count if it doesn't exist)
      const { data: contests } = await supabase
        .from('contests')
        .select('id, title, status, end_date, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      // Count entries for each contest manually
      const contestsWithCounts = await Promise.all(
        (contests || []).map(async (contest: any) => {
          const { count } = await supabase
            .from('entries')
            .select('*', { count: 'exact', head: true })
            .eq('contest_id', contest.id)
          
          return {
            ...contest,
            entry_count: count || 0
          }
        })
      )

      setStats({
        totalUsers: usersCount || 0,
        activeContests: contestsCount || 0,
        totalRevenue: 0, // No point_transactions table yet
        pendingReviews: 0 // No contest_entries table yet
      })

      setRecentContests(contestsWithCounts)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="text-text-secondary text-sm">Total Users</div>
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</div>
          <div className="text-success text-sm mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Platform growing
          </div>
        </div>

        <div className="bg-surface rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="text-text-secondary text-sm">Active Contests</div>
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl font-bold">{stats.activeContests}</div>
          <div className="text-text-secondary text-sm mt-2">
            {recentContests.filter(c => new Date(c.end_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length} ending soon
          </div>
        </div>

        <div className="bg-surface rounded-lg p-6 border border-border opacity-50">
          <div className="flex items-center justify-between mb-2">
            <div className="text-text-secondary text-sm">Total Revenue</div>
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl font-bold">₱0</div>
          <div className="text-text-secondary text-sm mt-2">
            Coming soon
          </div>
        </div>

        <div className="bg-surface rounded-lg p-6 border border-border opacity-50">
          <div className="flex items-center justify-between mb-2">
            <div className="text-text-secondary text-sm">Pending Reviews</div>
            <AlertCircle className="w-5 h-5 text-warning" />
          </div>
          <div className="text-3xl font-bold">0</div>
          <div className="text-text-secondary text-sm mt-2">
            Coming soon
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Contests */}
        <div className="bg-surface rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Contests</h2>
            <Link to="/admin/contests" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentContests.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                No contests yet
              </div>
            ) : (
              recentContests.map((contest) => (
                <Link
                  key={contest.id}
                  to={`/contests/${contest.id}`}
                  className="flex items-center justify-between p-3 bg-background rounded-lg hover:border-primary border border-transparent transition-colors"
                >
                  <div>
                    <div className="font-semibold">{contest.title}</div>
                    <div className="text-sm text-text-secondary">
                      {contest.entry_count || 0} entries
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${
                    contest.status === 'active' ? 'text-success' : 
                    contest.status === 'completed' ? 'text-text-secondary' : 
                    'text-warning'
                  }`}>
                    {contest.status.charAt(0).toUpperCase() + contest.status.slice(1)}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-surface rounded-lg p-6 border border-border opacity-50">
          <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
          <div className="space-y-3">
            <div className="text-center py-8 text-text-secondary">
              <p className="mb-2">Point transactions coming soon</p>
              <p className="text-sm">This feature requires the point_transactions table</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
