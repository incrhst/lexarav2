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
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['@stripe/stripe-js']
  },
  build: {
    rollupOptions: {
      external: ['@stripe/react-stripe-js', '@stripe/stripe-js', 'axios'],
      output: {
        globals: {
          '@stripe/react-stripe-js': 'ReactStripe',
          '@stripe/stripe-js': 'Stripe',
          'axios': 'axios'
        },
        paths: {
          '@stripe/react-stripe-js': 'https://cdn.jsdelivr.net/npm/@stripe/react-stripe-js@2.4.0/dist/react-stripe.umd.min.js',
          '@stripe/stripe-js': 'https://cdn.jsdelivr.net/npm/@stripe/stripe-js@2.4.0/dist/stripe.min.js'
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