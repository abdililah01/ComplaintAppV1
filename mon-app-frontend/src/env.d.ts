// tell TS about our @env imports
// mon-app-frontend/src/env.d.ts
declare module '@env' {
  export const API_BASE_URL: string;
}
// ---------------------------------------------------------------------------
// file: src/env.d.ts
// ---------------------------------------------------------------------------

declare module '@env' {
  /* existing vars … */
  export const API_BASE_URL: string;

  /* <───  add this line                                        */
  export const EXPO_PUBLIC_LOOKUP_API_BASE_URL: string;
}
