// file: src/api/lookup.ts
// -----------------------------------------------------------------------------
// Lookup API (Countries & Cities) — isolated from the main trx API
// -----------------------------------------------------------------------------

import { API_BASE_URL } from '@env';
import axios from 'axios';
import { useQuery, UseQueryResult } from '@tanstack/react-query';

/** Swagger shows your TRX API at e.g. http://192.168.3.8:3000.
 *  We know the lookup API runs on port 3001 on the same host.
 */
const LOOKUP_BASE_URL = API_BASE_URL.replace(/:3000(\/.*)?$/, ':3001');

/** A dedicated axios client for lookups */
const lookupApi = axios.create({
  baseURL: LOOKUP_BASE_URL,
  timeout: 15_000,
});

// -----------------------------------------------------------------------------
// DTOs
// -----------------------------------------------------------------------------
export interface Country {
  id: number;
  /** Arabic label already provided by the API */
  label: string;
}

export interface City {
  id: number;
  /** Arabic city label */
  label: string;
}

// -----------------------------------------------------------------------------
// Hooks
// -----------------------------------------------------------------------------

/** Fetch all countries in Arabic, cached for 5 minutes */
export function useCountries(): UseQueryResult<Country[], Error> {
  return useQuery<Country[], Error>({
    queryKey: ['lookup', 'countries'],
    queryFn: () =>
      lookupApi.get<Country[]>('/lookups/pays?lang=ar').then(r => r.data),
    staleTime: 5 * 60_000,
  });
}

/**
 * Fetch cities for a given country ID (Arabic).
 * Only runs when `idPays` is truthy.
 */
export function useCities(idPays?: number): UseQueryResult<City[], Error> {
  return useQuery<City[], Error>({
    queryKey: ['lookup', 'cities', idPays],
    queryFn: () =>
      lookupApi
        .get<City[]>(`/lookups/villes?idPays=${idPays}&lang=ar`)
        .then(r => r.data),
    enabled: Boolean(idPays),
    staleTime: 5 * 60_000,
  });
}
