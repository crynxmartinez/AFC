import { Link } from 'react-router-dom'
import { Sparkles, Trophy, Palette } from 'lucide-react'

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-secondary/20 rounded-2xl p-8 md:p-12 mb-12">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-primary rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-secondary rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full mb-6">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-primary">Compete. Create. Conquer.</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Where Artists
          <span className="text-primary"> Battle </span>
          for Glory
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
          Join the ultimate art competition platform. Submit your artwork across 4 phases, 
          compete with talented artists, and win amazing prizes.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/signup"
            className="px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold text-lg transition-colors flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <Trophy className="w-5 h-5" />
            Start Competing
          </Link>
          <Link
            to="/contests"
            className="px-8 py-4 bg-surface hover:bg-border border border-border rounded-lg font-semibold text-lg transition-colors flex items-center gap-2"
          >
            <Palette className="w-5 h-5" />
            Browse Contests
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-border/50">
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary mb-1">4</div>
            <div className="text-sm text-text-secondary">Phases per Contest</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary mb-1">∞</div>
            <div className="text-sm text-text-secondary">Creative Freedom</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary mb-1">100%</div>
            <div className="text-sm text-text-secondary">Community Driven</div>
          </div>
        </div>
      </div>
    </div>
  )
}
