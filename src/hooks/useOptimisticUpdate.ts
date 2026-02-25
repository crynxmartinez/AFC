import { useState, useCallback } from 'react'

/**
 * Custom hook for optimistic UI updates
 * Updates UI immediately, then syncs with server
 */
export function useOptimisticUpdate<T>(
  initialValue: T,
  updateFunction: (value: T) => Promise<any>
) {
  const [value, setValue] = useState<T>(initialValue)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = useCallback(
    async (newValue: T) => {
      // Store previous value for rollback
      const previousValue = value

      // Optimistically update UI
      setValue(newValue)
      setIsUpdating(true)
      setError(null)

      try {
        // Sync with server
        await updateFunction(newValue)
        setIsUpdating(false)
      } catch (err: any) {
        // Rollback on error
        setValue(previousValue)
        setError(err.message || 'Update failed')
        setIsUpdating(false)
      }
    },
    [value, updateFunction]
  )

  const reset = useCallback(() => {
    setValue(initialValue)
    setError(null)
    setIsUpdating(false)
  }, [initialValue])

  return {
    value,
    setValue,
    update,
    reset,
    isUpdating,
    error,
  }
}
