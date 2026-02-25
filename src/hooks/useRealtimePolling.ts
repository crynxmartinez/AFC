import { useEffect, useRef, useCallback } from 'react'

interface PollingOptions {
  interval?: number // milliseconds
  enabled?: boolean
  onUpdate?: (data: any) => void
}

/**
 * Custom hook for polling-based real-time updates
 * Optimized for Vercel serverless architecture
 */
export function useRealtimePolling(
  fetchFunction: () => Promise<any>,
  options: PollingOptions = {}
) {
  const {
    interval = 5000, // Default: poll every 5 seconds
    enabled = true,
    onUpdate,
  } = options

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  const poll = useCallback(async () => {
    if (!isMountedRef.current || !enabled) return

    try {
      const data = await fetchFunction()
      if (isMountedRef.current && onUpdate) {
        onUpdate(data)
      }
    } catch (error) {
      console.error('Polling error:', error)
    }
  }, [fetchFunction, enabled, onUpdate])

  useEffect(() => {
    isMountedRef.current = true

    if (enabled) {
      // Initial fetch
      poll()

      // Set up polling interval
      intervalRef.current = setInterval(poll, interval)
    }

    return () => {
      isMountedRef.current = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [poll, interval, enabled])

  return { poll }
}
