import { fileURLToPath, URL } from 'node:url'
import { templateCompilerOptions } from '@tresjs/core'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const isDev = process.env.NODE_ENV !== 'production'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      ...templateCompilerOptions
    }),
    ...(isDev ? [(await import('vite-plugin-vue-devtools')).default()] : [])
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  base: '',
  build: {
    outDir: '../api/www'
  },
  server: {
    port: 8080
  },
  optimizeDeps: {
    include: ['three', '@tresjs/core']
  },
})
