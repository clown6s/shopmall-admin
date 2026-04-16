import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['@mui/icons-material'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:7000',
        changeOrigin: true,
      },
    },
  },
})
