// app-backend/tests/trx.test.ts
import request from 'supertest';
import path from 'path';
import os from 'os';
import * as fsp from 'fs/promises';

/* ─────────────────────────── Mocks ───────────────────────────
   Put mocks BEFORE importing the app, so module init sees them.
---------------------------------------------------------------- */

// 1) Mock the stored-proc service used by the complaint controller
jest.mock('../src/trx/services/complaint.service', () => ({
  __esModule: true,
  createComplaintInDB: jest.fn().mockResolvedValue([
    { IdPlainte: BigInt(123456), TrackingCode: 'TRACK-ABC123' },
  ]),
}));

// 2) Mock prisma default export with $transaction for uploads
jest.mock('../src/common/prisma', () => ({
  __esModule: true,
  default: {
    $transaction: jest.fn(async (cb: any) => {
      const tx = {
        pieceJointe: {
          create: jest.fn(async ({ data }: any) => ({
            id: Math.floor(Math.random() * 10000),
            ...data,
          })),
        },
      };
      return cb(tx);
    }),
  },
}));

// 3) Mock AV (Option A): provide scanBufferDetailed + keep scanBuffer
jest.mock('../src/trx/services/clamav.service', () => ({
  __esModule: true,
  scanBufferDetailed: jest.fn().mockResolvedValue({ status: 'CLEAN' }),
  scanBuffer: jest.fn().mockResolvedValue(true),
}));

// 4) Mock sharp to support .rotate().jpeg().toBuffer() chain
jest.mock('sharp', () => {
  const factory = () => {
    const chain: any = {
      rotate: () => chain,
      jpeg: () => chain,
      toBuffer: async () => Buffer.from('normalized-image'),
    };
    return chain;
  };
  // support ESM default and CJS require
  return Object.assign(factory, { default: factory });
});

// 5) Mock file-type (dynamic import + named & default exports)
const ftObj = { fileTypeFromBuffer: jest.fn() };
jest.mock('file-type', () => ({
  __esModule: true,
  ...ftObj,                 // named: fileTypeFromBuffer
  default: ftObj,           // default.fileTypeFromBuffer
}));

/* ───────────────────────── Imports (after mocks) ───────────── */

import app from '../src/trx/app';
import * as fileTypeMod from 'file-type';
import * as avSvc from '../src/trx/services/clamav.service';

// Access the single shared mock function
const fileTypeFromBuffer = fileTypeMod.fileTypeFromBuffer as unknown as jest.Mock;

// (optional) access complaint service mock for call assertions
const complaintSvc = require('../src/trx/services/complaint.service');

/* ───────────────────────── Helpers ────────────────────────── */
const makeTempFile = async (name: string, contents: Buffer | string) => {
  const dir = await fsp.mkdtemp(path.join(os.tmpdir(), 'trx-'));
  const fp = path.join(dir, name);
  await fsp.writeFile(fp, contents);
  return fp;
};

