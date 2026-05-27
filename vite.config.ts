import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

const VERSION = '0.23.0'

// Security headers for S10
const SECURITY_HEADERS = {
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

// Content Security Policy
const CSP_HEADER = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

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
    },
    {
      name: 'security-headers',
      apply: 'serve',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Apply security headers to all responses
          Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
            res.setHeader(key, value)
          })
          res.setHeader('Content-Security-Policy', CSP_HEADER)
          next()
        })
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