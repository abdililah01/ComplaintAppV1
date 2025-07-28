// Fichier: /app-backend/src/lookup/app.ts (FINAL & LINT-PERFECT)

import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import pino from 'pino';
import { randomUUID } from 'crypto';
import lookupRoutes from './routes';

const logger = pino({ level: process.env.NODE_ENV === 'production' ? 'info' : 'debug' });
const app = express();

app.set('trust proxy', 1);

// Middlewares
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({ windowMs: 60_000, max: 300 });
app.use(limiter);

app.use((req: Request, _res: Response, next: NextFunction) => {
  req.id = randomUUID();
  logger.info({ id: req.id, method: req.method, url: req.url }, 'Incoming request');
  next();
});

// Healthcheck
app.get('/healthz', (_req: Request, res: Response) => res.json({ status: 'ok' }));

// Routes
app.use('/lookups', lookupRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// Error Handler
app.use((err: Error, req: Request, res: Response) => {
  logger.error({ id: req.id, error: err?.message, stack: err?.stack }, 'Unhandled error');

  // Safe way to check for status property on error object
  const statusCode = 'status' in err && typeof err.status === 'number' ? err.status : 500;

  res.status(statusCode).json({ error: err?.message || 'Internal error' });
});

export default app;