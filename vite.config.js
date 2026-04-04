import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  base: '/tonarium/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,vue}'],
      exclude: ['src/**/*.test.js']
    }
  }
})
