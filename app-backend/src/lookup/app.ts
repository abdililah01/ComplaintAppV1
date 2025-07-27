// Fichier: /app-backend/src/lookup/app.ts

import express from 'express';
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

app.use((req, _res, next) => {
  (req as any).id = (req as any).id || randomUUID();
  logger.info({ id: (req as any).id, method: req.method, url: req.url }, 'Incoming request');
  next();
});

// Healthcheck
app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/lookups', lookupRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// Error Handler
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ id: (req as any).id, error: err?.message, stack: err?.stack }, 'Unhandled error');
  res.status(err?.status || 500).json({ error: err?.message || 'Internal error' });
});

export default app; // Exporte l'instance d'Express pour les tests