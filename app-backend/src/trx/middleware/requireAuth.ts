import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../auth/jwt';

const DISABLED = String(process.env.AUTH_DISABLED || 'false').toLowerCase() === 'true';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (DISABLED) return next();

  const h = req.header('Authorization') || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  if (!m) return res.status(401).json({ error: 'NO_TOKEN' });

  try {
    (req as any).auth = verifyAccessToken(m[1]);
    next();
  } catch {
    res.status(401).json({ error: 'BAD_TOKEN' });
  }
}
