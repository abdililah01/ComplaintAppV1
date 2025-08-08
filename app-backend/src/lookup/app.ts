import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import pino from 'pino';
import { randomUUID } from 'crypto';
import lookupRoutes from './routes';

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
});

const app = express();
app.set('trust proxy', 1);

/* ── security & parsing ────────────────────────────────────────────────── */
app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }));
app.use(cors({ origin: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(
  rateLimit({
    windowMs: 60_000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

/* ── request-ID + structured logging ───────────────────────────────────── */
app.use((req: Request & { id?: string }, _res: Response, next: NextFunction) => {
  req.id = randomUUID();
  logger.info({ id: req.id, method: req.method, url: req.url }, 'Incoming request');
  next();
});

/* ── health ────────────────────────────────────────────────────────────── */
app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));

/* ── business routes ───────────────────────────────────────────────────── */
app.use('/lookups', lookupRoutes);

/* ── 404 ───────────────────────────────────────────────────────────────── */
app.use((req, res) => res.status(404).json({ error: 'Not found', path: req.path }));

/* ── error trap ────────────────────────────────────────────────────────── */
app.use(
  (err: Error & { status?: number }, req: Request & { id?: string }, res: Response, _next: NextFunction) => {
    logger.error({ id: req.id, error: err.message, stack: err.stack }, 'Unhandled error');
    res.status(err.status && typeof err.status === 'number' ? err.status : 500).json({
      error: err.message || 'Internal server error',
    });
  },
);

export default app;
