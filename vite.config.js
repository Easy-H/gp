import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/gp/',
  define: {
    'global': 'window',
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': '({ NODE_ENV: "production" })',
    'process.platform': '"browser"',
    'process.version': '"v16.0.0"',
    'process.versions': '{}',
    'process.browser': 'true',
    // 전역 변수 'process' 자체를 참조하는 코드를 위한 catch-all 설정
    'process': '({ env: { NODE_ENV: "production" }, platform: "browser", version: "v16.0.0", versions: {}, browser: true })'
  },
  resolve: {
    alias: {
      process: 'process/browser',
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
    },
  },
  optimizeDeps: {
    exclude: ['web-tree-sitter']
  },
})
