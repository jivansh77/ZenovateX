import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true
      },
      protocolImports: false,
    })
  ],
  resolve: {
    alias: {
      'twitter-api-v2/dist/esm/client-mixins/request-handler.helper.js': path.resolve(__dirname, 'src/utils/request-handler.helper.js')
    }
  }
})