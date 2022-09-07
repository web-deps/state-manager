import { mergeConfig } from 'vite'
import { defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(viteConfig, defineConfig({
  test: {
    include: ['lib/**/*.{test,spec}.{ts,tsx}'],
    exclude: [...configDefaults.exclude, 'packages/template/*'],
    environment: 'jsdom'
  },
}))
