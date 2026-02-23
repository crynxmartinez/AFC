import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - split large dependencies
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['lucide-react', 'zustand'],
          // Feature chunks
          'admin': [
            './src/pages/admin/AdminDashboard.tsx',
            './src/pages/admin/AdminContests.tsx',
            './src/pages/admin/AdminReviews.tsx',
            './src/pages/admin/AdminUsers.tsx',
            './src/pages/admin/AdminXPSystem.tsx',
            './src/pages/admin/AdminCreateContest.tsx',
            './src/pages/admin/AdminEditContest.tsx',
            './src/pages/admin/AdminFinalizeContest.tsx',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
