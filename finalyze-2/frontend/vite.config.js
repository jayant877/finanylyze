import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Any request to /api/* gets forwarded to the backend
    // This means in development you don't need to worry about CORS
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})
