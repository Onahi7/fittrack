import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/' : './', // Use absolute path for production, relative for Capacitor
  server: {
    host: "::",
    port: 8080,
    headers: {
      // Fix Cross-Origin-Opener-Policy for Google Sign-In popup
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    minify: 'esbuild',
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          'framer-motion': ['framer-motion']
        }
      }
    }
  },
  esbuild: {
    // Only remove console.log and debugger but keep console.warn for framer-motion
    pure: mode === 'production' ? ['console.log', 'console.debug', 'console.info'] : [],
    drop: mode === 'production' ? ['debugger'] : []
  }
}));
