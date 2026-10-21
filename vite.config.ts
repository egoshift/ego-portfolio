import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    svgr({ include: '**/*.svg?react' }),
    {
      // Pages serves assets with max-age=600 while preview sends no-cache, so
      // a throttled run here looks worse than the real thing. Match Pages for
      // assets only — caching the HTML as well would pin the browser to a
      // stale bundle and quietly serve old code after a rebuild.
      name: 'pages-like-cache-headers',
      configurePreviewServer(server) {
        server.middlewares.use((req: { url?: string }, res, next) => {
          const path = (req.url ?? '').split('?')[0];
          const cacheable = /\.(png|jpe?g|svg|gif|webp|woff2?|js|css|json)$/.test(path);
          res.setHeader('Cache-Control', cacheable ? 'max-age=600' : 'no-cache');
          next();
        });
      },
    },
  ],
  base: '/ego-portfolio/',
  // Pages serves assets with max-age=600 while preview sends no-cache, which
  // makes a throttled run here look worse than the real thing. This matches
  // Pages for assets only — caching the HTML too would pin the browser to a
  // stale bundle for ten minutes, which is murder on the edit/reload loop.
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
