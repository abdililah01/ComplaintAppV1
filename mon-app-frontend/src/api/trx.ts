// Use the single shared client that already has the JWT interceptors wired.
import { api } from './api';

/** -------- JSON helper (for non-upload calls) -------- */
export function postJson<T = any>(url: string, data: any) {
  return api.post<T>(url, data, {
    headers: { 'Content-Type': 'application/json' },
  });
}

/** -------- Create complaint (example) -------- */
export const createComplaint = <T = any>(payload: any) =>
  postJson<T>('/api/v1/complaints', payload);

/** -------- Upload attachments (complaintId + files[]) --------
 * In React Native, DON'T set multipart headers manually; axios will add boundary.
 */
export async function uploadAttachments<T = any>(
  complaintId: number,
  files: Array<{ uri: string; name: string; type: 'application/pdf' | 'image/jpeg' }>
) {
  const fd = new FormData();
  fd.append('complaintId', String(complaintId));

  for (const f of files) {
    // @ts-ignore: RN FormData file shape
    fd.append('files', { uri: f.uri, name: f.name, type: f.type });
  }

  const res = await api.post<T>('/api/v1/files', fd, {
    timeout: 30000,
  });
  return res.data;
}
