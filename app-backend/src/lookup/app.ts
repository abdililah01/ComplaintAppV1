// file : app-backend /src/lookup/app.ts
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

// Security & parsing middlewares
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
  })
);

// Request-ID + logging
app.use((req: Request & { id?: string }, _res: Response, next: NextFunction) => {
  (req as any).id = randomUUID();
  logger.info({ id: (req as any).id, method: req.method, url: req.url }, 'Incoming request');
  next();
});

// Healthcheck
app.get('/healthz', (_req: Request, res: Response) => res.json({ status: 'ok' }));

// Mount lookup routes
app.use('/lookups', lookupRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// Error handler
app.use(
  (err: Error & { status?: number }, req: Request & { id?: string }, res: Response, _next: NextFunction) => {
    logger.error({ id: (req as any).id, error: err.message, stack: err.stack }, 'Unhandled error');
    const statusCode = err.status && typeof err.status === 'number' ? err.status : 500;
    res.status(statusCode).json({ error: err.message || 'Internal server error' });
  }
);

export default app;
