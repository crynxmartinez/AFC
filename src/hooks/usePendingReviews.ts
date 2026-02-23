import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'

export function usePendingReviews() {
  const { profile } = useAuthStore()
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchPendingCount()
      
      // Poll every 60 seconds for updates
      const interval = setInterval(() => {
        fetchPendingCount()
      }, 60000)

      // Listen for manual updates from AdminReviews page
      const handleUpdate = () => fetchPendingCount()
      window.addEventListener('pending-reviews-updated', handleUpdate)

      return () => {
        clearInterval(interval)
        window.removeEventListener('pending-reviews-updated', handleUpdate)
      }
    }
  }, [profile?.role])

  const fetchPendingCount = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/entries?status=pending`, {
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Failed to fetch pending count')

      const data = await response.json()
      setPendingCount(data.entries?.length || 0)
    } catch (error) {
      console.error('Error fetching pending count:', error)
    } finally {
      setLoading(false)
    }
  }

  return { pendingCount, loading }
}
