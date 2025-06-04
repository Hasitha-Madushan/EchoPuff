import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000', 
      '/songs': 'http://localhost:5000',
      '/top10Songs': 'http://localhost:5000',
      '/signup': 'http://localhost:5000',
      '/register': 'http://localhost:5000',
      '/login': 'http://localhost:5000',// Proxy API requests to the backend
     '/playlists':'http://localhost:5000',
    },
  },
})
