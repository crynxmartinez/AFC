import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

export function useContactMessages() {
  const { profile } = useAuthStore()
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchUnreadCount()
      
      // Set up real-time subscription for new messages
      const channel = supabase
        .channel('contact-messages')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'contact_submissions'
          },
          () => {
            fetchUnreadCount()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [profile?.role])

  const fetchUnreadCount = async () => {
    try {
      const { count, error } = await supabase
        .from('contact_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new')

      if (error) throw error
      setUnreadCount(count || 0)
    } catch (error) {
      console.error('Error fetching unread messages count:', error)
    } finally {
      setLoading(false)
    }
  }

  return { unreadCount, loading, refetch: fetchUnreadCount }
}