describe('TRX API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /* ── Healthcheck ─────────────────────────────────────────── */
  describe('GET /healthz', () => {
    it('returns 200 and {ok:true}', async () => {
      const res = await request(app).get('/healthz');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ ok: true });
    });
  });

  /* ── POST /api/v1/complaints (nested) ────────────────────── */
  describe('POST /api/v1/complaints (nested payload)', () => {
    it('creates a complaint (individual) and returns id + tracking', async () => {
      fileTypeFromBuffer.mockResolvedValue({ ext: 'jpg', mime: 'image/jpeg' });

      const payload = {
        complainantType: 'individual',
        plaignant: {
          idPays: 504,
          idVille: 1,
          idSituationResidence: 1,
          idProfession: 1,
          sexe: 'M',
          adresse: '123 street',
          telephone: '+212600000000',
          email: 'john.doe@example.com',
          nom: 'Doe',
          prenom: 'John',
          cin: 'AB123456',
        },
        defendeur: { type: 'I' },
        plainteDetails: {
          resume: 'Résumé court de la plainte.',
          idObjetInjustice: 1,
          idJuridiction: 1,
        },
        phoneToVerify: '+212600000000',
      };

      const res = await request(app)
        .post('/api/v1/complaints')
        .set('Content-Type', 'application/json')
        .send(payload);

      expect(res.statusCode).toBe(201);
      expect(res.headers['content-type']).toMatch(/json/);
      expect(res.body).toHaveProperty('complaintId', '123456');
      expect(res.body).toHaveProperty('trackingCode', 'TRACK-ABC123');
      expect(complaintSvc.createComplaintInDB).toHaveBeenCalledTimes(1);
    });

    it('returns 422 with details when required fields are missing', async () => {
      const bad = {
        complainantType: 'individual',
        plaignant: {},               // missing required nested fields
        defendeur: { type: 'I' },
        // missing plainteDetails, phoneToVerify
      };

      const res = await request(app)
        .post('/api/v1/complaints')
        .set('Content-Type', 'application/json')
        .send(bad);

      expect(res.statusCode).toBe(422);
      expect(res.body).toHaveProperty('error', 'Validation failed');
      expect(res.body).toHaveProperty('details');
      expect(complaintSvc.createComplaintInDB).not.toHaveBeenCalled();
    });
  });

  /* ── POST /api/v1/complaints (legacy/flat) ───────────────── */
  describe('POST /api/v1/complaints (legacy/flat payload)', () => {
    it('accepts flat shape and returns id + tracking', async () => {
      const legacy = {
        PlaignantTypePersonne: 'P',
        PlaignantNom: 'Jane',
        PlaignantPrenom: 'Smith',
        PlaignantCIN: 'CD654321',
        PlaignantIdPays: 504,
        PlaignantIdVille: 1,
        PlaignantIdSituationResidence: 1,
        PlaignantIdProfession: 1,
        DefendeurTypePersonne: 'I',
        IdObjetInjustice: 1,
        IdJuridiction: 1,
        ResumePlainte: 'Résumé…',
        SessionId: 'session-legacy',
      };

      const res = await request(app)
        .post('/api/v1/complaints')
        .set('Content-Type', 'application/json')
        .send(legacy);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('complaintId', '123456');
      expect(res.body).toHaveProperty('trackingCode', 'TRACK-ABC123');
      expect(complaintSvc.createComplaintInDB).toHaveBeenCalledTimes(1);
    });
  });

  /* ── POST /api/v1/files ──────────────────────────────────── */
  describe('POST /api/v1/files', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('uploads JPEG and PDF and returns attachments', async () => {
      // dynamic sniff (middleware)
      fileTypeFromBuffer
        .mockResolvedValueOnce({ ext: 'jpg', mime: 'image/jpeg' })
        .mockResolvedValueOnce({ ext: 'pdf', mime: 'application/pdf' });

      const jpgPath = await makeTempFile('a.jpg', Buffer.from([0xff, 0xd8, 0xff]));
      const pdfPath = await makeTempFile('b.pdf', Buffer.from('%PDF-1.4'));

      const res = await request(app)
        .post('/api/v1/files')
        .field('complaintId', '123456')
        .attach('files', jpgPath, { contentType: 'image/jpeg' })
        .attach('files', pdfPath, { contentType: 'application/pdf' });

      expect(res.statusCode).toBe(201);
      expect(Array.isArray(res.body.attachments)).toBe(true);
      expect(res.body.attachments.length).toBe(2);
    });

    // ✅ Option A: sniff-level rejection → stable 415
    it('rejects unsupported file content (sniff mismatch → 415)', async () => {
      // Make fileFilter happy (claims PDF) but sniff returns text/plain
      fileTypeFromBuffer.mockResolvedValue({
        ext: 'txt',
        mime: 'text/plain',
      });

      const fakePdf = await makeTempFile('fake.pdf', Buffer.from('not really a pdf'));
      const res = await request(app)
        .post('/api/v1/files')
        .field('complaintId', '123456')
        .attach('files', fakePdf, { contentType: 'application/pdf' });

      expect(res.statusCode).toBe(415);
      expect(res.body).toHaveProperty('error');
    });

    it('rejects infected files (AV)', async () => {
      fileTypeFromBuffer.mockResolvedValue({ ext: 'jpg', mime: 'image/jpeg' });

      // ⬇️ IMPORTANT: use the detailed scanner mock (Option A)
      (avSvc.scanBufferDetailed as unknown as jest.Mock).mockResolvedValueOnce({
        status: 'FOUND',
        signature: 'Eicar-Test-Signature',
      });

      const jpgPath = await makeTempFile('bad.jpg', Buffer.from([0xff, 0xd8, 0xff]));

      const res = await request(app)
        .post('/api/v1/files')
        .field('complaintId', '123456')
        .attach('files', jpgPath, { contentType: 'image/jpeg' });

      expect(res.statusCode).toBe(415);
      expect(res.body).toHaveProperty('error');
    });

    it('rejects when complaintId is missing', async () => {
      fileTypeFromBuffer.mockResolvedValue({ ext: 'jpg', mime: 'image/jpeg' });

      const jpgPath = await makeTempFile('a.jpg', Buffer.from([0xff, 0xd8, 0xff]));

      const res = await request(app)
        .post('/api/v1/files')
        .attach('files', jpgPath, { contentType: 'image/jpeg' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  /* ── 404 guard ───────────────────────────────────────────── */
  describe('GET /non-existent-route', () => {
    it('returns 404 for unknown paths', async () => {
      const res = await request(app).get('/non-existent-route');
      expect(res.statusCode).toBe(404);
      expect(typeof res.body).toBe('object');
    });
  });
});
