import { Router } from 'express';
import { z } from 'zod';
import { signAccessToken } from '../auth/jwt';

const r = Router();

/**
 * POST /auth/anon
 * body: { installId: string, platform?: string, model?: string }
 * returns: { accessToken: string, sessionId: string }
 */
r.post('/auth/anon', (req, res) => {
  const { installId } = z.object({ installId: z.string().min(10) }).parse(req.body);
  const { token, jti } = signAccessToken(installId);
  res.status(201).json({ accessToken: token, sessionId: jti });
});

export default r;
