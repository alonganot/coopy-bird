import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // New builds silently take over on next load — no manual "update available" prompt to build.
      registerType: 'autoUpdate',
      // Not enabled in dev: a caching service worker fighting Vite's hot-reload is a well-known
      // source of confusing dev bugs, so it only runs in production builds/preview/deployed.
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'icon-source.svg'],
      manifest: {
        name: 'Coopy Bird',
        short_name: 'Coopy Bird',
        description: 'A neon arcade jump-and-dodge game',
        theme_color: '#010818',
        background_color: '#010818',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      // Only precache the built app shell (JS/CSS/HTML/icons) — deliberately no runtimeCaching
      // rules for the API/WS origin, so login/save/leaderboard requests always hit the network
      // fresh, never a stale cache.
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
      },
    }),
  ],
  test: {
    environment: 'node',
  },
});
