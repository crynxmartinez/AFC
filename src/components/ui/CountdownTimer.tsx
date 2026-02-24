import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

interface CountdownTimerProps {
  endDate: string
  label?: string
  compact?: boolean
}

export default function CountdownTimer({ endDate, label = 'Time Remaining', compact = false }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [isEnded, setIsEnded] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const end = new Date(endDate).getTime()
      const diff = end - now

      if (diff <= 0) {
        setIsEnded(true)
        setTimeLeft('Ended')
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`)
      } else {
        setTimeLeft(`${seconds}s`)
      }
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [endDate])

  if (compact) {
    return (
      <span className={`font-semibold ${isEnded ? 'text-text-secondary' : 'text-primary'}`}>
        {timeLeft}
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Clock className={`w-4 h-4 ${isEnded ? 'text-text-secondary' : 'text-primary'}`} />
      <div>
        <span className="text-text-secondary text-sm">{label}:</span>
        <span className={`font-semibold ml-2 ${isEnded ? 'text-text-secondary' : 'text-primary'}`}>
          {timeLeft}
        </span>
      </div>
    </div>
  )
}
