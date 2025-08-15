import jwt, { SignOptions, Algorithm } from 'jsonwebtoken';
import crypto from 'crypto';

const SECRET = process.env.AUTH_JWT_SECRET || 'dev-secret';
const ACCESS_TTL = process.env.AUTH_ACCESS_TTL || '15m';

/** Convert "15m", "1h", "30s", "2d" (or a number-like string) → seconds */
function parseTtlToSeconds(ttl: string): number {
  const m = ttl.match(/^(\d+)([smhd])$/i);
  if (m) {
    const n = parseInt(m[1], 10);
    const unit = m[2].toLowerCase();
    const mult: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    return n * mult[unit];
  }
  const n = Number(ttl);
  return Number.isFinite(n) ? n : 900; // default 15 min if bad input
}

export type AccessClaims = {
  sub: string;   // hashed device id
  jti: string;   // session id (use in SessionId columns)
  did: string;   // raw installId from app
  scope: string[];
  iat?: number; exp?: number;
};

export function signAccessToken(
  did: string,
  scope: string[] = ['complaint:create', 'file:upload']
) {
  const jti = crypto.randomUUID();
  const sub = crypto.createHash('sha256').update(did).digest('hex');

  const opts: SignOptions = {
    algorithm: 'HS512' as Algorithm,
    expiresIn: parseTtlToSeconds(ACCESS_TTL), // number → TS happy
  };

  const payload: AccessClaims = { sub, jti, did, scope };
  const token = jwt.sign(payload, SECRET, opts);
  return { token, jti };
}

export function verifyAccessToken(token: string): AccessClaims {
  return jwt.verify(token, SECRET, { algorithms: ['HS512'] }) as AccessClaims;
}
