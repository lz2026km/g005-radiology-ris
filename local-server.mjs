// 本地 HTTP 服务器 - 服务 dist 目录
// 用法: node local-server.mjs
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 5199;
const ROOT = path.resolve('dist');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];

  // 处理 basename 前缀 /g005-radiology-ris/
  const PREFIX = '/g005-radiology-ris';
  if (urlPath.startsWith(PREFIX + '/')) urlPath = urlPath.slice(PREFIX.length);
  else if (urlPath === PREFIX) urlPath = '/';

  // 默认 index.html
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(ROOT, urlPath);

  // 安全检查
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA fallback: 所有未匹配路径返回 index.html
      const indexPath = path.join(ROOT, 'index.html');
      fs.readFile(indexPath, (err2, data2) => {
        if (err2) {
          res.writeHead(404);
          res.end('Not Found');
          return;
        }
        res.writeHead(200, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-cache' });
        res.end(data2);
      });
      return;
    }
    const ext = path.extname(filePath);
    const ct = MIME[ext] || 'application/octet-stream';
    const cache = ext === '.html' ? 'no-cache' : 'public, max-age=60';
    res.writeHead(200, { 'Content-Type': ct, 'Cache-Control': cache });
    res.end(data);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`✅ HTTP 服务器已启动: http://127.0.0.1:${PORT}/g005-radiology-ris/`);
  console.log(`   测试登录页: http://127.0.0.1:${PORT}/g005-radiology-ris/login`);
});

export default server;
