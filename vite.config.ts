import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Optional HMR client port for proxied environments (e.g., IDE browser preview)
const hmrClientPort = (() => {
  const raw = (globalThis as any)?.process?.env?.VITE_HMR_CLIENT_PORT
  return raw ? Number(raw) : undefined
})()

export default defineConfig({
  plugins: [vue()],
  base: '/',
  assetsInclude: ['**/*.png'],
  server: {
    host: '127.0.0.1',
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization',
    },
    hmr: {
      host: '127.0.0.1',
      clientPort: hmrClientPort || 24678,
      port: 24678,
      protocol: 'ws',
      overlay: false,
    },
    sourcemap: true,
  },
  preview: {
    host: '127.0.0.1',
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization',
    },
  },
  build: {
    sourcemap: true,
  },
})
