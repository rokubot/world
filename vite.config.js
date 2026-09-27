import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist'
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': 'https://rokubot.com',
      '/socket.io': { target: 'https://rokubot.com', ws: true }
    }
  }
})
