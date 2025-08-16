/**
 * Minimal e2e-ish smoke test for JWT guard.
 * It does NOT hit the DB (mocked stored-proc layer).
 * It proves /auth/anon mints a token and the guard enforces 401/201.
 */

import request from 'supertest';
import { randomUUID } from 'crypto';

// IMPORTANT: mock the SP service to avoid DB.
jest.mock('../src/trx/services/complaint.service', () => ({
  __esModule: true,
  createComplaintInDB: jest.fn().mockResolvedValue([
    { IdPlainte: BigInt(123456), TrackingCode: 'TRACK-ABC123' },
  ]),
}));

describe('Auth guard smoke', () => {
  // we’ll require app AFTER setting env to ensure middleware reads it
  let app: any;

  beforeAll(async () => {
    jest.resetModules();
    process.env.AUTH_DISABLED = 'false'; // force guard ON for this file
    // provide JWT secret/TTL for test run
    process.env.AUTH_JWT_SECRET = process.env.AUTH_JWT_SECRET || 'dev_test_secret_please_change';
    process.env.AUTH_ACCESS_TTL = '5m';
    app = (await import('../src/trx/app')).default;
  });

  it('GET /healthz works', async () => {
    const res = await request(app).get('/healthz');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('POST /api/v1/complaints → 401 without Authorization', async () => {
    const res = await request(app)
      .post('/api/v1/complaints')
      .set('Content-Type', 'application/json')
      .send({
        // minimal valid legacy payload (keeps the controller happy)
        PlaignantTypePersonne: 'P',
        PlaignantNom: 'Jane',
        PlaignantPrenom: 'Doe',
        PlaignantCIN: 'AA123456',
        PlaignantIdPays: 504,
        PlaignantIdVille: 1,
        PlaignantIdSituationResidence: 1,
        PlaignantIdProfession: 1,
        DefendeurTypePersonne: 'I',
        IdObjetInjustice: 1,
        IdJuridiction: 1,
        ResumePlainte: 'Résumé…',
        SessionId: 'session-smoke', // not used by controller; JWT jti is
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error', 'NO_TOKEN');
  });

  it('mints token at /auth/anon and can create complaint with Authorization', async () => {
    const installId = randomUUID();

    // 1) ask for a token
    const t1 = await request(app)
      .post('/auth/anon')
      .set('Content-Type', 'application/json')
      .send({ installId });

    expect(t1.statusCode).toBe(201);
    expect(typeof t1.body.accessToken).toBe('string');
    expect(typeof t1.body.sessionId).toBe('string');

    const token = t1.body.accessToken;

    // 2) call a protected endpoint
    const res = await request(app)
      .post('/api/v1/complaints')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .send({
        PlaignantTypePersonne: 'P',
        PlaignantNom: 'Jane',
        PlaignantPrenom: 'Doe',
        PlaignantCIN: 'AA123456',
        PlaignantIdPays: 504,
        PlaignantIdVille: 1,
        PlaignantIdSituationResidence: 1,
        PlaignantIdProfession: 1,
        DefendeurTypePersonne: 'I',
        IdObjetInjustice: 1,
        IdJuridiction: 1,
        ResumePlainte: 'Résumé…',
        SessionId: 'session-smoke', // controller should override with JWT jti internally
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('complaintId', '123456');
    expect(res.body).toHaveProperty('trackingCode', 'TRACK-ABC123');
  });
});
