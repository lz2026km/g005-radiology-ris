// Simple static file server for dist/
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 5196;
const ROOT = new URL('./dist', import.meta.url).pathname;

http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  // 处理 /g005-radiology-ris/ 前缀
  const PREFIX = '/g005-radiology-ris';
  if (urlPath.startsWith(PREFIX + '/')) urlPath = urlPath.slice(PREFIX.length);
  else if (urlPath === PREFIX) urlPath = '';
  let filePath = path.join(ROOT, urlPath);
  if (filePath.endsWith('/') || !path.extname(filePath)) filePath = path.join(filePath, 'index.html');
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end(); return; }
    const ext = path.extname(filePath);
    const ct = { '.js': 'application/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' }[ext] || 'text/plain';
    res.writeHead(200, { 'Content-Type': ct, 'Cache-Control': 'no-cache' });
    res.end(data);
  });
}).listen(PORT, '127.0.0.1', () => console.log(`Server: http://127.0.0.1:${PORT}/`));