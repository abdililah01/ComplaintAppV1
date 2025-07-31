// -----------------------------------------------------------------------------
// Typed lookup hooks for <Country> & <City> tables
// -----------------------------------------------------------------------------
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { api } from './api';

/* ---------- DTOs coming from the backend ---------------------------------- */
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

/* ---------- Hooks --------------------------------------------------------- */

/** All countries (Arabic) – cached for 5 min */
export function useCountries(): UseQueryResult<Country[], Error> {
  return useQuery<Country[], Error>({
    queryKey: ['countries'],
    queryFn: async () =>
      api.get<Country[]>('/lookups/pays?lang=ar').then(r => r.data),
    staleTime: 5 * 60_000,
  });
}

/** Cities for a given country – runs only when `idPays` is set */
export function useCities(idPays?: number): UseQueryResult<City[], Error> {
  return useQuery<City[], Error>({
    queryKey: ['cities', idPays],
    queryFn: async () =>
      api
        .get<City[]>(`/lookups/villes?idPays=${idPays}&lang=ar`)
        .then(r => r.data),
    enabled: !!idPays,
    staleTime: 5 * 60_000,
  });
}
