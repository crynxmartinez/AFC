import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { formatDate, formatNumber } from '@/lib/utils'
import { contestsApi, entriesApi, usersApi, reactionsApi } from '@/lib/api'
import CountdownTimer from '@/components/ui/CountdownTimer'
import { Heart } from 'lucide-react'

type Contest = {
  id: string
  title: string
  description: string
  status: string
  startDate: string
  endDate: string
  thumbnailUrl: string | null
  hasSponsor: boolean
  sponsorName: string | null
  sponsorLogoUrl: string | null
  sponsorPrizeAmount: number | null
  prizePool: number
  prizePoolDistributed: boolean
  winner1stId: string | null
  winner2ndId: string | null
  winner3rdId: string | null
}

type Winner = {
  id: string
  entryId: string
  userId: string
  placement: number
  votesReceived: number
  prizeAmount: number
  users: {
    username: string
    avatarUrl: string | null
  }
  entries: {
    phase4Url: string | null
  }
}

type Entry = {
  id: string
  userId: string
  title: string | null
  description: string | null
  phase4Url: string | null
  voteCount: number
  users: {
    username: string
    avatarUrl: string | null
  }
}

export default function ContestDetailPage() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const [contest, setContest] = useState<Contest | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [winners, setWinners] = useState<Winner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchContest()
      fetchEntries()
      fetchWinners()
    }
  }, [id])

  const fetchContest = async () => {
    if (!id) return
    try {
      const response: any = await contestsApi.get(id)
      const data = response.contest
      console.log('Fetched contest:', data?.title, 'status:', data?.status)
      setContest(data)
    } catch (error) {
      console.error('Error fetching contest:', error)
    }
  }

  const fetchEntries = async () => {
    if (!id) return
    try {
      const response: any = await contestsApi.getEntries(id)
      const data = response.entries || []

      // Fetch user data separately and get reaction counts for each entry
      const entriesWithVotes = await Promise.all(
        data.map(async (entry: any) => {
          const userResponse: any = await usersApi.get(entry.userId)
          const userData = userResponse.user
          const reactionsResponse: any = await reactionsApi.getReactions(entry.id)
          const reactions = reactionsResponse.reactions || []

          return { ...entry, users: userData, vote_count: reactions.length }
        })
      )

      // Sort by vote count
      entriesWithVotes.sort((a, b) => b.vote_count - a.vote_count)
      setEntries(entriesWithVotes)
    } catch (error) {
      console.error('Error fetching entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWinners = async () => {
    if (!id) return
    try {
      const response: any = await contestsApi.getContestWinners(id)
      const data = response.winners || []
      setWinners(data)

      // Fetch related data separately
      const winnersWithData = await Promise.all(
        (data || []).map(async (winner: any) => {
          const userDataResponse: any = await usersApi.get(winner.userId)
          const userData = userDataResponse.user
          const entryDataResponse: any = await entriesApi.get(winner.entryId)
          const entryData = entryDataResponse.entry

          return { ...winner, users: userData, entries: entryData }
        })
      )
      
      setWinners(winnersWithData)
    } catch (error) {
      console.error('Error fetching winners:', error)
    }
  }

  const canSubmit = () => {
    if (!user || !contest) return false
    const now = new Date()
    const start = new Date(contest.startDate)
    const end = new Date(contest.endDate)
    return contest.status === 'active' && now >= start && now <= end
  }

  if (loading) {
    return <div className="text-center py-12">Loading contest...</div>
  }

  if (!contest) {
    return <div className="text-center py-12">Contest not found</div>
  }

  return (
    <div>
      {contest.thumbnailUrl && (
        <div className="mb-6 rounded-lg overflow-hidden">
          <img src={contest.thumbnailUrl} alt={contest.title} className="w-full h-64 object-cover" />
        </div>
      )}

      <div className="bg-surface rounded-lg p-8 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{contest.title}</h1>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                contest.status === 'active'
                  ? 'bg-success/20 text-success'
                  : contest.status === 'voting'
                  ? 'bg-secondary/20 text-secondary'
                  : contest.status === 'ended'
                  ? 'bg-text-secondary/20 text-text-secondary'
                  : 'bg-warning/20 text-warning'
              }`}
            >
              {contest.status.toUpperCase()}
            </span>
          </div>
          {canSubmit() && (
            <Link
              to={`/contests/${id}/submit`}
              className="px-6 py-3 bg-primary hover:bg-primary-hover rounded-lg font-semibold transition-colors"
            >
              Submit Entry
            </Link>
          )}
        </div>

        <p className="text-text-secondary text-lg mb-6 whitespace-pre-line">{contest.description}</p>

        {/* Sponsor Section */}
        {contest.hasSponsor && contest.sponsorName && (
          <div className="mb-6 p-4 bg-background rounded-lg border-2 border-primary/30">
            <div className="flex items-center gap-4">
              {contest.sponsorLogoUrl && (
                <img 
                  src={contest.sponsorLogoUrl} 
                  alt={contest.sponsorName}
                  className="h-12 w-auto object-contain"
                />
              )}
              <div className="flex-1">
                <p className="text-sm text-text-secondary">Sponsored by</p>
                <p className="text-xl font-bold text-primary">{contest.sponsorName}</p>
              </div>
              {contest.sponsorPrizeAmount && contest.sponsorPrizeAmount > 0 && (
                <div className="text-right">
                  <p className="text-sm text-text-secondary">Additional Prize</p>
                  <p className="text-2xl font-bold text-success">
                    ₱{contest.sponsorPrizeAmount.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div className="bg-background rounded-lg p-3">
            <div className="text-text-secondary mb-1">Entries</div>
            <div className="text-2xl font-bold">{entries.length}</div>
          </div>
          <div className="bg-background rounded-lg p-3">
            <div className="text-text-secondary mb-1 flex items-center gap-1">
              <Heart className="w-3 h-3" />
              Total Votes
            </div>
            <div className="text-2xl font-bold text-primary">
              {formatNumber(entries.reduce((sum, e) => sum + e.voteCount, 0))}
            </div>
          </div>
          <div className="bg-background rounded-lg p-3">
            <div className="text-text-secondary mb-1">Start Date</div>
            <div className="font-semibold">{formatDate(contest.startDate)}</div>
          </div>
          <div className="bg-background rounded-lg p-3">
            <div className="text-text-secondary mb-1">End Date</div>
            <div className="font-semibold">{formatDate(contest.endDate)}</div>
          </div>
          <div className="bg-background rounded-lg p-3">
            <CountdownTimer endDate={contest.endDate} label="Time Left" compact={false} />
          </div>
        </div>
      </div>

      {/* Winners Section */}
      {contest.prizePoolDistributed && winners.length > 0 && (
        <div className="bg-surface rounded-lg p-6 mb-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">🏆 Contest Winners</h2>
            <div className="text-sm text-text-secondary">
              Prize Pool: <span className="font-bold text-primary">{contest.prizePool} pts</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {winners.map((winner) => (
              <div
                key={winner.id}
                className="relative bg-background rounded-lg overflow-hidden border-2"
                style={{
                  borderColor:
                    winner.placement === 1
                      ? '#FFD700'
                      : winner.placement === 2
                      ? '#C0C0C0'
                      : '#CD7F32',
                }}
              >
                {/* Placement Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <div
                    className="text-4xl drop-shadow-lg"
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                    }}
                  >
                    {winner.placement === 1 ? '🥇' : winner.placement === 2 ? '🥈' : '🥉'}
                  </div>
                </div>

                {/* Entry Image */}
                <Link to={`/entries/${winner.entryId}`}>
                  <div className="aspect-square bg-background flex items-center justify-center">
                    {winner.entries.phase4Url ? (
                      <img
                        src={winner.entries.phase4Url}
                        alt={`${winner.placement} place`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    ) : (
                      <p className="text-text-secondary">No image</p>
                    )}
                  </div>
                </Link>

                {/* Winner Info */}
                <div className="p-4">
                  <Link
                    to={`/users/${winner.users.username}`}
                    className="flex items-center gap-2 mb-2 hover:text-primary transition-colors"
                  >
                    {winner.users.avatarUrl ? (
                      <img
                        src={winner.users.avatarUrl}
                        alt={winner.users.username}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm">
                        {winner.users.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-semibold">@{winner.users.username}</span>
                  </Link>

                  <div className="flex items-center justify-between text-sm">
                    <div className="text-text-secondary">
                      {winner.votesReceived} votes
                    </div>
                    <div className="font-bold text-primary">
                      +{winner.prizeAmount} pts
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prize Pool Display (if contest ended but not finalized) */}
      {contest.status === 'ended' && !contest.prizePoolDistributed && contest.prizePool > 0 && (
        <div className="bg-warning/20 border border-warning rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">⏳</div>
            <div>
              <p className="font-semibold">Contest Ended - Awaiting Finalization</p>
              <p className="text-sm text-text-secondary">
                Prize Pool: <span className="font-bold">{contest.prizePool} pts</span> will be distributed to top 3 winners soon!
              </p>
            </div>
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-lg border border-border">
          <p className="text-text-secondary mb-4">No entries yet</p>
          {canSubmit() && (
            <Link
              to={`/contests/${id}/submit`}
              className="inline-block px-6 py-3 bg-primary hover:bg-primary-hover rounded-lg font-semibold transition-colors"
            >
              Be the First to Submit!
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map((entry, index) => (
            <Link
              key={entry.id}
              to={`/entries/${entry.id}`}
              className="bg-surface rounded-lg overflow-hidden border border-border hover:border-primary transition-all hover:shadow-lg group relative"
            >
              {/* Ranking Badge */}
              {index < 3 && (
                <div className="absolute top-3 left-3 z-10">
                  <div className={`px-3 py-1 rounded-full font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500 text-black' :
                    index === 1 ? 'bg-gray-300 text-black' :
                    'bg-orange-600 text-white'
                  }`}>
                    #{index + 1}
                  </div>
                </div>
              )}
              
              {/* Vote Count Badge */}
              <div className="absolute top-3 right-3 z-10">
                <div className="bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  <span className="font-bold text-white">{formatNumber(entry.voteCount)}</span>
                </div>
              </div>

              <div className="aspect-square bg-background flex items-center justify-center overflow-hidden">
                {entry.phase4Url ? (
                  <img src={entry.phase4Url} alt={entry.title || "Entry"} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <p className="text-text-secondary">No final artwork yet</p>
                )}
              </div>
              <div className="p-4">
                {entry.title && (
                  <h3 className="font-bold mb-2 line-clamp-1">{entry.title}</h3>
                )}
                <div className="flex items-center gap-2">
                  {entry.users.avatarUrl ? (
                    <img
                      src={entry.users.avatarUrl}
                      alt={entry.users.username}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs">
                      {entry.users.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="font-semibold text-sm">@{entry.users.username}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
