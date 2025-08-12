// app-backend/tests/xss.test.ts
import request from 'supertest';
import fs from 'fs/promises';
import path from 'path';
import app from '../src/trx/app';

// 1) Mock the stored-proc call so we can inspect sanitized params
jest.mock('../src/trx/services/complaint.service', () => ({
  __esModule: true,
  createComplaintInDB: jest.fn().mockResolvedValue([
    { IdPlainte: BigInt(999), TrackingCode: 'SAFE-TRACK' },
  ]),
}));

const svc = require('../src/trx/services/complaint.service');

describe('XSS hardening', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('escapes dangerous HTML/JS in text fields before calling the SP', async () => {
    const payload = {
      complainantType: 'individual',
      plaignant: {
        nom: "Evil<script>alert('n')</script>",
        prenom: "<b>Bold</b>",
        cin: "AB12345'><img src=x onerror=alert(1)>",
        idPays: 1,
        idVille: 1,
        idSituationResidence: 1,
        idProfession: 1,
        adresse: "<svg/onload=alert(1)>",
        telephone: '+212600000000',
        email: "bad@example.com\"><script>alert(1)</script>",
      },
      // accept flat defendant too
      defendeur: {
        type: 'M',
        nomCommercial: 'D<ef>end</end>',
        numeroRC: `"><img src=x onerror=alert(2)>`,
      },
      // the controller also supports "plainteDetails"
      plainteDetails: {
        resume: `ok<script>alert(3)</script><img src=x onerror=alert(3)>`,
        idObjetInjustice: 1,
        idJuridiction: 1,
      },
      phoneToVerify: '+212600000000',
    };

    const res = await request(app)
      .post('/api/v1/complaints')
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(res.status).toBe(201);
    // we passed; now assert the SP received sanitized params
    expect(svc.createComplaintInDB).toHaveBeenCalledTimes(1);
    const spParams = svc.createComplaintInDB.mock.calls[0][0];

    // Resume/plainte is escaped
    expect(spParams.ResumePlainte).toContain('&lt;script&gt;alert');
    expect(spParams.ResumePlainte).not.toContain('<script');

    // Complainant name fields are escaped
    expect(spParams.PlaignantNom).toContain('&lt;script&gt;');
    expect(spParams.PlaignantPrenom).toContain('&lt;b&gt;');

    // Address escaped
    expect(spParams.PlaignantAdresse).toContain('&lt;svg');

    // Defendant (flat) fields escaped
    expect(spParams.DefendeurNomCommercial).toContain('&lt;');

    // Email normalized (validator.normalizeEmail → lower-cases domain, strips stray quotes/scripts)
    expect(spParams.PlaignantEmail).toContain('bad@example.com');
    expect(String(spParams.PlaignantEmail)).not.toContain('<script');

    // Basic sanity on response
    expect(res.body).toEqual({
      complaintId: '999',
      trackingCode: 'SAFE-TRACK',
    });
  });

  it('serves static files with safe headers (attachment + nosniff)', async () => {
    // create a temporary “uploaded” file with HTML content
    const uploadsDir = path.resolve(__dirname, '../uploads');
    await fs.mkdir(uploadsDir, { recursive: true });
    const evilName = 'evil.svg';
    const evilPath = path.join(uploadsDir, evilName);
    await fs.writeFile(
      evilPath,
      `<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>`,
      'utf8'
    );

    const res = await request(app).get(`/uploads/${evilName}`);

    // The app forces download & disables sniffing
    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toMatch(/attachment/);
    expect(res.headers['content-disposition']).toContain(`filename="${evilName}"`);
    expect(res.headers['x-content-type-options']).toBe('nosniff');

    // cleanup
    await fs.unlink(evilPath).catch(() => {});
  });
});
