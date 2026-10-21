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
  // GitHub Pages serves these with max-age=600. Vite's preview server
  // otherwise sends no-cache, which makes every CSS mask re-request its image
  // and looks like assets loading late when throttled.
  preview: {
    headers: { 'Cache-Control': 'max-age=600' },
  },
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
