// @ts-nocheck
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { formatDate } from '@/lib/utils'
import { MessageCircle, Send, Reply, Trash2, Edit2, ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react'
import { useToastStore } from '@/stores/toastStore'
import { Link } from 'react-router-dom'
import CommentReactionPicker from './CommentReactionPicker'

type Comment = {
  id: string
  entry_id: string
  user_id: string
  parent_comment_id: string | null
  comment_text: string
  created_at: string
  edited_at?: string | null
  reaction_counts?: Record<string, number>
  user_reaction?: string | null
  users: {
    username: string
    avatar_url: string | null
  }
  replies?: Comment[]
}

type Props = {
  entryId: string
  onCommentCountChange?: (count: number) => void
}

export default function CommentSection({ entryId, onCommentCountChange }: Props) {
  const { user } = useAuthStore()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'likes'>('newest')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const toast = useToastStore()

  useEffect(() => {
    fetchComments()
  }, [entryId])

  const fetchComments = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('entry_comments')
        .select('*')
        .eq('entry_id', entryId)
        .is('parent_comment_id', null)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch user data and replies for each comment
      const commentsWithReplies = await Promise.all(
        (data || []).map(async (comment: any) => {
          // Fetch user data for comment
          const { data: userData } = await supabase
            .from('users')
            .select('username, avatar_url')
            .eq('id', comment.user_id)
            .single()

          // Check user's reaction on this comment
          let userReaction = null
          if (user) {
            const { data: reactionData } = await supabase
              .from('comment_reactions')
              .select('reaction_type')
              .eq('comment_id', comment.id)
              .eq('user_id', user.id)
              .maybeSingle()
            userReaction = reactionData?.reaction_type || null
          }

          // Fetch replies
          const { data: repliesData } = await supabase
            .from('entry_comments')
            .select('*')
            .eq('parent_comment_id', comment.id)
            .order('created_at', { ascending: true })

          // Fetch user data for each reply
          const repliesWithUsers = await Promise.all(
            (repliesData || []).map(async (reply: any) => {
              const { data: replyUserData } = await supabase
                .from('users')
                .select('username, avatar_url')
                .eq('id', reply.user_id)
                .single()
              
              // Check user's reaction on this reply
              let replyUserReaction = null
              if (user) {
                const { data: replyReactionData } = await supabase
                  .from('comment_reactions')
                  .select('reaction_type')
                  .eq('comment_id', reply.id)
                  .eq('user_id', user.id)
                  .maybeSingle()
                replyUserReaction = replyReactionData?.reaction_type || null
              }
              
              return { ...reply, users: replyUserData, user_reaction: replyUserReaction }
            })
          )

          return {
            ...comment,
            users: userData,
            user_reaction: userReaction,
            replies: repliesWithUsers,
          }
        })
      )

      setComments(commentsWithReplies)
      
      // Calculate total comment count (including replies)
      const totalCount = commentsWithReplies.reduce((sum, c) => sum + 1 + (c.replies?.length || 0), 0)
      onCommentCountChange?.(totalCount)
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
      toast.error('Failed to post comment')
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
      toast.error('Failed to post reply')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    setDeleteConfirmId(null)
    try {
      const { error } = await supabase
        .from('entry_comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error
      await fetchComments()
      toast.success('Comment deleted')
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast.error('Failed to delete comment')
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!editText.trim()) return

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('entry_comments')
        .update({
          comment_text: editText.trim(),
          edited_at: new Date().toISOString()
        })
        .eq('id', commentId)

      if (error) throw error

      setEditingComment(null)
      setEditText('')
      await fetchComments()
    } catch (error) {
      console.error('Error editing comment:', error)
      toast.error('Failed to edit comment')
    } finally {
      setSubmitting(false)
    }
  }


  const sortComments = (comments: Comment[]) => {
    const sorted = [...comments]
    if (sortBy === 'newest') {
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else if (sortBy === 'oldest') {
      sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    } else if (sortBy === 'likes') {
      sorted.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
    }
    return sorted
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
              {comment.edited_at && ' (edited)'}
            </span>
          </div>
          
          {/* Comment Text or Edit Form */}
          {editingComment === comment.id ? (
            <div className="mt-2">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:border-primary"
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => {
                    setEditingComment(null)
                    setEditText('')
                  }}
                  className="px-3 py-1 text-sm bg-background hover:bg-border rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleEditComment(comment.id)}
                  disabled={submitting}
                  className="px-3 py-1 text-sm bg-primary hover:bg-primary-hover text-white rounded transition-colors disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-text-primary whitespace-pre-wrap">{comment.comment_text}</p>
          )}

          <div className="flex items-center gap-4 mt-2">
            {/* Reaction Picker */}
            <CommentReactionPicker
              commentId={comment.id}
              initialReaction={comment.user_reaction}
              reactionCounts={comment.reaction_counts || {}}
              onReactionChange={fetchComments}
            />

            {!isReply && (
              <button
                onClick={() => setReplyingTo(comment.id)}
                className="flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition-colors"
              >
                <Reply className="w-4 h-4" />
                Reply
              </button>
            )}
            
            {user?.id === comment.user_id && editingComment !== comment.id && (
              <>
                <button
                  onClick={() => {
                    setEditingComment(comment.id)
                    setEditText(comment.comment_text)
                  }}
                  className="flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => setDeleteConfirmId(comment.id)}
                  className="flex items-center gap-1 text-sm text-error hover:text-error/80 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
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
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:border-primary"
                  disabled={submitting}
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setReplyingTo(null)
                      setReplyText('')
                    }}
                    className="px-4 py-2 text-sm bg-background hover:bg-border rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !replyText.trim()}
                    className="px-4 py-2 text-sm bg-primary hover:bg-primary-hover disabled:bg-primary/50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Reply
                  </button>
                </div>
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

  const sortedComments = sortComments(comments)

  return (
    <div className="bg-surface rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">
            Comments ({comments.reduce((sum, c) => sum + 1 + (c.replies?.length || 0), 0)})
          </h2>
        </div>
        
        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="likes">Most Liked</option>
          </select>
        </div>
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
        <div>{sortedComments.map((comment) => renderComment(comment))}</div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl border border-border max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-error/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-error" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Delete Comment?</h3>
                <p className="text-sm text-text-secondary">This cannot be undone</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 bg-background hover:bg-border rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteComment(deleteConfirmId)}
                className="flex-1 px-4 py-2 bg-error hover:bg-error/80 rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
