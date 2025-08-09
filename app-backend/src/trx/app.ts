
// FILE : app-backend/src/trx/app.ts
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import complaintRoutes from './routes/complaints.routes';

const app = express();

// Security middlewares
app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }));
app.use(cors({ origin: true }));
app.use(express.json({ limit: '2mb' }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Health check
app.get('/healthz', (_req: Request, res: Response) => res.json({ ok: true }));

// Static uploads (e.g. GET /uploads/p1.png)
app.use(
  '/uploads',
  express.static(path.join(__dirname, '../../uploads'), {
    setHeaders(res) {
      res.setHeader('Cache-Control', 'private, max-age=3600');
    },
  })
);

// Mount your complaint routes
app.use('/api/v1', complaintRoutes);

// Global error handler
app.use(
  (err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
);

export default app;
