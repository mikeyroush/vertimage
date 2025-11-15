import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-slider', '@radix-ui/react-label'],
          'algorithms': ['./src/domain/algorithms'],
        },
      },
    },
    target: 'es2020',
    minify: 'terser',
    sourcemap: false,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand'],
  },
})