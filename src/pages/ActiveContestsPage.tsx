import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDate, getContestStatus, getPhaseTimeRemaining } from '@/lib/utils'
import { contestsApi } from '@/lib/api'
import { Clock, Users, Trophy } from 'lucide-react'
import type { ContestCategory } from '@/types/contest'
import CategoryBadge from '@/components/contests/CategoryBadge'

type Contest = {
  id: string
  title: string
  description: string
  category: ContestCategory
  thumbnailUrl: string | null
  startDate: string
  endDate: string
  status: string
  entryCount?: number
  hasSponsor: boolean
  sponsorName: string | null
  sponsorLogoUrl: string | null
  sponsorPrizeAmount: number | null
}

export default function ActiveContestsPage() {
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContests()
  }, [])

  const fetchContests = async () => {
    try {
      const response: any = await contestsApi.list('active')
      const data = response.contests || []

      // Get entry counts and calculate status for each contest
      const contestsWithCounts = await Promise.all(
        data.map(async (contest: any) => {
          const entriesResponse: any = await contestsApi.getEntries(contest.id)
          const entries = entriesResponse.entries || []

          const calculatedStatus = getContestStatus(contest.startDate, contest.endDate)
          return {
            ...contest,
            status: calculatedStatus,
            entry_count: entries.length,
          }
        })
      )

      // Filter to only active contests
      const activeContests = contestsWithCounts.filter(c => c.status === 'active')

      setContests(activeContests)
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

      {contests.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-lg border border-border">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-text-secondary" />
          <h2 className="text-2xl font-bold mb-2">No Active Contests</h2>
          <p className="text-text-secondary">
            Check back soon for new contests!
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
                {contest.thumbnailUrl ? (
                  <img
                    src={contest.thumbnailUrl}
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
                
                {/* Category Badge */}
                <div className="mb-3">
                  <CategoryBadge category={contest.category || 'art'} size="sm" />
                </div>
                
                {/* Sponsor Badge */}
                {contest.hasSponsor && contest.sponsorName && (
                  <div className="flex items-center gap-2 mb-2 p-2 bg-primary/10 rounded border border-primary/30">
                    {contest.sponsorLogoUrl && (
                      <img 
                        src={contest.sponsorLogoUrl} 
                        alt={contest.sponsorName}
                        className="h-6 w-auto object-contain"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-secondary">Sponsored by</p>
                      <p className="text-sm font-semibold text-primary truncate">{contest.sponsorName}</p>
                    </div>
                    {contest.sponsorPrizeAmount && contest.sponsorPrizeAmount > 0 && (
                      <div className="text-right">
                        <p className="text-xs font-bold text-success">
                          +₱{contest.sponsorPrizeAmount.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                <p className="text-sm text-text-secondary mb-4 line-clamp-2">
                  {contest.description}
                </p>

                {/* Stats */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <Users className="w-4 h-4" />
                    <span>{contest.entryCount || 0} entries</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-primary font-semibold">
                      {getPhaseTimeRemaining(contest.startDate, contest.endDate)}
                    </span>
                  </div>
                </div>

                {/* Dates */}
                <div className="text-xs text-text-secondary border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span>Started: {formatDate(contest.startDate)}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Ends: {formatDate(contest.endDate)}</span>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-4">
                  <div className="bg-primary/20 text-primary text-center py-2 rounded-lg font-semibold text-sm">
                    Submit & Vote →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
