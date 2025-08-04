//file: app-backend/src/lookup/index.ts
// ➊ Load env first
import '../common/load-env';

// ➋ Libraries
import pino from 'pino';
import app from './app';

// ➌ Logger & port
const logger = pino({ level: process.env.NODE_ENV === 'production' ? 'info' : 'debug' });
const PORT   = Number(process.env.PORT || process.env.LOOKUP_API_PORT || 3001);

// ➍ Start
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 Lookup API is running on http://0.0.0.0:${PORT}`);
});
