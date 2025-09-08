import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // Use root base so built assets resolve from '/'.
  // Relative base ('./') can break on hard refreshes at nested routes like '/natpaper'.
  base: '/',
  assetsInclude: ['**/*.png']
})