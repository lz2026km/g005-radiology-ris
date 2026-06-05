# G005 放射RIS系统 v2.1.0 部署文档

> Phase R13 W12: 生产部署指南

## 系统要求

| 组件 | 最低 | 推荐 |
|---|---|---|
| Node.js | 18.0 | 20.x LTS |
| 内存 | 2 GB | 4 GB+ |
| 磁盘 | 500 MB | 5 GB (含 DICOM 缓存) |
| 浏览器 | Chrome 100+ | Chrome 120+ / Edge 120+ |
| 网络 | 100 Mbps | 1 Gbps (P2P 协同) |

## 架构概览

```
┌─────────────────────────────────────────────────────────┐
│  浏览器 (Chrome / Edge)                                  │
│  ├─ React 18 + Vite                                     │
│  ├─ Dexie (IndexedDB)                                   │
│  ├─ Yjs (CRDT) ── WebRTC P2P ──┐                       │
│  ├─ Cornerstone3D (DICOM)       │                       │
│  ├─ Web Crypto (CA)             │                       │
│  └─ DeepSeek API (LLM) ─────────┤                       │
└──────────────┬──────────────────┘                       │
               │ HTTPS                                    │
┌──────────────▼──────────────────┐  ┌─────────────────┐  │
│  Vite Build → 静态资源           │  │  WebRTC Signaling│  │
│  (CDN / Nginx / S3)             │  │  (公共 yjs.dev)  │  │
└──────────────────────────────────┘  └─────────────────┘  │
                                                          │
┌─────────────────────────────────────────────────────────┐│
│  可选: 后端 API (Spring Boot / Go / Python)              ││
│  ├─ 报告持久化 (PostgreSQL)                              ││
│  ├─ 用户认证 (JWT + CA 证书)                             ││
│  ├─ DICOM 存储 (DCM4CHEE / Orthanc)                     ││
│  └─ LLM 代理 (隐藏 DeepSeek API key)                    ││
└─────────────────────────────────────────────────────────┘│
```

## 部署方式

### 方式 1: 静态部署 (推荐，零依赖)

```bash
# 1. 安装依赖
npm ci

# 2. 类型检查 + 构建
npm run build

# 3. 产物在 dist/ 目录，可部署到任何静态托管
#    - Nginx
#    - Apache
#    - AWS S3 + CloudFront
#    - Azure Static Web Apps
#    - Vercel / Netlify
```

#### Nginx 配置示例

```nginx
server {
  listen 80;
  server_name ris.example.com;
  root /var/www/g005/dist;
  index index.html;

  # SPA 路由 fallback
  location / {
    try_files $uri $uri/ /index.html;
  }

  # 静态资源缓存
  location ~* \.(js|css|png|svg|woff2?)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
  }

  # Gzip
  gzip on;
  gzip_types text/css application/javascript application/json;
  gzip_min_length 1024;

  # 安全头
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

#### Apache 配置示例

```apache
<VirtualHost *:80>
  ServerName ris.example.com
  DocumentRoot /var/www/g005/dist

  <Directory /var/www/g005/dist>
    Options -Indexes +FollowSymLinks
    AllowOverride All
    Require all granted
  </Directory>

  # SPA fallback
  RewriteEngine On
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</VirtualHost>
```

### 方式 2: Docker 部署

#### Dockerfile

```dockerfile
# 多阶段构建
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 运行阶段
FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/ >/dev/null
```

#### docker-compose.yml

```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
    environment:
      - TZ=Asia/Shanghai
    volumes:
      - ./logs/nginx:/var/log/nginx
```

```bash
# 构建并运行
docker compose up -d
docker compose logs -f
```

### 方式 3: Vercel / Netlify 一键部署

#### Vercel (`vercel.json`)

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
```

```bash
npm i -g vercel
vercel --prod
```

#### Netlify (`netlify.toml`)

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 环境变量

