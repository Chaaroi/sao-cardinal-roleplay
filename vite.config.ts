import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/wikia-img': {
        target: 'https://static.wikia.nocookie.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/wikia-img/, ''),
        headers: {
          Referer: 'https://swordartonline.fandom.com/',
        },
      },
    },
  },
})
