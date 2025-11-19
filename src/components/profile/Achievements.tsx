import { Award, Trophy, Zap, Target, Star, Crown } from 'lucide-react'

type Achievement = {
  id: string
  achievement_type: string
  achievement_name: string
  achievement_description: string
  earned_at: string
}

type AchievementsProps = {
  achievements: Achievement[]
}

const achievementIcons: Record<string, any> = {
  first_entry: Award,
  first_win: Trophy,
  streak_7: Zap,
  top_10: Target,
  top_3: Star,
  champion: Crown
}

const achievementColors: Record<string, string> = {
  first_entry: 'text-primary bg-primary/10',
  first_win: 'text-warning bg-warning/10',
  streak_7: 'text-purple-500 bg-purple-500/10',
  top_10: 'text-success bg-success/10',
  top_3: 'text-error bg-error/10',
  champion: 'text-yellow-500 bg-yellow-500/10'
}

export default function Achievements({ achievements }: AchievementsProps) {
  if (achievements.length === 0) {
    return (
      <div className="bg-surface rounded-lg p-8 text-center border border-border">
        <Award className="w-12 h-12 mx-auto mb-3 text-text-secondary" />
        <p className="text-text-secondary">No achievements yet. Keep participating to earn badges!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {achievements.map((achievement) => {
        const Icon = achievementIcons[achievement.achievement_type] || Award
        const colorClass = achievementColors[achievement.achievement_type] || 'text-primary bg-primary/10'

        return (
          <div
            key={achievement.id}
            className="bg-surface rounded-lg p-4 border border-border hover:border-primary transition-all hover:scale-105"
          >
            <div className={`w-16 h-16 rounded-full ${colorClass} flex items-center justify-center mx-auto mb-3`}>
              <Icon className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-center mb-1">{achievement.achievement_name}</h3>
            <p className="text-xs text-text-secondary text-center">{achievement.achievement_description}</p>
          </div>
        )
      })}
    </div>
  )
}
