import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// Standalone config (does not reuse vite.config.ts) so dev-only plugins such as
// vue-devtools are not loaded while testing.
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/__tests__/**/*.spec.ts'],
    restoreMocks: true,
    // The default worker pools fail on Node 26 with Vitest 5 ("Cannot read properties of undefined (reading 'config')").
    pool: 'vmThreads',
  },
})
