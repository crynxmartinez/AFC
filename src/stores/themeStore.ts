import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

type ThemeStore = {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'dark', // Default theme
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'dark' ? 'light' : 'dark'
          // Update document class
          if (typeof window !== 'undefined') {
            document.documentElement.classList.remove('dark', 'light')
            document.documentElement.classList.add(newTheme)
          }
          return { theme: newTheme }
        }),
      setTheme: (theme) =>
        set(() => {
          // Update document class
          if (typeof window !== 'undefined') {
            document.documentElement.classList.remove('dark', 'light')
            document.documentElement.classList.add(theme)
          }
          return { theme }
        }),
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        // Apply theme on load
        if (state && typeof window !== 'undefined') {
          document.documentElement.classList.add(state.theme)
        }
      },
    }
  )
)

// Initialize theme on first load
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('theme-storage')
  if (stored) {
    try {
      const { state } = JSON.parse(stored)
      document.documentElement.classList.add(state.theme)
    } catch (e) {
      // If no stored theme, check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.add(prefersDark ? 'dark' : 'light')
    }
  } else {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.classList.add(prefersDark ? 'dark' : 'light')
  }
}
