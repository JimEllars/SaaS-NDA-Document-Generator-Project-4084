import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    historyApiFallback: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  esbuild: {
    drop: ['debugger'],
    pure: ['console.log', 'console.info', 'console.debug', 'console.trace'],
  },
});