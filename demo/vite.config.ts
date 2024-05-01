import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
// import { visualizer } from 'rollup-plugin-visualizer'
// import mkcert from 'vite-plugin-mkcert'
// import viteCompression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    // visualizer(), // bundle-size-visualizer
    // mkcert(), // self-signed ssl-certificate, stored in ~/.vite-plugig-mkcert/rootCA.pem
    // viteCompression({ algorithm: 'gzip'}), viteCompression({ algorithm: 'brotliCompress' }), // Azure SWA already does that for you, so no need! (check your provider)
  ],
  base: '/react-image-manipulation/', // change if you're deploying to github pages
  resolve: {
    // preserveSymlinks: true // necessary for yarn link to work
  },
  build: {
    rollupOptions: {
      // external: ['fabric'], // to import a package from a CDN (no need for <rel> or anything else)
      // output: {
      //   paths: {
      //     fabric: 'https://cdn.jsdelivr.net/npm/fabric@5.3.0/+esm'
      //   }
    },
  },
})
