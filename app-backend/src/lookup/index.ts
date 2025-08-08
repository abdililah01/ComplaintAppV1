import '../common/load-env';                     // ⓐ  load .env + .env.local
import pino from 'pino';
import app from './app';

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
});

const PORT = Number(process.env.LOOKUP_API_PORT || process.env.PORT || 3001);

/* Bind on all interfaces so real devices on the LAN can reach the service */
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀  Lookup-API ready at http://0.0.0.0:${PORT}`);
});
