// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync('ssl/privatekey.pem'),
      cert: fs.readFileSync('ssl/certificate.pem'),
    },
    port: 5173
  }
})
