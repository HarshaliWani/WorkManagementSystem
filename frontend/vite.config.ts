import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Base URL for production deployment (change if deploying to subdirectory)
  base: '/',
  
  // Build optimizations for production
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable source maps in production for smaller bundle size
    minify: 'esbuild', // Use esbuild (faster, built-in) for minification
    rollupOptions: {
      output: {
        // Chunk splitting strategy for better caching
        manualChunks: (id) => {
          // Split vendor chunks for better caching
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('axios')) {
              return 'axios-vendor';
            }
            // Other vendor dependencies
            return 'vendor';
          }
        },
        // Optimize chunk file names with content hashing for cache busting
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const ext = assetInfo.name?.split('.').pop() || 'unknown';
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name || '')) {
            return 'assets/img/[name]-[hash][extname]';
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name || '')) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return `assets/${ext}/[name]-[hash][extname]`;
        },
      },
    },
    // Increase chunk size warning limit (in KB)
    chunkSizeWarningLimit: 1000,
    // Target modern browsers for smaller bundle
    target: 'es2015',
    // Enable CSS code splitting
    cssCodeSplit: true,
  },
  
  // Dependency optimization
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
  },
  
  // Server configuration (for dev)
  server: {
    port: 5173,
    strictPort: false,
  },
  
  // Preview configuration (for testing production build)
  preview: {
    port: 4173,
    strictPort: true,
    host: true, // Allow external connections
  },
});
