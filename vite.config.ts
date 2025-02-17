import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config();

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@stripe/react-stripe-js': resolve(__dirname, 'node_modules/@stripe/react-stripe-js'),
      '@stripe/stripe-js': resolve(__dirname, 'node_modules/@stripe/stripe-js'),
      'axios': resolve(__dirname, 'node_modules/axios'),
    },
  },
  optimizeDeps: {
    include: ['@stripe/stripe-js', '@stripe/react-stripe-js', 'axios'],
    exclude: ['lucide-react']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          stripe: ['@stripe/stripe-js', '@stripe/react-stripe-js'],
          vendor: ['react', 'react-dom', 'react-router-dom', 'axios']
        }
      }
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  },
  server: {
    port: 5173,
    strictPort: false, // Allow fallback to another port if 5173 is in use
    host: '127.0.0.1', // Listen only on localhost
    cors: true, // Enable CORS
    hmr: {
      host: 'localhost',
      protocol: 'ws',
    },
    watch: {
      usePolling: true, // Enable polling for file changes
    },
    open: true, // Automatically open browser
  },
});