import express from 'express';
import complaintRoutes from './routes/complaints.routes';

const app = express();
app.use(express.json());

// health check
app.get('/healthz', (_req, res) => res.json({ ok: true }));

// mount transactional API
app.use('/api/v1', complaintRoutes);

// global error handler
app.use((err: any, _req: any, res: any, _next: any) => {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

export default app;
