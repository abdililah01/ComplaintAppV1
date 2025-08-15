// app-backend/tests/auth.jwt.test.ts
import request from 'supertest';
import jwt from 'jsonwebtoken';

/** Re-import app with auth enabled and a known secret/TTL */
async function loadApp(ttl = '2m') {
  process.env.AUTH_DISABLED = 'false';          // enable auth for this suite
  process.env.AUTH_JWT_SECRET = 'test-secret';  // known secret for verification
  process.env.AUTH_ACCESS_TTL = ttl;            // short lifetime for tests

  // Ensure modules read the fresh env
  jest.resetModules();
  const app = (await import('../src/trx/app')).default;
  return app;
}

describe('Anonymous JWT auth', () => {
  it('issues HS512 token bound to installId', async () => {
    const app = await loadApp('2m');

    const installId = 'test-device-1234567890';
    const res = await request(app)
      .post('/auth/anon')
      .set('Content-Type', 'application/json')
      .send({ installId });

    expect(res.status).toBe(201);
    const { accessToken, sessionId } = res.body;
    expect(typeof accessToken).toBe('string');
    expect(typeof sessionId).toBe('string');

    // Verify signature + claims
    const payload = jwt.verify(accessToken, 'test-secret', {
      algorithms: ['HS512'],
    }) as any;

    expect(payload.did).toBe(installId);
    expect(payload.jti).toBe(sessionId);
    expect(Array.isArray(payload.scope)).toBe(true);

    // Header alg check
    const decoded = jwt.decode(accessToken, { complete: true }) as any;
    expect(decoded?.header?.alg).toBe('HS512');
  });

  it('protected route returns 401 without token, but not 401 with token', async () => {
    const app = await loadApp('2m');

    // No token -> 401
    const noAuth = await request(app).post('/api/v1/complaints').send({});
    expect(noAuth.status).toBe(401);

    // Get a token
    const { body } = await request(app)
      .post('/auth/anon')
      .send({ installId: 'device-abc-1234567890' });
    const token = body.accessToken;

    // With token -> NOT 401 (likely 422 because of validation)
    const withAuth = await request(app)
      .post('/api/v1/complaints')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(withAuth.status).not.toBe(401);
    expect([400, 422, 201, 415]).toContain(withAuth.status); // validation outcome OK
  });

  it('expired token is rejected', async () => {
    const app = await loadApp('1s'); // ultra-short TTL

    const { body } = await request(app)
      .post('/auth/anon')
      .send({ installId: 'device-exp-1234567890' });

    const token = body.accessToken;

    // Wait for expiry (a bit over 1s for clock skew)
    await new Promise((r) => setTimeout(r, 1500));

    const res = await request(app)
      .post('/api/v1/complaints')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(401);
  });
});
