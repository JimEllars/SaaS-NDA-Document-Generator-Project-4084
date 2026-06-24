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
    target: 'es2022',
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor_react';
            }
            if (id.includes('framer-motion')) {
              return 'vendor_animation';
            }
            if (id.includes('react-icons')) {
              return 'vendor_ui';
            }
            if (id.includes('axios') || id.includes('uuid') || id.includes('date-fns')) return 'vendor_utils';
            return 'vendor_other';
          }
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace']
      }
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/vitest.setup.jsx'],
    globals: true
  }
});
