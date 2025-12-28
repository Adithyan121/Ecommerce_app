import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo.png', 'masked-icon.svg'],
      manifest: {
        name: 'Warehouse Stock Manager',
        short_name: 'Warehouse',
        description: 'Mobile Warehouse Management System',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'logo_192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo_512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
