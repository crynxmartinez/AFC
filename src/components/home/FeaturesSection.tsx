import { Layers, Users, Trophy, TrendingUp, Heart, Zap } from 'lucide-react'

const features = [
  {
    icon: Layers,
    title: '4-Phase Contests',
    description: 'Submit and refine your artwork across 4 progressive phases, from sketch to final masterpiece.',
    color: 'text-primary bg-primary/10'
  },
  {
    icon: Users,
    title: 'Community Voting',
    description: 'Let the community decide! Earn votes and climb the rankings with your creative work.',
    color: 'text-purple-500 bg-purple-500/10'
  },
  {
    icon: Trophy,
    title: 'Win Prizes',
    description: 'Compete for prize money, XP, badges, and achievements. Top 3 placements get rewarded!',
    color: 'text-warning bg-warning/10'
  },
  {
    icon: TrendingUp,
    title: 'Level Up System',
    description: 'Earn XP for every submission and vote. Level up to unlock exclusive badges and titles.',
    color: 'text-success bg-success/10'
  },
  {
    icon: Heart,
    title: 'Follow Artists',
    description: 'Build your network! Follow your favorite artists and get updates on their latest work.',
    color: 'text-error bg-error/10'
  },
  {
    icon: Zap,
    title: 'Real-Time Updates',
    description: 'Get instant notifications for votes, comments, follows, and contest announcements.',
    color: 'text-info bg-info/10'
  }
]

export default function FeaturesSection() {
  return (
    <div className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Join Arena for Creatives?</h2>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          Everything you need to showcase your talent, compete with the best, and grow as an artist.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-surface rounded-xl p-6 border border-border hover:border-primary transition-all hover:scale-105"
          >
            <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
              <feature.icon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-text-secondary">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
