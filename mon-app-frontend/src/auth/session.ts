import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const INSTALL_KEY = 'installId';
const AT_KEY = 'accessToken';

// Bare client just for /auth/anon (no interceptors)
const baseURL = process.env.EXPO_PUBLIC_TRX_API_BASE_URL ?? '';
const bootstrap = axios.create({
  baseURL: baseURL || undefined,
  timeout: 15000,
});

let inflight: Promise<string> | null = null;

async function getInstallId(): Promise<string> {
  let id: string | null = await SecureStore.getItemAsync(INSTALL_KEY);
  if (!id) {
    const newId = uuidv4();
    await SecureStore.setItemAsync(INSTALL_KEY, newId);
    id = newId;
  }
  // Ensure it meets backend zod .min(10)
  if (id.length < 10) {
    const padded = id.padEnd(12, 'x');
    await SecureStore.setItemAsync(INSTALL_KEY, padded);
    return padded;
  }
  return id;
}

export async function ensureAccessToken(): Promise<string> {
  const cached = await SecureStore.getItemAsync(AT_KEY);
  if (cached) return cached;

  if (inflight) return inflight; // de-dup races

  inflight = (async () => {
    const installId = await getInstallId();
    if (!baseURL) {
      throw new Error(
        'TRX baseURL missing (EXPO_PUBLIC_TRX_API_BASE_URL). Cannot mint token.'
      );
    }
    const { data } = await bootstrap.post('/auth/anon', { installId });
    const token: unknown = data?.accessToken;
    if (typeof token !== 'string' || token.length < 20) {
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
