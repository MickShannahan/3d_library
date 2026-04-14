import { fileURLToPath, URL } from 'node:url'
import { templateCompilerOptions } from '@tresjs/core'
import vueDevTools from 'vite-plugin-vue-devtools'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

console.log('vite env', process.env.NODE_ENV)

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    vue({
      ...templateCompilerOptions
    }),
    process.env.NODE_ENV == 'development' ? vueDevTools() : null
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
  }
}))
