// @ts-nocheck - Supabase type inference issues
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { formatDate, getContestStatus, getPhaseTimeRemaining } from '@/lib/utils'
import { Clock, Users, Trophy } from 'lucide-react'

type Contest = {
  id: string
  title: string
  description: string
  thumbnail_url: string | null
  start_date: string
  end_date: string
  status: string
  entry_count?: number
}

export default function ActiveContestsPage() {
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'voting'>('all')

  useEffect(() => {
    fetchContests()
  }, [filter])

  const fetchContests = async () => {
    try {
      // Fetch all contests (status is calculated from dates)
      const { data, error } = await supabase
        .from('contests')
        .select('*, entries(count)')
        .order('start_date', { ascending: false })

      if (error) throw error

      // Calculate status for each contest and filter
      const contestsWithStatus = (data || []).map((contest: any) => {
        const calculatedStatus = getContestStatus(contest.start_date, contest.end_date)
        return {
          ...contest,
          status: calculatedStatus,
          entry_count: contest.entries?.[0]?.count || 0,
        }
      })

      // Filter based on selected tab
      let filtered = contestsWithStatus
      if (filter === 'all') {
        filtered = contestsWithStatus.filter(c => c.status === 'active' || c.status === 'voting')
      } else {
        filtered = contestsWithStatus.filter(c => c.status === filter)
      }

      setContests(filtered)
    } catch (error) {
      console.error('Error fetching contests:', error)
    } finally {
      setLoading(false)
    }
  }


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/20 text-success'
      case 'voting':
        return 'bg-secondary/20 text-secondary'
      default:
        return 'bg-text-secondary/20 text-text-secondary'
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading contests...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">🔥 Active Contests</h1>
        <p className="text-text-secondary text-lg">
          Join ongoing contests and showcase your creativity
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-6 border-b border-border">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'all'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          All Active
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'active'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Accepting Entries
        </button>
        <button
          onClick={() => setFilter('voting')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'voting'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Voting Phase
        </button>
      </div>

      {contests.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-lg border border-border">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-text-secondary" />
          <h2 className="text-2xl font-bold mb-2">No Active Contests</h2>
          <p className="text-text-secondary">
            {filter === 'all' 
              ? 'Check back soon for new contests!'
              : `No contests in ${filter} phase right now.`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contests.map((contest) => (
            <Link
              key={contest.id}
              to={`/contests/${contest.id}`}
              className="bg-surface rounded-lg overflow-hidden border border-border hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/20"
            >
              {/* Thumbnail */}
              <div className="aspect-square bg-background flex items-center justify-center overflow-hidden relative">
                {contest.thumbnail_url ? (
                  <img
                    src={contest.thumbnail_url}
                    alt={contest.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-text-secondary text-center p-8">
                    <Trophy className="w-16 h-16 mx-auto mb-2" />
                    <p>No thumbnail</p>
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(contest.status)}`}>
                    {contest.status}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-xl mb-2 line-clamp-1">{contest.title}</h3>
                <p className="text-sm text-text-secondary mb-4 line-clamp-2">
                  {contest.description}
                </p>

                {/* Stats */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <Users className="w-4 h-4" />
                    <span>{contest.entry_count || 0} entries</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-primary font-semibold">
                      {getPhaseTimeRemaining(contest.start_date, contest.end_date)}
                    </span>
                  </div>
                </div>

                {/* Dates */}
                <div className="text-xs text-text-secondary border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span>Started: {formatDate(contest.start_date)}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Ends: {formatDate(contest.end_date)}</span>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-4">
                  {contest.status === 'active' ? (
                    <div className="bg-primary/20 text-primary text-center py-2 rounded-lg font-semibold text-sm">
                      Submit Your Entry →
                    </div>
                  ) : (
                    <div className="bg-secondary/20 text-secondary text-center py-2 rounded-lg font-semibold text-sm">
                      Vote Now →
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
