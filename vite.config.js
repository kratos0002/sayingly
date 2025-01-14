import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {}, // Ensure `process.env` compatibility
  },
  base: '/',
  server: {
    historyApiFallback: true,
  },
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          maps: ['mapbox-gl', 'react-map-gl'],
          icons: ['react-icons'],
          components: [
            './src/components/common/ContentCard',
            './src/components/AllIdioms'
          ]
        }
      }
    },
    sourcemap: true
  },
})
