import { Target, Heart, Users, Zap, Trophy, Palette } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-16">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">About Arena for Creatives</h1>
        <p className="text-xl text-text-secondary">
          Empowering artists through competitive creativity
        </p>
      </div>

      {/* Mission Statement */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 md:p-12">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-10 h-10 text-primary" />
          <h2 className="text-3xl font-bold">Our Mission</h2>
        </div>
        <p className="text-lg text-text-secondary leading-relaxed">
          Arena for Creatives is dedicated to creating a vibrant, competitive platform where artists 
          can showcase their talents, push their creative boundaries, and earn recognition for their work. 
          We believe that healthy competition drives growth, and our multi-phase contest system allows 
          artists to progressively refine their skills while engaging with a supportive community.
        </p>
      </div>

      {/* What Makes Us Unique */}
      <div>
        <h2 className="text-3xl font-bold mb-8 text-center">What Makes Us Unique</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface rounded-xl p-6 border border-border">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Palette className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">4-Phase System</h3>
            <p className="text-text-secondary">
              Our unique 4-phase contest structure allows artists to develop their work progressively, 
              from initial concept to polished masterpiece, receiving feedback at every stage.
            </p>
          </div>

          <div className="bg-surface rounded-xl p-6 border border-border">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Community-Driven</h3>
            <p className="text-text-secondary">
              Every vote counts. Our democratic voting system ensures that the community decides 
              the winners, creating a fair and transparent competition environment.
            </p>
          </div>

          <div className="bg-surface rounded-xl p-6 border border-border">
            <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 text-warning" />
            </div>
            <h3 className="text-xl font-bold mb-2">Real Rewards</h3>
            <p className="text-text-secondary">
              Win prize money, earn XP, unlock badges, and build your reputation. We reward 
              talent and dedication with tangible recognition and opportunities.
            </p>
          </div>

          <div className="bg-surface rounded-xl p-6 border border-border">
            <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-success" />
            </div>
            <h3 className="text-xl font-bold mb-2">Growth-Focused</h3>
            <p className="text-text-secondary">
              Level up your skills with our XP system, track your progress, and see your 
              improvement over time. Every submission makes you a better artist.
            </p>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="bg-surface rounded-2xl p-8 md:p-12 border border-border">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-10 h-10 text-error" />
          <h2 className="text-3xl font-bold">Our Values</h2>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-2 text-primary">Fair Competition</h3>
            <p className="text-text-secondary">
              We maintain a level playing field where talent and creativity are the only factors 
              that matter. Every artist gets an equal opportunity to shine.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2 text-primary">Artist Support</h3>
            <p className="text-text-secondary">
              We're committed to supporting artists at every stage of their journey, providing 
              tools, feedback, and opportunities for growth and recognition.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2 text-primary">Creative Freedom</h3>
            <p className="text-text-secondary">
              While contests have themes, we encourage unique interpretations and diverse styles. 
              Your creativity is what makes you stand out.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2 text-primary">Community First</h3>
            <p className="text-text-secondary">
              Our platform is built by artists, for artists. Community feedback drives our 
              development, and every feature is designed with your needs in mind.
            </p>
          </div>
        </div>
      </div>

      {/* Our Story */}
      <div>
        <h2 className="text-3xl font-bold mb-6">Our Story</h2>
        <div className="prose prose-lg max-w-none text-text-secondary space-y-4">
          <p>
            Arena for Creatives was born from a simple idea: what if artists could compete in a way 
            that actually helps them grow? Traditional art competitions often feel like one-shot 
            deals, but we wanted to create something different.
          </p>
          <p>
            Our 4-phase system was designed to mirror the real creative process. Artists don't 
            create masterpieces in a single sitting—they sketch, refine, detail, and polish. 
            By breaking contests into phases, we give artists the time and structure to develop 
            their best work while learning from community feedback.
          </p>
          <p>
            Today, Arena for Creatives is more than just a competition platform. It's a community 
            where artists support each other, share techniques, and celebrate creativity together. 
            Every contest, every vote, and every comment contributes to a vibrant ecosystem where 
            talent is recognized and rewarded.
          </p>
        </div>
      </div>

      {/* Join Us CTA */}
      <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-8 md:p-12 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
        <p className="text-lg mb-8 opacity-90">
          Be part of a growing community of talented artists. Start your journey today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/signup"
            className="px-8 py-4 bg-white text-primary hover:bg-gray-100 rounded-lg font-semibold text-lg transition-colors"
          >
            Create Account
          </a>
          <a
            href="/contests"
            className="px-8 py-4 bg-white/10 hover:bg-white/20 border-2 border-white rounded-lg font-semibold text-lg transition-colors"
          >
            View Contests
          </a>
        </div>
      </div>
    </div>
  )
}
