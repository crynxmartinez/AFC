import { Trophy, Heart, Image, Award, TrendingUp, Users } from 'lucide-react'

type ProfileStatsProps = {
  stats: {
    totalEntries: number
    totalWins: number
    totalVotes: number
    winRate: number
    followers: number
    following: number
    avgVotes: number
    bestRank?: number
  }
}

export default function ProfileStats({ stats }: ProfileStatsProps) {
  const statCards = [
    {
      icon: Image,
      label: 'Entries',
      value: stats.totalEntries,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      icon: Trophy,
      label: 'Wins',
      value: stats.totalWins,
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      icon: Heart,
      label: 'Total Votes',
      value: stats.totalVotes,
      color: 'text-error',
      bgColor: 'bg-error/10'
    },
    {
      icon: Award,
      label: 'Win Rate',
      value: `${stats.winRate.toFixed(1)}%`,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      icon: TrendingUp,
      label: 'Avg Votes',
      value: Math.round(stats.avgVotes),
      color: 'text-info',
      bgColor: 'bg-info/10'
    },
    {
      icon: Users,
      label: 'Followers',
      value: stats.followers,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="bg-surface rounded-lg p-4 border border-border hover:border-primary transition-colors"
        >
          <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center mb-3`}>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <div className="text-2xl font-bold mb-1">{stat.value}</div>
          <div className="text-sm text-text-secondary">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}
