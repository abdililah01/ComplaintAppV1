// filie :app-backend/src/trx/index.ts
import '../common/load-env'; // ➊ load .env + .env.local
import app from './app';
import fs from 'fs';
import https from 'https';
import http from 'http';

const PORT = Number(process.env.TRX_API_PORT || process.env.PORT || 3000);
const HOST = '0.0.0.0';

if (
  process.env.HTTPS === 'true' &&
  process.env.SSL_CRT_FILE &&
  process.env.SSL_KEY_FILE
) {
  const cert = fs.readFileSync(process.env.SSL_CRT_FILE);
  const key  = fs.readFileSync(process.env.SSL_KEY_FILE);

  https
    .createServer({ key, cert }, app)
    .listen(PORT, HOST, () =>
      console.log(`🔒 TRX API listening on https://${HOST}:${PORT}`)
    );
} else {
  http
    .createServer(app)
    .listen(PORT, HOST, () =>
      console.log(`⚠️  TRX API listening on http://${HOST}:${PORT}`)
    );
}
