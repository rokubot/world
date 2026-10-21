import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist'
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'https://api.rokubot.com',
        changeOrigin: true
      }
    }
  }
})
