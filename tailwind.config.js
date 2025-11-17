/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        surface: '#1a1a1a',
        border: '#2a2a2a',
        'text-primary': '#ffffff',
        'text-secondary': '#a3a3a3',
        primary: {
          DEFAULT: '#ff6b35',
          hover: '#ff8555',
        },
        secondary: '#4ecdc4',
        success: '#06d6a0',
        warning: '#ffd23f',
        error: '#ef476f',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
