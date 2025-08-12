// app-backend/src/trx/index.ts
import '../common/load-env'; // load .env + .env.local
import app from './app';
import fs from 'fs';
import http from 'http';
import https from 'https';

const PORT = Number(process.env.TRX_API_PORT || process.env.PORT || 3000);
const HOST = '0.0.0.0';

function applyTimeouts(server: any) {
  // Tighter timeouts are good for upload endpoints
  server.headersTimeout = 10_000;   // time to receive headers
  server.requestTimeout = 15_000;   // total time per request
  server.keepAliveTimeout = 5_000;  // optional
}

function startHttp() {
  const server = http.createServer(app);
  applyTimeouts(server);
  server.listen(PORT, HOST, () => {
    console.log(`⚠️  TRX API listening on http://${HOST}:${PORT}`);
  });
}

function startHttps() {
  const crt = process.env.SSL_CRT_FILE;
  const key = process.env.SSL_KEY_FILE;

  if (process.env.HTTPS === 'true' && crt && key) {
    try {
      const cert = fs.readFileSync(crt);
      const k = fs.readFileSync(key);
      const server = https.createServer({ key: k, cert }, app);
      applyTimeouts(server);
      server.listen(PORT, HOST, () => {
        console.log(`🔒 TRX API listening on https://${HOST}:${PORT}`);
      });
      return;
    } catch (err) {
      console.error('Failed to start HTTPS server, falling back to HTTP:', err);
    }
  }
  startHttp();
}

process.on('unhandledRejection', (err) => {
  console.error('unhandledRejection', err);
});
process.on('uncaughtException', (err) => {
  console.error('uncaughtException', err);
});

startHttps();
