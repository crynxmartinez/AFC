import { UserPlus, Palette, Vote, Trophy } from 'lucide-react'

const steps = [
  {
    icon: UserPlus,
    title: 'Sign Up',
    description: 'Create your free account and join the artist community',
    step: '1'
  },
  {
    icon: Palette,
    title: 'Submit Artwork',
    description: 'Choose a contest and submit your artwork across 4 phases',
    step: '2'
  },
  {
    icon: Vote,
    title: 'Get Votes',
    description: 'Community members vote on your work and provide feedback',
    step: '3'
  },
  {
    icon: Trophy,
    title: 'Win Prizes',
    description: 'Top entries win prizes, XP, badges, and recognition',
    step: '4'
  }
]

export default function HowItWorksSection() {
  return (
    <div className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          Start competing in just 4 simple steps
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, index) => (
          <div key={index} className="relative">
            {/* Connector Line (hidden on mobile, shown on desktop) */}
            {index < steps.length - 1 && (
              <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary to-transparent"></div>
            )}
            
            <div className="relative bg-surface rounded-xl p-6 border border-border hover:border-primary transition-all text-center">
              {/* Step Number Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                {step.step}
              </div>
              
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 mt-2">
                <step.icon className="w-8 h-8 text-primary" />
              </div>
              
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-text-secondary text-sm">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
