// file : app-backend/src/lookup/index.ts
import '../common/load-env'; // ➊ load .env + .env.local
import pino from 'pino';
import app from './app';

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
});
const PORT = Number(process.env.LOOKUP_API_PORT || process.env.PORT || 3001);

// Bind on all interfaces so mobile devices can reach you
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 Lookup API is running on http://0.0.0.0:${PORT}`);
});
