import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          motion: ['framer-motion'],
          icons: ['lucide-react'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // All API routes consumed by the frontend are forwarded to the
      // Spring Boot backend during development. If you run the backend
      // on a different port, update the target below (or set VITE_API_URL
      // to an absolute URL and keep the proxy untouched).
      '/users': 'http://localhost:8080',
      '/projects': 'http://localhost:8080',
      '/verifier': 'http://localhost:8080',
      '/buyer': 'http://localhost:8080',
      '/admin': 'http://localhost:8080',
      '/marketplace': 'http://localhost:8080',
    },
  },
})
