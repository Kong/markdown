import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

// @ts-ignore
export default mergeConfig(viteConfig, defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['**/*.spec.ts'],
    exclude: [
      './dist/**',
      './sandbox/**',
      'node_modules',
    ],
    deps: {
      optimizer: {
        web: {
          // https://github.com/vitest-dev/vitest/issues/4074
          exclude: ['vue'],
        },
      },
    },
  },
}))
