import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['clsx', 'tailwind-merge', 'lucide-react', 'framer-motion'],
          pdf: ['html2canvas', 'jspdf', 'html-to-image'],
          utils: ['react-helmet-async', 'react-speech-recognition', 'react-markdown', 'recharts']
        }
      }
    }
  }
})
