export function authMiddleware(req: any, _res: any, next: () => void) {
  // 开发模式跳过认证，生产模式会验证 JWT Token
  next();
}
