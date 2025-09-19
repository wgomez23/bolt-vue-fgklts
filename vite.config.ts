import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Optional HMR client port for proxied environments (e.g., IDE browser preview)
// Uses globalThis to avoid requiring Node typings in this TS file.
const hmrClientPort = (() => {
  const raw = (globalThis as any)?.process?.env?.VITE_HMR_CLIENT_PORT
  return raw ? Number(raw) : undefined
})()

export default defineConfig({
  plugins: [vue()],
  // Use root base so built assets resolve from '/'.
  // Relative base ('./') can break on hard refreshes at nested routes like '/natpaper'.
  base: '/',
  assetsInclude: ['**/*.png'],
  // Improve HMR reliability when running behind reverse proxies (e.g., IDE browser preview)
  // and reduce noisy overlay logs from transient WebSocket issues.
  server: {
    host: '127.0.0.1',
    // Keep default port selection, but allow HMR to pick up a proxy clientPort via env if provided
    hmr: {
      host: '127.0.0.1',
      // If you launch the preview behind a proxy with a different external port, set VITE_HMR_CLIENT_PORT
      // e.g., VITE_HMR_CLIENT_PORT=56633 npm run dev
      clientPort: hmrClientPort,
      overlay: false,
    },
  },
  // Apply host for vite preview as well (no HMR options available here)
  preview: {
    host: '127.0.0.1',
  },
})