// Always use the shared client that already wires JWT interceptors.
import api from './api';

/** JSON helper (non-upload calls). */
export function postJson<T = any>(url: string, data: any) {
  return api.post<T>(url, data, {
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Create complaint. */
export const createComplaint = <T = any>(payload: any) =>
  postJson<T>('/api/v1/complaints', payload);

/** Upload attachments (complaintId + files[]). */
export async function uploadAttachments<T = any>(
  complaintId: number,
  files: Array<{ uri: string; name: string; type: 'application/pdf' | 'image/jpeg' }>
) {
  const fd = new FormData();
  fd.append('complaintId', String(complaintId));

  for (const f of files) {
    // @ts-ignore RN FormData file shape
    fd.append('files', { uri: f.uri, name: f.name, type: f.type });
  }

  const res = await api.post<T>('/api/v1/files', fd, { timeout: 30000 });
  return res.data;
}
