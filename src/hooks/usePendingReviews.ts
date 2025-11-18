import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

export function usePendingReviews() {
  const { profile } = useAuthStore()
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchPendingCount()
      
      // Set up real-time subscription
      const channel = supabase
        .channel('pending-reviews')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'entries',
            filter: 'status=eq.pending_review'
          },
          () => {
            fetchPendingCount()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [profile?.role])

  const fetchPendingCount = async () => {
    try {
      const { count, error } = await supabase
        .from('entries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending_review')

      if (error) throw error
      setPendingCount(count || 0)
    } catch (error) {
      console.error('Error fetching pending count:', error)
    } finally {
      setLoading(false)
    }
  }

  return { pendingCount, loading }
}
