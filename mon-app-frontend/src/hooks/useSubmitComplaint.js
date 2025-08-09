// file: mon-app-frontend/src/hooks/useSubmitComplaint.js
import axios from 'axios';                  // ← for isAxiosError
import { useMutation } from '@tanstack/react-query';
import { trxApi } from '@/api/trx';
import { Alert } from 'react-native';

export function useSubmitComplaint() {
  return useMutation({
    mutationFn: async ({ jsonBody, files }) => {
      try {
        // 1) POST complaint JSON
        const { data } = await trxApi.post('/api/v1/complaints', jsonBody);

        // 2) if there are files => build FormData & upload
        if (files?.length) {
          const form = new FormData();
          form.append('complaintId', data.complaintId.toString());
          files.forEach(f =>
            form.append('files', {
              uri: f.uri,
              name: f.name,
              type: f.type || 'application/octet-stream',
            })
          );
          
          try {
            await trxApi.post('/api/v1/files', form, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
          } catch (uploadError) {
            // Specific error for upload failure as requested
            Alert.alert('فشل رفع المرفقات');
            // Re-throw to make the mutation fail
            throw uploadError;
          }
        }
        
        // Return the data needed for navigation
        return data; // { complaintId, trackingCode }
      } catch (error) {
        // Rethrow to be caught by onError below
        throw error;
      }
    },
    onError: err => {
      // Log the full 422 payload so you can see exactly what the API rejected
      if (axios.isAxiosError(err)) {
       console.log('💥 TRX 422 payload ↴\n', JSON.stringify(err.response?.data, null, 2));
      } else {
        console.log('💥 TRX unexpected error:', err);
      }
      // You can still show your existing alert elsewhere, or rely on the caller’s onError
    }
  });
}
