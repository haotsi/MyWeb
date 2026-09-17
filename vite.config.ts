import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom', 'three'],
  },
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
