import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatNumber, formatTimeAgo } from '@/lib/utils'

type Entry = {
  id: string
  user_id: string
  contest_id: string
  phase_1_url: string | null
  phase_2_url: string | null
  phase_3_url: string | null
  phase_4_url: string | null
  vote_count: number
  final_rank: number | null
  status: string
  users: {
    username: string
    avatar_url: string | null
    level: number
  }
  contests: {
    title: string
  }
}

type Comment = {
  id: string
  text: string
  created_at: string
  users: {
    username: string
    avatar_url: string | null
  }
}

export default function EntryDetailPage() {
  const { id } = useParams()
  const [entry, setEntry] = useState<Entry | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [selectedPhase, setSelectedPhase] = useState(4)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchEntry()
      fetchComments()
    }
  }, [id])

  const fetchEntry = async () => {
    if (!id) return
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('*, users(username, avatar_url, level), contests(title)')
        .eq('id', id)
        .single()

      if (error) throw error
      const entryData = data as any
      setEntry(entryData)
      
      // Set initial phase to the highest available
      if (entryData.phase_4_url) setSelectedPhase(4)
      else if (entryData.phase_3_url) setSelectedPhase(3)
      else if (entryData.phase_2_url) setSelectedPhase(2)
      else setSelectedPhase(1)
    } catch (error) {
      console.error('Error fetching entry:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    if (!id) return
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*, users(username, avatar_url)')
        .eq('entry_id', id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setComments(data as any || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const getPhaseUrl = (phaseNum: number) => {
    if (!entry) return null
    switch (phaseNum) {
      case 1: return entry.phase_1_url
      case 2: return entry.phase_2_url
      case 3: return entry.phase_3_url
      case 4: return entry.phase_4_url
      default: return null
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading entry...</div>
  }

  if (!entry) {
    return <div className="text-center py-12">Entry not found</div>
  }

  const phases = [
    { num: 1, label: 'Sketch', url: entry.phase_1_url },
    { num: 2, label: 'Line Art', url: entry.phase_2_url },
    { num: 3, label: 'Base Colors', url: entry.phase_3_url },
    { num: 4, label: 'Final', url: entry.phase_4_url },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="aspect-square bg-surface rounded-lg border border-border flex items-center justify-center mb-4 overflow-hidden">
            {getPhaseUrl(selectedPhase) ? (
              <img
                src={getPhaseUrl(selectedPhase) || ''}
                alt={`Phase ${selectedPhase}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <p className="text-text-secondary">No image for this phase</p>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {phases.map((phase) => (
              <button
                key={phase.num}
                onClick={() => phase.url && setSelectedPhase(phase.num)}
                disabled={!phase.url}
                className={`aspect-square rounded border transition-all ${
                  phase.url
                    ? selectedPhase === phase.num
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-surface hover:border-primary/50'
                    : 'border-border bg-background opacity-50 cursor-not-allowed'
                } flex items-center justify-center text-xs font-medium overflow-hidden`}
              >
                {phase.url ? (
                  <img src={phase.url} alt={phase.label} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-text-secondary">{phase.label}</span>
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-text-secondary text-center mt-2">
            Phase {selectedPhase}: {phases[selectedPhase - 1].label}
          </p>
        </div>

        <div>
          <Link
            to={`/profile/${entry.users.username}`}
            className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity"
          >
            {entry.users.avatar_url ? (
              <img
                src={entry.users.avatar_url}
                alt={entry.users.username}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center font-bold">
                {entry.users.username[0].toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="font-semibold">@{entry.users.username}</h3>
              <p className="text-sm text-text-secondary">Level {entry.users.level}</p>
            </div>
          </Link>

          <p className="text-text-secondary mb-4">
            Contest: <Link to={`/contests/${entry.contest_id}`} className="text-primary hover:underline">{entry.contests.title}</Link>
          </p>

          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${
              entry.status === 'approved'
                ? 'bg-success/20 text-success'
                : entry.status === 'pending_review'
                ? 'bg-warning/20 text-warning'
                : 'bg-error/20 text-error'
            }`}
          >
            {entry.status.replace('_', ' ').toUpperCase()}
          </span>

          {entry.status === 'approved' && (
            <button className="w-full py-3 bg-primary hover:bg-primary-hover rounded-lg font-semibold mb-4 transition-colors">
              🔥 Vote (1 point)
            </button>
          )}

          <div className="bg-surface rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Total Votes</span>
              <span className="font-semibold text-lg">{formatNumber(entry.vote_count)}</span>
            </div>
            {entry.final_rank && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Current Rank</span>
                <span className="font-semibold text-lg text-primary">#{entry.final_rank}</span>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-3">Comments ({comments.length})</h3>
            {comments.length === 0 ? (
              <p className="text-text-secondary text-sm">No comments yet</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-surface rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      {comment.users.avatar_url && (
                        <img
                          src={comment.users.avatar_url}
                          alt={comment.users.username}
                          className="w-5 h-5 rounded-full"
                        />
                      )}
                      <span className="font-semibold text-sm">@{comment.users.username}</span>
                      <span className="text-xs text-text-secondary">{formatTimeAgo(comment.created_at)}</span>
                    </div>
                    <p className="text-sm">{comment.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
