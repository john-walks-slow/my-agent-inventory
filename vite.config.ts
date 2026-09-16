import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/my-dsh-inventory/' : './',
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5180,
    allowedHosts: ['.trycloudflare.com'],
  },
  preview: {
    host: '0.0.0.0',
    port: 5180,
    allowedHosts: ['.trycloudflare.com'],
  }
})
