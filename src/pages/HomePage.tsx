import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import HeroSection from '@/components/home/HeroSection'
import FeaturesSection from '@/components/home/FeaturesSection'
import StatsSection from '@/components/home/StatsSection'
import HowItWorksSection from '@/components/home/HowItWorksSection'
import FAQAccordion from '@/components/home/FAQAccordion'
import { ArrowRight } from 'lucide-react'

type Contest = {
  id: string
  title: string
  description: string
  thumbnail_url: string | null
  start_date: string
  end_date: string
  status: string
  entry_count?: number
  has_sponsor: boolean
  sponsor_name: string | null
  sponsor_logo_url: string | null
  sponsor_prize_amount: number | null
}

export default function HomePage() {
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContests()
  }, [])

  const fetchContests = async () => {
    try {
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .in('status', ['active', 'voting'])
        .order('start_date', { ascending: false })

      if (error) throw error

      // Get entry counts separately
      const contestsWithCounts = await Promise.all(
        (data || []).map(async (contest: any) => {
          const { count } = await supabase
            .from('entries')
            .select('*', { count: 'exact', head: true })
            .eq('contest_id', contest.id)

          return {
            ...contest,
            entry_count: count || 0,
          }
        })
      )

      setContests(contestsWithCounts)
    } catch (error) {
      console.error('Error fetching contests:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTimeRemaining = (endDate: string) => {
    const now = new Date()
    const end = new Date(endDate)
    const diff = end.getTime() - now.getTime()
    
    if (diff < 0) return 'Ended'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`
    return 'Ending soon'
  }

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Stats Section */}
      <StatsSection />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Active Contests Section */}
      <div className="py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Active Contests</h2>
            <p className="text-text-secondary text-lg">
              Jump into the action and start competing today
            </p>
          </div>
          <Link
            to="/contests"
            className="hidden md:flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : contests.length === 0 ? (
          <div className="text-center py-12 bg-surface rounded-lg border border-border">
            <h3 className="text-2xl font-bold mb-2">No Active Contests</h3>
            <p className="text-text-secondary">Check back soon for new contests!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contests.slice(0, 6).map((contest) => (
            <Link
              key={contest.id}
              to={`/contests/${contest.id}`}
              className="bg-surface rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
            >
              <div className="aspect-square bg-background flex items-center justify-center overflow-hidden">
                {contest.thumbnail_url ? (
                  <img
                    src={contest.thumbnail_url}
                    alt={contest.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <p className="text-text-secondary">No thumbnail</p>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold flex-1 line-clamp-1">{contest.title}</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      contest.status === 'active'
                        ? 'bg-success/20 text-success'
                        : 'bg-secondary/20 text-secondary'
                    }`}
                  >
                    {contest.status.toUpperCase()}
                  </span>
                </div>
                
                {/* Sponsor Badge */}
                {contest.has_sponsor && contest.sponsor_name && (
                  <div className="flex items-center gap-2 mb-2 p-2 bg-primary/10 rounded border border-primary/30">
                    {contest.sponsor_logo_url && (
                      <img 
                        src={contest.sponsor_logo_url} 
                        alt={contest.sponsor_name}
                        className="h-5 w-auto object-contain"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-secondary">Sponsored by</p>
                      <p className="text-sm font-semibold text-primary truncate">{contest.sponsor_name}</p>
                    </div>
                    {contest.sponsor_prize_amount && contest.sponsor_prize_amount > 0 && (
                      <div className="text-right">
                        <p className="text-xs font-bold text-success">
                          +₱{contest.sponsor_prize_amount.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                  {contest.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">{contest.entry_count || 0} entries</span>
                  <span className="text-primary font-semibold">{getTimeRemaining(contest.end_date)}</span>
                </div>
                <p className="text-xs text-text-secondary mt-2">
                  Ends: {formatDate(contest.end_date)}
                </p>
              </div>
            </Link>
          ))}
            </div>
            
            {/* View All Button for Mobile */}
            <div className="mt-8 text-center md:hidden">
              <Link
                to="/contests"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors"
              >
                View All Contests
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </div>

      {/* FAQ Section */}
      <div id="faq" className="py-8">
        <FAQAccordion />
      </div>
    </div>
  )
}
