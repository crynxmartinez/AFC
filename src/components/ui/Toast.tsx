import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose: () => void
}

export default function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />
      case 'error':
        return <AlertCircle className="w-5 h-5" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />
      default:
        return <Info className="w-5 h-5" />
    }
  }

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-success/20 border-success text-success'
      case 'error':
        return 'bg-error/20 border-error text-error'
      case 'warning':
        return 'bg-warning/20 border-warning text-warning'
      default:
        return 'bg-primary/20 border-primary text-primary'
    }
  }

  return (
    <div
      className={`
        flex items-center gap-3 
        px-4 py-3 rounded-lg border-2
        shadow-lg backdrop-blur-sm bg-surface/95
        animate-in min-w-[280px] max-w-[400px]
        ${getStyles()}
      `}
      role="alert"
    >
      <div className="flex-shrink-0">{getIcon()}</div>
      <p className="font-medium flex-1">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 ml-2 hover:opacity-70 transition-opacity"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
