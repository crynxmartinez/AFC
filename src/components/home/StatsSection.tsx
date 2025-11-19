import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, Trophy, Image, DollarSign } from 'lucide-react'

type Stats = {
  totalArtists: number
  activeContests: number
  totalEntries: number
  prizeMoney: number
}

export default function StatsSection() {
  const [stats, setStats] = useState<Stats>({
    totalArtists: 0,
    activeContests: 0,
    totalEntries: 0,
    prizeMoney: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Get total artists
      const { count: artistCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      // Get active contests
      const { count: contestCount } = await supabase
        .from('contests')
        .select('*', { count: 'exact', head: true })
        .in('status', ['active', 'voting'])

      // Get total entries
      const { count: entryCount } = await supabase
        .from('entries')
        .select('*', { count: 'exact', head: true })

      // Get total prize money awarded
      const { data: winnersData } = await supabase
        .from('contest_winners')
        .select('prize_amount')

      const totalPrize = winnersData?.reduce((sum, w: any) => sum + (w.prize_amount || 0), 0) || 0

      setStats({
        totalArtists: artistCount || 0,
        activeContests: contestCount || 0,
        totalEntries: entryCount || 0,
        prizeMoney: totalPrize
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      icon: Users,
      label: 'Active Artists',
      value: stats.totalArtists.toLocaleString(),
      color: 'text-primary bg-primary/10'
    },
    {
      icon: Trophy,
      label: 'Active Contests',
      value: stats.activeContests.toLocaleString(),
      color: 'text-warning bg-warning/10'
    },
    {
      icon: Image,
      label: 'Artworks Submitted',
      value: stats.totalEntries.toLocaleString(),
      color: 'text-purple-500 bg-purple-500/10'
    },
    {
      icon: DollarSign,
      label: 'Prize Money Awarded',
      value: `${stats.prizeMoney.toLocaleString()} pts`,
      color: 'text-success bg-success/10'
    }
  ]

  if (loading) {
    return (
      <div className="py-16 bg-surface rounded-2xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Platform at a Glance</h2>
        <p className="text-text-secondary text-lg">
          Join a thriving community of talented artists
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-surface rounded-xl p-6 border border-border text-center hover:border-primary transition-all hover:scale-105"
          >
            <div className={`w-16 h-16 rounded-full ${stat.color} flex items-center justify-center mx-auto mb-4`}>
              <stat.icon className="w-8 h-8" />
            </div>
            <div className="text-3xl font-bold mb-2">{stat.value}</div>
            <div className="text-sm text-text-secondary">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
