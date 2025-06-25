import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Allow the dev server to be reachable from other devices on the local network
  // `host: true` is shorthand for "0.0.0.0".
  server: {
    host: true,
  },
})
