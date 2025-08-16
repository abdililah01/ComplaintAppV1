import axios from 'axios';
import { ensureAccessToken, dropAccessToken } from '../auth/session';

/** TRX API client (protected endpoints). */
const baseURL = process.env.EXPO_PUBLIC_TRX_API_BASE_URL ?? '';

if (!baseURL) {
  // eslint-disable-next-line no-console
  console.warn(
    '[api] EXPO_PUBLIC_TRX_API_BASE_URL is not set. ' +
      'Set it in .env (e.g., http://<LAN-IP>:3000) for dev.'
  );
}

export const api = axios.create({
  baseURL: baseURL || undefined, // avoid accidental "null"/"" strings
  timeout: 20000,
});

// Attach JWT before each request
api.interceptors.request.use(async (cfg) => {
  const at = await ensureAccessToken(); // mints via /auth/anon if missing
  cfg.headers = cfg.headers || {};
  cfg.headers.Authorization = `Bearer ${at}`;
  return cfg;
});

// On 401, drop token so next request re-mints
api.interceptors.response.use(undefined, async (err) => {
  if (err?.response?.status === 401) {
    await dropAccessToken();
  }
  return Promise.reject(err);
});

// ✅ Back-compat for places that do `import api from './api'`
export default api;
