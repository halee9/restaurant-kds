import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import browserslist from 'browserslist'
import { browserslistToTargets } from 'lightningcss'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    cssMinify: 'lightningcss',
  },
  css: {
    lightningcss: {
      targets: browserslistToTargets(browserslist('chrome >= 80')),
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
