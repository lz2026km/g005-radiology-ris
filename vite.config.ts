import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

const VERSION = '0.5.0'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'version-stamp',
      apply: 'build',
      writeBundle() {
        const htmlPath = 'dist/index.html'
        let html = fs.readFileSync(htmlPath, 'utf-8')
        html = html.replace(/(src|href)="(\/assets\/[^"]+\.js)"/g, `$1="$2?v=${VERSION}"`)
        html = html.replace(/(src|href)="(\/assets\/[^"]+\.css)"/g, `$1="$2?v=${VERSION}"`)
        fs.writeFileSync(htmlPath, html)
        console.log(`✅ Version stamp v${VERSION} applied to index.html`)
      }
    }
  ],
  build: {
    rollupOptions: {
      external: ['dcmjs', 'three', 'puppeteer']
    }
  },
  server: {
    port: 5195,
    host: '0.0.0.0',
  },
})
