// @ts-nocheck
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { formatTimeAgo } from '@/lib/utils'
import { MessageCircle, Edit2, Trash2, Send } from 'lucide-react'

type Comment = {
  id: string
  user_id: string
  entry_id: string
  parent_comment_id: string | null
  content: string
  edited: boolean
  edited_at: string | null
  created_at: string
  users: {
    username: string
    avatar_url: string | null
  }
  replies?: Comment[]
}

type Props = {
  entryId: string
  entryOwnerId: string
}

export default function Comments({ entryId, entryOwnerId }: Props) {
  const { user } = useAuthStore()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [entryId])

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          users:user_id (username, avatar_url)
        `)
        .eq('entry_id', entryId)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Organize comments into parent-child structure
      const parentComments = data?.filter(c => !c.parent_comment_id) || []
      const organized = parentComments.map(parent => ({
        ...parent,
        replies: data?.filter(c => c.parent_comment_id === parent.id) || []
      }))

      setComments(organized)
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return

    setLoading(true)
    try {
      const { error } = await supabase.from('comments').insert({
        entry_id: entryId,
        user_id: user.id,
        content: newComment.trim(),
      })

      if (error) throw error

      // Create notification for entry owner
      await createCommentNotification(newComment.trim(), null)

      setNewComment('')
      await fetchComments()
    } catch (error) {
      console.error('Error adding comment:', error)
      alert('Failed to add comment')
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async (parentId: string) => {
    if (!user || !replyContent.trim()) return

    setLoading(true)
    try {
      const { error } = await supabase.from('comments').insert({
        entry_id: entryId,
        user_id: user.id,
        parent_comment_id: parentId,
        content: replyContent.trim(),
      })

      if (error) throw error

      // Create notification for parent comment owner
      await createCommentNotification(replyContent.trim(), parentId)

      setReplyTo(null)
      setReplyContent('')
      await fetchComments()
    } catch (error) {
      console.error('Error adding reply:', error)
      alert('Failed to add reply')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('comments')
        .update({
          content: editContent.trim(),
          edited: true,
          edited_at: new Date().toISOString(),
        })
        .eq('id', commentId)

      if (error) throw error

      setEditingId(null)
      setEditContent('')
      await fetchComments()
    } catch (error) {
      console.error('Error editing comment:', error)
      alert('Failed to edit comment')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (commentId: string, hasReplies: boolean) => {
    const message = hasReplies
      ? 'This comment has replies. Delete anyway?'
      : 'Are you sure you want to delete this comment?'

    if (!confirm(message)) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error

      await fetchComments()
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('Failed to delete comment')
    } finally {
      setLoading(false)
    }
  }

  const createCommentNotification = async (content: string, parentId: string | null) => {
    try {
      let notifyUserId = entryOwnerId
      let notifType = 'comment'

      // If it's a reply, notify the parent comment owner
      if (parentId) {
        const { data: parentComment } = await supabase
          .from('comments')
          .select('user_id')
          .eq('id', parentId)
          .single()

        if (parentComment) {
          notifyUserId = parentComment.user_id
          notifType = 'reply'
        }
      }

      // Don't notify self
      if (notifyUserId === user?.id) return

      // Check notification preferences
      const { data: owner } = await supabase
        .from('users')
        .select('notify_comments')
        .eq('id', notifyUserId)
        .single()

      if (!owner?.notify_comments) return

      // Get entry title
      const { data: entry } = await supabase
        .from('entries')
        .select('title')
        .eq('id', entryId)
        .single()

      // Create notification
      const notifContent = notifType === 'reply'
        ? `replied to your comment: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`
        : `commented on your entry "${entry?.title}": "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`

      await supabase.from('notifications').insert({
        user_id: notifyUserId,
        type: notifType,
        actor_id: user?.id,
        entry_id: entryId,
        content: notifContent,
      })
    } catch (error) {
      console.error('Error creating notification:', error)
    }
  }

  const renderComment = (comment: Comment, isReply = false) => {
    const isOwner = user?.id === comment.user_id
    const isEditing = editingId === comment.id

    return (
      <div key={comment.id} className={`${isReply ? 'ml-12' : ''} mb-4`}>
        <div className="flex gap-3">
          {/* Avatar */}
          {comment.users?.avatar_url ? (
            <img
              src={comment.users.avatar_url}
              alt={comment.users.username}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold flex-shrink-0">
              {comment.users?.username?.[0]?.toUpperCase()}
            </div>
          )}

          {/* Comment Content */}
          <div className="flex-1 bg-surface rounded-lg p-3 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">{comment.users?.username}</span>
              <span className="text-xs text-text-secondary">
                {formatTimeAgo(comment.created_at)}
              </span>
              {comment.edited && (
                <span className="text-xs text-text-secondary italic">(edited)</span>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary resize-none"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(comment.id)}
                    disabled={loading}
                    className="px-3 py-1 bg-primary text-white rounded-lg text-sm hover:bg-primary/80 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null)
                      setEditContent('')
                    }}
                    className="px-3 py-1 bg-surface border border-border rounded-lg text-sm hover:bg-background transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-text-primary whitespace-pre-wrap">{comment.content}</p>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-2">
                  {user && !isReply && (
                    <button
                      onClick={() => setReplyTo(comment.id)}
                      className="text-xs text-text-secondary hover:text-primary transition-colors flex items-center gap-1"
                    >
                      <MessageCircle className="w-3 h-3" />
                      Reply
                    </button>
                  )}

                  {isOwner && (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(comment.id)
                          setEditContent(comment.content)
                        }}
                        className="text-xs text-text-secondary hover:text-primary transition-colors flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(comment.id, (comment.replies?.length || 0) > 0)}
                        className="text-xs text-text-secondary hover:text-error transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Reply Form */}
        {replyTo === comment.id && (
          <div className="ml-12 mt-2">
            <div className="flex gap-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary resize-none"
                rows={2}
              />
              <button
                onClick={() => handleReply(comment.id)}
                disabled={loading || !replyContent.trim()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => {
                setReplyTo(null)
                setReplyContent('')
              }}
              className="text-xs text-text-secondary hover:text-text-primary mt-1"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <MessageCircle className="w-5 h-5" />
        Comments ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
      </h3>

      {/* Add Comment Form */}
      {user ? (
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="You"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                {user.email?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:border-primary resize-none"
              rows={3}
            />
            <button
              onClick={handleAddComment}
              disabled={loading || !newComment.trim()}
              className="mt-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Comment
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 bg-surface rounded-lg border border-border">
          <p className="text-text-secondary">Please login to comment</p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  )
}
