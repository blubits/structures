import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    viteReact(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@structures': resolve(__dirname, './src/structures'),
      '@components': resolve(__dirname, './src/components'),
      'react': resolve(__dirname, './node_modules/react'),
      'react-dom': resolve(__dirname, './node_modules/react-dom'),
    },
  },
})
