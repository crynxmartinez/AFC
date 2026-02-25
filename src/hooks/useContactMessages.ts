import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'

export function useContactMessages() {
  const { profile } = useAuthStore()
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchUnreadCount()
      
      // Poll every 60 seconds for updates
      const interval = setInterval(() => {
        fetchUnreadCount()
      }, 60000)

      // Listen for manual updates from AdminMessages page
      const handleUpdate = () => fetchUnreadCount()
      window.addEventListener('contact-messages-updated', handleUpdate)

      return () => {
        clearInterval(interval)
        window.removeEventListener('contact-messages-updated', handleUpdate)
      }
    }
  }, [profile?.role])

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/admin/messages?status=new', {
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Failed to fetch unread count')

      const data = await response.json()
      setUnreadCount(data.messages?.length || 0)
    } catch (error) {
      console.error('Error fetching unread messages count:', error)
    } finally {
      setLoading(false)
    }
  }

  return { unreadCount, loading, refetch: fetchUnreadCount }
}
