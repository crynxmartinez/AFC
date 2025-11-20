import { Sun, Moon } from 'lucide-react'
import { useThemeStore } from '@/stores/themeStore'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg bg-surface hover:bg-border transition-all duration-200 group"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      aria-label="Toggle theme"
    >
      {/* Sun Icon (Light Mode) */}
      <Sun
        className={`w-5 h-5 text-primary transition-all duration-300 ${
          theme === 'light'
            ? 'rotate-0 scale-100 opacity-100'
            : 'rotate-90 scale-0 opacity-0 absolute inset-0 m-auto'
        }`}
      />
      
      {/* Moon Icon (Dark Mode) */}
      <Moon
        className={`w-5 h-5 text-text-primary transition-all duration-300 ${
          theme === 'dark'
            ? 'rotate-0 scale-100 opacity-100'
            : '-rotate-90 scale-0 opacity-0 absolute inset-0 m-auto'
        }`}
      />
    </button>
  )
}
