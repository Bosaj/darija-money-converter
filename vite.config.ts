import { defineConfig, type Plugin } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

/** Serve api/*.ts Vercel Functions during `npm run dev`. */
function devApi(): Plugin {
  return {
    name: 'dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const m = /^\/api\/([a-z-]+)(\?.*)?$/.exec(req.url ?? '')
        if (!m) return next()
        try {
          const mod = (await server.ssrLoadModule(`/api/${m[1]}.ts`)) as Record<string, (r: Request) => Promise<Response> | Response>
          const handler = mod[req.method ?? 'GET']
          if (!handler) return next()
          const response = await handler(new Request(`http://${req.headers.host}${req.url}`, { method: req.method }))
          res.statusCode = response.status
          response.headers.forEach((v, k) => res.setHeader(k, v))
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (err) {
          next(err)
        }
      })
    },
  }
}

/** Preload Readex Pro (Arabic + Latin) so the header doesn't reflow when the web font arrives. */
function preloadFonts(): Plugin {
  return {
    name: 'preload-fonts',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const fonts = Object.keys(ctx.bundle ?? {}).filter((f) => /readex-pro-(arabic|latin)-wght-normal-[\w-]+\.woff2$/.test(f))
        return { html, tags: fonts.map((f) => ({ tag: 'link', attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `/${f}`, crossorigin: '' }, injectTo: 'head' as const })) }
      },
    },
  }
}

export default defineConfig({
  plugins: [
    devApi(),
    preloadFonts(),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      pwaAssets: { config: true },
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Chhal? — Darija Money Converter',
        short_name: 'Chhal?',
        description: 'Convert Moroccan money slang (rial, santim, million, doro) to Dirham and back. Works offline.',
        lang: 'ar',
        theme_color: '#0f7b5f',
        background_color: '#f7f1e7',
        display: 'standalone',
        start_url: '/',
        categories: ['finance', 'utilities', 'education'],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    css: false,
  },
})
