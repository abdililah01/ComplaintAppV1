import axios from 'axios';
import { ensureAccessToken, dropAccessToken } from '../auth/session';

/**
 * TRX API client (protected endpoints).
 */
const baseURL = process.env.EXPO_PUBLIC_TRX_API_BASE_URL;

if (!baseURL) {
  // eslint-disable-next-line no-console
  console.warn(
    '[api] EXPO_PUBLIC_TRX_API_BASE_URL is not set. ' +
      'Set it in your .env (e.g., http://<LAN-IP>:3000 for dev).'
  );
}

export const api = axios.create({
  baseURL,
  timeout: 20000,
});

// Attach JWT before every request EXCEPT the bootstrap call.
api.interceptors.request.use(async (cfg) => {
  const fullUrl = `${cfg.baseURL || ''}${cfg.url || ''}`;
  if (/\/auth\/anon\b/.test(fullUrl)) return cfg; // <-- critical

  const at = await ensureAccessToken(); // will call /auth/anon via bare client if needed
  cfg.headers = cfg.headers || {};
  cfg.headers.Authorization = `Bearer ${at}`;

  // Debug: uncomment to confirm header is set
  // console.log('[api] →', cfg.method, cfg.url, !!cfg.headers.Authorization);

  return cfg;
});

api.interceptors.response.use(undefined, async (err) => {
  const status = err?.response?.status;
  if (status === 401) {
    await dropAccessToken(); // force re-mint on next request
  }
  return Promise.reject(err);
});