| 变量 | 必需 | 默认 | 说明 |
|---|---|---|---|
| `VITE_DEEPSEEK_API_KEY` | 否 | demo | DeepSeek API 密钥 |
| `VITE_DEEPSEEK_BASE_URL` | 否 | `https://api.deepseek.com/v1` | DeepSeek API 端点 |
| `VITE_DEEPSEEK_MODEL` | 否 | `deepseek-chat` | 文本模型 |
| `VITE_DEEPSEEK_VISION_MODEL` | 否 | `deepseek-vl-7b` | 视觉模型 |
| `VITE_DEEPSEEK_STREAM` | 否 | `true` | 流式响应 |
| `VITE_DEEPSEEK_MAX_TOKENS` | 否 | `2048` | 最大 token |
| `VITE_DEEPSEEK_TEMPERATURE` | 否 | `0.3` | 温度 |
| `VITE_API_BASE_URL` | 否 | `/api` | 后端 API 基础 URL |
| `VITE_USE_MSW` | 否 | `false` | 开发用 MSW Mock |
| `VITE_SIGNALING_URLS` | 否 | (公共) | y-webrtc 信令服务器 |

### .env.production 示例

```env
VITE_DEEPSEEK_API_KEY=sk-prod-xxxxxxxxxxxxx
VITE_DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
VITE_API_BASE_URL=https://api.g005.hospital/v2
VITE_USE_MSW=false
```

⚠️ **安全提示**:
- 生产环境**不要**在前端暴露真实的 DeepSeek API key
- 应当在后端代理 LLM 请求，前端仅调用自有 API
- CA 私钥应存储在浏览器 IndexedDB 而非 localStorage

## 监控与日志

### 前端错误监控

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';
if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: 'production',
    release: import.meta.env.VITE_GIT_SHA,
    tracesSampleRate: 0.1,
  });
}
```

### 性能指标

- LCP (Largest Contentful Paint) < 2.5s
- FID (First Input Delay) < 100ms
- CLS (Cumulative Layout Shift) < 0.1
- TTI (Time to Interactive) < 3s

## 备份与恢复

### 用户数据 (IndexedDB)

```javascript
// 导出
import Dexie from 'dexie';
const db = new Dexie('g005-radiology-ris');
const data = await db.tables.reduce(async (acc, t) => {
  acc[t.name] = await t.toArray();
  return acc;
}, {});
const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
// 下载 blob
```

### 协同房间 (Yjs state)

```javascript
import * as Y from 'yjs';
const state = Y.encodeStateAsUpdate(ydoc);
// 存储到 localStorage / IndexedDB / 后端
```

## 升级流程

```bash
# 1. 备份当前数据
./scripts/backup.sh

# 2. 拉取新版本
git pull origin main

# 3. 安装新依赖
npm ci

# 4. 数据库迁移 (如有)
npm run migrate

# 5. 重新构建
npm run build

# 6. 滚动部署
./scripts/deploy.sh
```

## 故障排查

| 问题 | 解决方案 |
|---|---|
| 影像无法加载 | 检查 CORS / 验证 DICOMweb 端点 |
| 协同无法连接 | 检查 WebRTC 信令服务器可达性 |
| LLM 无响应 | 验证 API key + 检查网络代理 |
| CA 签名失败 | 检查 Web Crypto API 支持 + 私钥存在 |
| 性能慢 | 启用 HTTP/2 + Brotli 压缩 + CDN |
| 移动端崩溃 | 减小切片缓存 + 降低 3D 渲染精度 |

## 安全清单

- [x] HTTPS 强制 (HSTS)
- [x] CSP 头 (`script-src 'self'`)
- [x] API key 通过后端代理（生产）
- [x] CA 私钥加密存储 (IndexedDB + 密码)
- [x] 审计链不可篡改 (Merkle 根 + 签名)
- [x] 用户会话超时 (30 分钟)
- [x] 危急值必通知 (CA 签名 + 多通道)
- [x] 影像 PHI 脱敏（外发）
- [x] 定期密钥轮换 (CA 1 年)

## 联系

- 工程: eng@g005.hospital
- 安全: security@g005.hospital
- 文档: https://wiki.g005.hospital
