import * as SecureStore from 'expo-secure-store';
import { api } from '../api/api'; // use your existing axios instance

const INSTALL_KEY = 'installId';
const AT_KEY = 'accessToken';

async function getInstallId() {
  let id = await SecureStore.getItemAsync(INSTALL_KEY);
  if (!id) {
    id = (global as any).crypto?.randomUUID?.() || String(Date.now()) + Math.random().toString(16).slice(2);
    await SecureStore.setItemAsync(INSTALL_KEY, id);
  }
  return id;
}

export async function ensureAccessToken() {
  const at = await SecureStore.getItemAsync(AT_KEY);
  if (at) return at;
  const installId = await getInstallId();
  const { data } = await api.post('/auth/anon', { installId });
  await SecureStore.setItemAsync(AT_KEY, data.accessToken);
  return data.accessToken;
}

export async function dropAccessToken() {
  await SecureStore.deleteItemAsync(AT_KEY);
}
