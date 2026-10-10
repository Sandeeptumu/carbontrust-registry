import process from 'node:process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
    proxy: Object.fromEntries(
      ['/users', '/projects', '/verifier', '/buyer', '/admin', '/marketplace', '/mrv'].map((prefix) => [prefix, {
        target: process.env.API_PROXY_TARGET || 'http://localhost:8080',
        // Client routes overlap API paths. Browser navigations need the SPA shell;
        // fetch requests use Accept: application/json and still reach Spring Boot.
        bypass(request) {
          if (request.headers.accept?.includes('text/html')) return '/index.html'
        },
      }]),
    ),
  },
})
