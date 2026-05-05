import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

const VERSION = '0.16.0'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'version-stamp',
      apply: 'build',
      writeBundle() {
        // Rewrite index.html to add version query param to all JS files
        const htmlPath = 'dist/index.html'
        let html = fs.readFileSync(htmlPath, 'utf-8')
        html = html.replace(/(src|href)="(\/assets\/[^"]+\.js)"/g, `$1="$2?v=${VERSION}"`)
        html = html.replace(/(src|href)="(\/assets\/[^"]+\.css)"/g, `$1="$2?v=${VERSION}"`)
        fs.writeFileSync(htmlPath, html)
        console.log(`✅ Version stamp v${VERSION} applied to index.html`)
      }
    }
  ],
  server: {
    port: 5195,
    host: '0.0.0.0',
  },
})
