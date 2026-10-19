import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), svgr({
    include: "**/*.svg?react"
  })],
  base: '/ego-portfolio/',
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      // v2 takes over the root URL; v1 is archived under /v1/
      input: {
        v2: 'index.html',
        v1: 'v1/index.html',
      }
    }
  }
})
