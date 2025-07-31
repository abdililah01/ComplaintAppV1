// files: src/trx/app.ts
import express from 'express';
import path from 'path';
import complaintRoutes from './routes/complaints.routes';

const app = express();

// parse JSON bodies
app.use(express.json());

// health check
app.get('/healthz', (_req, res) => res.json({ ok: true }));

// serve your uploads folder at /uploads
// Clients can GET e.g. http://<host>/uploads/p1.png
app.use(
    '/uploads',
    express.static(
        // relative to this file (src/trx), go up two levels into <project_root>/uploads
        path.join(__dirname, '../../uploads'),
        {
            setHeaders(res, filePath) {
                // optional: prevent caching sensitive files indefinitely
                res.setHeader('Cache-Control', 'private, max-age=3600');
            },
        }
    )
);

// mount transactional API under /api/v1
app.use('/api/v1', complaintRoutes);

// global error handler
app.use((err: any, _req: any, res: any, _next: any) => {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

export default app;
