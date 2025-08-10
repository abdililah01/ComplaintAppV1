// file : mon-app-frontend/src/api/trx.ts

import { API_BASE_URL } from '@env';
import axios from 'axios';
import 'react-native-get-random-values';
import { v4 as uuid } from 'uuid';

// DEBUG: ensure the env plugin is picking up your .env
console.log('♻️  Loaded trx.ts, API_BASE_URL env is:', API_BASE_URL);

// generate one session-id per app launch
const sessionId = uuid();

const axiosConfig: any = {
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'x-session-id': sessionId,
    'Content-Type': 'application/json',
  },
};

// Only add sslPinning _outside_ of development (i.e. in a real release build or dev-client)
if (!__DEV__) {
  // @ts-ignore
  axiosConfig.sslPinning = { certs: ['backend_pub'] };
}

export const trxApi = axios.create(axiosConfig);

// DEBUG: verify the axios instance is configured correctly
console.log('🔗 TRX API baseURL:', trxApi.defaults.baseURL);
