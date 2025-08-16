// mon-app-frontend/src/auth/session.ts
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const INSTALL_KEY = 'installId';
const AT_KEY = 'accessToken';

// Use a bare client for /auth/anon (NO interceptors here).
const baseURL = process.env.EXPO_PUBLIC_TRX_API_BASE_URL ?? '';
const bootstrap = axios.create({ baseURL, timeout: 15000 });

let inflight: Promise<string> | null = null;

function genInstallId(): string {
  const rnd =
    (global as any).crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random()
      .toString(36)
      .slice(2)}`;
  return String(rnd);
}

async function getInstallId(): Promise<string> {
  // Coerce null → '' so `id` is always a string
  let id: string = (await SecureStore.getItemAsync(INSTALL_KEY)) ?? '';

  // Generate and persist if missing
  if (id.length === 0) {
    id = genInstallId();
    await SecureStore.setItemAsync(INSTALL_KEY, id);
  }

  // Ensure it passes backend zod .min(10)
  if (id.length < 10) {
    id = id.padEnd(12, 'x');
    await SecureStore.setItemAsync(INSTALL_KEY, id);
  }

  return id; // ✅ always string
}

export async function ensureAccessToken(): Promise<string> {
  const cached = await SecureStore.getItemAsync(AT_KEY);
  if (cached && cached.length > 0) return cached;

  if (inflight) return inflight; // de-dup parallel calls

  inflight = (async () => {
    const installId = await getInstallId();
    const { data } = await bootstrap.post('/auth/anon', { installId });
    const token: string =
      typeof data?.accessToken === 'string' ? data.accessToken : '';

    if (token.length < 20) {
      throw new Error('Invalid access token from /auth/anon');
    }

    await SecureStore.setItemAsync(AT_KEY, token);
    return token;
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

export async function dropAccessToken(): Promise<void> {
  await SecureStore.deleteItemAsync(AT_KEY);
}
