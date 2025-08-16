import axios from 'axios';

/** Lookup API client (public endpoints, no auth). */
const baseURL = process.env.EXPO_PUBLIC_LOOKUP_API_BASE_URL ?? '';

if (!baseURL) {
  // eslint-disable-next-line no-console
  console.warn(
    '[lookupClient] EXPO_PUBLIC_LOOKUP_API_BASE_URL is not set. ' +
      'Set it in .env (e.g., http://<LAN-IP>:3001).'
  );
}

export const lookupClient = axios.create({
  baseURL: baseURL || undefined,
  timeout: 20000,
});

export default lookupClient;
