// src/api/lookupClient.ts  (NEW)
import axios from 'axios';

export const lookupApi = axios.create({
  baseURL: process.env.EXPO_PUBLIC_LOOKUP_API_BASE_URL,
  timeout: 10000,
});
