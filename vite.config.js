import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/gp/',
  define: {
    global: 'window',
    'process.env': '{}',
    'process.version': '"v16.0.0"', // 따옴표로 감싸야 정확히 문자열로 치환됩니다.
    'process.versions': '{}',     // node 키를 비워두어 tree-sitter를 속입니다.
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
  build: {
    rollupOptions: {
      output: {
        globals: { 'module': 'undefined' } // 'module' 모듈이 브라우저에서 참조될 때 undefined로 처리
      }
    }
  }
})
