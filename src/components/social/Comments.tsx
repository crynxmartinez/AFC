// @ts-nocheck
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { formatDate } from '@/lib/utils'
import { MessageCircle, Send, Reply, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

type Comment = {
  id: string
  entry_id: string
  user_id: string
  parent_comment_id: string | null
  comment_text: string
  created_at: string
  users: {
    username: string
    avatar_url: string | null
  }
  replies?: Comment[]
}

type Props = {
  entryId: string
}

export default function CommentSection({ entryId }: Props) {
  const { user } = useAuthStore()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [entryId])

  const fetchComments = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('entry_comments')
        .select(`
          *,
          users (username, avatar_url)
        `)
        .eq('entry_id', entryId)
        .is('parent_comment_id', null)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch replies for each comment
      const commentsWithReplies = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: replies } = await supabase
            .from('entry_comments')
            .select(`
              *,
              users (username, avatar_url)
            `)
            .eq('parent_comment_id', comment.id)
            .order('created_at', { ascending: true })

          return {
            ...comment,
            replies: replies || [],
          }
        })
      )

      setComments(commentsWithReplies)
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('entry_comments')
        .insert({
          entry_id: entryId,
          user_id: user.id,
          comment_text: newComment.trim(),
        })

      if (error) throw error

      setNewComment('')
      await fetchComments()
    } catch (error) {
      console.error('Error submitting comment:', error)
      alert('Failed to post comment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitReply = async (parentId: string) => {
    if (!user || !replyText.trim()) return

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('entry_comments')
        .insert({
          entry_id: entryId,
          user_id: user.id,
          parent_comment_id: parentId,
          comment_text: replyText.trim(),
        })

      if (error) throw error

      setReplyText('')
      setReplyingTo(null)
      await fetchComments()
    } catch (error) {
      console.error('Error submitting reply:', error)
      alert('Failed to post reply. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      const { error } = await supabase
        .from('entry_comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error
      await fetchComments()
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('Failed to delete comment.')
    }
  }

  const renderComment = (comment: Comment, isReply = false) => (
    <div
      key={comment.id}
      className={`${isReply ? 'ml-12 mt-3' : 'mb-4'} bg-background rounded-lg p-4`}
    >
      <div className="flex items-start gap-3">
        <Link to={`/users/${comment.users.username}`}>
          {comment.users.avatar_url ? (
            <img
              src={comment.users.avatar_url}
              alt={comment.users.username}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-sm font-bold">
              {comment.users.username.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Link
              to={`/users/${comment.users.username}`}
              className="font-semibold hover:text-primary transition-colors"
            >
              @{comment.users.username}
            </Link>
            <span className="text-xs text-text-secondary">
              {formatDate(comment.created_at)}
            </span>
          </div>
          <p className="text-text-primary whitespace-pre-wrap">{comment.comment_text}</p>
          <div className="flex items-center gap-4 mt-2">
            {!isReply && (
              <button
                onClick={() => setReplyingTo(comment.id)}
                className="flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition-colors"
              >
                <Reply className="w-4 h-4" />
                Reply
              </button>
            )}
            {user?.id === comment.user_id && (
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="flex items-center gap-1 text-sm text-error hover:text-error/80 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSubmitReply(comment.id)
              }}
              className="mt-3"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 px-4 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:border-primary"
                  disabled={submitting}
                />
                <button
                  type="submit"
                  disabled={submitting || !replyText.trim()}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover disabled:bg-primary/50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReplyingTo(null)
                    setReplyText('')
                  }}
                  className="px-4 py-2 bg-background hover:bg-border rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map((reply) => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-surface rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">
          Comments ({comments.reduce((sum, c) => sum + 1 + (c.replies?.length || 0), 0)})
        </h2>
      </div>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="flex gap-3">
            {user && (
              <div className="flex-shrink-0">
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Your avatar"
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-sm font-bold">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            )}
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
                disabled={submitting}
              />
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="px-6 py-3 bg-primary hover:bg-primary-hover disabled:bg-primary/50 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                Post
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-background rounded-lg text-center">
          <p className="text-text-secondary">
            <Link to="/login" className="text-primary hover:underline">
              Log in
            </Link>{' '}
            to leave a comment
          </p>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 text-text-secondary" />
          <p className="text-text-secondary">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div>{comments.map((comment) => renderComment(comment))}</div>
      )}
    </div>
  )
}
