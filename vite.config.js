import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/gp/',
  define: {
    global: 'window',
    process: {
      env: { NODE_ENV: 'production' },
      version: 'v16.0.0',
      versions: {},
      platform: 'browser'
    }
  },
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
      stream: 'stream-browserify', // Add alias for stream module

    },
  },
  optimizeDeps: {
    exclude: ['web-tree-sitter']
  },
})
