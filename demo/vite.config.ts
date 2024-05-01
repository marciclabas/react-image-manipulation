import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
  ],
  base: '/react-image-manipulation/', // change if you're deploying to github pages
  build: {
    rollupOptions: {
      external: ['fabric'], // to import a package from a CDN (no need for <rel> or anything else)
      output: {
        paths: {
          fabric: 'https://cdn.jsdelivr.net/npm/fabric@5.3.0/+esm'
        }
      },
    },
  }
})
