import request from 'supertest';
import app from '../src/lookup/app';   // Express instance (no listener)

// -------------------------------------------------------------------------
//  Test-suite : Lookup-API
// -------------------------------------------------------------------------
describe('Lookup API Endpoints (/lookups)', () => {
  /* ── Healthcheck ────────────────────────────────────────────────────── */
  describe('GET /healthz', () => {
    it('returns 200 and {status:"ok"}', async () => {
      const res = await request(app).get('/healthz');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
    });
  });

  /* ── /pays ──────────────────────────────────────────────────────────── */
  describe('GET /lookups/pays', () => {
    it('returns an array of countries', async () => {
      const res = await request(app).get('/lookups/pays');
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toMatch(/json/);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('label');
    });
  });

  /* ── /villes ────────────────────────────────────────────────────────── */
  describe('GET /lookups/villes', () => {
    it('returns cities for a valid idPays', async () => {
      const res = await request(app).get('/lookups/villes?idPays=1');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('label');
    });

    it('returns 400 when idPays is missing', async () => {
      const res = await request(app).get('/lookups/villes');
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('returns an empty array when the country has no cities', async () => {
      const res = await request(app).get('/lookups/villes?idPays=9999');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });

  /* ── Static list: /sexe ─────────────────────────────────────────────── */
  describe('GET /lookups/sexe', () => {
    it('returns the two gender options (M/F)', async () => {
      const res = await request(app).get('/lookups/sexe');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toEqual([
        { id: 'M', label: 'ذكر' },
        { id: 'F', label: 'أنثى' },
      ]);
    });
  });

  /* ── Other look-ups (happy-path only) ───────────────────────────────── */
  const simpleEndpoints = [
    '/lookups/juridictions',
    '/lookups/objets',
    '/lookups/professions',
    '/lookups/situations-residence',
  ];

  simpleEndpoints.forEach(path => {
    describe(`GET ${path}`, () => {
      it('returns an array', async () => {
        const res = await request(app).get(path);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        /* situations-residence should be seeded – sanity check */
        if (path === '/lookups/situations-residence') {
          expect(res.body.length).toBeGreaterThan(0);
        }
      });
    });
  });

  /* ── 404 guard ──────────────────────────────────────────────────────── */
  describe('GET /non-existent-route', () => {
    it('returns 404 for unknown paths', async () => {
      const res = await request(app).get('/non-existent-route');
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ error: 'Not found', path: '/non-existent-route' });
    });
  });
});
