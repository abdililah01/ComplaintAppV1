// app-backend/src/trx/app.ts
import path from 'path';
import * as crypto from 'crypto';
import express, {
  type ErrorRequestHandler,
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import type { ServeStaticOptions } from 'serve-static';
import type { ServerResponse } from 'http';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import complaintsRouter from './routes/complaints.routes';

const app = express();

// Trust reverse proxy (prod)
app.set('trust proxy', 1);

// Tiny dependency-free request logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  const id = crypto.randomUUID();
  (req as any).id = id;
  console.log(JSON.stringify({ id, method: req.method, url: req.url }), 'Incoming request');
  next();
});

/* ───────── Security headers (XSS hardening) ───────── */
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'none'"],
      baseUri: ["'none'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
      connectSrc: ["'self'"],
      imgSrc: ["'none'"],
      scriptSrc: ["'none'"],
      styleSrc: ["'none'"],
    },
  })
);
app.use(helmet.crossOriginEmbedderPolicy());
app.use(helmet.crossOriginOpenerPolicy({ policy: 'same-origin' }));
app.use(helmet.crossOriginResourcePolicy({ policy: 'same-origin' }));
app.use(helmet.referrerPolicy({ policy: 'no-referrer' }));
app.use(helmet.noSniff()); // stop MIME sniffing

/* ───────── CORS & rate limit ───────── */
app.use(
  cors({
    origin: true, // tighten for prod
    credentials: false,
  })
);

app.use(
  rateLimit({
    windowMs: 60_000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

/* ───────── Parsers ───────── */
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

/* ───────── Health ───────── */
app.get('/healthz', (_req, res) => res.json({ ok: true }));

/* ───────── Routes ───────── */
app.use('/api/v1', complaintsRouter);

/* ───────── Static downloads (block stored XSS) ───────── */
const uploadsDir = path.join(__dirname, '../../uploads');

const staticOpts: ServeStaticOptions = {
  index: false,
  // NOTE: use Node's ServerResponse here (not Express Response)
  setHeaders: (res: ServerResponse, filePath: string /*, stat: number*/) => {
    const filename = path.basename(filePath);
    // Force download; never render inline
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    // Stop MIME sniffing (belt & suspenders; also via helmet.noSniff)
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, max-age=600');
  },
};

app.use('/uploads', express.static(uploadsDir, staticOpts));

/* ───────── 404 ───────── */
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

/* ───────── Error handler ───────── */
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error({ err: { message: err?.message, code: (err as any)?.code } }, 'unhandled');
  res.status(500).json({ error: 'Internal server error' });
};
app.use(errorHandler);

export default app;
