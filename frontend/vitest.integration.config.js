import { defineConfig, mergeConfig } from 'vite'
import baseConfig from './vite.config'
export default mergeConfig(baseConfig, defineConfig({
  test: { environment: 'jsdom', include: ['tests/*.integration.jsx'] },
}))
