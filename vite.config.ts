import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
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
