import axios, { AxiosInstance } from 'axios';
import 'react-native-get-random-values';
import { v4 as uuid } from 'uuid';

/** ---------- Read + normalize LAN base URL (Expo public var) ---------- */
const RAW = String(process.env.EXPO_PUBLIC_TRX_API_BASE_URL ?? '').trim();
if (!RAW) {
  throw new Error(
    'Missing EXPO_PUBLIC_TRX_API_BASE_URL in .env.local (e.g. http://192.168.3.8:3000).'
  );
}
const WITH_PROTO = /^https?:\/\//i.test(RAW) ? RAW : `http://${RAW}`;
export const TRX_BASE_URL = WITH_PROTO.replace(/\/+$/, ''); // strip trailing slashes

/** ---------- Axios instance (no global JSON header) ------------------- */
const sessionId = uuid();
export const trxApi: AxiosInstance = axios.create({
  baseURL: TRX_BASE_URL,
  timeout: 15000,
  headers: {
    'x-session-id': sessionId,
  },
});

// Debug
// eslint-disable-next-line no-console
console.log('🔗 TRX API baseURL:', TRX_BASE_URL);

/** ---------- JSON helper (use for non-upload calls) ------------------- */
export function postJson<T = any>(url: string, data: any) {
  return trxApi.post<T>(url, data, {
    headers: { 'Content-Type': 'application/json' },
  });
}

/** ---------- Upload helper (complaintId + files[]) -------------------- */
/* In React-Native, DO NOT set multipart headers manually — let axios set the
   boundary, otherwise uploads can fail silently. */
export async function uploadAttachments(
  complaintId: number,
  files: Array<{ uri: string; name: string; type: 'application/pdf' | 'image/jpeg' }>
) {
  const fd = new FormData();
  fd.append('complaintId', String(complaintId));

  for (const f of files) {
    // @ts-ignore RN FormData file shape
    fd.append('files', { uri: f.uri, name: f.name, type: f.type });
  }

  const res = await trxApi.post('/api/v1/files', fd, {
    timeout: 30000,
    // no headers: axios will add the correct multipart boundary in RN
  });
  return res.data;
}

export default trxApi;
