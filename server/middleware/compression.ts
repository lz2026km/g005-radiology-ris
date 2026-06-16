import { gzipSync, deflateSync, brotliCompressSync } from 'zlib';

export function compressionMiddleware(req: any, res: any, next: () => void) {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  const originalSend = res.send.bind(res);
  res.send = function (body: any) {
    if (typeof body !== 'string' && !Buffer.isBuffer(body)) {
      return originalSend(body);
    }
    const buffer = Buffer.isBuffer(body) ? body : Buffer.from(body);
    if (acceptEncoding.includes('br') && buffer.length > 1024) {
      res.setHeader('Content-Encoding', 'br');
      return originalSend(brotliCompressSync(buffer));
    }
    if (acceptEncoding.includes('gzip') && buffer.length > 1024) {
      res.setHeader('Content-Encoding', 'gzip');
      return originalSend(gzipSync(buffer));
    }
    if (acceptEncoding.includes('deflate') && buffer.length > 1024) {
      res.setHeader('Content-Encoding', 'deflate');
      return originalSend(deflateSync(buffer));
    }
    return originalSend(body);
  };
  next();
}
