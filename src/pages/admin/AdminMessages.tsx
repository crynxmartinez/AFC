import { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Mail, MailOpen, CheckCircle, Clock, Filter, ChevronDown, ChevronUp, User, MessageSquare } from 'lucide-react'
import { useToastStore } from '@/stores/toastStore'

type ContactSubmission = {
  id: string
  userId: string | null
  name: string
  email: string
  subject: string
  message: string
  status: 'new' | 'read' | 'resolved'
  readAt: string | null
  resolvedAt: string | null
  adminNotes: string | null
  createdAt: string
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'resolved'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({})
  const toast = useToastStore()

  useEffect(() => {
    fetchMessages()
  }, [filter])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const response: any = await adminApi.getMessages()
      let data = response.messages || []

      if (filter !== 'all') {
        data = data.filter((msg: any) => msg.status === filter)
      }

      setMessages(data || [])

      // Initialize admin notes
      const notes: Record<string, string> = {}
      data?.forEach((msg: any) => {
        notes[msg.id] = msg.admin_notes || ''
      })
      setAdminNotes(notes)
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await adminApi.updateMessage(id, { status: 'read' })

      setMessages(prev => prev.map(msg => 
        msg.id === id ? { ...msg, status: 'read', readAt: new Date().toISOString() } : msg
      ))
      
      // Dispatch event to update sidebar badge
      window.dispatchEvent(new CustomEvent('contact-messages-updated'))
      toast.success('Marked as read')
    } catch (error) {
      console.error('Error marking as read:', error)
      toast.error('Failed to update')
    }
  }

  const markAsResolved = async (id: string) => {
    try {
      await adminApi.updateMessage(id, { 
        status: 'resolved',
        adminNotes: adminNotes[id] || null
      })
      
      setMessages(prev => prev.map(msg => 
        msg.id === id ? { ...msg, status: 'resolved', resolvedAt: new Date().toISOString() } : msg
      ))
      
      // Dispatch event to update sidebar badge
      window.dispatchEvent(new CustomEvent('contact-messages-updated'))
      toast.success('Marked as resolved')
    } catch (error) {
      console.error('Error marking as resolved:', error)
      toast.error('Failed to update')
    }
  }

  const saveNotes = async (id: string) => {
    try {
      await adminApi.updateMessage(id, { adminNotes: adminNotes[id] || null })
      toast.success('Notes saved')
    } catch (error) {
      console.error('Error saving notes:', error)
      toast.error('Failed to save notes')
    }
  }

  const toggleExpand = async (msg: ContactSubmission) => {
    if (expandedId === msg.id) {
      setExpandedId(null)
    } else {
      setExpandedId(msg.id)
      // Auto-mark as read when expanding a new message
      if (msg.status === 'new') {
        await markAsRead(msg.id)
      }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <Mail className="w-5 h-5 text-primary" />
      case 'read':
        return <MailOpen className="w-5 h-5 text-warning" />
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-success" />
      default:
        return <Mail className="w-5 h-5" />
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      new: 'bg-primary/20 text-primary',
      read: 'bg-warning/20 text-warning',
      resolved: 'bg-success/20 text-success'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || ''}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const counts = {
    all: messages.length,
    new: messages.filter(m => m.status === 'new').length,
    read: messages.filter(m => m.status === 'read').length,
    resolved: messages.filter(m => m.status === 'resolved').length
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Contact Messages</h1>
          <p className="text-text-secondary mt-1">Manage contact form submissions</p>
        </div>
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-text-secondary" />
          <span className="text-text-secondary">{messages.length} total</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['all', 'new', 'read', 'resolved'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              filter === status
                ? 'bg-primary text-white'
                : 'bg-surface border border-border hover:bg-background'
            }`}
          >
            {status === 'all' && <Filter className="w-4 h-4" />}
            {status === 'new' && <Mail className="w-4 h-4" />}
            {status === 'read' && <MailOpen className="w-4 h-4" />}
            {status === 'resolved' && <CheckCircle className="w-4 h-4" />}
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status === 'new' && counts.new > 0 && (
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {counts.new}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-surface rounded-xl p-12 text-center border border-border">
          <Mail className="w-12 h-12 mx-auto mb-4 text-text-secondary" />
          <h3 className="text-xl font-semibold mb-2">No messages</h3>
          <p className="text-text-secondary">
            {filter === 'all' 
              ? 'No contact submissions yet'
              : `No ${filter} messages`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-surface rounded-xl border transition-all ${
                msg.status === 'new' 
                  ? 'border-primary shadow-lg shadow-primary/10' 
                  : 'border-border'
              }`}
            >
              {/* Header - Always visible */}
              <button
                onClick={() => toggleExpand(msg)}
                className="w-full p-4 flex items-center gap-4 text-left"
              >
                <div className="flex-shrink-0">
                  {getStatusIcon(msg.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{msg.name}</span>
                    {getStatusBadge(msg.status)}
                  </div>
                  <div className="text-sm text-text-secondary truncate">
                    {msg.subject}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right text-sm">
                    <div className="text-text-secondary">{formatDate(msg.createdAt)}</div>
                    <div className="text-xs text-text-secondary">{msg.email}</div>
                  </div>
                  {expandedId === msg.id ? (
                    <ChevronUp className="w-5 h-5 text-text-secondary" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-text-secondary" />
                  )}
                </div>
              </button>

              {/* Expanded Content */}
              {expandedId === msg.id && (
                <div className="px-4 pb-4 border-t border-border">
                  <div className="pt-4 space-y-4">
                    {/* Sender Info */}
                    <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                      <User className="w-5 h-5 text-text-secondary" />
                      <div>
                        <div className="font-medium">{msg.name}</div>
                        <a 
                          href={`mailto:${msg.email}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {msg.email}
                        </a>
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <div className="text-sm font-medium text-text-secondary mb-1">Subject</div>
                      <div className="font-semibold">{msg.subject}</div>
                    </div>

                    {/* Message */}
                    <div>
                      <div className="text-sm font-medium text-text-secondary mb-1">Message</div>
                      <div className="p-4 bg-background rounded-lg whitespace-pre-wrap">
                        {msg.message}
                      </div>
                    </div>

                    {/* Timestamps */}
                    <div className="flex gap-4 text-sm text-text-secondary">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Received: {formatDate(msg.createdAt)}
                      </div>
                      {msg.readAt && (
                        <div>Read: {formatDate(msg.readAt)}</div>
                      )}
                      {msg.resolvedAt && (
                        <div>Resolved: {formatDate(msg.resolvedAt)}</div>
                      )}
                    </div>

                    {/* Admin Notes */}
                    <div>
                      <div className="text-sm font-medium text-text-secondary mb-1">Admin Notes</div>
                      <textarea
                        value={adminNotes[msg.id] || ''}
                        onChange={(e) => setAdminNotes(prev => ({ ...prev, [msg.id]: e.target.value }))}
                        placeholder="Add notes about this message..."
                        rows={3}
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary resize-none"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      {msg.status === 'new' && (
                        <button
                          onClick={() => markAsRead(msg.id)}
                          className="px-4 py-2 bg-warning/20 text-warning rounded-lg font-medium hover:bg-warning/30 transition-colors flex items-center gap-2"
                        >
                          <MailOpen className="w-4 h-4" />
                          Mark as Read
                        </button>
                      )}
                      {msg.status !== 'resolved' && (
                        <button
                          onClick={() => markAsResolved(msg.id)}
                          className="px-4 py-2 bg-success/20 text-success rounded-lg font-medium hover:bg-success/30 transition-colors flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark as Resolved
                        </button>
                      )}
                      <button
                        onClick={() => saveNotes(msg.id)}
                        className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors"
                      >
                        Save Notes
                      </button>
                      <a
                        href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                        className="px-4 py-2 bg-surface border border-border rounded-lg font-medium hover:bg-background transition-colors flex items-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        Reply via Email
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
