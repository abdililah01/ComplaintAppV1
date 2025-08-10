// -----------------------------------------------------------------------------
// file: mon-app-frontend/src/api/lookup.ts
// Lookup micro-service (port 3001) – React-Query hooks
// -----------------------------------------------------------------------------

import axios from 'axios';
import { useQuery, UseQueryResult } from '@tanstack/react-query';

/* ─────────────────────────────────────────────────────────────────── */
/* 1. Base-URL resolution                                             */
/* ─────────────────────────────────────────────────────────────────── */

const explicit = process.env.EXPO_PUBLIC_LOOKUP_API_BASE_URL?.trim();
const derived  =
  process.env.API_BASE_URL?.replace(/:3000(\/.*)?$/, ':3001')?.trim();

export const LOOKUP_BASE_URL =
  explicit && explicit.length ? explicit : derived ?? 'http://localhost:3001';

/* Dedicated Axios client */
const lookupApi = axios.create({
  baseURL: LOOKUP_BASE_URL,
  timeout: 15_000,
});

/* ─────────────────────────────────────────────────────────────────── */
/* 2. DTOs                                                             */
/* ─────────────────────────────────────────────────────────────────── */

export interface LookupItem {
  id: number | string;
  label: string;                 // already Arabic-localised by the API
}

/* ─────────────────────────────────────────────────────────────────── */
/* 3. Generic fetcher helper                                           */
/* ─────────────────────────────────────────────────────────────────── */

const get =
  <T = LookupItem[]>(url: string) =>
  () =>
    lookupApi.get<T>(url).then(r => r.data);

/* ─────────────────────────────────────────────────────────────────── */
/* 4. Hooks                                                            */
/* ─────────────────────────────────────────────────────────────────── */

/** Countries – cached 5 min */
export function useCountries(): UseQueryResult<LookupItem[], Error> {
  return useQuery({
    queryKey : ['lookup', 'countries'],
    queryFn  : get('/lookups/pays?lang=ar'),
    staleTime: 5 * 60_000,
  });
}

/** Cities for a given country – cached 5 min */
export function useCities(idPays?: number): UseQueryResult<LookupItem[], Error> {
  return useQuery({
    queryKey : ['lookup', 'cities', idPays],
    queryFn  : get(`/lookups/villes?idPays=${idPays}&lang=ar`),
    enabled  : Boolean(idPays),
    staleTime: 5 * 60_000,
  });
}

/** Sex / gender (static list – never refetch) */
export interface GenderItem {
  id: 'M' | 'F';
  label: string;                 // « ذكر » / « أنثى »
}
export function useGenders(): UseQueryResult<GenderItem[], Error> {
  return useQuery({
    queryKey : ['lookup', 'genders'],
    queryFn  : get<GenderItem[]>('/lookups/sexe'),
    staleTime: Infinity,
  });
}

/* Additional look-ups kept for completeness */
export function useProfessions() {
  return useQuery({
    queryKey : ['lookup', 'professions'],
    queryFn  : get('/lookups/professions'),
    staleTime: 24 * 60 * 60_000,
  });
}
export function useResidenceSituations() {
  return useQuery({
    queryKey : ['lookup', 'situations-residence'],
    queryFn  : get('/lookups/situations-residence'),
    staleTime: 24 * 60 * 60_000,
  });
}
export function useInjusticeObjects() {
  return useQuery({
    queryKey : ['lookup', 'objets'],
    queryFn  : get('/lookups/objets'),
    staleTime: 24 * 60 * 60_000,
  });
}
export function useJuridictions() {
  return useQuery({
    queryKey : ['lookup', 'juridictions'],
    queryFn  : get('/lookups/juridictions'),
    staleTime: 24 * 60 * 60_000,
  });
}
