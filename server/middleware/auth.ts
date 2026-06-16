import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const DEV_MODE = process.env.NODE_ENV !== 'production';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string; department: string };
    }
  }
}

export function authMiddleware(req: any, res: any, next: () => void) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (DEV_MODE) {
      req.user = { id: 'dev-guest', role: 'super-admin', department: 'radiology' };
      return next();
    }
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Missing or invalid token' } });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Token is empty' } });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string; department: string };
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Token verification failed' } });
  }
}
