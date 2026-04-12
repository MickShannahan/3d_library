import { fileURLToPath, URL } from 'node:url'
import { templateCompilerOptions } from '@tresjs/core'
import vueDevTools from 'vite-plugin-vue-devtools'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    vue({
      ...templateCompilerOptions
    }),
    process.env.NODE_ENV == 'dev' ? vueDevTools() : null
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  base: process.env.NODE_ENV == 'dev' ? '' : 'https://normal-library-2df470da57b4.herokuapp.com/',
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
