import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,   // доступно за LAN IP (не тільки localhost)
    port: 5173,   // ← змінити порт тут
  },
})
