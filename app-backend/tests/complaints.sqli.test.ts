// app-backend/src/tests/complaints.sqli.test.ts
import request from 'supertest';
import app from '../src/trx/app'; // your app export

describe('SQLi hardening tests', () => {
  // Add SQLi payloads and check for 400/422 (no data loss)
  it('rejects SQLi payloads (numeric injection)', async () => {
    const badPayload = {
      complainantType: 'individual',
      plaignant: {
        idPays: '1 OR 1=1', // SQLi test
        idVille: 1,
        idSituationResidence: 1,
        idProfession: 1,
        nom: 'John',
        prenom: 'Doe',
      },
      defendeur: { type: 'I' },
      plainteDetails: {
        resume: 'Test case for SQLi injection',
        idObjetInjustice: 1,
        idJuridiction: 1,
      },
      phoneToVerify: '123456789',
    };

    const res = await request(app)
      .post('/api/v1/complaints')
      .set('Content-Type', 'application/json')
      .send(badPayload);

    expect(res.statusCode).toBe(422); // validation should catch this
    expect(res.body.error).toBeDefined();
  });

  it('rejects SQLi payloads (string injection)', async () => {
    const badPayload = {
      complainantType: 'individual',
      plaignant: {
        idPays: "1'; DROP TABLE plaignants; --", // SQLi test
        idVille: 1,
        idSituationResidence: 1,
        idProfession: 1,
        nom: 'Jane',
        prenom: 'Smith',
      },
      defendeur: { type: 'I' },
      plainteDetails: {
        resume: 'SQL Injection test for DROP',
        idObjetInjustice: 1,
        idJuridiction: 1,
      },
      phoneToVerify: '987654321',
    };

    const res = await request(app)
      .post('/api/v1/complaints')
      .set('Content-Type', 'application/json')
      .send(badPayload);

    expect(res.statusCode).toBe(422); // validation should catch this
    expect(res.body.error).toBeDefined();
  });

  it('rejects SQLi payloads (comment injection)', async () => {
    const badPayload = {
      complainantType: 'individual',
      plaignant: {
        idPays: "1; --", // SQLi test
        idVille: 1,
        idSituationResidence: 1,
        idProfession: 1,
        nom: 'Foo',
        prenom: 'Bar',
      },
      defendeur: { type: 'I' },
      plainteDetails: {
        resume: 'SQLi payload with comments',
        idObjetInjustice: 1,
        idJuridiction: 1,
      },
      phoneToVerify: '555555555',
    };

    const res = await request(app)
      .post('/api/v1/complaints')
      .set('Content-Type', 'application/json')
      .send(badPayload);

    expect(res.statusCode).toBe(422); // validation should catch this
    expect(res.body.error).toBeDefined();
  });

  it('rejects SQLi payloads (time-based delay)', async () => {
    const badPayload = {
      complainantType: 'individual',
      plaignant: {
        idPays: "1; WAITFOR DELAY '0:0:5' --", // Time-based SQLi test
        idVille: 1,
        idSituationResidence: 1,
        idProfession: 1,
        nom: 'Alice',
        prenom: 'Wonderland',
      },
      defendeur: { type: 'I' },
      plainteDetails: {
        resume: 'Test case with SQLi time delay',
        idObjetInjustice: 1,
        idJuridiction: 1,
      },
      phoneToVerify: '123123123',
    };

    const t0 = Date.now();
    const res = await request(app)
      .post('/api/v1/complaints')
      .set('Content-Type', 'application/json')
      .send(badPayload);

    expect(res.statusCode).toBe(422); // validation should catch this
    expect(res.body.error).toBeDefined();
    expect(Date.now() - t0).toBeLessThan(2000); // Ensure delay is blocked
  });
});
