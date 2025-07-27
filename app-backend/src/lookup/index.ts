// Fichier: /app-backend/src/lookup/index.ts

import app from './app'; // Importe l'application configurée
import pino from 'pino';

const logger = pino({ level: process.env.NODE_ENV === 'production' ? 'info' : 'debug' });
const PORT = Number(process.env.PORT || 3001);

// Démarre le serveur en écoutant sur le bon port
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 Lookup API is running on http://0.0.0.0:${PORT}`);
});