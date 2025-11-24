import { create } from 'zustand'
import type { ToastType } from '@/components/ui/Toast'

interface ToastItem {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastStore {
  toasts: ToastItem[]
  addToast: (message: string, type?: ToastType, duration?: number) => void
  removeToast: (id: string) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  
  addToast: (message, type = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substring(7)
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }]
    }))
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id)
    }))
  },
  
  success: (message, duration = 3000) => {
    set((state) => {
      const id = Math.random().toString(36).substring(7)
      return {
        toasts: [...state.toasts, { id, message, type: 'success', duration }]
      }
    })
  },
  
  error: (message, duration = 4000) => {
    set((state) => {
      const id = Math.random().toString(36).substring(7)
      return {
        toasts: [...state.toasts, { id, message, type: 'error', duration }]
      }
    })
  },
  
  info: (message, duration = 3000) => {
    set((state) => {
      const id = Math.random().toString(36).substring(7)
      return {
        toasts: [...state.toasts, { id, message, type: 'info', duration }]
      }
    })
  },
  
  warning: (message, duration = 3500) => {
    set((state) => {
      const id = Math.random().toString(36).substring(7)
      return {
        toasts: [...state.toasts, { id, message, type: 'warning', duration }]
      }
    })
  }
}))
